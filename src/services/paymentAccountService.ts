
// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, runTransaction, writeBatch, query, where } from 'firebase/firestore';
import { type PaymentAccount } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

const accountsCollection = collection(db, 'paymentAccounts');

export async function getAccounts(businessId?: string): Promise<PaymentAccount[]> {
    noStore();
    let q = query(accountsCollection);
    if (businessId) {
        q = query(accountsCollection, where('businessId', '==', businessId));
    }
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => processDoc<PaymentAccount>(doc));
    return data;
}

export async function addAccount(account: Omit<PaymentAccount, 'id' | 'balance'>, businessId?: string): Promise<void> {
    const newAccount = {
        ...account,
        businessId: businessId || null,
        balance: account.openingBalance || 0,
    };
    await addDoc(accountsCollection, newAccount);
}

export async function updateAccount(id: string, account: Partial<Omit<PaymentAccount, 'id'>>): Promise<void> {
    const docRef = doc(db, 'paymentAccounts', id);
    await updateDoc(docRef, account);
}

export async function deleteAccount(id: string): Promise<void> {
    const docRef = doc(db, 'paymentAccounts', id);
    await deleteDoc(docRef);
}

export async function setAsDefaultAccount(id: string, businessId: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
        // Find the current default account for this specific business
        const q = query(
            accountsCollection,
            where("isDefault", "==", true),
            where("businessId", "==", businessId)
        );
        const currentDefaultDocs = await getDocs(q);

        // Unset the current default
        currentDefaultDocs.forEach(docSnap => {
            transaction.update(docSnap.ref, { isDefault: false });
        });

        // Set the new default
        const newDefaultRef = doc(db, 'paymentAccounts', id);
        transaction.update(newDefaultRef, { isDefault: true });
    });
}
