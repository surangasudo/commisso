
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, runTransaction, DocumentData } from 'firebase/firestore';
import { type StockTransfer } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

type StockTransferItem = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

type StockTransferInput = Omit<StockTransfer, 'id' | 'totalAmount'> & {
    items: StockTransferItem[];
    additionalNotes?: string;
};

const stockTransfersCollection = collection(db, 'stockTransfers');

export async function getStockTransfers(): Promise<StockTransfer[]> {
    noStore();
    const snapshot = await getDocs(stockTransfersCollection);
    return snapshot.docs.map(doc => processDoc<StockTransfer>(doc));
}

export async function addStockTransfer(transfer: StockTransferInput): Promise<DocumentData> {
    const totalAmount = transfer.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) + (transfer.shippingCharges || 0);
    
    const newTransferData = {
        date: new Date(transfer.date),
        referenceNo: transfer.referenceNo || `ST-${Date.now()}`,
        locationFrom: transfer.locationFrom,
        locationTo: transfer.locationTo,
        status: transfer.status,
        shippingCharges: transfer.shippingCharges || 0,
        totalAmount: totalAmount,
        addedBy: transfer.addedBy,
        additionalNotes: transfer.additionalNotes || '',
        items: transfer.items, // Storing items for record keeping
    };

    return await runTransaction(db, async (transaction) => {
        const newTransferRef = doc(collection(db, "stockTransfers"));
        transaction.set(newTransferRef, newTransferData);
        
        for (const item of transfer.items) {
            const productRef = doc(db, 'products', item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw `Product with ID ${item.productId} does not exist.`;
            }
            
            const productData = productDoc.data();
            const currentTransferred = Number(productData.totalUnitTransferred) || 0;
            const newTotalTransferred = currentTransferred + item.quantity;
            
            transaction.update(productRef, { 
                totalUnitTransferred: newTotalTransferred 
            });
        }
        
        return { id: newTransferRef.id, ...newTransferData };
    });
}

export async function deleteStockTransfer(id: string): Promise<void> {
    // Note: Does not revert stock changes for simplicity.
    const docRef = doc(db, 'stockTransfers', id);
    await deleteDoc(docRef);
}
