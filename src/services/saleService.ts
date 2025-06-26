
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
        // 1. Fetch all agent profiles for this sale first
        const agentProfiles = new Map<string, DocumentData>();
        if (sale.commissionAgentIds) {
            for (const agentId of sale.commissionAgentIds) {
                const agentRef = doc(db, 'commissionProfiles', agentId);
                const agentDoc = await transaction.get(agentRef);
                if (agentDoc.exists()) {
                    agentProfiles.set(agentId, agentDoc.data());
                }
            }
        }
        
        const agentCommissionTotals: Record<string, number> = {};

        // 2. Process all sale items
        for (const item of sale.items) {
            const productRef = doc(db, 'products', item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw `Product with ID ${item.productId} not found.`;
            }
            
            const productData = productDoc.data();

            // 2a. Update stock level
            const currentStock = productData.currentStock || 0;
            transaction.update(productRef, { currentStock: currentStock - item.quantity });

            // 2b. Calculate commission for this item
            const salePrice = item.unitPrice * item.quantity;
            if (sale.commissionAgentIds) {
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
                    
                    agentCommissionTotals[agentId] += salePrice * (rate / 100);
                }
            }
        }

        // 3. Update agent profiles with total commission from this sale
        for (const agentId in agentCommissionTotals) {
            const agentRef = doc(db, 'commissionProfiles', agentId);
            const agentProfile = agentProfiles.get(agentId);
            if (!agentProfile) continue;
            
            const currentPending = agentProfile.totalCommissionPending || 0;
            transaction.update(agentRef, { totalCommissionPending: currentPending + agentCommissionTotals[agentId] });
        }

        // 4. Create the new sale document
        const newSaleRef = doc(collection(db, 'sales'));
        transaction.set(newSaleRef, sale);
    });
}

export async function deleteSale(id: string): Promise<void> {
    const docRef = doc(db, 'sales', id);
    await deleteDoc(docRef);
}
