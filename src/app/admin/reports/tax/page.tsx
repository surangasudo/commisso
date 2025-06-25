
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { getSales, type Sale } from '@/services/saleService';
import { getPurchases, type Purchase } from '@/services/purchaseService';
import { getExpenses, type Expense } from '@/services/expenseService';
import { useCurrency } from '@/hooks/use-currency';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// Reusable table component
const TaxReportTable = ({ title, data, columns, footerData, handleExport, formatCurrency }: { title: string, data: any[], columns: { key: string, header: string, isNumeric?: boolean }[], footerData: { label: string, value: string }[], handleExport: (format: 'csv' | 'xlsx' | 'pdf') => void, formatCurrency: (value: number) => string }) => {
    return (
        <Card className="print:border-none print:shadow-none">
            <CardHeader className="flex-row items-center justify-between print:hidden">
                <CardTitle>{title}</CardTitle>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="mr-2 h-4 w-4" />CSV</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}><Download className="mr-2 h-4 w-4" />Excel</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />PDF</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(col => <TableHead key={col.key} className={cn(col.isNumeric && "text-right")}>{col.header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? data.map((item, index) => (
                            <TableRow key={item.id || index}>
                                {columns.map(col => (
                                    <TableCell key={col.key} className={cn(col.isNumeric && "text-right")}>
                                        {col.isNumeric ? formatCurrency(item[col.key]) : item[col.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )) : (
                           <TableRow>
                                <TableCell colSpan={columns.length} className="text-center h-24">No data available</TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        {footerData.map(footer => (
                            <TableRow key={footer.label}>
                                <TableCell colSpan={columns.length - 1} className="text-right font-bold">{footer.label}</TableCell>
                                <TableCell className="font-bold text-right">{footer.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function TaxReportPage() {
    const { formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(true);

    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
    const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

    const [activeFilters, setActiveFilters] = useState({
        location: 'all',
        date: {
            from: startOfYear(new Date()),
            to: endOfYear(new Date()),
        } as DateRange | undefined
    });
    
    const [pendingFilters, setPendingFilters] = useState(activeFilters);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [salesData, purchasesData, expensesData] = await Promise.all([
                    getSales(),
                    getPurchases(),
                    getExpenses()
                ]);
                setAllSales(salesData);
                setAllPurchases(purchasesData);
                setAllExpenses(expensesData);
            } catch (error) {
                console.error("Failed to fetch tax report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const { filteredSales, filteredPurchases, filteredExpenses } = useMemo(() => {
        const dateFilter = (item: { date: string }) => {
            const itemDate = new Date(item.date);
            return activeFilters.date?.from && activeFilters.date?.to ? (itemDate >= activeFilters.date.from && itemDate <= activeFilters.date.to) : true;
        };

        const locationFilter = (item: { location: string }) => {
            return activeFilters.location === 'all' || item.location === activeFilters.location;
        }

        return {
            filteredSales: allSales.filter(s => dateFilter(s) && locationFilter(s)),
            filteredPurchases: allPurchases.filter(p => dateFilter(p) && locationFilter(p)),
            filteredExpenses: allExpenses.filter(e => dateFilter(e) && locationFilter(e)),
        }
    }, [allSales, allPurchases, allExpenses, activeFilters]);

    // Calculations
    const totalInputTax = filteredPurchases.reduce((acc, p) => acc + (p.taxAmount || 0), 0);
    const totalOutputTax = filteredSales.reduce((acc, s) => acc + (s.taxAmount || 0), 0);
    const totalExpenseTax = filteredExpenses.reduce((acc, e) => acc + (e.tax || 0), 0);
    const netTax = totalOutputTax - totalInputTax - totalExpenseTax;

    const inputTaxData = filteredPurchases.map(p => ({
        id: p.id,
        date: new Date(p.date).toLocaleDateString(),
        ref: p.referenceNo,
        contact: p.supplier,
        tax: p.taxAmount || 0,
    }));
    
    const outputTaxData = filteredSales.map(s => ({
        id: s.id,
        date: new Date(s.date).toLocaleDateString(),
        ref: s.invoiceNo,
        contact: s.customerName,
        tax: s.taxAmount || 0,
    }));
    
    const expenseTaxData = filteredExpenses.map(e => ({
        id: e.id,
        date: new Date(e.date).toLocaleDateString(),
        ref: e.referenceNo,
        contact: e.contact || 'N/A',
        tax: e.tax || 0,
    }));

    const taxColumns = [
        { key: 'date', header: 'Date' },
        { key: 'ref', header: 'Reference No.' },
        { key: 'contact', header: 'Contact' },
        { key: 'tax', header: 'Tax Amount', isNumeric: true },
    ];
    
    const handleExport = (type: 'input' | 'output' | 'expense', format: 'csv' | 'xlsx' | 'pdf') => {
        let data, filename;

        switch (type) {
            case 'input': data = inputTaxData; filename = 'input-tax-report'; break;
            case 'output': data = outputTaxData; filename = 'output-tax-report'; break;
            case 'expense': data = expenseTaxData; filename = 'expense-tax-report'; break;
        }

        const dataToExport = data.map(d => ({
            "Date": d.date,
            "Reference No.": d.ref,
            "Contact": d.contact,
            "Tax Amount": d.tax,
        }));
        const headers = ["Date", "Reference No.", "Contact", "Tax Amount"];
        const pdfData = data.map(d => [d.date, d.ref, d.contact, formatCurrency(d.tax)]);

        if (format === 'csv') exportToCsv(dataToExport, filename);
        if (format === 'xlsx') exportToXlsx(dataToExport, filename);
        if (format === 'pdf') {
            exportToPdf(headers, pdfData, filename);
        }
    };

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between print:hidden">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Tax Report
            </h1>
             <div className="flex items-center gap-4">
                <Button variant="default" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>
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
                    <Label>Location</Label>
                    <Select value={pendingFilters.location} onValueChange={(value) => setPendingFilters(f => ({...f, location: value}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All locations</SelectItem>
                            <SelectItem value="Awesome Shop">Awesome Shop</SelectItem>
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
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !pendingFilters.date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {pendingFilters.date?.from ? (
                                pendingFilters.date.to ? (
                                    <>
                                    {format(pendingFilters.date.from, "LLL dd, y")} -{" "}
                                    {format(pendingFilters.date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(pendingFilters.date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={pendingFilters.date?.from}
                                selected={pendingFilters.date}
                                onSelect={(date) => setPendingFilters(f => ({...f, date: date}))}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
        </Card>
      
        <div className="printable-area space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-4 bg-blue-50">
                        <h3 className="font-semibold text-lg mb-2 text-blue-800">Input Tax</h3>
                        {isLoading ? <Skeleton className="h-8 w-32"/> : <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalInputTax)}</p>}
                    </Card>
                    <Card className="p-4 bg-green-50">
                        <h3 className="font-semibold text-lg mb-2 text-green-800">Output Tax</h3>
                        {isLoading ? <Skeleton className="h-8 w-32"/> : <p className="text-2xl font-bold text-green-900">{formatCurrency(totalOutputTax)}</p>}
                    </Card>
                    <Card className="p-4 bg-yellow-50">
                        <h3 className="font-semibold text-lg mb-2 text-yellow-800">Expense Tax</h3>
                        {isLoading ? <Skeleton className="h-8 w-32"/> : <p className="text-2xl font-bold text-yellow-900">{formatCurrency(totalExpenseTax)}</p>}
                    </Card>
                    <Card className="p-4 bg-red-50">
                        <h3 className="font-semibold text-lg mb-2 text-red-800">Tax Due</h3>
                        {isLoading ? <Skeleton className="h-8 w-32"/> : <p className="text-2xl font-bold text-red-900">{formatCurrency(netTax)}</p>}
                        <p className="text-xs text-muted-foreground">(Output - Input - Expense)</p>
                    </Card>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 gap-6">
                <TaxReportTable 
                    title="Input Tax"
                    data={inputTaxData}
                    columns={taxColumns}
                    footerData={[{ label: 'Total Input Tax', value: formatCurrency(totalInputTax)}]}
                    handleExport={(format) => handleExport('input', format)}
                    formatCurrency={formatCurrency}
                />
                <TaxReportTable 
                    title="Output Tax"
                    data={outputTaxData}
                    columns={taxColumns}
                    footerData={[{ label: 'Total Output Tax', value: formatCurrency(totalOutputTax)}]}
                    handleExport={(format) => handleExport('output', format)}
                    formatCurrency={formatCurrency}
                />
                <TaxReportTable 
                    title="Expense Tax"
                    data={expenseTaxData}
                    columns={taxColumns}
                    footerData={[{ label: 'Total Expense Tax', value: formatCurrency(totalExpenseTax)}]}
                    handleExport={(format) => handleExport('expense', format)}
                    formatCurrency={formatCurrency}
                />
            </div>
        </div>
    </div>
  );
}
