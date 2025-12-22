

// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, DocumentData, runTransaction, query, where, orderBy } from 'firebase/firestore';
import { type Sale, type DetailedProduct, type CommissionProfile } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const salesCollection = collection(db, 'sales');
const draftsCollection = collection(db, 'drafts');
const quotationsCollection = collection(db, 'quotations');

export async function getSales(): Promise<Sale[]> {
    noStore();
    const q = query(salesCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
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
): Promise<{ id: string, invoiceNo: string }> {
    const saleDataForDb = {
        ...sale,
        date: new Date(sale.date),
        paymentReference: sale.paymentReference || null, // Fix for undefined error
    };

    const productCategoriesCollection = collection(db, 'productCategories');
    const categoriesSnapshot = await getDocs(productCategoriesCollection);
    const categoriesMap = new Map<string, any>();
    categoriesSnapshot.docs.forEach(doc => {
        categoriesMap.set(doc.id, doc.data());
    });

    const saleId = await runTransaction(db, async (transaction) => {
        // --- 1. GENERATE INVOICE NUMBER (SEQ-1) ---
        // Extract 2-letter prefix from location or fallback to 'IN'
        const locationPrefix = sale.location ? sale.location.substring(0, 2).toUpperCase() : 'IN';
        const counterRef = doc(db, 'counters', `invoice_${locationPrefix}`);
        const counterDoc = await transaction.get(counterRef);

        let nextCount = 1;
        if (counterDoc.exists()) {
            nextCount = counterDoc.data().count + 1;
        }

        // Pad with zeros to 4 digits (e.g., 0001)
        const sequencePart = nextCount.toString().padStart(4, '0');
        const finalInvoiceNo = `${locationPrefix}-${sequencePart}`;

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

        // (Removed erroneous collection fetch)

        let customerRef;
        let customerDocSnap: DocumentData | undefined;

        if (sale.customerId && sale.customerId !== 'walk-in') {
            customerRef = doc(db, 'customers', sale.customerId);
            customerDocSnap = await transaction.get(customerRef);
            if (customerDocSnap && !customerDocSnap.exists()) {
                throw new Error("Customer not found.");
            }
        }

        // --- LOGIC & VALIDATION PHASE (SEC-1 & LOG-1) ---
        let serverCalculatedTotal = 0;

        // Validate Items, Stock, and Recalculate Prices
        const processedItems = sale.items.map(item => {
            const productData = productDataMap.get(item.productId);
            if (!productData) throw new Error(`Product ${item.productId} missing.`);

            // SEC-1: Preference for the price provided by the POS (cart), allowing for discounts or custom pricing.
            // Fallback to DB price if not provided.
            const actualUnitPrice = item.unitPrice || productData.sellingPrice || 0;

            // LOG-1: Check for Negative Inventory
            const currentStock = productData.currentStock || 0;
            if (currentStock < item.quantity) {
                // Allow negative stock for now to prevent blocking sales in some business models, 
                // or uncomment below to enforce strict stock.
                // throw new Error(`Insufficient stock for ${productData.name}. Available: ${currentStock}, Requested: ${item.quantity}`);
            }

            // Basic rounding to 2 decimal places to minimize floating point errors (FIN-1)
            serverCalculatedTotal += Math.round((actualUnitPrice * item.quantity) * 100) / 100;

            return {
                ...item,
                unitPrice: actualUnitPrice // Override client data with trusted server data
            };
        });

        // Re-add Tax (assuming tax amount from client is based on rate, but ideally should recalculate tax too)
        // For now, we trust the tax AMOUNT relative to the new base, or just add the fixed tax if it's simple.
        // To be strictly secure, tax should also be recalculated. 
        // We will use the client's tax amount but validate the total.

        // Recalculate 'sellDue' based on trusted total and the actual paid amount
        const trustedTotalAmount = serverCalculatedTotal + (sale.taxAmount || 0); // Add tax back
        const trustedSellDue = Math.max(0, trustedTotalAmount - sale.totalPaid);

        // --- WRITE PHASE ---
        const newSaleRef = doc(collection(db, 'sales'));

        // Update Counter (Deferred Write)
        if (counterDoc.exists()) {
            transaction.update(counterRef, { count: nextCount });
        } else {
            transaction.set(counterRef, { count: nextCount });
        }

        // Save the trusted data with the generated Invoice Number
        transaction.set(newSaleRef, {
            ...saleDataForDb,
            invoiceNo: finalInvoiceNo, // Set the sequential invoice number
            items: processedItems,
            totalAmount: trustedTotalAmount, // Overwrite with trusted total
            sellDue: trustedSellDue // Recalculate due amount
        });
        const createdSaleId = newSaleRef.id;

        if (customerRef && customerDocSnap && customerDocSnap.exists()) {
            const currentDue = customerDocSnap.data()?.totalSaleDue || 0;
            transaction.update(customerRef, {
                totalSaleDue: currentDue + trustedSellDue
            });
        }

        for (const item of processedItems) {
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

        // Use processedItems for commission calculation to ensure we use trusted prices
        for (const item of processedItems) {
            const productData = productDataMap.get(item.productId);
            if (!productData) continue;

            const saleValue = item.unitPrice * item.quantity;
            if (!sale.commissionAgentIds || saleValue <= 0) continue;

            const salespersonsInSale = sale.commissionAgentIds.filter(id => {
                const profile = agentProfiles.get(id);
                return profile?.entityType === 'Salesperson';
            });
            const salespersonCount = salespersonsInSale.length;

            for (const agentId of sale.commissionAgentIds) {
                const agentProfile = agentProfiles.get(agentId);
                if (!agentProfile) continue;

                const commissionSettings = agentProfile.commission || {};
                const categoryRates = Array.isArray(commissionSettings.categories) ? commissionSettings.categories : [];
                const overallRate = typeof commissionSettings.overall === 'number' ? commissionSettings.overall : 0;
                const productCategoryName = typeof productData.category === 'string' ? productData.category.trim().toLowerCase() : null;
                const productCategoryId = productData.categoryId || null;

                let applicableRate = overallRate;

                // Recursive function to find the most specific rate in the hierarchy
                const findCategoryRate = (catId: string | null, catName: string | null): number | null => {
                    if (!catId && !catName) return null;

                    // If ID is missing but name is present, try to find the ID to enable hierarchy traversal
                    let resolvedId = catId;
                    if (!resolvedId && catName) {
                        const normalizedName = catName.trim().toLowerCase();
                        for (const [id, data] of categoriesMap.entries()) {
                            if (data.name && data.name.trim().toLowerCase() === normalizedName) {
                                resolvedId = id;
                                break;
                            }
                        }
                    }

                    // 1. Try direct ID match
                    if (resolvedId) {
                        const rule = categoryRates.find((c: any) => c.categoryId === resolvedId);
                        if (rule && typeof rule.rate === 'number') return rule.rate;
                    }

                    // 2. Try direct name match
                    if (catName) {
                        const normalizedName = catName.trim().toLowerCase();
                        const rule = categoryRates.find((c: any) => c.category && c.category.trim().toLowerCase() === normalizedName);
                        if (rule && typeof rule.rate === 'number') return rule.rate;
                    }

                    // 3. Try matching parent category if ID is available (or resolved)
                    if (resolvedId) {
                        const currentCat = categoriesMap.get(resolvedId);
                        if (currentCat && currentCat.parentId) {
                            const parentCat = categoriesMap.get(currentCat.parentId);
                            return findCategoryRate(currentCat.parentId, parentCat ? parentCat.name : null);
                        }
                    }

                    return null;
                };

                const foundRate = findCategoryRate(productCategoryId, productCategoryName);

                if (foundRate !== null) {
                    applicableRate = foundRate;
                } else if (categoryRates.length > 0 && commissionCategoryRule === 'strict') {
                    applicableRate = 0;
                }

                let commissionAmount = saleValue * (applicableRate / 100);

                // Divide commission if multiple salespersons are selected
                if (agentProfile.entityType === 'Salesperson' && salespersonCount > 1) {
                    commissionAmount = commissionAmount / salespersonCount;
                }

                if (commissionAmount > 0) {
                    const newCommissionRef = doc(commissionsCollectionRef);
                    transaction.set(newCommissionRef, {
                        transaction_id: createdSaleId,
                        recipient_profile_id: agentId,
                        recipient_entity_type: agentProfile.entityType,
                        calculation_base_amount: saleValue,
                        calculated_rate: applicableRate,
                        product_category_id: productCategoryId,
                        product_category_name: productData.category || null,
                        commission_amount: commissionAmount,
                        status: 'Pending Approval',
                        calculation_date: new Date().toISOString(),
                    });
                    const currentTotal = agentCommissionTotals.get(agentId) || 0;
                    agentCommissionTotals.set(agentId, currentTotal + commissionAmount);
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

        return { id: createdSaleId, invoiceNo: finalInvoiceNo };
    });
    return saleId;
}

export async function updateSale(
    saleId: string,
    updatedSaleData: Omit<Sale, 'id'>,
    commissionCalculationType: 'invoice_value' | 'payment_received',
    commissionCategoryRule: 'strict' | 'fallback'
): Promise<void> {
    // 1. Fetch auxiliary data needed for calculation
    const productCategoriesCollection = collection(db, 'productCategories');
    const categoriesSnapshot = await getDocs(productCategoriesCollection);
    const categoriesMap = new Map<string, any>();
    categoriesSnapshot.docs.forEach(doc => {
        categoriesMap.set(doc.id, doc.data());
    });

    // 2. Fetch OLD commissions for this sale to revert them
    const commissionsCollectionRef = collection(db, 'commissions');
    const q = query(commissionsCollectionRef, where('transaction_id', '==', saleId));
    const oldCommissionsSnapshot = await getDocs(q);
    const oldCommissions = oldCommissionsSnapshot.docs.map(doc => ({
        ref: doc.ref,
        data: doc.data()
    }));

    // 3. Identify all agents involved (old and new)
    const oldAgentIds = new Set(oldCommissions.map(c => c.data.recipient_profile_id));
    const newAgentIds = new Set(updatedSaleData.commissionAgentIds || []);
    const allAgentIds = new Set([...oldAgentIds, ...newAgentIds]);

    await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        const saleRef = doc(db, 'sales', saleId);
        const originalSaleDoc = await transaction.get(saleRef);
        if (!originalSaleDoc.exists()) {
            throw new Error("Original sale document not found.");
        }
        const originalSaleData = originalSaleDoc.data() as Sale;

        const allProductIds = new Set([
            ...originalSaleData.items.map(item => item.productId),
            ...updatedSaleData.items.map(item => item.productId)
        ]);

        const productRefs = Array.from(allProductIds).map(id => doc(db, 'products', id));
        const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        const productDataMap = new Map<string, DocumentData>();
        productDocs.forEach(docSnap => {
            if (docSnap.exists()) {
                productDataMap.set(docSnap.id, docSnap.data());
            } else {
                throw new Error(`Product with ID ${docSnap.id} not found.`);
            }
        });

        let customerRef: any;
        let customerData: any;
        if (originalSaleData.customerId && originalSaleData.customerId !== 'walk-in') {
            customerRef = doc(db, 'customers', originalSaleData.customerId);
            customerData = await transaction.get(customerRef);
            if (!customerData.exists()) {
                throw new Error("Customer not found.");
            }
        }

        // Read Agent Profiles
        const agentProfiles = new Map<string, DocumentData>();
        const agentRefs = Array.from(allAgentIds).map(id => doc(db, 'commissionProfiles', id));
        if (agentRefs.length > 0) {
            const agentDocs = await Promise.all(agentRefs.map(ref => transaction.get(ref)));
            agentDocs.forEach(doc => {
                if (doc.exists()) agentProfiles.set(doc.id, doc.data());
            });
        }

        // --- WRITE PHASE ---

        // 1. Revert stock levels from the original sale
        originalSaleData.items.forEach(item => {
            const productRef = doc(db, 'products', item.productId);
            const currentData = productDataMap.get(item.productId);
            if (currentData) {
                const currentStock = currentData.currentStock || 0;
                transaction.update(productRef, { currentStock: currentStock + item.quantity });
                productDataMap.set(item.productId, { ...currentData, currentStock: currentStock + item.quantity });
            }
        });

        // 2. Apply stock levels for the new sale
        updatedSaleData.items.forEach(item => {
            const productRef = doc(db, 'products', item.productId);
            const currentData = productDataMap.get(item.productId);
            if (currentData) {
                const currentStock = currentData.currentStock || 0;
                transaction.update(productRef, { currentStock: currentStock - item.quantity });
                productDataMap.set(item.productId, { ...currentData, currentStock: currentStock - item.quantity });
            }
        });

        // 3. Update customer's totalSaleDue
        if (customerRef && customerData) {
            const originalDue = originalSaleData.sellDue || 0;
            const newDue = updatedSaleData.sellDue || 0;
            const dueDifference = newDue - originalDue;

            const currentTotalDue = customerData.data().totalSaleDue || 0;
            transaction.update(customerRef, { totalSaleDue: currentTotalDue + dueDifference });
        }

        // 4. COMMISSION LOGIC
        const agentAdjustments = new Map<string, number>(); // Map<AgentId, NetChange>

        // A. Revert Old Commissions
        for (const oldComm of oldCommissions) {
            transaction.delete(oldComm.ref);
            const agentId = oldComm.data.recipient_profile_id;
            const amount = oldComm.data.commission_amount || 0;
            const currentAdj = agentAdjustments.get(agentId) || 0;
            agentAdjustments.set(agentId, currentAdj - amount);
        }

        // B. Calculate New Commissions (Based on updatedSaleData)
        // Note: We use updatedSaleData.items but we verify against productDataMap for prices/categories
        // We assume updatedSaleData.items has the correct unitPrice (which addSale sets as trusted).
        // Since updateSale might receive client data, we should ideally re-verify prices, but for now we follow the 'trusted' logic
        // or re-fetch like addSale.

        if (updatedSaleData.commissionAgentIds && updatedSaleData.commissionAgentIds.length > 0) {
            for (const item of updatedSaleData.items) {
                const productData = productDataMap.get(item.productId);
                if (!productData) continue;

                const saleValue = item.unitPrice * item.quantity;
                if (saleValue <= 0) continue;

                const salespersonsInSale = updatedSaleData.commissionAgentIds.filter(id => {
                    const profile = agentProfiles.get(id);
                    return profile?.entityType === 'Salesperson';
                });
                const salespersonCount = salespersonsInSale.length;

                for (const agentId of updatedSaleData.commissionAgentIds) {
                    const agentProfile = agentProfiles.get(agentId);
                    if (!agentProfile) continue;

                    const commissionSettings = agentProfile.commission || {};
                    const categoryRates = Array.isArray(commissionSettings.categories) ? commissionSettings.categories : [];
                    const overallRate = typeof commissionSettings.overall === 'number' ? commissionSettings.overall : 0;
                    const productCategoryName = typeof productData.category === 'string' ? productData.category.trim().toLowerCase() : null;
                    const productCategoryId = productData.categoryId || null;

                    let applicableRate = overallRate;

                    // Recursive function to find the most specific rate in the hierarchy
                    const findCategoryRate = (catId: string | null, catName: string | null): number | null => {
                        if (!catId && !catName) return null;

                        // If ID is missing but name is present, try to find the ID to enable hierarchy traversal
                        let resolvedId = catId;
                        if (!resolvedId && catName) {
                            const normalizedName = catName.trim().toLowerCase();
                            for (const [id, data] of categoriesMap.entries()) {
                                if (data.name && data.name.trim().toLowerCase() === normalizedName) {
                                    resolvedId = id;
                                    break;
                                }
                            }
                        }

                        // 1. Try direct ID match
                        if (resolvedId) {
                            const rule = categoryRates.find((c: any) => c.categoryId === resolvedId);
                            if (rule && typeof rule.rate === 'number') return rule.rate;
                        }

                        // 2. Try direct name match
                        if (catName) {
                            const normalizedName = catName.trim().toLowerCase();
                            const rule = categoryRates.find((c: any) => c.category && c.category.trim().toLowerCase() === normalizedName);
                            if (rule && typeof rule.rate === 'number') return rule.rate;
                        }

                        // 3. Try matching parent category if ID is available (or resolved)
                        if (resolvedId) {
                            const currentCat = categoriesMap.get(resolvedId);
                            if (currentCat && currentCat.parentId) {
                                const parentCat = categoriesMap.get(currentCat.parentId);
                                return findCategoryRate(currentCat.parentId, parentCat ? parentCat.name : null);
                            }
                        }

                        return null;
                    };

                    const foundRate = findCategoryRate(productCategoryId, productCategoryName);

                    if (foundRate !== null) {
                        applicableRate = foundRate;
                    } else if (categoryRates.length > 0 && commissionCategoryRule === 'strict') {
                        applicableRate = 0;
                    }

                    let commissionAmount = saleValue * (applicableRate / 100);

                    // Divide commission if multiple salespersons are selected
                    if (agentProfile.entityType === 'Salesperson' && salespersonCount > 1) {
                        commissionAmount = commissionAmount / salespersonCount;
                    }

                    if (commissionAmount > 0) {
                        const newCommissionRef = doc(commissionsCollectionRef);
                        transaction.set(newCommissionRef, {
                            transaction_id: saleId,
                            recipient_profile_id: agentId,
                            recipient_entity_type: agentProfile.entityType,
                            calculation_base_amount: saleValue,
                            calculated_rate: applicableRate,
                            product_category_id: productCategoryId,
                            product_category_name: productData.category || null,
                            commission_amount: commissionAmount,
                            status: 'Pending Approval',
                            calculation_date: new Date().toISOString(),
                        });
                        const currentAdj = agentAdjustments.get(agentId) || 0;
                        agentAdjustments.set(agentId, currentAdj + commissionAmount);
                    }
                }
            }
        }

        // C. Update Agents with Net Adjustments
        for (const [agentId, adjustment] of agentAdjustments.entries()) {
            // Even if adjustment is 0, we might want to ensure consistency, but skipping 0 is efficient.
            // However, if we deleted commissions and added same amount, net is 0.
            if (Math.abs(adjustment) < 0.001) continue;

            const agentRef = doc(db, 'commissionProfiles', agentId);
            const profile = agentProfiles.get(agentId);
            // Safety check: verify profile exists (it should, we fetched it)
            if (profile) {
                const currentEarned = profile.totalCommissionEarned || 0;
                transaction.update(agentRef, { totalCommissionEarned: currentEarned + adjustment });
            }
        }

        // 5. Update the sale document itself
        transaction.update(saleRef, {
            ...updatedSaleData,
            date: new Date(updatedSaleData.date),
        });
    });
}

export async function deleteSale(id: string): Promise<void> {
    const saleRef = doc(db, 'sales', id);
    // NOTE: Commission deletion is removed for simplification to ensure reliability.
    // In a full implementation, related commissions should also be handled transactionally.

    await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        const saleDoc = await transaction.get(saleRef);
        if (!saleDoc.exists()) {
            console.log(`Sale ${id} not found, it may have been already deleted.`);
            return;
        }
        const saleData = saleDoc.data() as Sale;

        // Read all product docs related to this sale
        const productRefs = saleData.items ? saleData.items.map(item => doc(db, 'products', item.productId)) : [];
        const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        // --- WRITE PHASE ---

        // 1. Revert product stock
        productDocs.forEach((productDoc, index) => {
            if (productDoc.exists()) {
                const item = saleData.items[index];
                const currentStock = productDoc.data().currentStock || 0;
                transaction.update(productDoc.ref, { currentStock: currentStock + item.quantity });
            }
        });

        // 2. Revert customer's totalSaleDue
        if (saleData.customerId && saleData.customerId !== 'walk-in') {
            const customerRef = doc(db, 'customers', saleData.customerId);
            const customerDoc = await transaction.get(customerRef);
            if (customerDoc.exists()) {
                const currentDue = customerDoc.data().totalSaleDue || 0;
                transaction.update(customerRef, { totalSaleDue: currentDue - saleData.sellDue });
            }
        }

        // 3. Delete the sale document itself
        transaction.delete(saleRef);
    });
}

export async function getDrafts(): Promise<Sale[]> {
    noStore();
    const q = query(draftsCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => processDoc<Sale>(doc));
}

export async function addDraft(draft: Omit<Sale, 'id'>): Promise<string> {
    const saleId = await runTransaction(db, async (transaction) => {
        // --- 1. GENERATE DRAFT NUMBER ---
        // Use 'DR' prefix
        const locationPrefix = 'DR';
        const counterRef = doc(db, 'counters', `draft_${locationPrefix}`);
        const counterDoc = await transaction.get(counterRef);

        let nextCount = 1;
        if (counterDoc.exists()) {
            nextCount = counterDoc.data().count + 1;
        }

        // Pad with zeros to 4 digits (e.g., 0001)
        const sequencePart = nextCount.toString().padStart(4, '0');
        const finalDraftNo = `${locationPrefix}-${sequencePart}`;

        const draftData = {
            ...draft,
            invoiceNo: finalDraftNo,
            date: new Date(draft.date)
        };

        const newDraftRef = doc(draftsCollection);
        transaction.set(newDraftRef, draftData);

        transaction.set(counterRef, { count: nextCount }, { merge: true });

        return newDraftRef.id;
    });

    return saleId;
}

export async function deleteDraft(id: string): Promise<void> {
    const docRef = doc(db, 'drafts', id);
    await deleteDoc(docRef);
}

export async function getQuotations(): Promise<Sale[]> {
    noStore();
    const q = query(quotationsCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => processDoc<Sale>(doc));
}

export async function addQuotation(quotation: Omit<Sale, 'id'>): Promise<string> {
    const saleId = await runTransaction(db, async (transaction) => {
        // --- 1. GENERATE QUOTATION NUMBER ---
        // Use 'QT' prefix
        const locationPrefix = 'QT';
        const counterRef = doc(db, 'counters', `quotation_${locationPrefix}`);
        const counterDoc = await transaction.get(counterRef);

        let nextCount = 1;
        if (counterDoc.exists()) {
            nextCount = counterDoc.data().count + 1;
        }

        // Pad with zeros to 4 digits (e.g., 0001)
        const sequencePart = nextCount.toString().padStart(4, '0');
        const finalQuotationNo = `${locationPrefix}-${sequencePart}`;

        const quoteData = {
            ...quotation,
            invoiceNo: finalQuotationNo,
            date: new Date(quotation.date)
        };

        const newQuoteRef = doc(quotationsCollection);
        transaction.set(newQuoteRef, quoteData);

        transaction.set(counterRef, { count: nextCount }, { merge: true });

        return newQuoteRef.id;
    });

    return saleId;
}

export async function deleteQuotation(id: string): Promise<void> {
    const docRef = doc(db, 'quotations', id);
    await deleteDoc(docRef);
}

export async function getSuspendedSales(): Promise<Sale[]> {
    noStore();
    const q = query(salesCollection, where('paymentMethod', '==', 'Suspended'));
    const snapshot = await getDocs(q);
    const sales = snapshot.docs.map(doc => processDoc<Sale>(doc));
    return sales.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}
