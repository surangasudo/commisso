
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type CommissionProfile } from '@/lib/data';

const commissionProfilesCollection = collection(db, 'commissionProfiles');

export async function getCommissionProfiles(): Promise<CommissionProfile[]> {
  const snapshot = await getDocs(commissionProfilesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
            id: doc.id,
            name: docData.name,
            entityType: docData.entityType,
            phone: docData.phone,
            email: docData.email,
            bankDetails: docData.bankDetails,
            commission: docData.commission,
      } as CommissionProfile;
  });
  return data;
}

export async function getCommissionProfile(id: string): Promise<CommissionProfile | null> {
    const docRef = doc(db, 'commissionProfiles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const docData = docSnap.data();
        const data = {
            id: docSnap.id,
            name: docData.name,
            entityType: docData.entityType,
            phone: docData.phone,
            email: docData.email,
            bankDetails: docData.bankDetails,
            commission: docData.commission,
        } as CommissionProfile;
        return data;
    } else {
        return null;
    }
}

export async function addCommissionProfile(profile: Omit<CommissionProfile, 'id'>): Promise<DocumentData> {
    return await addDoc(commissionProfilesCollection, profile);
}

export async function updateCommissionProfile(id: string, profile: Partial<Omit<CommissionProfile, 'id'>>): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    await updateDoc(docRef, profile);
}

export async function deleteCommissionProfile(id: string): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    await deleteDoc(docRef);
}
