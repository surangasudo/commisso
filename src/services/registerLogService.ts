import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { type RegisterLog } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const COLLECTION_NAME = 'registerLogs';
const registerLogsCollection = collection(db, COLLECTION_NAME);

export async function getRegisterLogs(): Promise<RegisterLog[]> {
  noStore();
  const snapshot = await getDocs(registerLogsCollection);
  return snapshot.docs.map(doc => processDoc<RegisterLog>(doc));
}

export async function getActiveRegister(userId: string): Promise<RegisterLog | null> {
  noStore();
  const q = query(
    registerLogsCollection,
    where('userId', '==', userId),
    where('status', '==', 'Open')
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return processDoc<RegisterLog>(snapshot.docs[0]);
}

export async function openRegister(
  userId: string,
  userName: string,
  openingCash: number,
  location: string
): Promise<string> {
  const newLog: Omit<RegisterLog, 'id'> = {
    userId,
    user: userName,
    location,
    openingCash,
    openTime: new Date().toISOString(),
    closeTime: null,
    status: 'Open',
    totalCardSlips: 0,
    totalCheques: 0,
    totalCash: 0,
    totalRefunds: 0,
    totalExpenses: 0,
    closingCash: 0,
    closingNote: null,
  };
  const docRef = await addDoc(registerLogsCollection, newLog);
  return docRef.id;
}

export async function closeRegister(
  registerId: string,
  closingData: {
    closingCash: number,
    totalCardSlips: number,
    totalCheques: number,
    totalCash: number,
    totalRefunds: number,
    totalExpenses: number,
    closingNote: string | null
  }
): Promise<void> {
  const registerRef = doc(db, COLLECTION_NAME, registerId);
  await updateDoc(registerRef, {
    ...closingData,
    closeTime: new Date().toISOString(),
    status: 'Closed'
  });
}
