
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData, runTransaction } from 'firebase/firestore';
import { type CommissionProfile, type Expense } from '@/lib/data';

const commissionProfilesCollection = collection(db, 'commissionProfiles');

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

export async function addCommissionProfile(profile: Omit<CommissionProfile, 'id'>): Promise<DocumentData> {
    const profileWithDefaults = {
      ...profile,
      totalCommissionEarned: 0,
      totalCommissionPaid: 0,
    };
    return await addDoc(commissionProfilesCollection, profileWithDefaults);
}

export async function updateCommissionProfile(id: string, profile: Partial<Omit<CommissionProfile, 'id'>>): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    await updateDoc(docRef, profile);
}

export async function deleteCommissionProfile(id: string): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    await deleteDoc(docRef);
}

export async function payCommission(
    profile: CommissionProfile,
    amountToPay: number,
    paymentMethod: string,
    paymentNote: string
): Promise<void> {
    const profileDocRef = doc(db, 'commissionProfiles', profile.id);
    const expensesCollectionRef = collection(db, 'expenses');

    try {
        await runTransaction(db, async (transaction) => {
            const profileDoc = await transaction.get(profileDocRef);
            if (!profileDoc.exists()) {
                throw "Profile document does not exist!";
            }
            
            const currentData = profileDoc.data();
            const currentPaid = currentData.totalCommissionPaid || 0;
            const currentEarned = currentData.totalCommissionEarned || 0;
            const pending = currentEarned - currentPaid;

            if (amountToPay > pending) {
                console.warn(`Attempt to pay ${amountToPay} which is more than pending ${pending}. Capping payment.`);
                amountToPay = pending;
            }

            if (amountToPay <= 0) {
                console.warn("Payment amount is zero or less. No transaction will occur.");
                return;
            }

            const newPaid = currentPaid + amountToPay;
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
                totalAmount: amountToPay,
                paymentDue: 0,
                expenseFor: null,
                contact: profile.name, // Link the expense to the agent
                addedBy: 'System', // Or current logged in user
                expenseNote: `Commission payout to ${profile.name}. Method: ${paymentMethod}. Note: ${paymentNote}`.trim(),
            };
            
            const newExpenseRef = doc(expensesCollectionRef);
            transaction.set(newExpenseRef, newExpense);
        });
    } catch (e) {
        console.error("Commission payment transaction failed: ", e);
        throw e;
    }
}
