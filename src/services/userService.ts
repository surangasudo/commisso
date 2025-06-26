
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { type User } from '@/lib/data';

const usersCollection = collection(db, 'users');

export async function getUsers(): Promise<User[]> {
  const snapshot = await getDocs(usersCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          username: docData.username,
          name: docData.name,
          role: docData.role,
          email: docData.email,
          status: docData.status,
      } as User
  });
  return data;
}
