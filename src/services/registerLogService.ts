
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { type RegisterLog } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const registerLogsCollection = collection(db, 'registerLogs');

export async function getRegisterLogs(): Promise<RegisterLog[]> {
  noStore();
  const snapshot = await getDocs(registerLogsCollection);
  return snapshot.docs.map(doc => processDoc<RegisterLog>(doc));
}
