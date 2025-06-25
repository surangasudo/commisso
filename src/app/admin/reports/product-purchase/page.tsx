
'use client';
import React, { useState, useMemo, useEffect } from 'react';
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
import { type Purchase, type DetailedProduct, type Supplier } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { getPurchases } from '@/services/purchaseService';
import { getProducts } from '@/services/productService';
import { getSuppliers } from '@/services/supplierService';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';

type ReportItem = {
    id: string;
    product: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    referenceNo: string;
    date: string;
    supplier: string;
};

export default function ProductPurchaseReportPage() {
    const { formatCurrency } = useCurrency();
    const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
    const [allProducts, setAllProducts] = useState<DetailedProduct[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };
    
    const [pendingFilters, setPendingFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        supplier: 'all',
    });
    const [activeFilters, setActiveFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        supplier: 'all',
    });
    const [searchTerm, setSearchTerm] = useState('');

     useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [purchasesData, productsData, suppliersData] = await Promise.all([
                    getPurchases(),
                    getProducts(),
                    getSuppliers()
                ]);
                setAllPurchases(purchasesData);
                setAllProducts(productsData);
                setAllSuppliers(suppliersData);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    };

    const reportData: ReportItem[] = useMemo(() => {
        const flattenedItems: ReportItem[] = [];
        
        allPurchases.forEach(purchase => {
            const purchaseDate = new Date(purchase.date);
            const dateMatch = activeFilters.date?.from && activeFilters.date?.to ? (purchaseDate >= activeFilters.date.from && purchaseDate <= activeFilters.date.to) : true;
            const locationMatch = activeFilters.location === 'all' || purchase.location === activeFilters.location;
            const supplierMatch = activeFilters.supplier === 'all' || purchase.supplier === activeFilters.supplier;

            if (dateMatch && locationMatch && supplierMatch) {
                (purchase.items || []).forEach((item, index) => {
                    const productInfo = allProducts.find(p => p.id === item.productId);
                    if (!productInfo) return;
                    
                    flattenedItems.push({
                        id: `${purchase.id}-${index}`,
                        product: productInfo.name,
                        sku: productInfo.sku,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalAmount: item.quantity * item.unitPrice,
                        referenceNo: purchase.referenceNo,
                        date: new Date(purchase.date).toLocaleDateString(),
                        supplier: purchase.supplier,
                    });
                });
            }
        });

        return flattenedItems;
    }, [activeFilters, allPurchases, allProducts]);

    const filteredData = useMemo(() => {
        return reportData.filter(item => 
            item.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reportData, searchTerm]);

    const totalQuantity = filteredData.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = filteredData.reduce((acc, item) => acc + item.totalAmount, 0);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'product-purchase-report';
        const exportData = filteredData.map(item => ({
            "Product": item.product,
            "SKU": item.sku,
            "Date": item.date,
            "Reference No.": item.referenceNo,
            "Supplier": item.supplier,
            "Quantity": item.quantity,
            "Unit Price": item.unitPrice,
            "Total Amount": item.totalAmount,
        }));
        
        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = Object.keys(exportData[0]);
            const data = exportData.map(row => Object.values(row).map((val, i) => [6,7].includes(i) ? formatCurrency(val as number) : val));
            exportToPdf(headers, data, filename);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between print:hidden">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <FileText className="w-8 h-8" />
                    Product Purchase Report
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
                        <Label>Supplier</Label>
                        <Select value={pendingFilters.supplier} onValueChange={(value) => setPendingFilters(f => ({...f, supplier: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Suppliers</SelectItem>
                                {allSuppliers.map(s => <SelectItem key={s.id} value={s.businessName}>{s.businessName}</SelectItem>)}
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
                </CardContent>
            </Card>

            <div className="printable-area">
                <Card>
                    <CardHeader>
                        <CardTitle>Report Details</CardTitle>
                        <CardDescription>Product-wise purchase report for the selected period.</CardDescription>
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
                            </div>
                        </div>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Reference No.</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5" /></TableCell>)}
                                            </TableRow>
                                        ))
                                    ) : filteredData.length > 0 ? filteredData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.product}</TableCell>
                                            <TableCell>{item.sku}</TableCell>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.referenceNo}</TableCell>
                                            <TableCell>{item.supplier}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center h-24">No data available for the selected filters.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={5} className="font-bold text-right">Total:</TableCell>
                                        <TableCell className="font-bold text-right">{totalQuantity}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="font-bold text-right">{formatCurrency(totalAmount)}</TableCell>
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
        </div>
    );
}
