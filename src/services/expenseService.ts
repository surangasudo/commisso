
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Expense } from '@/lib/data';

const expensesCollection = collection(db, 'expenses');

export async function getExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(expensesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        date: docData.date || new Date().toISOString(),
        referenceNo: docData.referenceNo || '',
        location: docData.location || '',
        expenseCategory: docData.expenseCategory || '',
        subCategory: docData.subCategory || null,
        paymentStatus: docData.paymentStatus || 'Due',
        tax: docData.tax || 0,
        totalAmount: docData.totalAmount || 0,
        paymentDue: docData.paymentDue || 0,
        expenseFor: docData.expenseFor || null,
        contact: docData.contact || null,
        addedBy: docData.addedBy || '',
        expenseNote: docData.expenseNote || null,
      } as Expense;
  });
  return data;
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    await addDoc(expensesCollection, expense);
}

export async function deleteExpense(expenseId: string): Promise<void> {
    const expenseDoc = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseDoc);
}
