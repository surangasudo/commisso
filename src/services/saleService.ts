

'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, DocumentData, runTransaction, updateDoc } from 'firebase/firestore';
import { type Sale, type DetailedProduct, type CommissionProfile } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  noStore();
  const snapshot = await getDocs(salesCollection);
  return snapshot.docs.map(doc => processDoc<Sale>(doc));
}

export async function getSale(id: string): Promise<Sale | null> {
    noStore();
    const docRef = doc(db, 'sales', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return processDoc<Sale>(docSnap);
    } else {
        return null;
    }
}

export async function addSale(
  sale: Omit<Sale, 'id'>,
  commissionCalculationType: 'invoice_value' | 'payment_received',
  commissionCategoryRule: 'strict' | 'fallback'
) {
  const saleDataForDb = {
    ...sale,
    date: new Date(sale.date),
  };

  await runTransaction(db, async (transaction) => {
    // 1. Fetch all agent profiles for this sale
    const agentProfiles = new Map<string, DocumentData>();
    if (sale.commissionAgentIds && sale.commissionAgentIds.length > 0) {
      const agentRefs = sale.commissionAgentIds.map((id) => doc(db, 'commissionProfiles', id));
      const agentDocs = await Promise.all(agentRefs.map((ref) => transaction.get(ref)));
      agentDocs.forEach((agentDoc) => {
        if (agentDoc.exists()) {
          agentProfiles.set(agentDoc.id, agentDoc.data());
        }
      });
    }

    // 2. Fetch all product documents for this sale
    const productDataMap = new Map<string, DocumentData>();
    if (sale.items && sale.items.length > 0) {
      const productRefs = sale.items.map((item) => doc(db, 'products', item.productId));
      const productDocs = await Promise.all(productRefs.map((ref) => transaction.get(ref)));
      productDocs.forEach((productDoc) => {
        if (productDoc.exists()) {
          productDataMap.set(productDoc.id, productDoc.data());
        } else {
          throw new Error(`Product with ID ${productDoc.id} not found.`);
        }
      });
    }

    // 3. Create the new sale document
    const newSaleRef = doc(collection(db, 'sales'));
    transaction.set(newSaleRef, saleDataForDb);
    const saleId = newSaleRef.id;

    // --- WRITE PHASE ---

    // 1. Update product stock levels
    for (const item of sale.items) {
      const productRef = doc(db, 'products', item.productId);
      const productData = productDataMap.get(item.productId);
      if (productData) {
        const currentStock = productData.currentStock || 0;
        transaction.update(productRef, {
          currentStock: currentStock - item.quantity,
        });
      }
    }

    // 2. Create individual commission records
    const commissionsCollectionRef = collection(db, 'commissions');
    for (const item of sale.items) {
      const productData = productDataMap.get(item.productId);
      if (!productData) continue;

      const saleValue = item.unitPrice * item.quantity;
      if (sale.commissionAgentIds && saleValue > 0) {
        for (const agentId of sale.commissionAgentIds) {
          const agentProfile = agentProfiles.get(agentId);
          if (!agentProfile) continue;

          const commission = agentProfile.commission || {};
          const categories = commission.categories || [];
          const hasCategoryRates = categories.length > 0;
          let calculatedRate = 0;

          if (hasCategoryRates) {
            const categoryRateData = categories.find(
              (c: any) => c.category?.toLowerCase() === productData.category?.toLowerCase()
            );
            if (categoryRateData) {
              calculatedRate = categoryRateData.rate;
            } else if (commissionCategoryRule === 'fallback') {
              calculatedRate = commission.overall || 0;
            }
          } else {
            calculatedRate = commission.overall || 0;
          }
          
          const commissionAmount = saleValue * (calculatedRate / 100);

          if (commissionAmount > 0) {
              const newCommission = {
                  transaction_id: saleId,
                  recipient_profile_id: agentId,
                  recipient_entity_type: agentProfile.entityType,
                  calculation_base_amount: saleValue,
                  calculated_rate: calculatedRate,
                  commission_amount: commissionAmount,
                  status: 'Pending Approval', // New Logic
                  calculation_date: new Date().toISOString(),
              };
              const newCommissionRef = doc(commissionsCollectionRef);
              transaction.set(newCommissionRef, newCommission);
          }
        }
      }
    }
  });
}


export async function updateSale(saleId: string, updatedSaleData: Omit<Sale, 'id'>, originalSaleData: Sale): Promise<void> {
    await runTransaction(db, async (transaction) => {
        // --- PREPARE DATA ---
        const originalItems = new Map(originalSaleData.items.map(item => [item.productId, item.quantity]));
        const updatedItems = new Map(updatedSaleData.items.map(item => [item.productId, item.quantity]));
        const allProductIds = new Set([...originalItems.keys(), ...updatedItems.keys()]);

        // --- READ PHASE ---
        const productRefsAndDocs = await Promise.all(
            Array.from(allProductIds).map(async (productId) => {
                const ref = doc(db, 'products', productId);
                const pDoc = await transaction.get(ref);
                if (!pDoc.exists()) {
                    throw new Error(`Product with ID ${productId} not found.`);
                }
                return { ref, doc: pDoc };
            })
        );
        
        // --- WRITE PHASE ---
        
        // Update product stock based on quantity differences
        for (const { ref, doc: productDoc } of productRefsAndDocs) {
            const productId = productDoc.id;
            const originalQty = originalItems.get(productId) || 0;
            const updatedQty = updatedItems.get(productId) || 0;
            const quantityChange = originalQty - updatedQty; // +ve means stock should increase, -ve means decrease

            if (quantityChange !== 0) {
                const currentStock = productDoc.data().currentStock || 0;
                transaction.update(ref, { currentStock: currentStock + quantityChange });
            }
        }

        // Update the sale document itself
        const saleRef = doc(db, 'sales', saleId);
        transaction.update(saleRef, updatedSaleData);
    });
}

export async function deleteSale(id: string): Promise<void> {
    const docRef = doc(db, 'sales', id);
    await deleteDoc(docRef);
}
