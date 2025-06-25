
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { type RegisterLog } from '@/lib/data';
import { sanitizeForClient } from '@/lib/firestore-utils';

const registerLogsCollection = collection(db, 'registerLogs');

export async function getRegisterLogs(): Promise<RegisterLog[]> {
  const snapshot = await getDocs(registerLogsCollection);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sanitizeForClient<RegisterLog[]>(data);
}
