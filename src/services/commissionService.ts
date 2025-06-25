'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type CommissionProfile } from '@/lib/data';

function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  if (typeof data === 'object' && data.constructor === Object) {
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObject[key] = sanitizeData(data[key]);
      }
    }
    return sanitizedObject;
  }
  return data;
}

const commissionProfilesCollection = collection(db, 'commissionProfiles');

export async function getCommissionProfiles(): Promise<CommissionProfile[]> {
  const snapshot = await getDocs(commissionProfilesCollection);
  return snapshot.docs.map(doc => {
    const data = sanitizeData(doc.data());
    return { id: doc.id, ...data } as CommissionProfile
  });
}

export async function getCommissionProfile(id: string): Promise<CommissionProfile | null> {
    const docRef = doc(db, 'commissionProfiles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = sanitizeData(docSnap.data());
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
