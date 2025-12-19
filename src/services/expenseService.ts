
// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData, Timestamp, runTransaction } from 'firebase/firestore';
import { type Expense } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const expensesCollection = collection(db, 'expenses');

export async function getExpenses(): Promise<Expense[]> {
    noStore();
    const snapshot = await getDocs(expensesCollection);
    return snapshot.docs.map(doc => processDoc<Expense>(doc));
}

export async function addExpense(expense: Omit<Expense, 'id'>, prefix?: string): Promise<void> {
    const dataToSave = {
        ...expense,
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
