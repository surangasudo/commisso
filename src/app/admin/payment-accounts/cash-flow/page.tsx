
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Filter, Calendar as CalendarIcon, Printer } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import { getSales } from '@/services/saleService';
import { getPurchases } from '@/services/purchaseService';
import { getExpenses } from '@/services/expenseService';
import { getAccounts } from '@/services/paymentAccountService';
import { format, startOfYear, endOfYear } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

const ReportRow = ({ label, value, isTotal = false, isSubTotal = false, isLoading = false, level = 0 }: { label: string; value: number; isTotal?: boolean; isSubTotal?: boolean; isLoading?: boolean; level?: number }) => {
    const { formatCurrency } = useCurrency();
    const indentStyle = { paddingLeft: `${level * 1.5}rem` };
    
    return (
        <div className={`flex justify-between py-2 text-sm ${isSubTotal ? 'border-t' : ''} ${isTotal ? 'font-bold text-base border-t-2 border-primary mt-2 pt-2' : ''}`}>
            <span style={indentStyle}>{label}</span>
            {isLoading ? <Skeleton className="h-5 w-24" /> : <span>{formatCurrency(value)}</span>}
        </div>
    );
};

export default function CashFlowPage() {
    const { formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(true);
    
    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };
    const [date, setDate] = useState<DateRange | undefined>(defaultDateRange);
    
    const [sales, setSales] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        const fetchCashFlowData = async () => {
            setIsLoading(true);
            try {
                const [salesData, purchasesData, expensesData, accountsData] = await Promise.all([
                    getSales(),
                    getPurchases(),
                    getExpenses(),
                    getAccounts(),
                ]);
                setSales(salesData);
                setPurchases(purchasesData);
                setExpenses(expensesData);
                setAccounts(accountsData);
            } catch (error) {
                console.error("Failed to fetch cash flow data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCashFlowData();
    }, []);

    const cashFlowData = useMemo(() => {
        const dateFilter = (item: { date: string }) => {
            if (!date?.from || !date?.to) return true;
            const itemDate = new Date(item.date);
            return itemDate >= date.from && itemDate <= date.to;
        };
        
        const filteredSales = sales.filter(dateFilter);
        const filteredPurchases = purchases.filter(dateFilter);
        const filteredExpenses = expenses.filter(dateFilter);

        // --- Operating Activities ---
        const cashFromSales = filteredSales
            .filter(s => s.paymentMethod?.toLowerCase() === 'cash')
            .reduce((sum, s) => sum + s.totalPaid, 0);

        // Assumption: paid amount for purchases is cash outflow
        const cashForPurchases = filteredPurchases.reduce((sum, p) => sum + (p.grandTotal - p.paymentDue), 0);
        
        // Assumption: paid amount for expenses is cash outflow
        const cashForExpenses = filteredExpenses.reduce((sum, e) => sum + (e.totalAmount - e.paymentDue), 0);

        const netCashFromOps = cashFromSales - cashForPurchases - cashForExpenses;
        
        // --- Investing & Financing Activities (Mocked) ---
        const netCashFromInvesting = 0;
        const netCashFromFinancing = 0;

        // --- Summary ---
        const netIncreaseInCash = netCashFromOps + netCashFromInvesting + netCashFromFinancing;

        // For simplicity, we'll use total opening balance of cash accounts as beginning cash.
        // A more accurate model would require historical transactions.
        const cashAtBeginning = accounts
            .filter(a => a.accountType === 'Cash')
            .reduce((sum, a) => sum + a.openingBalance, 0);
            
        const cashAtEnd = cashAtBeginning + netIncreaseInCash;
        
        return {
            cashFromSales,
            cashForPurchases,
            cashForExpenses,
            netCashFromOps,
            netCashFromInvesting,
            netCashFromFinancing,
            netIncreaseInCash,
            cashAtBeginning,
            cashAtEnd,
        };
    }, [date, sales, purchases, expenses, accounts]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <Droplets className="w-8 h-8" />
            Cash Flow Statement
        </h1>
        <Button variant="default" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
      </div>
      
       <Card className="print:hidden">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Filters</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
        </Card>

      <Card className="printable-area">
        <CardHeader>
          <CardTitle>Cash Flow Report</CardTitle>
          <CardDescription>
            For the period: {date?.from ? format(date.from, "PPP") : 'N/A'} to {date?.to ? format(date.to, "PPP") : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="max-w-2xl mx-auto">
                <h3 className="font-semibold text-base mb-2">Cash Flow from Operating Activities</h3>
                <ReportRow label="Cash from Sales" value={cashFlowData.cashFromSales} isLoading={isLoading} level={1} />
                <ReportRow label="Payments for Purchases" value={-cashFlowData.cashForPurchases} isLoading={isLoading} level={1} />
                <ReportRow label="Payments for Expenses" value={-cashFlowData.cashForExpenses} isLoading={isLoading} level={1} />
                <ReportRow label="Net Cash from Operating Activities" value={cashFlowData.netCashFromOps} isLoading={isLoading} isSubTotal />

                <h3 className="font-semibold text-base mb-2 mt-4">Cash Flow from Investing Activities</h3>
                <ReportRow label="Net Cash from Investing Activities" value={cashFlowData.netCashFromInvesting} isLoading={isLoading} isSubTotal />
                
                <h3 className="font-semibold text-base mb-2 mt-4">Cash Flow from Financing Activities</h3>
                <ReportRow label="Net Cash from Financing Activities" value={cashFlowData.netCashFromFinancing} isLoading={isLoading} isSubTotal />
                
                <Separator className="my-4"/>

                <ReportRow label="Net Increase/(Decrease) in Cash" value={cashFlowData.netIncreaseInCash} isLoading={isLoading} />
                <ReportRow label="Cash at beginning of period" value={cashFlowData.cashAtBeginning} isLoading={isLoading} />
                <ReportRow label="Cash at end of period" value={cashFlowData.cashAtEnd} isLoading={isLoading} isTotal />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
