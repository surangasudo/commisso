
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, DocumentData, runTransaction } from 'firebase/firestore';
import { type Sale, type DetailedProduct, type CommissionProfile } from '@/lib/data';

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
          invoiceNo: docData.invoiceNo || '',
          customerName: docData.customerName || '',
          contactNumber: docData.contactNumber || '',
          location: docData.location || '',
          paymentStatus: docData.paymentStatus || 'Due',
          paymentMethod: docData.paymentMethod || '',
          totalAmount: docData.totalAmount || 0,
          totalPaid: docData.totalPaid || 0,
          sellDue: docData.sellDue || 0,
          sellReturnDue: docData.sellReturnDue || 0,
          shippingStatus: docData.shippingStatus || null,
          totalItems: docData.totalItems || 0,
          addedBy: docData.addedBy || '',
          sellNote: docData.sellNote || null,
          staffNote: docData.staffNote || null,
          shippingDetails: docData.shippingDetails || null,
          taxAmount: docData.taxAmount || 0,
          items: docData.items || [],
          commissionAgentIds: docData.commissionAgentIds || null,
      } as Sale;
  });
  return data;
}

export async function getSale(id: string): Promise<Sale | null> {
    const docRef = doc(db, 'sales', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const docData = docSnap.data();
        return {
            id: docSnap.id,
            date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
            invoiceNo: docData.invoiceNo || '',
            customerName: docData.customerName || '',
            contactNumber: docData.contactNumber || '',
            location: docData.location || '',
            paymentStatus: docData.paymentStatus || 'Due',
            paymentMethod: docData.paymentMethod || '',
            totalAmount: docData.totalAmount || 0,
            totalPaid: docData.totalPaid || 0,
            sellDue: docData.sellDue || 0,
            sellReturnDue: docData.sellReturnDue || 0,
            shippingStatus: docData.shippingStatus || null,
            totalItems: docData.totalItems || 0,
            addedBy: docData.addedBy || '',
            sellNote: docData.sellNote || null,
            staffNote: docData.staffNote || null,
            shippingDetails: docData.shippingDetails || null,
            taxAmount: docData.taxAmount || 0,
            items: docData.items || [],
            commissionAgentIds: docData.commissionAgentIds || null,
        } as Sale;
    } else {
        return null;
    }
}

export async function addSale(sale: Omit<Sale, 'id'>) {
    await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        
        // 1. Fetch all agent profiles for this sale
        const agentProfiles = new Map<string, DocumentData>();
        if (sale.commissionAgentIds && sale.commissionAgentIds.length > 0) {
            const agentRefs = sale.commissionAgentIds.map(id => doc(db, 'commissionProfiles', id));
            const agentDocs = await Promise.all(agentRefs.map(ref => transaction.get(ref)));
            agentDocs.forEach(agentDoc => {
                if (agentDoc.exists()) {
                    agentProfiles.set(agentDoc.id, agentDoc.data());
                }
            });
        }
        
        // 2. Fetch all product documents for this sale
        const productDataMap = new Map<string, DocumentData>();
        if (sale.items && sale.items.length > 0) {
            const productRefs = sale.items.map(item => doc(db, 'products', item.productId));
            const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
            productDocs.forEach(productDoc => {
                if (productDoc.exists()) {
                    productDataMap.set(productDoc.id, productDoc.data());
                } else {
                    // If any product doesn't exist, fail the transaction.
                    throw new Error(`Product with ID ${productDoc.id} not found.`);
                }
            });
        }

        // --- CALCULATION PHASE ---

        const agentCommissionTotals: Record<string, number> = {};

        // Process all sale items and calculate commissions
        for (const item of sale.items) {
            const productData = productDataMap.get(item.productId);
            if (!productData) continue; 

            // Calculate commission for this item based on sale value
            const saleValue = item.unitPrice * item.quantity;
            
            if (sale.commissionAgentIds && saleValue > 0) {
                for (const agentId of sale.commissionAgentIds) {
                    const agentProfile = agentProfiles.get(agentId);
                    if (!agentProfile) continue;

                    if (!agentCommissionTotals[agentId]) {
                        agentCommissionTotals[agentId] = 0;
                    }

                    const commission = agentProfile.commission || {};
                    const categories = commission.categories || [];
                    
                    const categoryRateData = categories.find((c: any) => c.category === productData.category);
                    const rate = categoryRateData ? categoryRateData.rate : commission.overall;
                    
                    agentCommissionTotals[agentId] += saleValue * (rate / 100);
                }
            }
        }
        
        // --- WRITE PHASE ---

        // 1. Update product stock levels
        for (const item of sale.items) {
            const productRef = doc(db, 'products', item.productId);
            const productData = productDataMap.get(item.productId);
            if (productData) {
                 const currentStock = productData.currentStock || 0;
                 transaction.update(productRef, { currentStock: currentStock - item.quantity });
            }
        }
        
        // 2. Update agent profiles with total commission from this sale
        for (const agentId in agentCommissionTotals) {
            const agentRef = doc(db, 'commissionProfiles', agentId);
            const agentProfile = agentProfiles.get(agentId);
            if (!agentProfile) continue;
            
            const currentPending = agentProfile.totalCommissionPending || 0;
            transaction.update(agentRef, { totalCommissionPending: currentPending + agentCommissionTotals[agentId] });
        }

        // 3. Create the new sale document
        const newSaleRef = doc(collection(db, 'sales'));
        transaction.set(newSaleRef, sale);
    });
}

export async function deleteSale(id: string): Promise<void> {
    const docRef = doc(db, 'sales', id);
    await deleteDoc(docRef);
}
