'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download, Search, Filter, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { detailedProducts, sales } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';

type TrendingProduct = {
    sku: string;
    product: string;
    category: string;
    brand: string;
    totalQuantity: number;
    totalAmount: number;
};

export default function TrendingProductsPage() {
    const defaultDateRange = {
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
    };
    
    const [pendingFilters, setPendingFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        category: 'all',
        brand: 'all',
    });
    const [activeFilters, setActiveFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        category: 'all',
        brand: 'all',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState<{ key: keyof TrendingProduct; direction: 'asc' | 'desc' }>({ key: 'totalQuantity', direction: 'desc' });

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    };

    const reportData: TrendingProduct[] = useMemo(() => {
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            const dateMatch = activeFilters.date?.from && activeFilters.date?.to ? (saleDate >= activeFilters.date.from && saleDate <= activeFilters.date.to) : true;
            const locationMatch = activeFilters.location === 'all' || s.location === activeFilters.location;
            return dateMatch && locationMatch;
        });

        const productSales: { [productId: string]: { totalQuantity: number; totalAmount: number } } = {};
        
        for (const sale of filteredSales) {
            for (const item of sale.items) {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { totalQuantity: 0, totalAmount: 0 };
                }
                productSales[item.productId].totalQuantity += item.quantity;
                productSales[item.productId].totalAmount += item.quantity * item.unitPrice;
            }
        }
        
        let trendingProducts = Object.entries(productSales).map(([productId, data]) => {
            const productInfo = detailedProducts.find(p => p.id === productId);
            return {
                sku: productInfo?.sku || 'N/A',
                product: productInfo?.name || 'Unknown Product',
                category: productInfo?.category || 'N/A',
                brand: productInfo?.brand || 'N/A',
                totalQuantity: data.totalQuantity,
                totalAmount: data.totalAmount,
            };
        });
        
        // Filter by category and brand
        if (activeFilters.category !== 'all') {
            trendingProducts = trendingProducts.filter(p => p.category === activeFilters.category);
        }
        if (activeFilters.brand !== 'all') {
            trendingProducts = trendingProducts.filter(p => p.brand === activeFilters.brand);
        }
        
        return trendingProducts;
    }, [activeFilters]);

    const sortedData = useMemo(() => {
        const data = [...reportData].filter(item => 
            item.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );

        data.sort((a, b) => {
            if (a[sort.key] < b[sort.key]) return sort.direction === 'asc' ? -1 : 1;
            if (a[sort.key] > b[sort.key]) return sort.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return data;
    }, [reportData, searchTerm, sort]);
    
    const handleSort = (key: keyof TrendingProduct) => {
        if (sort.key === key) {
            setSort({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
        } else {
            setSort({ key, direction: 'desc' });
        }
    }

    const uniqueCategories = [...new Set(detailedProducts.map(p => p.category).filter(Boolean))];
    const uniqueBrands = [...new Set(detailedProducts.map(p => p.brand).filter(Boolean))];

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'trending-products-report';
        const exportData = sortedData.map(item => ({
            "SKU": item.sku,
            "Product": item.product,
            "Category": item.category,
            "Brand": item.brand,
            "Total Quantity Sold": item.totalQuantity,
            "Total Amount Sold": item.totalAmount.toFixed(2),
        }));
        
        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = ["SKU", "Product", "Category", "Brand", "Total Quantity Sold", "Total Amount Sold"];
            const data = exportData.map(row => Object.values(row));
            exportToPdf(headers, data, filename);
        }
    };
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Trending Products Report
            </h1>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Filters</CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleApplyFilters}>
                            <Filter className="h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <CardDescription>Top-selling products based on quantity sold for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search products..." 
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
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('totalQuantity')}>
                                        <div className="flex items-center justify-end gap-1">Total Quantity Sold <ArrowUpDown className="h-3 w-3" /></div>
                                    </TableHead>
                                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('totalAmount')}>
                                         <div className="flex items-center justify-end gap-1">Total Amount Sold <ArrowUpDown className="h-3 w-3" /></div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedData.length > 0 ? sortedData.map((item) => (
                                    <TableRow key={item.sku}>
                                        <TableCell>{item.sku}</TableCell>
                                        <TableCell className="font-medium">{item.product}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.brand}</TableCell>
                                        <TableCell className="text-right">{item.totalQuantity}</TableCell>
                                        <TableCell className="text-right">${item.totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No data available for the selected filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{sortedData.length}</strong> of <strong>{reportData.length}</strong> entries
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
