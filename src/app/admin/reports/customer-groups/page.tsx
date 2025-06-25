
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
import { type Customer, type Sale } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/use-currency';
import { getCustomers } from '@/services/customerService';
import { getSales } from '@/services/saleService';
import { Skeleton } from '@/components/ui/skeleton';

type CustomerGroupReportData = {
  groupName: string;
  totalSale: number;
  totalSaleDue: number;
};

export default function CustomerGroupsReportPage() {
    const { formatCurrency } = useCurrency();
    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };
    
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [pendingDate, setPendingDate] = useState<DateRange | undefined>(defaultDateRange);
    const [pendingLocation, setPendingLocation] = useState('all');

    const [activeDate, setActiveDate] = useState<DateRange | undefined>(defaultDateRange);
    const [activeLocation, setActiveLocation] = useState('all');

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [customersData, salesData] = await Promise.all([
                    getCustomers(),
                    getSales()
                ]);
                setAllCustomers(customersData);
                setAllSales(salesData);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApplyFilters = () => {
        setActiveDate(pendingDate);
        setActiveLocation(pendingLocation);
    };

    const reportData = useMemo(() => {
        const filteredSales = allSales.filter(s => {
            const saleDate = new Date(s.date);
            const dateMatch = activeDate?.from && activeDate?.to ? (saleDate >= activeDate.from && saleDate <= activeDate.to) : true;
            const locationMatch = activeLocation === 'all' || s.location === activeLocation;
            return dateMatch && locationMatch;
        });
        
        const groups = [...new Set(allCustomers.map(c => c.customerGroup))];
        
        const data: CustomerGroupReportData[] = groups.map(group => {
            const customersInGroup = allCustomers.filter(c => c.customerGroup === group);
            const customerNamesInGroup = customersInGroup.map(c => c.name);

            const totalSaleDue = customersInGroup.reduce((acc, c) => acc + c.totalSaleDue, 0);
            
            const totalSale = filteredSales
                .filter(s => customerNamesInGroup.includes(s.customerName))
                .reduce((acc, s) => acc + s.totalAmount, 0);

            return {
                groupName: group,
                totalSale: totalSale,
                totalSaleDue: totalSaleDue,
            };
        });

        return data;
    }, [activeDate, activeLocation, allCustomers, allSales]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return reportData;
        return reportData.filter(item => item.groupName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [reportData, searchTerm]);

    const totalSale = filteredData.reduce((acc, item) => acc + item.totalSale, 0);
    const totalSaleDue = filteredData.reduce((acc, item) => acc + item.totalSaleDue, 0);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'customer-groups-report';
        const exportData = filteredData.map(item => ({
            "Customer Group": item.groupName,
            "Total Sale": item.totalSale,
            "Total Sale Due": item.totalSaleDue,
        }));

        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = ["Customer Group", "Total Sale", "Total Sale Due"];
            const data = filteredData.map(item => [item.groupName, formatCurrency(item.totalSale), formatCurrency(item.totalSaleDue)]);
            exportToPdf(headers, data, filename);
        }
    };
    
    return (
        <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between print:hidden">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <FileText className="w-8 h-8" />
                    Customer Groups Report
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
                        <Label>Location</Label>
                        <Select value={pendingLocation} onValueChange={setPendingLocation}>
                            <SelectTrigger>
                                <SelectValue placeholder="All locations" />
                            </SelectTrigger>
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
                                        !pendingDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {pendingDate?.from ? (
                                    pendingDate.to ? (
                                        <>
                                        {format(pendingDate.from, "LLL dd, y")} -{" "}
                                        {format(pendingDate.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(pendingDate.from, "LLL dd, y")
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
                                    defaultMonth={pendingDate?.from}
                                    selected={pendingDate}
                                    onSelect={setPendingDate}
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
                        <CardTitle>Report Details</CardTitle>
                        <CardDescription>Sales information grouped by customer group.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 print:hidden">
                            <div className="relative flex-1 sm:max-w-xs">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search groups..." 
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
                                        <TableHead>Customer Group</TableHead>
                                        <TableHead className="text-right">Total Sale</TableHead>
                                        <TableHead className="text-right">Total Sale Due</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 2 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredData.map((item) => (
                                        <TableRow key={item.groupName}>
                                            <TableCell className="font-medium">{item.groupName}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.totalSale)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.totalSaleDue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell className="font-bold">Total</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(totalSale)}</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(totalSaleDue)}</TableCell>
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
