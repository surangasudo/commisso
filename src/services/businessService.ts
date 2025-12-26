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
    serverTimestamp
} from 'firebase/firestore';
import { type Business } from '@/lib/data';

const COLLECTION_NAME = 'businesses';

export async function getBusinesses(): Promise<Business[]> {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Business));
    } catch (error) {
        console.error("Error fetching businesses:", error);
        return [];
    }
}

export async function getBusiness(id: string): Promise<Business | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Business;
        }
        return null;
    } catch (error) {
        console.error("Error fetching business:", error);
        return null;
    }
}

export async function createBusiness(business: Omit<Business, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...business,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
}

export async function updateBusiness(id: string, updates: Partial<Business>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
}

export async function deleteBusiness(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

export async function isModuleEnabled(businessId: string, moduleId: string): Promise<boolean> {
    if (!businessId) return true; // Superadmin or global
    const business = await getBusiness(businessId);
    return business?.modules?.includes(moduleId) || false;
}
