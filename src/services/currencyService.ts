
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, runTransaction, writeBatch, query, where } from 'firebase/firestore';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';
import { type Currency } from '@/lib/data';

const currencyCollection = collection(db, 'currencies');
// It's recommended to store this key in an environment variable (e.g., in your .env file)
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY; 

export async function getCurrencies(): Promise<Currency[]> {
  noStore();
  const snapshot = await getDocs(currencyCollection);
  if (snapshot.empty) {
    // Seed initial data if the collection is empty
    const initialCurrencies: Omit<Currency, 'id'>[] = [
      { name: 'US Dollar', code: 'USD', symbol: '$', exchangeRate: 1, isBaseCurrency: true },
      { name: 'Euro', code: 'EUR', symbol: '€', exchangeRate: 0.92 },
      { name: 'British Pound', code: 'GBP', symbol: '£', exchangeRate: 0.79 },
    ];
    const batch = writeBatch(db);
    initialCurrencies.forEach(currency => {
        const docRef = doc(currencyCollection);
        batch.set(docRef, currency);
    });
    await batch.commit();
    const newSnapshot = await getDocs(currencyCollection);
    return newSnapshot.docs.map(doc => processDoc<Currency>(doc));
  }
  return snapshot.docs.map(doc => processDoc<Currency>(doc));
}

export async function addCurrency(currency: Omit<Currency, 'id' | 'isBaseCurrency'>): Promise<void> {
    await addDoc(currencyCollection, { ...currency, isBaseCurrency: false });
}

export async function updateCurrency(id: string, currency: Partial<Omit<Currency, 'id'>>): Promise<void> {
    const docRef = doc(db, 'currencies', id);
    await updateDoc(docRef, currency);
}

export async function deleteCurrency(id: string): Promise<void> {
    const docRef = doc(db, 'currencies', id);
    await deleteDoc(docRef);
}

export async function setBaseCurrency(id: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    // 1. Find the current default currency
    const currentDefaultQuery = query(currencyCollection, where("isBaseCurrency", "==", true));
    const currentDefaultDocs = await getDocs(currentDefaultQuery);

    // 2. Unset the current default
    currentDefaultDocs.forEach(docSnap => {
        transaction.update(docSnap.ref, { isBaseCurrency: false });
    });

    // 3. Set the new default
    const newDefaultRef = doc(db, 'currencies', id);
    transaction.update(newDefaultRef, { isBaseCurrency: true });
  });
}

export async function updateAllExchangeRates(): Promise<{success: boolean, message: string}> {
  if (!EXCHANGE_RATE_API_KEY || EXCHANGE_RATE_API_KEY === 'YOUR_API_KEY_HERE') {
      const errorMsg = 'ExchangeRate-API key is not configured. Please add it to your .env file.';
      console.error(errorMsg);
      return { success: false, message: errorMsg };
  }
  
  const allCurrencies = await getCurrencies();
  const baseCurrency = allCurrencies.find(c => c.isBaseCurrency);
  
  if (!baseCurrency) {
      return { success: false, message: 'No base currency found.' };
  }
  
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${baseCurrency.code}`);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (data.result !== 'success') {
        throw new Error(`API error: ${data['error-type']}`);
    }

    const rates = data.conversion_rates;
    const batch = writeBatch(db);

    allCurrencies.forEach(currency => {
        if (rates[currency.code]) {
            const docRef = doc(db, 'currencies', currency.id);
            batch.update(docRef, { exchangeRate: rates[currency.code] });
        }
    });

    await batch.commit();
    return { success: true, message: 'Exchange rates updated successfully.' };

  } catch (error: any) {
    console.error('Failed to update exchange rates:', error);
    return { success: false, message: error.message };
  }
}
