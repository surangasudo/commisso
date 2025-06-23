'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Printer, Download, Search, Filter, DollarSign } from 'lucide-react';
import { detailedProducts, type DetailedProduct } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';

type StockReportRow = {
    sku: string;
    product: string;
    location: string;
    unitPrice: number;
    currentStock: number;
    stockValueByPurchase: number;
    stockValueBySale: number;
    potentialProfit: number;
    totalUnitSold: number;
    totalUnitTransferred: number;
    totalUnitAdjusted: number;
};

export default function StockReportPage() {
    const [filters, setFilters] = useState({
        location: 'all',
        category: 'all',
        brand: 'all',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const reportData: StockReportRow[] = useMemo(() => {
        return detailedProducts.map(p => {
            const stockValueByPurchase = p.currentStock * p.unitPurchasePrice;
            const stockValueBySale = p.currentStock * p.sellingPrice;
            return {
                sku: p.sku,
                product: p.name,
                location: p.businessLocation,
                unitPrice: p.sellingPrice,
                currentStock: p.currentStock,
                stockValueByPurchase,
                stockValueBySale,
                potentialProfit: stockValueBySale - stockValueByPurchase,
                totalUnitSold: p.totalUnitSold || 0,
                totalUnitTransferred: p.totalUnitTransferred || 0,
                totalUnitAdjusted: p.totalUnitAdjusted || 0,
            }
        });
    }, []);

    const filteredData = useMemo(() => {
        return reportData.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchTerm.toLowerCase());
            
            const locationMatch = filters.location === 'all' || item.location === filters.location;
            
            // For category and brand, need to find original product
            const originalProduct = detailedProducts.find(p => p.sku === item.sku);
            const categoryMatch = filters.category === 'all' || originalProduct?.category === filters.category;
            const brandMatch = filters.brand === 'all' || originalProduct?.brand === filters.brand;
            
            return searchMatch && locationMatch && categoryMatch && brandMatch;
        });
    }, [reportData, searchTerm, filters]);
    
    const totals = useMemo(() => {
        return {
            stockValueByPurchase: filteredData.reduce((acc, item) => acc + item.stockValueByPurchase, 0),
            stockValueBySale: filteredData.reduce((acc, item) => acc + item.stockValueBySale, 0),
            potentialProfit: filteredData.reduce((acc, item) => acc + item.potentialProfit, 0),
        };
    }, [filteredData]);

    const uniqueCategories = [...new Set(detailedProducts.map(p => p.category).filter(Boolean))];
    const uniqueBrands = [...new Set(detailedProducts.map(p => p.brand).filter(Boolean))];

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'stock-report';
        const exportData = filteredData.map(item => ({
            "SKU": item.sku,
            "Product": item.product,
            "Location": item.location,
            "Unit Price": item.unitPrice.toFixed(2),
            "Current Stock": item.currentStock,
            "Stock Value (Purchase)": item.stockValueByPurchase.toFixed(2),
            "Stock Value (Sale)": item.stockValueBySale.toFixed(2),
            "Potential Profit": item.potentialProfit.toFixed(2),
            "Total Unit Sold": item.totalUnitSold,
            "Total Unit Transferred": item.totalUnitTransferred,
            "Total Unit Adjusted": item.totalUnitAdjusted,
        }));
        
        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = Object.keys(exportData[0]);
            const data = exportData.map(row => Object.values(row));
            exportToPdf(headers, data, filename);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Stock Report
            </h1>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Filters</CardTitle>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Filter className="h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select value={filters.location} onValueChange={(value) => setFilters(f => ({...f, location: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All locations</SelectItem>
                                <SelectItem value="Awesome Shop">Awesome Shop</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={filters.category} onValueChange={(value) => setFilters(f => ({...f, category: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Brand</Label>
                        <Select value={filters.brand} onValueChange={(value) => setFilters(f => ({...f, brand: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                 {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closing stock (By purchase price)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totals.stockValueByPurchase.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closing stock (By sale price)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totals.stockValueBySale.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
                         <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totals.potentialProfit.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Stock Details</CardTitle>
                    <CardDescription>Detailed stock information for all products.</CardDescription>
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
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Current Stock</TableHead>
                                    <TableHead className="text-right">Stock Value (Purchase)</TableHead>
                                    <TableHead className="text-right">Stock Value (Sale)</TableHead>
                                    <TableHead className="text-right">Potential Profit</TableHead>
                                    <TableHead className="text-right">Total Unit Sold</TableHead>
                                    <TableHead className="text-right">Total Unit Transferred</TableHead>
                                    <TableHead className="text-right">Total Unit Adjusted</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length > 0 ? filteredData.map((item, index) => (
                                    <TableRow key={`${item.sku}-${index}`}>
                                        <TableCell>{item.sku}</TableCell>
                                        <TableCell className="font-medium">{item.product}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{item.currentStock}</TableCell>
                                        <TableCell className="text-right">${item.stockValueByPurchase.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${item.stockValueBySale.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${item.potentialProfit.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{item.totalUnitSold}</TableCell>
                                        <TableCell className="text-right">{item.totalUnitTransferred}</TableCell>
                                        <TableCell className="text-right">{item.totalUnitAdjusted}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center h-24">No data available</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={5} className="text-right font-bold">Total</TableCell>
                                    <TableCell className="text-right font-bold">${totals.stockValueByPurchase.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">${totals.stockValueBySale.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">${totals.potentialProfit.toFixed(2)}</TableCell>
                                    <TableCell colSpan={3}></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredData.length}</strong> of <strong>{reportData.length}</strong> entries
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
