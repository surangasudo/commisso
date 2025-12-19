
// use server removed

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { type MoneyExchange } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const moneyExchangesCollection = collection(db, 'moneyExchanges');

export async function addMoneyExchange(exchange: Omit<MoneyExchange, 'id'>): Promise<void> {
  const dataToSave = {
    ...exchange,
    date: Timestamp.fromDate(new Date(exchange.date)),
  };
  await addDoc(moneyExchangesCollection, dataToSave);
}

export async function getMoneyExchanges(): Promise<MoneyExchange[]> {
  noStore();
  const snapshot = await getDocs(moneyExchangesCollection);
  return snapshot.docs.map(doc => processDoc<MoneyExchange>(doc));
}
