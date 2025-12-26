import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, runTransaction, DocumentData, query, where } from 'firebase/firestore';
import { type StockAdjustment } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

type StockAdjustmentItem = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

type StockAdjustmentInput = Omit<StockAdjustment, 'id' | 'totalAmount' | 'referenceNo' | 'totalAmountRecovered' | 'reason'> & {
    referenceNo?: string;
    totalAmountRecovered?: number;
    reason?: string;
    items: StockAdjustmentItem[];
};


const stockAdjustmentsCollection = collection(db, 'stockAdjustments');

export async function getStockAdjustments(businessId?: string): Promise<StockAdjustment[]> {
    noStore();
    let q = query(stockAdjustmentsCollection);
    if (businessId) {
        q = query(stockAdjustmentsCollection, where('businessId', '==', businessId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => processDoc<StockAdjustment>(doc));
}

export async function addStockAdjustment(adjustment: StockAdjustmentInput, businessId?: string): Promise<DocumentData> {
    const totalAmount = adjustment.items.reduce((sum, item) => sum + (Math.abs(item.quantity) * item.unitPrice), 0);

    const newAdjustmentData = {
        date: new Date(adjustment.date),
        businessId: businessId || null,
        referenceNo: adjustment.referenceNo || `SA-${Date.now()}`,
        location: adjustment.location,
        adjustmentType: adjustment.adjustmentType,
        totalAmount: totalAmount,
        totalAmountRecovered: adjustment.totalAmountRecovered || 0,
        reason: adjustment.reason || '',
        addedBy: adjustment.addedBy,
    };

    return await runTransaction(db, async (transaction) => {
        // 1. Perform all reads first
        const productUpdates = [];
        for (const item of adjustment.items) {
            if (!item.productId) throw new Error("Invalid product ID in adjustment items");
            if (typeof item.quantity !== 'number' || isNaN(item.quantity)) throw new Error(`Invalid quantity for product ${item.productId}`);

            const productRef = doc(db, 'products', item.productId);
            const productDoc = await transaction.get(productRef);

            if (!productDoc.exists()) {
                throw new Error(`Product with ID ${item.productId} does not exist.`);
            }

            productUpdates.push({ ref: productRef, data: productDoc.data(), quantity: item.quantity });
        }

        // 2. Perform all writes
        const newAdjustmentRef = doc(collection(db, "stockAdjustments"));
        transaction.set(newAdjustmentRef, newAdjustmentData);

        for (const update of productUpdates) {
            const currentStock = Number(update.data.currentStock) || 0;
            const currentTotalAdjusted = Number(update.data.totalUnitAdjusted) || 0;

            const newStock = currentStock + update.quantity;
            const newTotalAdjusted = currentTotalAdjusted + update.quantity;

            transaction.update(update.ref, {
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
