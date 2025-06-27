
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import { getAccounts } from '@/services/paymentAccountService';
import { getCustomers } from '@/services/customerService';
import { getProducts } from '@/services/productService';
import { getSuppliers } from '@/services/supplierService';
import { getCommissionProfiles } from '@/services/commissionService';
import { format } from 'date-fns';

const ReportRow = ({ label, value, isTotal = false, isLoading = false }: { label: string; value: number; isTotal?: boolean; isLoading?: boolean }) => {
    const { formatCurrency } = useCurrency();
    return (
        <div className={`flex justify-between py-2 ${isTotal ? 'font-bold border-t pt-2 mt-2' : ''}`}>
            <span>{label}</span>
            {isLoading ? <Skeleton className="h-5 w-24" /> : <span>{formatCurrency(value)}</span>}
        </div>
    );
};

export default function BalanceSheetPage() {
    const { formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(true);
    const [reportDate, setReportDate] = useState(new Date());

    const [assets, setAssets] = useState({
        cash: 0,
        receivables: 0,
        inventory: 0,
    });
    const [liabilities, setLiabilities] = useState({
        payables: 0,
        accruedExpenses: 0,
    });
    
    useEffect(() => {
        const fetchBalanceSheetData = async () => {
            setIsLoading(true);
            try {
                const [accounts, customers, products, suppliers, commissionProfiles] = await Promise.all([
                    getAccounts(),
                    getCustomers(),
                    getProducts(),
                    getSuppliers(),
                    getCommissionProfiles(),
                ]);

                // Calculate Assets
                const cash = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
                const receivables = customers.reduce((sum, cust) => sum + cust.totalSaleDue, 0);
                const inventory = products.reduce((sum, prod) => sum + (prod.currentStock * prod.unitPurchasePrice), 0);
                setAssets({ cash, receivables, inventory });

                // Calculate Liabilities
                const payables = suppliers.reduce((sum, sup) => sum + sup.totalPurchaseDue, 0);
                const accruedExpenses = commissionProfiles.reduce((sum, profile) => {
                    const pending = (profile.totalCommissionEarned || 0) - (profile.totalCommissionPaid || 0);
                    return sum + pending;
                }, 0);
                setLiabilities({ payables, accruedExpenses });

            } catch (error) {
                console.error("Failed to fetch balance sheet data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBalanceSheetData();
    }, []);

    const { totalCurrentAssets, totalAssets, totalCurrentLiabilities, totalLiabilities, totalEquity, totalLiabilitiesAndEquity } = useMemo(() => {
        const totalCurrentAssets = assets.cash + assets.receivables + assets.inventory;
        const totalAssets = totalCurrentAssets; // Assuming no fixed assets for now

        const totalCurrentLiabilities = liabilities.payables + liabilities.accruedExpenses;
        const totalLiabilities = totalCurrentLiabilities; // Assuming no long-term liabilities

        const totalEquity = totalAssets - totalLiabilities;
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
        
        return { totalCurrentAssets, totalAssets, totalCurrentLiabilities, totalLiabilities, totalEquity, totalLiabilitiesAndEquity };
    }, [assets, liabilities]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Scale className="w-8 h-8" />
        Balance Sheet
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet Report</CardTitle>
          <CardDescription>
            Financial position as of {format(reportDate, "PPP")}. This report shows your business assets, liabilities, and owner's equity.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 text-sm">
                {/* ASSETS COLUMN */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Assets</h3>
                    <div>
                        <h4 className="font-medium text-base mb-2">Current Assets</h4>
                        <ReportRow label="Cash & Equivalents" value={assets.cash} isLoading={isLoading} />
                        <ReportRow label="Accounts Receivable" value={assets.receivables} isLoading={isLoading} />
                        <ReportRow label="Inventory" value={assets.inventory} isLoading={isLoading} />
                        <ReportRow label="Total Current Assets" value={totalCurrentAssets} isLoading={isLoading} isTotal />
                    </div>
                     <div>
                        <h4 className="font-medium text-base mb-2">Fixed Assets</h4>
                        <ReportRow label="Furniture & Equipment" value={0} isLoading={isLoading} />
                        <ReportRow label="Total Fixed Assets" value={0} isLoading={isLoading} isTotal />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between font-bold text-lg text-primary">
                        <span>Total Assets</span>
                        <span>{isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(totalAssets)}</span>
                    </div>
                </div>

                 {/* LIABILITIES & EQUITY COLUMN */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Liabilities & Owner's Equity</h3>
                     <div>
                        <h4 className="font-medium text-base mb-2">Liabilities</h4>
                        <p className="font-medium">Current Liabilities</p>
                        <ReportRow label="Accounts Payable" value={liabilities.payables} isLoading={isLoading} />
                        <ReportRow label="Accrued Expenses (Commissions)" value={liabilities.accruedExpenses} isLoading={isLoading} />
                        <ReportRow label="Total Current Liabilities" value={totalCurrentLiabilities} isLoading={isLoading} isTotal />
                    </div>
                     <div>
                        <h4 className="font-medium text-base mb-2 mt-4">Owner's Equity</h4>
                        <ReportRow label="Retained Earnings" value={totalEquity} isLoading={isLoading} />
                        <ReportRow label="Total Owner's Equity" value={totalEquity} isLoading={isLoading} isTotal />
                    </div>
                    <Separator className="my-4" />
                     <div className="flex justify-between font-bold text-lg text-primary">
                        <span>Total Liabilities & Equity</span>
                        <span>{isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(totalLiabilitiesAndEquity)}</span>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
