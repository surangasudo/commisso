
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { type MoneyExchange } from '@/lib/data';

const moneyExchangesCollection = collection(db, 'moneyExchanges');

export async function addMoneyExchange(exchange: Omit<MoneyExchange, 'id'>): Promise<void> {
    const dataToSave = {
        ...exchange,
        date: Timestamp.fromDate(new Date(exchange.date)),
    };
    await addDoc(moneyExchangesCollection, dataToSave);
}
