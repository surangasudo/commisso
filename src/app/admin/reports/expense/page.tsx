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
import { expenses, type Expense, expenseCategories } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
};

export default function ExpenseReportPage() {
    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };

    const [pendingFilters, setPendingFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        category: 'all',
    });
    const [activeFilters, setActiveFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        category: 'all',
    });
    
    const [searchTerm, setSearchTerm] = useState('');

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    };

    const filteredData = useMemo(() => {
        return expenses.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.expenseCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.subCategory && item.subCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
                item.addedBy.toLowerCase().includes(searchTerm.toLowerCase());
            
            const itemDate = new Date(item.date);
            const dateMatch = activeFilters.date?.from && activeFilters.date.to ? (itemDate >= activeFilters.date.from && itemDate <= activeFilters.date.to) : true;

            const locationMatch = activeFilters.location === 'all' || item.location === activeFilters.location;
            
            const categoryMatch = activeFilters.category === 'all' || item.expenseCategory === activeFilters.category;

            return searchMatch && dateMatch && locationMatch && categoryMatch;
        });
    }, [searchTerm, activeFilters]);

    const totalAmount = filteredData.reduce((acc, item) => acc + item.totalAmount, 0);
    const totalTax = filteredData.reduce((acc, item) => acc + (item.tax || 0), 0);
    const totalPaymentDue = filteredData.reduce((acc, item) => acc + item.paymentDue, 0);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'expense-report';
        const exportData = filteredData.map(item => ({
            "Date": item.date,
            "Reference No": item.referenceNo,
            "Category": item.expenseCategory,
            "Sub Category": item.subCategory || 'N/A',
            "Location": item.location,
            "Payment Status": item.paymentStatus,
            "Tax": (item.tax || 0).toFixed(2),
            "Total Amount": item.totalAmount.toFixed(2),
            "Payment Due": item.paymentDue.toFixed(2),
            "Added By": item.addedBy,
            "Note": item.expenseNote || '',
        }));

        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = Object.keys(exportData[0]);
            const data = exportData.map(row => Object.values(row));
            exportToPdf(headers, data, filename);
        }
    };
    
    const mainCategories = useMemo(() => expenseCategories.filter(c => !c.parentId), []);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Expense Report
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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select value={pendingFilters.location} onValueChange={(value) => setPendingFilters(f => ({...f, location: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All locations</SelectItem>
                                <SelectItem value="awesome-shop">Awesome Shop</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                         <Select value={pendingFilters.category} onValueChange={(value) => setPendingFilters(f => ({...f, category: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {mainCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
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

            <Card>
                <CardHeader>
                    <CardTitle>Report Details</CardTitle>
                    <CardDescription>A list of all expenses for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
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
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reference No</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Sub Category</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Payment Status</TableHead>
                                    <TableHead className="text-right">Tax</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead className="text-right">Payment Due</TableHead>
                                    <TableHead>Added By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length > 0 ? filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.referenceNo}</TableCell>
                                        <TableCell>{item.expenseCategory}</TableCell>
                                        <TableCell>{item.subCategory || 'N/A'}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell><Badge variant="outline" className={cn("capitalize", getPaymentStatusBadge(item.paymentStatus))}>{item.paymentStatus}</Badge></TableCell>
                                        <TableCell className="text-right">${(item.tax || 0).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${item.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${item.paymentDue.toFixed(2)}</TableCell>
                                        <TableCell>{item.addedBy}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center h-24">No data available for the selected filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={6} className="font-bold text-right">Total:</TableCell>
                                    <TableCell className="text-right font-bold">${totalTax.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">${totalAmount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">${totalPaymentDue.toFixed(2)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredData.length}</strong> of <strong>{expenses.length}</strong> entries
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
