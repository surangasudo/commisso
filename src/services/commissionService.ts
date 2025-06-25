'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type CommissionProfile } from '@/lib/data';

const commissionProfilesCollection = collection(db, 'commissionProfiles');

export async function getCommissionProfiles(): Promise<CommissionProfile[]> {
  const snapshot = await getDocs(commissionProfilesCollection);
  return snapshot.docs.map(doc => {
    const data = JSON.parse(JSON.stringify(doc.data()));
    return { id: doc.id, ...data } as CommissionProfile
  });
}

export async function getCommissionProfile(id: string): Promise<CommissionProfile | null> {
    const docRef = doc(db, 'commissionProfiles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = JSON.parse(JSON.stringify(docSnap.data()));
        return { id: docSnap.id, ...data } as CommissionProfile;
    } else {
        return null;
    }
}

export async function addCommissionProfile(profile: Omit<CommissionProfile, 'id'>): Promise<DocumentData> {
    const profileData = JSON.parse(JSON.stringify(profile));
    return await addDoc(commissionProfilesCollection, profileData);
}

export async function updateCommissionProfile(id: string, profile: Partial<Omit<CommissionProfile, 'id'>>): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    const profileData = JSON.parse(JSON.stringify(profile));
    await updateDoc(docRef, profileData);
}

export async function deleteCommissionProfile(id: string): Promise<void> {
    const docRef = doc(db, 'commissionProfiles', id);
    await deleteDoc(docRef);
}
