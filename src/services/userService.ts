import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { type User } from '@/lib/data';

const COLLECTION_NAME = 'users';

export async function getUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const email = data.email || '';
      // Force Admin for the primary account holder
      const isOwner = email.toLowerCase() === 'surangasudo@gmail.com';

      return {
        id: doc.id,
        username: data.username || email.split('@')[0] || 'user',
        name: data.name || email.split('@')[0] || 'Unknown User',
        role: (data.role === 'Admin' || data.isAdmin || isOwner) ? 'Admin' : 'Cashier',
        email: email,
        status: data.status || 'Active'
      } as User;
    });

    if (users.length > 0) return users;

    // Fallback Mock Data if DB is empty or fails
    return [
      { id: 'mock-admin', name: 'System Admin (Emergency)', email: 'surangasudo@gmail.com', role: 'Admin', status: 'Active', username: 'admin' },
      { id: 'mock-cashier', name: 'Test Cashier', email: 'cashier@crimson.pos', role: 'Cashier', status: 'Active', username: 'cashier' }
    ];
  } catch (error) {
    console.error("Error fetching users, using mock data:", error);
    return [
      { id: 'mock-admin', name: 'System Admin (Offline)', email: 'admin@crimson.pos', role: 'Admin', status: 'Active', username: 'admin' },
      { id: 'mock-cashier', name: 'Test Cashier (Offline)', email: 'cashier@crimson.pos', role: 'Cashier', status: 'Active', username: 'cashier' }
    ];
  }
}

export async function getUser(id: string): Promise<User | null> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  const userDoc = querySnapshot.docs.find(doc => doc.id === id);
  if (!userDoc) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function addUser(user: Omit<User, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), user);
  return docRef.id;
}

export async function updateUser(user: User): Promise<void> {
  const { id, ...data } = user;
  const userRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(userRef, data);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
