
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { type SellingPriceGroup } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';

const spgCollection = collection(db, 'selling_price_groups');

export async function getSellingPriceGroups(businessId?: string): Promise<SellingPriceGroup[]> {
    let q = query(spgCollection);
    if (businessId) {
        q = query(spgCollection, where('businessId', '==', businessId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => processDoc<SellingPriceGroup>(doc));
}

export async function addSellingPriceGroup(group: Omit<SellingPriceGroup, 'id'>, businessId?: string): Promise<{ id: string }> {
    const docRef = await addDoc(spgCollection, {
        ...group,
        businessId: businessId || null
    });
    return { id: docRef.id };
}

export async function updateSellingPriceGroup(id: string, group: Partial<Omit<SellingPriceGroup, 'id'>>): Promise<void> {
    const docRef = doc(db, 'selling_price_groups', id);
    await updateDoc(docRef, group);
}

export async function deleteSellingPriceGroup(id: string): Promise<void> {
    const docRef = doc(db, 'selling_price_groups', id);
    await deleteDoc(docRef);
}

export async function ensureDefaultSellingPriceGroups(businessId: string): Promise<void> {
    const groups = await getSellingPriceGroups(businessId);
    if (groups.length === 0) {
        await addSellingPriceGroup({
            name: 'Default Selling Price',
            description: 'Default selling price for all customers',
            isDefault: true,
            businessId: businessId // Added businessId to satisfy type
        }, businessId);
        await addSellingPriceGroup({
            name: 'Wholesale',
            description: 'Special pricing for wholesale customers',
            isDefault: false,
            businessId: businessId // Added businessId to satisfy type
        }, businessId);
    }
}
