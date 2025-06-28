
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, runTransaction, DocumentData } from 'firebase/firestore';
import { type StockAdjustment } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

type StockAdjustmentItem = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

type StockAdjustmentInput = Omit<StockAdjustment, 'id' | 'totalAmount'> & {
    items: StockAdjustmentItem[];
};


const stockAdjustmentsCollection = collection(db, 'stockAdjustments');

export async function getStockAdjustments(): Promise<StockAdjustment[]> {
  noStore();
  const snapshot = await getDocs(stockAdjustmentsCollection);
  return snapshot.docs.map(doc => processDoc<StockAdjustment>(doc));
}

export async function addStockAdjustment(adjustment: StockAdjustmentInput): Promise<DocumentData> {
    const totalAmount = adjustment.items.reduce((sum, item) => sum + (Math.abs(item.quantity) * item.unitPrice), 0);

    const newAdjustmentData = {
        date: new Date(adjustment.date),
        referenceNo: adjustment.referenceNo || `SA-${Date.now()}`,
        location: adjustment.location,
        adjustmentType: adjustment.adjustmentType,
        totalAmount: totalAmount,
        totalAmountRecovered: adjustment.totalAmountRecovered || 0,
        reason: adjustment.reason || '',
        addedBy: adjustment.addedBy,
    };
    
    return await runTransaction(db, async (transaction) => {
        // 1. Add the new stock adjustment document
        const newAdjustmentRef = doc(collection(db, "stockAdjustments"));
        transaction.set(newAdjustmentRef, newAdjustmentData);
        
        // 2. Update the stock for each product
        for (const item of adjustment.items) {
            const productRef = doc(db, 'products', item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw `Product with ID ${item.productId} does not exist.`;
            }
            
            const productData = productDoc.data();
            const currentStock = Number(productData.currentStock) || 0;
            const currentTotalAdjusted = Number(productData.totalUnitAdjusted) || 0;
            
            const newStock = currentStock + item.quantity; 
            const newTotalAdjusted = currentTotalAdjusted + item.quantity;
            
            transaction.update(productRef, { 
                currentStock: newStock,
                totalUnitAdjusted: newTotalAdjusted 
            });
        }
        
        return { id: newAdjustmentRef.id, ...newAdjustmentData };
    });
}


export async function deleteStockAdjustment(id: string): Promise<void> {
    // Note: This does not revert the stock changes for simplicity.
    // A full implementation would require another transaction to undo the stock updates.
    const docRef = doc(db, 'stockAdjustments', id);
    await deleteDoc(docRef);
}
