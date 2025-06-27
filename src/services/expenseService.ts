
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Expense } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';

const expensesCollection = collection(db, 'expenses');

export async function getExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(expensesCollection);
  return snapshot.docs.map(doc => processDoc<Expense>(doc));
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    const dataToSave = {
        ...expense,
        date: new Date(expense.date),
    };
    await addDoc(expensesCollection, dataToSave);
}

export async function deleteExpense(expenseId: string): Promise<void> {
    const expenseDoc = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseDoc);
}
