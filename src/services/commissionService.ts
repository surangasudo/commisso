

'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData, runTransaction, query, where } from 'firebase/firestore';
import { type Commission, type CommissionProfile, type CommissionProfileWithSummary, type Sale, type DetailedProduct, type Expense } from '@/lib/data';
import { sendSms } from '@/services/smsService';
import { processDoc } from '@/lib/firestore-utils';
import { type AllSettings } from '@/hooks/use-settings';
import { unstable_noStore as noStore } from 'next/cache';

const commissionProfilesCollection = collection(db, 'commissionProfiles');
const commissionsCollection = collection(db, 'commissions');

export type PendingCommission = {
    id: string; // Commission ID
    date: string;
    invoiceNo: string;
    totalAmount: number;
    commissionEarned: number;
};

export async function getCommissions(): Promise<Commission[]> {
  noStore();
  const snapshot = await getDocs(commissionsCollection);
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

    return commissions.map(commission => {
        const sale = salesMap.get(commission.transaction_id);
        return {
            id: commission.id, // Use the commission ID
            date: new Date(commission.calculation_date).toLocaleDateString(),
            invoiceNo: sale?.invoiceNo || 'N/A',
            totalAmount: commission.calculation_base_amount,
            commissionEarned: commission.commission_amount
        };
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


export async function addCommissionProfile(profile: Omit<CommissionProfile, 'id'>): Promise<void> {
    const dataToSave = {
        ...profile,
        commission: {
            overall: profile.commission.overall,
            categories: profile.commission.categories?.map(({ category, rate }) => ({ category, rate })) || []
        },
        totalCommissionEarned: 0,
        totalCommissionPaid: 0,
    };
    await addDoc(commissionProfilesCollection, dataToSave);
}

export async function updateCommissionProfile(id: string, profile: Partial<Omit<CommissionProfile, 'id'>>): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    const dataToSave = {
        ...profile,
        commission: {
            overall: profile.commission?.overall,
            categories: profile.commission?.categories?.map(({ category, rate }) => ({ category, rate })) || []
        }
    };
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
    paymentNote: string,
): Promise<{ success: boolean; error?: string }> {
    const expensesCollectionRef = collection(db, 'expenses');
    
    try {
        await runTransaction(db, async (transaction) => {
            const profileRef = doc(db, 'commissionProfiles', profile.id);
            const profileDoc = await transaction.get(profileRef);
            if (!profileDoc.exists()) throw new Error("Profile not found");
            const profileData = profileDoc.data();

            const commissionRefs = commissionIds.map(id => doc(db, 'commissions', id));
            const commissionDocs = await Promise.all(commissionRefs.map(ref => transaction.get(ref)));
            
            let calculatedTotal = 0;
            for (const commissionDoc of commissionDocs) {
                if (!commissionDoc.exists() || commissionDoc.data().status !== 'Pending Approval') {
                    throw new Error(`Commission record ${commissionDoc.id} is not valid for payment.`);
                }
                calculatedTotal += commissionDoc.data().commission_amount;
            }

            const roundedTotal = Math.round(calculatedTotal * 100) / 100;
            
            if (roundedTotal <= 0) {
                 throw new Error("Payment amount must be greater than zero.");
            }

            // Update status of all selected commission records to 'Paid'
            for (const commissionDoc of commissionDocs) {
                transaction.update(commissionDoc.ref, { 
                    status: 'Paid',
                    payment_date: new Date(),
                    payment_details: paymentNote,
                    payment_method: paymentMethod,
                 });
            }

            // Update the summary on the profile
            const currentPaid = profileData.totalCommissionPaid || 0;
            transaction.update(profileRef, {
                totalCommissionPaid: currentPaid + roundedTotal
            });


            // Create a single expense record for the total payout
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
        return { success: false, error: e.message }; // Return error message
    }
}

export async function sendPayoutNotification(
    profile: CommissionProfile,
    amount: number,
    smsConfig: AllSettings['sms'] & { currency?: string; businessName?: string }
): Promise<{ success: boolean; error?: string }> {
     if (!profile.phone || profile.phone.trim() === '') {
        return { success: false, error: "Profile does not have a phone number." };
    }

    const message = `You have received a commission payment of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: smsConfig.currency || 'USD' }).format(amount)} from ${smsConfig.businessName}. Thank you.`;
    
    try {
        const smsResult = await sendSms(profile.phone, message, smsConfig);
        if (!smsResult.success) {
            return { success: false, error: smsResult.error || 'SMS sending failed for an unknown reason.' };
        }
        return { success: true };
    } catch (error: any) {
        console.error("Error in sendPayoutNotification:", error);
        return { success: false, error: error.message };
    }
}
