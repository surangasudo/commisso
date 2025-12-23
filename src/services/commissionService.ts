

// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData, runTransaction, query, where } from 'firebase/firestore';
import { type Commission, type CommissionProfile, type CommissionProfileWithSummary, type Sale, type DetailedProduct, type Expense, type ProductCategory } from '@/lib/data';
import { sendSms } from '@/services/smsService';
import { processDoc } from '@/lib/firestore-utils';
import { type AllSettings } from '@/hooks/use-settings';
import { unstable_noStore as noStore } from 'next/cache';

const commissionProfilesCollection = collection(db, 'commissionProfiles');
const commissionsCollection = collection(db, 'commissions');
const productCategoriesCollection = collection(db, 'productCategories');

export type PendingCommission = {
    id: string; // Aggregate grouping ID (usually the first commission ID)
    ids: string[]; // List of all commission IDs in this group
    date: string;
    invoiceNo: string;
    totalAmount: number;
    commissionEarned: number;
    commissionRate: string; // Can be a range/summary like "Mix" or "5%-10%"
    commissionRecords: {
        categoryName: string;
        rate: number;
        amount: number;
        baseAmount: number;
    }[];
};

export async function getCommissions(): Promise<Commission[]> {
    noStore();
    const snapshot = await getDocs(commissionsCollection);
    return snapshot.docs.map(doc => processDoc<Commission>(doc));
}

export async function getCommissionsByIds(ids: string[]): Promise<Commission[]> {
    if (ids.length === 0) return [];
    noStore();
    const commissions: Commission[] = [];
    // Firestore 'in' query has a limit of 30 items.
    for (let i = 0; i < ids.length; i += 30) {
        const chunk = ids.slice(i, i + 30);
        const q = query(commissionsCollection, where('__name__', 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
            commissions.push(processDoc<Commission>(doc));
        });
    }
    return commissions;
}

export async function getCommissionsForProfile(profileId: string): Promise<Commission[]> {
    noStore();
    const q = query(commissionsCollection, where("recipient_profile_id", "==", profileId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => processDoc<Commission>(doc));
}

export async function getCommissionProfiles(): Promise<CommissionProfileWithSummary[]> {
    noStore();
    const profilesSnapshot = await getDocs(commissionProfilesCollection);
    const profiles = profilesSnapshot.docs.map(doc => processDoc<CommissionProfileWithSummary>(doc));
    return profiles;
}

export async function getCommissionProfile(id: string): Promise<CommissionProfileWithSummary | null> {
    noStore();
    const docRef = doc(db, 'commissionProfiles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return processDoc<CommissionProfileWithSummary>(docSnap);
    } else {
        return null;
    }
}


export async function getPendingCommissions(profileId: string): Promise<PendingCommission[]> {
    noStore();
    const commissionsQuery = query(
        commissionsCollection,
        where("recipient_profile_id", "==", profileId),
        where("status", "==", "Pending Approval") // Fetch records ready for payout
    );

    const snapshot = await getDocs(commissionsQuery);
    if (snapshot.empty) return [];

    const commissions = snapshot.docs.map(doc => processDoc<Commission>(doc));

    // Fetch related sales efficiently
    const saleIds = [...new Set(commissions.map(c => c.transaction_id))];
    const salesMap = new Map<string, Sale>();

    // Fetch related categories efficiently
    const categoryIds = [...new Set(commissions.map(c => c.product_category_id).filter(id => !!id))] as string[];
    const categoriesMap = new Map<string, string>();

    // Firestore 'in' query supports up to 30 elements
    for (let i = 0; i < saleIds.length; i += 30) {
        const chunk = saleIds.slice(i, i + 30);
        if (chunk.length === 0) continue;
        const salesQuery = query(collection(db, 'sales'), where('__name__', 'in', chunk));
        const salesSnapshot = await getDocs(salesQuery);
        salesSnapshot.docs.forEach(doc => {
            salesMap.set(doc.id, processDoc<Sale>(doc));
        });
    }

    if (categoryIds.length > 0) {
        for (let i = 0; i < categoryIds.length; i += 30) {
            const chunk = categoryIds.slice(i, i + 30);
            if (chunk.length === 0) continue;
            const categoriesQuery = query(productCategoriesCollection, where('__name__', 'in', chunk));
            const categoriesSnapshot = await getDocs(categoriesQuery);
            categoriesSnapshot.docs.forEach(doc => {
                categoriesMap.set(doc.id, doc.data().name);
            });
        }
    }

    const grouped = commissions.reduce((acc, commission) => {
        const transactionId = commission.transaction_id;
        if (!acc[transactionId]) {
            acc[transactionId] = [];
        }
        acc[transactionId].push(commission);
        return acc;
    }, {} as Record<string, Commission[]>);

    const result: PendingCommission[] = [];

    for (const [transactionId, transactionCommissions] of Object.entries(grouped)) {
        const sale = salesMap.get(transactionId);
        const firstComm = transactionCommissions[0];

        const totalCommission = transactionCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
        const totalBase = transactionCommissions.reduce((sum, c) => sum + c.calculation_base_amount, 0);

        // Get unique rates for display
        const rates = [...new Set(transactionCommissions.map(c => c.calculated_rate))];
        const rateDisplay = rates.length === 1 ? `${rates[0]}%` : `${Math.min(...rates)}% - ${Math.max(...rates)}%`;

        const commissionRecords = transactionCommissions.map(c => {
            let categoryName = c.product_category_id ? categoriesMap.get(c.product_category_id) : null;
            if (!categoryName) {
                categoryName = c.product_category_name || 'Uncategorized';
            }
            return {
                categoryName,
                rate: c.calculated_rate,
                amount: c.commission_amount,
                baseAmount: c.calculation_base_amount
            };
        });

        result.push({
            id: firstComm.id,
            ids: transactionCommissions.map(c => c.id),
            date: new Date(firstComm.calculation_date).toLocaleDateString(),
            invoiceNo: sale?.invoiceNo || 'N/A',
            totalAmount: totalBase,
            commissionEarned: totalCommission,
            commissionRate: rateDisplay,
            commissionRecords
        });
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


export async function addCommissionProfile(profile: Omit<CommissionProfile, 'id'>): Promise<void> {
    const dataToSave: any = {
        ...profile,
        email: profile.email || null,
        bankDetails: profile.bankDetails || null,
        commission: {
            overall: profile.commission.overall,
            categories: profile.commission.categories?.map(({ category, rate, categoryId }) => ({ category, rate, categoryId })) || []
        },
        totalCommissionEarned: 0,
        totalCommissionPaid: 0,
    };
    await addDoc(commissionProfilesCollection, dataToSave);
}

export async function updateCommissionProfile(id: string, profile: Partial<Omit<CommissionProfile, 'id'>>): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    const dataToSave: any = {
        ...profile,
        email: profile.email === undefined ? undefined : (profile.email || null),
        bankDetails: profile.bankDetails === undefined ? undefined : (profile.bankDetails || null),
        commission: profile.commission ? {
            overall: profile.commission.overall,
            categories: profile.commission.categories?.map(({ category, rate, categoryId }) => ({ category, rate, categoryId })) || []
        } : undefined
    };
    // Remove undefined fields for updateDoc
    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);
    await updateDoc(docRef, dataToSave);
}

export async function deleteCommissionProfile(id: string): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    await deleteDoc(docRef);
}

export async function payCommission(
    profile: CommissionProfile,
    commissionIds: string[],
    paymentMethod: string,
    paymentNote: string
): Promise<{ success: boolean; error?: string }> {
    if (!profile || !profile.id) {
        return { success: false, error: "Invalid profile provided." };
    }
    if (!commissionIds || commissionIds.length === 0) {
        return { success: false, error: "No commission records selected for payment." };
    }

    const expensesCollectionRef = collection(db, 'expenses');

    try {
        await runTransaction(db, async (transaction) => {
            // --- 1. READ ALL DATA FIRST ---
            const profileRef = doc(db, 'commissionProfiles', profile.id);
            const profileDoc = await transaction.get(profileRef);
            if (!profileDoc.exists()) {
                throw new Error("Commission profile not found in database.");
            }

            let totalToPay = 0;
            const commissionDocsData: DocumentData[] = [];

            // Read commissions in chunks if necessary (though usually not for a single payout)
            for (let i = 0; i < commissionIds.length; i += 30) {
                const chunk = commissionIds.slice(i, i + 30);
                const commissionsQuery = query(commissionsCollection, where('__name__', 'in', chunk));
                const commissionSnapshot = await getDocs(commissionsQuery);

                if (commissionSnapshot.docs.length !== chunk.length) {
                    throw new Error("One or more commission records could not be found.");
                }

                for (const commissionDoc of commissionSnapshot.docs) {
                    const commissionData = commissionDoc.data();
                    commissionDocsData.push(commissionDoc); // Store the whole doc for later reference

                    if (commissionData.status !== 'Pending Approval') {
                        throw new Error(`Commission ${commissionDoc.id} is not pending approval and cannot be paid.`);
                    }
                    if (typeof commissionData.commission_amount !== 'number') {
                        throw new Error(`Commission amount for ${commissionDoc.id} is not a valid number.`);
                    }
                    totalToPay += commissionData.commission_amount;
                }
            }


            const roundedTotal = Math.round(totalToPay * 100) / 100;
            if (roundedTotal <= 0) {
                throw new Error("Total payment amount must be greater than zero.");
            }

            // --- 2. PERFORM ALL WRITES ---

            // Update commission documents
            for (const commissionDoc of commissionDocsData) {
                transaction.update(commissionDoc.ref, {
                    status: 'Paid',
                    payment_date: new Date(),
                    payment_details: paymentNote,
                    payment_method: paymentMethod,
                });
            }

            // Update profile summary
            const profileData = profileDoc.data();
            const currentPaid = typeof profileData.totalCommissionPaid === 'number' ? profileData.totalCommissionPaid : 0;
            const newTotalPaid = currentPaid + roundedTotal;

            transaction.update(profileRef, {
                totalCommissionPaid: newTotalPaid
            });

            // Create expense record
            const newExpense: Omit<Expense, 'id'> = {
                date: new Date().toISOString(),
                referenceNo: `COMM-PAY-${Date.now()}`,
                location: 'Awesome Shop',
                expenseCategory: 'Sales Commission Payout',
                subCategory: null,
                paymentStatus: 'Paid',
                tax: 0,
                totalAmount: roundedTotal,
                paymentDue: 0,
                expenseFor: null,
                contact: profileData.name,
                addedBy: 'System',
                expenseNote: `Commission payout to ${profileData.name}. Method: ${paymentMethod}. Note: ${paymentNote}`.trim(),
            };

            const newExpenseRef = doc(expensesCollectionRef);
            transaction.set(newExpenseRef, newExpense);
        });

        return { success: true };

    } catch (e: any) {
        console.error("Commission payment transaction failed: ", e);
        return { success: false, error: e.message };
    }
}


export async function sendPayoutNotification(
    profile: CommissionProfile,
    commissionIds: string[],
    smsConfig: AllSettings['sms'] & { currency?: string; businessName?: string }
): Promise<{ success: boolean; error?: string }> {
    if (!profile.phone || profile.phone.trim() === '') {
        return { success: false, error: "Profile does not have a phone number." };
    }

    // Fetch details for the paid commissions
    const paidCommissions = await getCommissionsByIds(commissionIds);
    if (paidCommissions.length === 0) {
        return { success: false, error: "Could not find paid commission details to generate notification." };
    }

    const categoriesSnapshot = await getDocs(productCategoriesCollection);
    const categoryMap = new Map<string, string>();
    categoriesSnapshot.docs.forEach(doc => {
        categoryMap.set(doc.id, doc.data().name);
    });

    const breakdown: { [categoryName: string]: { amount: number, invoices: Set<string> } } = {};
    let totalPaid = 0;

    paidCommissions.forEach(commission => {
        const categoryName = commission.product_category_id ? categoryMap.get(commission.product_category_id) || 'Uncategorized' : 'Uncategorized';

        if (!breakdown[categoryName]) {
            breakdown[categoryName] = { amount: 0, invoices: new Set() };
        }

        breakdown[categoryName].amount += commission.commission_amount;
        breakdown[categoryName].invoices.add(commission.transaction_id);
        totalPaid += commission.commission_amount;
    });

    const detailsString = Object.entries(breakdown)
        .map(([category, data]) => {
            const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: smsConfig.currency || 'USD' }).format(data.amount);
            return `${category} (${data.invoices.size} invoices): ${formattedAmount}`;
        })
        .join(', ');

    const message = `${smsConfig.businessName}: Commission of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: smsConfig.currency || 'USD' }).format(totalPaid)} has been paid. Details: ${detailsString}.`;

    console.log('Commission Payout Notification Trace:', {
        recipient: profile.name,
        phone: profile.phone,
        totalPaid,
        messagePreview: message.substring(0, 50) + '...'
    });

    try {
        const smsResult = await sendSms(profile.phone, message, smsConfig);
        console.log('Commission Payout SMS Result:', smsResult);
        if (!smsResult.success) {
            return { success: false, error: smsResult.error || 'SMS sending failed for an unknown reason.' };
        }
        return { success: true };
    } catch (error: any) {
        console.error("Error in sendPayoutNotification:", error);
        return { success: false, error: error.message };
    }
}
