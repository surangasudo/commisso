
// use server removed

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { type MoneyExchange } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const moneyExchangesCollection = collection(db, 'moneyExchanges');

export async function addMoneyExchange(exchange: Omit<MoneyExchange, 'id'>, businessId?: string): Promise<void> {
  const dataToSave = {
    ...exchange,
    businessId: businessId || null,
    date: Timestamp.fromDate(new Date(exchange.date)),
  };
  await addDoc(moneyExchangesCollection, dataToSave);
}

export async function getMoneyExchanges(businessId?: string): Promise<MoneyExchange[]> {
  noStore();
  let q = query(moneyExchangesCollection);
  if (businessId) {
    q = query(moneyExchangesCollection, where('businessId', '==', businessId));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => processDoc<MoneyExchange>(doc));
}
