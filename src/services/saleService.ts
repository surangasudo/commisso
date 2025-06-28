

'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, DocumentData, runTransaction, query, where } from 'firebase/firestore';
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

export async function updateSale(
    saleId: string, 
    updatedSaleData: Omit<Sale, 'id'>,
    commissionCalculationType: 'invoice_value' | 'payment_received',
    commissionCategoryRule: 'strict' | 'fallback'
): Promise<void> {
    // Step 1: Query for old commissions to delete OUTSIDE the transaction.
    const commissionsQuery = query(collection(db, 'commissions'), where("transaction_id", "==", saleId));
    const oldCommissionsSnapshot = await getDocs(commissionsQuery);

    await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        // Get original sale data
        const saleRef = doc(db, 'sales', saleId);
        const originalSaleDoc = await transaction.get(saleRef);
        if (!originalSaleDoc.exists()) throw new Error("Sale not found.");
        
        const originalSaleData = originalSaleDoc.data() as Sale;

        // Get all products involved (original and new)
        const originalItemsMap = new Map(originalSaleData.items.map(item => [item.productId, item.quantity]));
        const updatedItemsMap = new Map(updatedSaleData.items.map(item => [item.productId, item.quantity]));
        const allProductIds = new Set([...originalItemsMap.keys(), ...updatedItemsMap.keys()]);
        
        const productDataMap = new Map<string, DocumentData>();
        if (allProductIds.size > 0) {
            const productRefs = Array.from(allProductIds).map(id => doc(db, 'products', id));
            const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
            productDocs.forEach(productDoc => {
                if (productDoc.exists()) productDataMap.set(productDoc.id, productDoc.data());
            });
        }

        // Get all agent profiles involved in the updated sale
        const agentProfiles = new Map<string, DocumentData>();
        if (updatedSaleData.commissionAgentIds && updatedSaleData.commissionAgentIds.length > 0) {
            const agentRefs = updatedSaleData.commissionAgentIds.map(id => doc(db, 'commissionProfiles', id));
            const agentDocs = await Promise.all(agentRefs.map(ref => transaction.get(ref)));
            agentDocs.forEach(agentDoc => {
                if (agentDoc.exists()) agentProfiles.set(agentDoc.id, agentDoc.data());
            });
        }
        
        // --- WRITE PHASE ---
        
        // 1. Update product stock based on quantity differences
        for (const productId of allProductIds) {
            const productRef = doc(db, 'products', productId);
            const originalQty = originalItemsMap.get(productId) || 0;
            const updatedQty = updatedItemsMap.get(productId) || 0;
            const quantityChange = originalQty - updatedQty; // +ve means stock should increase, -ve means decrease

            if (quantityChange !== 0) {
                const currentStock = productDataMap.get(productId)?.currentStock || 0;
                transaction.update(productRef, { currentStock: currentStock + quantityChange });
            }
        }
        
        // 2. Delete old commission records
        oldCommissionsSnapshot.forEach(commissionDoc => {
            transaction.delete(commissionDoc.ref);
        });

        // 3. Create new commission records (logic copied and adapted from addSale)
        const commissionsCollectionRef = collection(db, 'commissions');
        for (const item of updatedSaleData.items) {
            const productData = productDataMap.get(item.productId);
            if (!productData) continue;
            
            const saleValue = item.unitPrice * item.quantity;
            if (updatedSaleData.commissionAgentIds && saleValue > 0) {
                for (const agentId of updatedSaleData.commissionAgentIds) {
                    const agentProfile = agentProfiles.get(agentId);
                    if (!agentProfile) continue;

                    const commission = agentProfile.commission || {};
                    const categories = commission.categories || [];
                    const hasCategoryRates = categories.length > 0;
                    let calculatedRate = 0;

                    if (hasCategoryRates) {
                        const categoryRateData = categories.find((c: any) => c.category?.toLowerCase() === productData.category?.toLowerCase());
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
                        const newCommissionRef = doc(commissionsCollectionRef);
                        transaction.set(newCommissionRef, {
                            transaction_id: saleId,
                            recipient_profile_id: agentId,
                            recipient_entity_type: agentProfile.entityType,
                            calculation_base_amount: saleValue,
                            calculated_rate: calculatedRate,
                            commission_amount: commissionAmount,
                            status: 'Pending Approval',
                            calculation_date: new Date().toISOString(),
                        });
                    }
                }
            }
        }
        
        // 4. Update the sale document itself
        transaction.update(saleRef, {
            ...updatedSaleData,
            date: new Date(updatedSaleData.date),
        });
    });
}

export async function deleteSale(id: string): Promise<void> {
    const saleRef = doc(db, 'sales', id);
    const commissionsQuery = query(collection(db, 'commissions'), where("transaction_id", "==", id));
    
    // Read which commissions to delete outside the transaction
    const commissionsSnapshot = await getDocs(commissionsQuery);
    
    await runTransaction(db, async (transaction) => {
        const saleDoc = await transaction.get(saleRef);
        if (!saleDoc.exists()) {
            throw new Error("Sale not found.");
        }
        const saleData = saleDoc.data() as Sale;

        // 1. Revert product stock for each item in the sale
        if (saleData.items) {
            const productRefs = saleData.items.map(item => doc(db, 'products', item.productId));
            // Read all product docs at once
            const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

            productDocs.forEach((productDoc, index) => {
                if (productDoc.exists()) {
                    const item = saleData.items[index];
                    const currentStock = productDoc.data().currentStock || 0;
                    transaction.update(productDoc.ref, { currentStock: currentStock + item.quantity });
                }
            });
        }

        // 2. Delete associated commission records that were queried earlier
        commissionsSnapshot.forEach(commissionDoc => {
            transaction.delete(commissionDoc.ref);
        });

        // 3. Delete the sale document itself
        transaction.delete(saleRef);
    });
}
