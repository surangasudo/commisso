'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sales, detailedProducts, customers } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';

type ReportItem = {
    id: string;
    product: string;
    sku: string;
    quantity: number;
    totalAmount: number;
    invoiceNo: string;
    date: string;
    customerName: string;
};

export default function ItemsReportPage() {
    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };
    
    const [pendingFilters, setPendingFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        category: 'all',
        brand: 'all',
        customer: 'all',
    });
    const [activeFilters, setActiveFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        category: 'all',
        brand: 'all',
        customer: 'all',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    };

    const reportData: ReportItem[] = useMemo(() => {
        const flattenedItems: ReportItem[] = [];
        
        sales.forEach(sale => {
            // Date filtering
            const saleDate = new Date(sale.date);
            if (!(activeFilters.date?.from && activeFilters.date?.to && saleDate >= activeFilters.date.from && saleDate <= activeFilters.date.to)) {
                return;
            }

            // Location filtering
            if (activeFilters.location !== 'all' && sale.location !== activeFilters.location) {
                return;
            }
            
            // Customer filtering
            if(activeFilters.customer !== 'all' && sale.customerName !== activeFilters.customer) {
                return;
            }

            sale.items.forEach((item, index) => {
                const productInfo = detailedProducts.find(p => p.id === item.productId);
                if (!productInfo) return;
                
                // Category filtering
                if (activeFilters.category !== 'all' && productInfo.category !== activeFilters.category) {
                    return;
                }

                // Brand filtering
                if (activeFilters.brand !== 'all' && productInfo.brand !== activeFilters.brand) {
                    return;
                }

                flattenedItems.push({
                    id: `${sale.id}-${index}`,
                    product: productInfo.name,
                    sku: productInfo.sku,
                    quantity: item.quantity,
                    totalAmount: item.quantity * item.unitPrice,
                    invoiceNo: sale.invoiceNo,
                    date: sale.date,
                    customerName: sale.customerName,
                });
            });
        });

        return flattenedItems;
    }, [activeFilters]);

    const filteredData = useMemo(() => {
        return reportData.filter(item => 
            item.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reportData, searchTerm]);

    const totalQuantity = filteredData.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = filteredData.reduce((acc, item) => acc + item.totalAmount, 0);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'items-report';
        const exportData = filteredData.map(item => ({
            "Product": item.product,
            "SKU": item.sku,
            "Date": item.date,
            "Invoice No.": item.invoiceNo,
            "Customer": item.customerName,
            "Quantity": item.quantity,
            "Total Amount": item.totalAmount.toFixed(2),
        }));
        
        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = Object.keys(exportData[0]);
            const data = exportData.map(row => Object.values(row));
            exportToPdf(headers, data, filename);
        }
    };
    
    const uniqueCategories = [...new Set(detailedProducts.map(p => p.category).filter(Boolean))];
    const uniqueBrands = [...new Set(detailedProducts.map(p => p.brand).filter(Boolean))];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Items Report
            </h1>

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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                                    onSelect={(date) => setPendingFilters(f => ({...f, date: date || defaultDateRange}))}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>Customer</Label>
                        <Select value={pendingFilters.customer} onValueChange={(value) => setPendingFilters(f => ({...f, customer: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Customers</SelectItem>
                                {customers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
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
                        <Label>Category</Label>
                        <Select value={pendingFilters.category} onValueChange={(value) => setPendingFilters(f => ({...f, category: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Brand</Label>
                        <Select value={pendingFilters.brand} onValueChange={(value) => setPendingFilters(f => ({...f, brand: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Report Details</CardTitle>
                    <CardDescription>Item-wise sales report for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 print:hidden">
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="mr-2 h-4 w-4" />CSV</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}><Download className="mr-2 h-4 w-4" />Excel</Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />PDF</Button>
                            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
                        </div>
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Invoice No.</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length > 0 ? filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product}</TableCell>
                                        <TableCell>{item.sku}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.invoiceNo}</TableCell>
                                        <TableCell>{item.customerName}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${item.totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">No data available for the selected filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={5} className="font-bold text-right">Total:</TableCell>
                                    <TableCell className="font-bold text-right">{totalQuantity}</TableCell>
                                    <TableCell className="font-bold text-right">${totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="print:hidden">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredData.length}</strong> of <strong>{reportData.length}</strong> entries
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
