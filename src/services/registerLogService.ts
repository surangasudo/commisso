
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
          ...docData,
          openTime: docData.openTime?.toDate ? docData.openTime.toDate().toISOString() : docData.openTime,
          closeTime: docData.closeTime?.toDate ? docData.closeTime.toDate().toISOString() : docData.closeTime,
      } as RegisterLog;
  });
  return data;
}
