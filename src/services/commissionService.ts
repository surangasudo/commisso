'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type CommissionProfile } from '@/lib/data';
import { sanitizeForClient } from '@/lib/firestore-utils';

const commissionProfilesCollection = collection(db, 'commissionProfiles');

export async function getCommissionProfiles(): Promise<CommissionProfile[]> {
  const snapshot = await getDocs(commissionProfilesCollection);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sanitizeForClient<CommissionProfile[]>(data);
}

export async function getCommissionProfile(id: string): Promise<CommissionProfile | null> {
    const docRef = doc(db, 'commissionProfiles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        return sanitizeForClient<CommissionProfile>(data);
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
