
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { 
    format, 
    startOfYear,
    endOfYear,
} from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Purchase, type Sale } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Badge } from '@/components/ui/badge';
import { getSales } from '@/services/saleService';
import { getPurchases } from '@/services/purchaseService';
import { useCurrency } from '@/hooks/use-currency';

// Helper for status badges
const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'due':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'partial':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

// Reusable table component for this page
const PurchaseSaleTable = ({ title, data, columns, footerData, handleExport }: { title: string, data: any[], columns: { key: string, header: string }[], footerData: { label: string, value: string }[], handleExport: (format: 'csv' | 'xlsx' | 'pdf') => void }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="mr-2 h-4 w-4" />CSV</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}><Download className="mr-2 h-4 w-4" />Excel</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />PDF</Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(col => <TableHead key={col.key}>{col.header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow key={item.id || index}>
                                {columns.map(col => (
                                    <TableCell key={col.key}>
                                        {col.key === 'paymentStatus' ? (
                                            <Badge variant="outline" className={cn("capitalize", getPaymentStatusBadge(item[col.key]))}>{item[col.key]}</Badge>
                                        ) : (
                                            col.key.toLowerCase().includes('amount') || col.key.toLowerCase().includes('total') ? `$${item[col.key].toFixed(2)}` : item[col.key]
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        {footerData.map(footer => (
                            <TableRow key={footer.label}>
                                <TableCell colSpan={columns.length - 1} className="text-right font-bold">{footer.label}</TableCell>
                                <TableCell className="font-bold">{footer.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function PurchaseSaleReportPage() {
    const { formatCurrency } = useCurrency();
    const [date, setDate] = useState<DateRange | undefined>({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    });
    
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [salesData, purchasesData] = await Promise.all([
                    getSales(),
                    getPurchases(),
                ]);
                setAllSales(salesData);
                setAllPurchases(purchasesData);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredSales = useMemo(() => {
        return allSales.filter(s => {
            const saleDate = new Date(s.date);
            return date?.from && date?.to ? (saleDate >= date.from && saleDate <= date.to) : true;
        });
    }, [allSales, date]);

    const filteredPurchases = useMemo(() => {
        return allPurchases.filter(p => {
            const purchaseDate = new Date(p.date);
            return date?.from && date?.to ? (purchaseDate >= date.from && purchaseDate <= date.to) : true;
        });
    }, [allPurchases, date]);
    
    // Calculations
    const totalPurchase = filteredPurchases.reduce((acc, p) => acc + p.grandTotal, 0);
    const totalPurchaseReturn = 0; // Assuming no return data for now
    const netPurchase = totalPurchase - totalPurchaseReturn;

    const totalSale = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalSellReturn = 0; // Assuming no return data for now
    const netSale = totalSale - totalSellReturn;
    
    const profit = netSale - netPurchase;

    const purchaseColumns = [
        { key: 'referenceNo', header: 'Reference No' },
        { key: 'supplier', header: 'Supplier' },
        { key: 'paymentStatus', header: 'Payment Status' },
        { key: 'grandTotal', header: 'Total Amount' },
    ];
    
    const saleColumns = [
        { key: 'invoiceNo', header: 'Invoice No' },
        { key: 'customerName', header: 'Customer' },
        { key: 'paymentStatus', header: 'Payment Status' },
        { key: 'totalAmount', header: 'Total Amount' },
    ];
    
    const handlePurchaseExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const dataToExport = filteredPurchases.map(p => ({
            "Reference No": p.referenceNo,
            "Supplier": p.supplier,
            "Payment Status": p.paymentStatus,
            "Total Amount": p.grandTotal,
        }));
        if (format === 'csv') exportToCsv(dataToExport, 'purchases-report');
        if (format === 'xlsx') exportToXlsx(dataToExport, 'purchases-report');
        if (format === 'pdf') {
            const headers = ["Reference No", "Supplier", "Payment Status", "Total Amount"];
            const data = filteredPurchases.map(p => [p.referenceNo, p.supplier, p.paymentStatus, formatCurrency(p.grandTotal)]);
            exportToPdf(headers, data, 'purchases-report');
        }
    };
    
    const handleSaleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const dataToExport = filteredSales.map(s => ({
            "Invoice No": s.invoiceNo,
            "Customer": s.customerName,
            "Payment Status": s.paymentStatus,
            "Total Amount": s.totalAmount,
        }));
        if (format === 'csv') exportToCsv(dataToExport, 'sales-report');
        if (format === 'xlsx') exportToXlsx(dataToExport, 'sales-report');
        if (format === 'pdf') {
            const headers = ["Invoice No", "Customer", "Payment Status", "Total Amount"];
            const data = filteredSales.map(s => [s.invoiceNo, s.customerName, s.paymentStatus, formatCurrency(s.totalAmount)]);
            exportToPdf(headers, data, 'sales-report');
        }
    };

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Purchase & Sale Report
            </h1>
             <div className="flex items-center gap-4">
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All locations</SelectItem>
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
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
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                    A summary of your purchases and sales for the selected period.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Purchases</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Total Purchases:</span><span>{isLoading ? 'Calculating...' : formatCurrency(totalPurchase)}</span></div>
                        <div className="flex justify-between"><span>Purchase Returns:</span><span>{isLoading ? 'Calculating...' : formatCurrency(totalPurchaseReturn)}</span></div>
                        <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Net Purchases:</span><span>{isLoading ? 'Calculating...' : formatCurrency(netPurchase)}</span></div>
                    </div>
                </Card>
                 <Card className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Sales</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Total Sales:</span><span>{isLoading ? 'Calculating...' : formatCurrency(totalSale)}</span></div>
                        <div className="flex justify-between"><span>Sell Returns:</span><span>{isLoading ? 'Calculating...' : formatCurrency(totalSellReturn)}</span></div>
                        <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Net Sales:</span><span>{isLoading ? 'Calculating...' : formatCurrency(netSale)}</span></div>
                    </div>
                </Card>
                 <Card className="p-4 bg-primary/10">
                    <h3 className="font-semibold text-lg mb-2">Overall (Sale - Purchase)</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Sale - Purchase:</span><span>{isLoading ? 'Calculating...' : formatCurrency(totalSale - totalPurchase)}</span></div>
                        <div className="flex justify-between"><span>Due Amount:</span><span>{isLoading ? 'Calculating...' : formatCurrency(0)}</span></div>
                        <div className="flex justify-between font-bold border-t pt-1 mt-1 text-lg"><span>Gross Profit:</span><span>{isLoading ? 'Calculating...' : formatCurrency(profit)}</span></div>
                    </div>
                </Card>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PurchaseSaleTable 
                title="Purchases"
                data={filteredPurchases}
                columns={purchaseColumns}
                footerData={[{ label: 'Total Purchases', value: formatCurrency(totalPurchase)}]}
                handleExport={handlePurchaseExport}
            />
            <PurchaseSaleTable 
                title="Sales"
                data={filteredSales}
                columns={saleColumns}
                footerData={[{ label: 'Total Sales', value: formatCurrency(totalSale)}]}
                handleExport={handleSaleExport}
            />
        </div>

    </div>
  );
}

