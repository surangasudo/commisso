
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
        date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
        referenceNo: docData.referenceNo,
        location: docData.location,
        expenseCategory: docData.expenseCategory,
        subCategory: docData.subCategory,
        paymentStatus: docData.paymentStatus,
        tax: docData.tax,
        totalAmount: docData.totalAmount,
        paymentDue: docData.paymentDue,
        expenseFor: docData.expenseFor,
        contact: docData.contact,
        addedBy: docData.addedBy,
        expenseNote: docData.expenseNote,
      } as Expense;
  });
  return data;
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<DocumentData> {
    return await addDoc(expensesCollection, expense);
}

export async function deleteExpense(expenseId: string): Promise<void> {
    const expenseDoc = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseDoc);
}
