'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type CommissionProfile } from '@/lib/data';

const commissionProfilesCollection = collection(db, 'commissionProfiles');

const sanitizeData = (docData: DocumentData) => {
    const data = { ...docData };
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (data[key] instanceof Timestamp) {
          data[key] = data[key].toDate().toISOString();
        }
      }
    }
    return data;
}

export async function getCommissionProfiles(): Promise<CommissionProfile[]> {
  const snapshot = await getDocs(commissionProfilesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...sanitizeData(doc.data()) } as CommissionProfile));
}

export async function getCommissionProfile(id: string): Promise<CommissionProfile | null> {
    const docRef = doc(db, 'commissionProfiles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...sanitizeData(docSnap.data()) } as CommissionProfile;
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
