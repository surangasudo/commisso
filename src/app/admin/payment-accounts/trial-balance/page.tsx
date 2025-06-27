'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Library } from "lucide-react";
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import { getAccounts } from '@/services/paymentAccountService';
import { getCustomers } from '@/services/customerService';
import { getProducts } from '@/services/productService';
import { getSuppliers } from '@/services/supplierService';
import { getSales } from '@/services/saleService';
import { getPurchases } from '@/services/purchaseService';
import { getExpenses } from '@/services/expenseService';
import { format } from 'date-fns';

type AccountRow = {
    account: string;
    balance: number;
};

const ReportTable = ({ title, data, isLoading, formatCurrency }: { title: string; data: AccountRow[]; isLoading: boolean; formatCurrency: (value: number) => string; }) => {
    const total = data.reduce((acc, item) => acc + item.balance, 0);
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{row.account}</TableCell>
                                <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell className="font-bold">Total</TableCell>
                            <TableCell className="text-right font-bold">
                                {isLoading ? <Skeleton className="h-6 w-28 ml-auto" /> : formatCurrency(total)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
};


export default function TrialBalancePage() {
    const { formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(true);
    const [reportDate] = useState(new Date());

    const [debitAccounts, setDebitAccounts] = useState<AccountRow[]>([]);
    const [creditAccounts, setCreditAccounts] = useState<AccountRow[]>([]);

    useEffect(() => {
        const fetchTrialBalanceData = async () => {
            setIsLoading(true);
            try {
                const [
                    accounts, customers, products, suppliers, 
                    sales, purchases, expenses
                ] = await Promise.all([
                    getAccounts(), getCustomers(), getProducts(), getSuppliers(),
                    getSales(), getPurchases(), getExpenses()
                ]);

                // Debit side calculations
                const cashAndBank = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
                const accountsReceivable = customers.reduce((sum, cust) => sum + cust.totalSaleDue, 0);
                const inventory = products.reduce((sum, prod) => sum + ((prod.currentStock || 0) * prod.unitPurchasePrice), 0);
                const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
                const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

                const debits: AccountRow[] = [
                    { account: 'Cash & Bank', balance: cashAndBank },
                    { account: 'Accounts Receivable', balance: accountsReceivable },
                    { account: 'Inventory', balance: inventory },
                    { account: 'Purchases (COGS)', balance: totalPurchases },
                    { account: 'Expenses', balance: totalExpenses },
                ];
                setDebitAccounts(debits);
                const totalDebits = debits.reduce((sum, acc) => sum + acc.balance, 0);

                // Credit side calculations
                const accountsPayable = suppliers.reduce((sum, sup) => sum + sup.totalPurchaseDue, 0);
                const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
                
                const totalCreditsWithoutEquity = accountsPayable + totalSales;
                // Simplified equity calculation: Equity = (Revenue + Liabilities) - (Assets + Expenses)
                // In our model: Equity = (totalSales + accountsPayable) - totalDebits
                const equity = totalCreditsWithoutEquity - totalDebits;

                const credits: AccountRow[] = [
                    { account: 'Accounts Payable', balance: accountsPayable },
                    { account: 'Sales Revenue', balance: totalSales },
                    { account: 'Owner\'s Equity / Retained Earnings', balance: equity },
                ];
                setCreditAccounts(credits);

            } catch (error) {
                console.error("Failed to fetch trial balance data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrialBalanceData();
    }, []);


    return (
        <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <Library className="w-8 h-8" />
            Trial Balance
        </h1>
        <Card>
            <CardHeader>
            <CardTitle>Trial Balance Report</CardTitle>
            <CardDescription>
                A summary of all ledger balances as of {format(reportDate, "PPP")}.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                    <ReportTable title="Debits" data={debitAccounts} isLoading={isLoading} formatCurrency={formatCurrency} />
                    <ReportTable title="Credits" data={creditAccounts} isLoading={isLoading} formatCurrency={formatCurrency} />
                </div>
            </CardContent>
        </Card>
        </div>
    );
}