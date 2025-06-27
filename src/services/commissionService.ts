
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData, runTransaction, query, where } from 'firebase/firestore';
import { type CommissionProfile, type Sale, type DetailedProduct, type Expense } from '@/lib/data';
import { sendSms } from '@/services/smsService';
import { processDoc } from '@/lib/firestore-utils';
import { type AllSettings } from '@/hooks/use-settings';

const commissionProfilesCollection = collection(db, 'commissionProfiles');

export type PendingSale = {
    id: string;
    date: string;
    invoiceNo: string;
    totalAmount: number;
    commissionEarned: number;
};

export async function getCommissionProfiles(): Promise<CommissionProfile[]> {
  const snapshot = await getDocs(commissionProfilesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      const commissionData = docData.commission || {};
      const categoriesData = commissionData.categories || [];

      return {
            id: doc.id,
            name: docData.name || '',
            entityType: docData.entityType || '',
            phone: docData.phone || '',
            email: docData.email || '',
            bankDetails: docData.bankDetails || '',
            commission: {
                overall: commissionData.overall || 0,
                categories: Array.isArray(categoriesData) ? categoriesData.map(c => ({
                    category: c.category || '',
                    rate: c.rate || 0,
                })) : [],
            },
            totalCommissionEarned: docData.totalCommissionEarned || 0,
            totalCommissionPaid: docData.totalCommissionPaid || 0,
      } as CommissionProfile;
  });
  return data;
}

export async function getCommissionProfile(id: string): Promise<CommissionProfile | null> {
    const docRef = doc(db, 'commissionProfiles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const docData = docSnap.data();
        const commissionData = docData.commission || {};
        const categoriesData = commissionData.categories || [];
        
        const data = {
            id: docSnap.id,
            name: docData.name || '',
            entityType: docData.entityType || '',
            phone: docData.phone || '',
            email: docData.email || '',
            bankDetails: docData.bankDetails || '',
            commission: {
                overall: commissionData.overall || 0,
                categories: Array.isArray(categoriesData) ? categoriesData.map(c => ({
                    category: c.category || '',
                    rate: c.rate || 0,
                })) : [],
            },
            totalCommissionEarned: docData.totalCommissionEarned || 0,
            totalCommissionPaid: docData.totalCommissionPaid || 0,
        } as CommissionProfile;
        return data;
    } else {
        return null;
    }
}

export async function getPendingCommissions(profileId: string): Promise<PendingSale[]> {
    const profile = await getCommissionProfile(profileId);
    if (!profile) return [];

    const salesCollectionRef = collection(db, 'sales');
    const q = query(salesCollectionRef, where("commissionAgentIds", "array-contains", profileId));
    const salesSnapshot = await getDocs(q);
    const agentSales = salesSnapshot.docs.map(doc => processDoc<Sale>(doc));

    const allProductIds = agentSales.flatMap(s => s.items.map(i => i.productId));
    if (allProductIds.length === 0) return [];

    const uniqueProductIds = [...new Set(allProductIds)];
    
    // Firestore 'in' query has a limit of 30 values. Handle chunking if necessary.
    const productChunks = [];
    for (let i = 0; i < uniqueProductIds.length; i += 30) {
        productChunks.push(uniqueProductIds.slice(i, i + 30));
    }

    const productMap = new Map<string, DetailedProduct>();
    for (const chunk of productChunks) {
        if (chunk.length === 0) continue;
        const productsCollectionRef = collection(db, 'products');
        const productsQuery = query(productsCollectionRef, where("__name__", "in", chunk));
        const productsSnapshot = await getDocs(productsQuery);
        productsSnapshot.docs.forEach(doc => {
            productMap.set(doc.id, processDoc<DetailedProduct>(doc));
        });
    }
    
    const sortedSales = [...agentSales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const round = (num: number) => Math.round(num * 100) / 100;
    let paidAmountCounter = round(profile.totalCommissionPaid || 0);
    const salesResult: PendingSale[] = [];

    for (const sale of sortedSales) {
        let commissionForThisSale = 0;
        for (const item of sale.items) {
            const product = productMap.get(item.productId);
            if (!product) continue;
            
            const saleValue = item.unitPrice * item.quantity;
            const hasCategoryRates = profile.commission.categories && profile.commission.categories.length > 0;
            let rate = 0;

            if (hasCategoryRates) {
                rate = profile.commission.categories?.find(c => c.category?.toLowerCase() === product.category?.toLowerCase())?.rate || 0;
            } else {
                rate = profile.commission.overall || 0;
            }

            commissionForThisSale += saleValue * (rate / 100);
        }
        
        const roundedCommission = round(commissionForThisSale);

        if (roundedCommission > 0) {
            if (paidAmountCounter >= roundedCommission) {
                paidAmountCounter = round(paidAmountCounter - roundedCommission);
            } else {
                salesResult.push({
                    id: sale.id,
                    date: new Date(sale.date).toLocaleDateString(),
                    invoiceNo: sale.invoiceNo,
                    totalAmount: sale.totalAmount,
                    commissionEarned: roundedCommission
                });
            }
        }
    }
    
    return salesResult.reverse(); // Newest first
}


export async function addCommissionProfile(profile: Omit<CommissionProfile, 'id'>): Promise<DocumentData> {
    const profileWithDefaults = {
      ...profile,
      totalCommissionEarned: 0,
      totalCommissionPaid: 0,
      commission: {
          ...profile.commission,
          overall: Number(profile.commission.overall) || 0,
          categories: profile.commission.categories?.map(c => ({
              ...c,
              rate: Number(c.rate) || 0,
          })) || [],
      }
    };
    return await addDoc(commissionProfilesCollection, profileWithDefaults);
}

export async function updateCommissionProfile(id: string, profile: Partial<Omit<CommissionProfile, 'id'>>): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    const profileToUpdate = {
        ...profile,
        commission: {
            ...profile.commission,
            overall: Number(profile.commission?.overall) || 0,
            categories: profile.commission?.categories?.map(c => ({
                ...c,
                rate: Number(c.rate) || 0,
            })) || [],
        }
    };
    await updateDoc(docRef, profileToUpdate);
}

export async function deleteCommissionProfile(id: string): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    await deleteDoc(docRef);
}

export async function payCommission(
    profile: CommissionProfile,
    amountToPay: number,
    paymentMethod: string,
    paymentNote: string,
    smsMessage: string,
    smsConfig: AllSettings['sms']
): Promise<{ paymentRecorded: boolean; smsSent: boolean; error?: string }> {
    const profileDocRef = doc(db, 'commissionProfiles', profile.id);
    const expensesCollectionRef = collection(db, 'expenses');

    const round = (num: number) => Math.round(num * 100) / 100;

    try {
        await runTransaction(db, async (transaction) => {
            const profileDoc = await transaction.get(profileDocRef);
            if (!profileDoc.exists()) {
                throw "Profile document does not exist!";
            }
            
            const currentData = profileDoc.data();
            const currentPaid = currentData.totalCommissionPaid || 0;
            const currentEarned = currentData.totalCommissionEarned || 0;
            
            const pending = round(currentEarned - currentPaid);
            const roundedAmountToPay = round(amountToPay);

            let finalAmountToPay = roundedAmountToPay;
            if (finalAmountToPay > pending) {
                console.warn(`Attempt to pay ${finalAmountToPay} which is more than pending ${pending}. Capping payment.`);
                finalAmountToPay = pending;
            }

            if (finalAmountToPay <= 0) {
                console.warn("Payment amount is zero or less. No transaction will occur.");
                return;
            }

            const newPaid = round(currentPaid + finalAmountToPay);
            transaction.update(profileDocRef, { totalCommissionPaid: newPaid });

            // Create a corresponding expense record
            const newExpense: Omit<Expense, 'id'> = {
                date: new Date().toISOString(),
                referenceNo: `COMM-${Date.now()}`,
                location: 'Awesome Shop', // Default location for business-wide expenses
                expenseCategory: 'Sales Commission',
                subCategory: null,
                paymentStatus: 'Paid',
                tax: 0,
                totalAmount: finalAmountToPay,
                paymentDue: 0,
                expenseFor: null,
                contact: profile.name, // Link the expense to the agent
                addedBy: 'System', // Or current logged in user
                expenseNote: `Commission payout to ${profile.name}. Method: ${paymentMethod}. Note: ${paymentNote}`.trim(),
            };
            
            const newExpenseRef = doc(expensesCollectionRef);
            transaction.set(newExpenseRef, newExpense);
        });

        // After the transaction is successful, send the SMS
        if (profile.phone && profile.phone.trim() !== '' && smsMessage) {
            const smsResult = await sendSms(profile.phone, smsMessage, smsConfig);
            if (!smsResult.success) {
                 return {
                    paymentRecorded: true,
                    smsSent: false,
                    error: `Payment recorded, but SMS notification failed: ${smsResult.error}`,
                };
            }
             return { paymentRecorded: true, smsSent: true };
        } else {
             return {
                paymentRecorded: true,
                smsSent: false,
                error: 'No phone number or message available for this profile.',
            };
        }
    } catch (e: any) {
        console.error("Commission payment transaction failed: ", e);
        throw e; // Re-throw transaction errors
    }
}
