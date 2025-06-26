
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { type RegisterLog } from '@/lib/data';

const registerLogsCollection = collection(db, 'registerLogs');

export async function getRegisterLogs(): Promise<RegisterLog[]> {
  const snapshot = await getDocs(registerLogsCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          openTime: docData.openTime?.toDate ? docData.openTime.toDate().toISOString() : docData.openTime,
          closeTime: docData.closeTime?.toDate ? docData.closeTime.toDate().toISOString() : docData.closeTime,
          location: docData.location,
          user: docData.user,
          closingNote: docData.closingNote,
          status: docData.status,
          totalCardSlips: docData.totalCardSlips,
          totalCheques: docData.totalCheques,
          totalCash: docData.totalCash,
          totalRefunds: docData.totalRefunds,
          totalExpenses: docData.totalExpenses,
          closingCash: docData.closingCash,
          openingCash: docData.openingCash,
      } as RegisterLog;
  });
  return data;
}
