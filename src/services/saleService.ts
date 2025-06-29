

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
): Promise<string> {
  const saleDataForDb = {
    ...sale,
    date: new Date(sale.date),
  };

  const saleId = await runTransaction(db, async (transaction) => {
    // --- READ PHASE ---
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

    let customerRef;
    if (sale.customerId && sale.customerId !== 'walk-in') {
        customerRef = doc(db, 'customers', sale.customerId);
        const customerDoc = await transaction.get(customerRef);
        if (!customerDoc.exists()) {
            throw new Error("Customer not found.");
        }
    }

    // --- WRITE PHASE ---
    const newSaleRef = doc(collection(db, 'sales'));
    transaction.set(newSaleRef, saleDataForDb);
    const createdSaleId = newSaleRef.id;

    if (customerRef) {
        const customerDoc = await transaction.get(customerRef); // Re-read to be safe
        const currentDue = customerDoc.data()?.totalSaleDue || 0;
        transaction.update(customerRef, {
            totalSaleDue: currentDue + sale.sellDue
        });
    }

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

    const commissionsCollectionRef = collection(db, 'commissions');
    const agentCommissionTotals = new Map<string, number>();

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
            const categoryRateData = categories.find((c: any) => {
                if (!c.category || !productData.category) {
                    return false; 
                }
                return c.category.trim().toLowerCase() === productData.category.trim().toLowerCase();
            });

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
                  transaction_id: createdSaleId,
                  recipient_profile_id: agentId,
                  recipient_entity_type: agentProfile.entityType,
                  calculation_base_amount: saleValue,
                  calculated_rate: calculatedRate,
                  commission_amount: commissionAmount,
                  status: 'Pending Approval',
                  calculation_date: new Date(),
              };
              const newCommissionRef = doc(commissionsCollectionRef);
              transaction.set(newCommissionRef, newCommission);

              const currentTotal = agentCommissionTotals.get(agentId) || 0;
              agentCommissionTotals.set(agentId, currentTotal + commissionAmount);
          }
        }
      }
    }

    for (const [agentId, commissionToAdd] of agentCommissionTotals.entries()) {
        const agentRef = doc(db, 'commissionProfiles', agentId);
        const agentProfileData = agentProfiles.get(agentId); 
        if (agentProfileData) {
            const currentEarned = agentProfileData.totalCommissionEarned || 0;
            transaction.update(agentRef, {
                totalCommissionEarned: currentEarned + commissionToAdd
            });
        }
    }

    return createdSaleId;
  });
  return saleId;
}

export async function updateSale(
    saleId: string, 
    updatedSaleData: Omit<Sale, 'id'>,
    commissionCalculationType: 'invoice_value' | 'payment_received',
    commissionCategoryRule: 'strict' | 'fallback'
): Promise<void> {
    const commissionsQuery = query(collection(db, 'commissions'), where("transaction_id", "==", saleId));
    
    const oldCommissionsSnapshot = await getDocs(commissionsQuery);
    const oldCommissionRefs = oldCommissionsSnapshot.docs.map(d => d.ref);

    await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        const saleRef = doc(db, 'sales', saleId);
        const originalSaleDoc = await transaction.get(saleRef);
        if (!originalSaleDoc.exists()) throw new Error("Sale not found.");
        const originalSaleData = originalSaleDoc.data() as Sale;

        const allProductIds = new Set([...originalSaleData.items.map(i => i.productId), ...updatedSaleData.items.map(i => i.productId)]);
        const allAgentIds = new Set([...(originalSaleData.commissionAgentIds || []), ...(updatedSaleData.commissionAgentIds || [])]);
        
        const productRefs = Array.from(allProductIds).map(id => doc(db, 'products', id));
        const agentRefs = Array.from(allAgentIds).map(id => doc(db, 'commissionProfiles', id));
        
        const [productDocs, agentDocs, oldCommissionDocs] = await Promise.all([
             Promise.all(productRefs.map(ref => transaction.get(ref))),
             Promise.all(agentRefs.map(ref => transaction.get(ref))),
             Promise.all(oldCommissionRefs.map(ref => transaction.get(ref)))
        ]);

        const productDataMap = new Map(productDocs.map(d => [d.id, d.data()]));
        const agentDataMap = new Map(agentDocs.map(d => [d.id, d.data()]));
        
        // --- WRITE PHASE ---
        
        // 1. Revert old stock levels & commission earned
        originalSaleData.items.forEach(item => {
            const productData = productDataMap.get(item.productId);
            if (productData) {
                const productRef = doc(db, 'products', item.productId);
                transaction.update(productRef, { currentStock: (productData.currentStock || 0) + item.quantity });
            }
        });
        
        oldCommissionDocs.forEach(commissionDoc => {
            if (commissionDoc.exists()) {
                const commissionData = commissionDoc.data();
                const agentId = commissionData.recipient_profile_id;
                const amount = commissionData.commission_amount;
                const agentData = agentDataMap.get(agentId);
                
                if (agentData) {
                    const agentRef = doc(db, 'commissionProfiles', agentId);
                    transaction.update(agentRef, { totalCommissionEarned: (agentData.totalCommissionEarned || 0) - amount });
                }
                transaction.delete(commissionDoc.ref);
            }
        });

        // 2. Apply new stock levels & commission earned
        const newCommissionTotals = new Map<string, number>();

        updatedSaleData.items.forEach(item => {
            const productData = productDataMap.get(item.productId);
            if (productData) {
                const productRef = doc(db, 'products', item.productId);
                transaction.update(productRef, { currentStock: (productData.currentStock || 0) - item.quantity });

                const saleValue = item.unitPrice * item.quantity;
                if (updatedSaleData.commissionAgentIds && saleValue > 0) {
                    for (const agentId of updatedSaleData.commissionAgentIds) {
                        const agentProfile = agentDataMap.get(agentId);
                        if (!agentProfile) continue;

                        const commission = agentProfile.commission || {};
                        const categories = commission.categories || [];
                        const hasCategoryRates = categories.length > 0;
                        let calculatedRate = 0;

                        if (hasCategoryRates) {
                            const categoryRateData = categories.find((c: any) => c.category?.trim().toLowerCase() === productData.category?.trim().toLowerCase());
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
                            newCommissionTotals.set(agentId, (newCommissionTotals.get(agentId) || 0) + commissionAmount);
                        }
                    }
                }
            }
        });

        for(const [agentId, newAmount] of newCommissionTotals.entries()) {
            const agentData = agentDataMap.get(agentId);
            if(agentData) {
                const agentRef = doc(db, 'commissionProfiles', agentId);
                const oldRevertedCommission = oldCommissionDocs.filter(c => c.exists() && c.data()!.recipient_profile_id === agentId).reduce((sum, c) => sum + c.data()!.commission_amount, 0);
                const revertedTotal = (agentData.totalCommissionEarned || 0) - oldRevertedCommission;
                transaction.update(agentRef, { totalCommissionEarned: revertedTotal + newAmount });

                // Create new aggregate commission doc
                const newCommissionRef = doc(collection(db, 'commissions'));
                transaction.set(newCommissionRef, {
                    transaction_id: saleId,
                    recipient_profile_id: agentId,
                    recipient_entity_type: agentData.entityType,
                    calculation_base_amount: updatedSaleData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
                    calculated_rate: 0,
                    commission_amount: newAmount,
                    status: 'Pending Approval',
                    calculation_date: new Date(),
                });
            }
        }
        
        transaction.update(saleRef, {
            ...updatedSaleData,
            date: new Date(updatedSaleData.date),
        });
    });
}

export async function deleteSale(id: string): Promise<void> {
    const saleRef = doc(db, 'sales', id);
    const commissionsQuery = query(collection(db, 'commissions'), where("transaction_id", "==", id));
    
    // Query outside transaction to get references, which is allowed.
    const commissionsSnapshot = await getDocs(commissionsQuery);
    const commissionRefs = commissionsSnapshot.docs.map(d => d.ref);

    await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        const saleDoc = await transaction.get(saleRef);
        if (!saleDoc.exists()) {
            console.log(`Sale ${id} not found, it may have been already deleted.`);
            return;
        }
        const saleData = saleDoc.data() as Sale;

        // Read all product docs
        const productRefs = saleData.items ? saleData.items.map(item => doc(db, 'products', item.productId)) : [];
        const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        // Read all commission docs using their references
        const commissionDocs = await Promise.all(commissionRefs.map(ref => transaction.get(ref)));

        // Get all unique agent IDs from the commissions to read their profiles
        const agentIds = new Set<string>();
        commissionDocs.forEach(commissionDoc => {
            if (commissionDoc.exists()) {
                const agentId = commissionDoc.data().recipient_profile_id;
                if (agentId) agentIds.add(agentId);
            }
        });
        const agentRefs = Array.from(agentIds).map(agentId => doc(db, 'commissionProfiles', agentId));
        const agentDocs = await Promise.all(agentRefs.map(ref => transaction.get(ref)));
        const agentDataMap = new Map(agentDocs.map(d => [d.id, d.data()]));

        // --- WRITE PHASE ---
        
        // 1. Revert product stock
        productDocs.forEach((productDoc, index) => {
            if (productDoc.exists()) {
                const item = saleData.items[index];
                const currentStock = productDoc.data().currentStock || 0;
                transaction.update(productDoc.ref, { currentStock: currentStock + item.quantity });
            }
        });

        // 2. Revert commission totals and delete commission docs
        commissionDocs.forEach(commissionDoc => {
            if (commissionDoc.exists()) {
                const commissionData = commissionDoc.data();
                const agentId = commissionData.recipient_profile_id;
                const amount = commissionData.commission_amount;
                
                if (agentId && amount) {
                    const agentData = agentDataMap.get(agentId);
                    if (agentData) {
                        const agentRef = doc(db, 'commissionProfiles', agentId);
                        const currentEarned = agentData.totalCommissionEarned || 0;
                        transaction.update(agentRef, { totalCommissionEarned: currentEarned - amount });
                    } else {
                         console.warn(`Could not find agent profile ${agentId} to revert commission.`);
                    }
                }
                transaction.delete(commissionDoc.ref);
            }
        });
        
        // 3. Delete the sale document itself
        transaction.delete(saleRef);
    });
}
