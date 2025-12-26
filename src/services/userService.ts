import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc
} from 'firebase/firestore';
import { type User } from '@/lib/data';

const COLLECTION_NAME = 'users';

export async function getUsers(businessId?: string): Promise<User[]> {
  try {
    let q = query(collection(db, COLLECTION_NAME));

    if (businessId) {
      q = query(collection(db, COLLECTION_NAME), where('businessId', '==', businessId));
    }

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        privileges: data.privileges || { canManageRegister: data.role === 'Admin' }
      } as User;
    });

    if (users.length > 0) return users;

    // Fallback Mock Data if DB is empty or fails (only for dev/test)
    if (!businessId) {
      return [
        { id: 'mock-admin', name: 'System Admin', email: 'admin@crimson.pos', role: 'Admin', status: 'Active', username: 'admin', businessId: null, privileges: { canManageRegister: true } },
      ];
    }
    return [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUser(id: string, businessId?: string): Promise<User | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // SECURITY: If businessId is provided, verify it matches the user record
      if (businessId && data.businessId !== businessId) {
        console.warn(`Security Warning: Unauthorized access attempt to user ${id} from business ${businessId}`);
        return null;
      }
      return { id: docSnap.id, ...data } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function addUser(user: Omit<User, 'id'>, id?: string): Promise<string> {
  // Ensure businessId is present for non-SuperAdmin creation
  if (id) {
    await setDoc(doc(db, COLLECTION_NAME, id), {
      ...user,
      privileges: user.privileges || { canManageRegister: user.role === 'Admin' }
    });
    return id;
  } else {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...user,
      privileges: user.privileges || { canManageRegister: user.role === 'Admin' }
    });
    return docRef.id;
  }
}

export async function updateUser(user: User, businessId?: string): Promise<void> {
  const { id, ...data } = user;
  const userRef = doc(db, COLLECTION_NAME, id);

  // SECURITY: If businessId is provided, verify it matches BEFORE updating
  if (businessId) {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists() || docSnap.data().businessId !== businessId) {
      throw new Error("Unauthorized: Cannot update user outside of your business.");
    }
  }

  await updateDoc(userRef, {
    ...data,
    privileges: data.privileges || { canManageRegister: data.role === 'Admin' }
  });
}

export async function deleteUser(id: string, businessId?: string): Promise<void> {
  const userRef = doc(db, COLLECTION_NAME, id);

  // SECURITY: If businessId is provided, verify it matches BEFORE deleting
  if (businessId) {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists() || docSnap.data().businessId !== businessId) {
      throw new Error("Unauthorized: Cannot delete user outside of your business.");
    }
  }

  await deleteDoc(userRef);
}
