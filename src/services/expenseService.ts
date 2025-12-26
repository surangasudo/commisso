
// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData, Timestamp, runTransaction, query, where } from 'firebase/firestore';
import { type Expense } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const expensesCollection = collection(db, 'expenses');

export async function getExpenses(businessId?: string): Promise<Expense[]> {
    noStore();
    let q = query(expensesCollection);
    if (businessId) {
        q = query(expensesCollection, where('businessId', '==', businessId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => processDoc<Expense>(doc));
}

export async function addExpense(expense: Omit<Expense, 'id'>, businessId?: string, prefix?: string): Promise<void> {
    const dataToSave = {
        ...expense,
        businessId: businessId || null,
        date: Timestamp.fromDate(new Date(expense.date)),
    };

    if (prefix) {
        await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, 'counters', `expense_${prefix}`);
            const counterDoc = await transaction.get(counterRef);

            let nextCount = 1;
            if (counterDoc.exists()) {
                nextCount = counterDoc.data().count + 1;
            }

            const sequencePart = nextCount.toString().padStart(4, '0');
            const customId = `${prefix}-${sequencePart}`;

            const newDocRef = doc(expensesCollection, customId);

            if (counterDoc.exists()) {
                transaction.update(counterRef, { count: nextCount });
            } else {
                transaction.set(counterRef, { count: nextCount });
            }

            transaction.set(newDocRef, { ...dataToSave, id: customId });
        });
    } else {
        await addDoc(expensesCollection, dataToSave);
    }
}

export async function deleteExpense(expenseId: string): Promise<void> {
    const expenseDoc = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseDoc);
}
