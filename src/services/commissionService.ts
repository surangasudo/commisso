
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData, runTransaction } from 'firebase/firestore';
import { type CommissionProfile } from '@/lib/data';

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
            totalCommissionPending: docData.totalCommissionPending || 0,
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
            totalCommissionPending: docData.totalCommissionPending || 0,
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
      totalCommissionPending: 0,
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

export async function payCommission(profileId: string, amountToPay: number): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', profileId);

    try {
        await runTransaction(db, async (transaction) => {
            const profileDoc = await transaction.get(docRef);
            if (!profileDoc.exists()) {
                throw "Document does not exist!";
            }
            
            const currentData = profileDoc.data();
            const currentPending = currentData.totalCommissionPending || 0;
            const currentPaid = currentData.totalCommissionPaid || 0;

            const newPending = currentPending - amountToPay;
            const newPaid = currentPaid + amountToPay;

            transaction.update(docRef, { 
                totalCommissionPending: newPending,
                totalCommissionPaid: newPaid
            });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
}
