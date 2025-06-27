'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear, startOfDay, isBefore } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Filter, Notebook } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';

// Import services
import { getAccounts, type PaymentAccount } from '@/services/paymentAccountService';
import { getSales, type Sale } from '@/services/saleService';
import { getPurchases, type Purchase } from '@/services/purchaseService';
import { getExpenses, type Expense } from '@/services/expenseService';

type LedgerEntry = {
    date: Date;
    description: string;
    refNo: string;
    debit: number;
    credit: number;
    balance?: number;
};

export default function PaymentAccountReportPage() {
    const { formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Filter states
    const defaultDateRange = { from: startOfYear(new Date()), to: endOfYear(new Date()) };
    const [pendingFilters, setPendingFilters] = useState({
        account: '',
        date: defaultDateRange as DateRange | undefined,
    });
    const [activeFilters, setActiveFilters] = useState({
        account: '',
        date: defaultDateRange as DateRange | undefined,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [accs, sls, purcs, exps] = await Promise.all([
                    getAccounts(),
                    getSales(),
                    getPurchases(),
                    getExpenses(),
                ]);
                setAccounts(accs);
                setSales(sls);
                setPurchases(purcs);
                setExpenses(exps);

                // Set default account filter to the first account
                if (accs.length > 0) {
                    const defaultAccountId = accs[0].id;
                    setPendingFilters(f => ({ ...f, account: defaultAccountId }));
                    setActiveFilters(f => ({ ...f, account: defaultAccountId }));
                }

            } catch (error) {
                console.error("Failed to fetch account report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    };

    const { reportData, openingBalance, closingBalance } = useMemo(() => {
        if (!activeFilters.account) {
            return { reportData: [], openingBalance: 0, closingBalance: 0 };
        }

        const selectedAccount = accounts.find(a => a.id === activeFilters.account);
        if (!selectedAccount) {
            return { reportData: [], openingBalance: 0, closingBalance: 0 };
        }
        
        // Assumption: Report is for the 'Cash' account type for now.
        // A more complex system would link transactions to specific accounts.
        const accountTypeMatch = (method: string) => {
             if (selectedAccount.accountType.toLowerCase() === 'cash') {
                 return method.toLowerCase() === 'cash' || method.toLowerCase() === 'multiple';
             }
             return false; // Not implemented for other account types yet
        };

        const fromDate = activeFilters.date?.from ? startOfDay(activeFilters.date.from) : new Date(0);

        // 1. Calculate Opening Balance
        let currentOpeningBalance = selectedAccount.openingBalance;
        
        // Add sales before the fromDate
        sales.filter(s => isBefore(new Date(s.date), fromDate) && accountTypeMatch(s.paymentMethod)).forEach(s => {
            currentOpeningBalance += s.totalPaid;
        });
        
        // Subtract purchases and expenses before the fromDate
        purchases.filter(p => isBefore(new Date(p.date), fromDate)).forEach(p => {
             currentOpeningBalance -= (p.grandTotal - p.paymentDue);
        });
        expenses.filter(e => isBefore(new Date(e.date), fromDate)).forEach(e => {
            currentOpeningBalance -= (e.totalAmount - e.paymentDue);
        });


        // 2. Generate Ledger Entries for the selected period
        const ledgerEntries: Omit<LedgerEntry, 'balance'>[] = [];
        
        const toDate = activeFilters.date?.to ? startOfDay(activeFilters.date.to) : new Date();

        // Process Sales
        sales.filter(s => new Date(s.date) >= fromDate && new Date(s.date) <= toDate && accountTypeMatch(s.paymentMethod)).forEach(s => {
            ledgerEntries.push({
                date: new Date(s.date),
                description: `Sale - ${s.customerName}`,
                refNo: s.invoiceNo,
                credit: s.totalPaid,
                debit: 0,
            });
        });
        
        // Process Purchases
         purchases.filter(p => new Date(p.date) >= fromDate && new Date(p.date) <= toDate).forEach(p => {
            ledgerEntries.push({
                date: new Date(p.date),
                description: `Purchase - ${p.supplier}`,
                refNo: p.referenceNo,
                credit: 0,
                debit: p.grandTotal - p.paymentDue,
            });
        });

        // Process Expenses
        expenses.filter(e => new Date(e.date) >= fromDate && new Date(e.date) <= toDate).forEach(e => {
            ledgerEntries.push({
                date: new Date(e.date),
                description: `Expense - ${e.expenseCategory}`,
                refNo: e.referenceNo,
                credit: 0,
                debit: e.totalAmount - e.paymentDue,
            });
        });

        // Sort entries by date
        ledgerEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

        // 3. Calculate running balance
        let runningBalance = currentOpeningBalance;
        const finalReportData = ledgerEntries.map(entry => {
            runningBalance = runningBalance + entry.credit - entry.debit;
            return { ...entry, balance: runningBalance };
        });

        return {
            reportData: finalReportData,
            openingBalance: currentOpeningBalance,
            closingBalance: runningBalance,
        };
    }, [activeFilters, accounts, sales, purchases, expenses]);


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between print:hidden">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <Notebook className="w-8 h-8" />
                    Payment Account Report
                </h1>
                <Button variant="default" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>

            <Card className="print:hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Filters</CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleApplyFilters}>
                            <Filter className="h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Account</Label>
                        <Select value={pendingFilters.account} onValueChange={(value) => setPendingFilters(f => ({...f, account: value}))}>
                            <SelectTrigger><SelectValue placeholder="Select an account"/></SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.accountType})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !pendingFilters.date && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {pendingFilters.date?.from ? (pendingFilters.date.to ? (<>{format(pendingFilters.date.from, "LLL dd, y")} - {format(pendingFilters.date.to, "LLL dd, y")}</>) : (format(pendingFilters.date.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={pendingFilters.date?.from}
                                    selected={pendingFilters.date}
                                    onSelect={(date) => setPendingFilters(f => ({...f, date: date || defaultDateRange}))}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            <div className="printable-area">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Statement</CardTitle>
                        <CardDescription>
                            Transactions for "{accounts.find(a => a.id === activeFilters.account)?.name}" from {activeFilters.date?.from ? format(activeFilters.date.from, 'PPP') : 'start'} to {activeFilters.date?.to ? format(activeFilters.date.to, 'PPP') : 'end'}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Ref No.</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="font-bold">Opening Balance</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(openingBalance)}</TableCell>
                                    </TableRow>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5" /></TableCell>)}
                                            </TableRow>
                                        ))
                                    ) : reportData.length > 0 ? reportData.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{format(item.date, "PPP")}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.refNo}</TableCell>
                                            <TableCell className="text-right text-red-600">{item.debit > 0 ? formatCurrency(item.debit) : '-'}</TableCell>
                                            <TableCell className="text-right text-green-600">{item.credit > 0 ? formatCurrency(item.credit) : '-'}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.balance || 0)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24">No transactions in this period.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={5} className="font-bold text-right text-lg">Closing Balance</TableCell>
                                        <TableCell className="font-bold text-right text-lg">{formatCurrency(closingBalance)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
