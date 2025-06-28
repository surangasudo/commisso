
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, runTransaction, writeBatch, query, where } from 'firebase/firestore';
import { type PaymentAccount } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';

const accountsCollection = collection(db, 'paymentAccounts');

const defaultAccounts: Omit<PaymentAccount, 'id' | 'balance'>[] = [
    { name: 'Cash', accountType: 'Cash', openingBalance: 0, note: 'Default cash account.', isDefault: true },
    { name: 'Main Bank Account', accountType: 'Checking', accountNumber: '1234567890', openingBalance: 10000, note: 'Primary business checking account.' },
];

async function seedDefaultAccounts() {
    const batch = writeBatch(db);
    for (const account of defaultAccounts) {
        const newDocRef = doc(accountsCollection);
        batch.set(newDocRef, {
            ...account,
            balance: account.openingBalance,
        });
    }
    await batch.commit();
}

export async function getAccounts(): Promise<PaymentAccount[]> {
    noStore();
    let snapshot = await getDocs(accountsCollection);
    
    if (snapshot.empty) {
        await seedDefaultAccounts();
        snapshot = await getDocs(accountsCollection);
    }
    
    const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as PaymentAccount));

    return data;
}

export async function addAccount(account: Omit<PaymentAccount, 'id' | 'balance'>): Promise<void> {
    const newAccount = {
        ...account,
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

export async function setAsDefaultAccount(id: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
        // Find the current default account
        const q = query(accountsCollection, where("isDefault", "==", true));
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
