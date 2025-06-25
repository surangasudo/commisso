
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
import { stockAdjustments, type StockAdjustment } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function StockAdjustmentReportPage() {
    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };

    const [pendingDate, setPendingDate] = useState<DateRange | undefined>(defaultDateRange);
    const [pendingLocation, setPendingLocation] = useState('all');
    
    const [activeDate, setActiveDate] = useState<DateRange | undefined>(defaultDateRange);
    const [activeLocation, setActiveLocation] = useState('all');
    
    const [searchTerm, setSearchTerm] = useState('');

    const handleApplyFilters = () => {
        setActiveDate(pendingDate);
        setActiveLocation(pendingLocation);
    };

    const filteredData = useMemo(() => {
        return stockAdjustments.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.addedBy.toLowerCase().includes(searchTerm.toLowerCase());
            
            const itemDate = new Date(item.date);
            const dateMatch = activeDate?.from && activeDate.to ? (itemDate >= activeDate.from && itemDate <= activeDate.to) : true;

            const locationMatch = activeLocation === 'all' || item.location === activeLocation;
            
            return searchMatch && dateMatch && locationMatch;
        });
    }, [searchTerm, activeDate, activeLocation]);

    const totalAmount = filteredData.reduce((acc, item) => acc + item.totalAmount, 0);
    const totalAmountRecovered = filteredData.reduce((acc, item) => acc + item.totalAmountRecovered, 0);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'stock-adjustment-report';
        const exportData = filteredData.map(item => ({
            "Date": item.date,
            "Reference No": item.referenceNo,
            "Location": item.location,
            "Adjustment Type": item.adjustmentType,
            "Total Amount": item.totalAmount.toFixed(2),
            "Total Amount Recovered": item.totalAmountRecovered.toFixed(2),
            "Reason": item.reason,
            "Added By": item.addedBy,
        }));

        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = ["Date", "Reference No", "Location", "Adjustment Type", "Total Amount", "Total Amount Recovered", "Reason", "Added By"];
            const data = filteredData.map(item => [
                item.date,
                item.referenceNo,
                item.location,
                item.adjustmentType,
                `$${item.totalAmount.toFixed(2)}`,
                `$${item.totalAmountRecovered.toFixed(2)}`,
                item.reason,
                item.addedBy
            ]);
            exportToPdf(headers, data, filename);
        }
    };
    
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between print:hidden">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <FileText className="w-8 h-8" />
                    Stock Adjustment Report
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
                                <SelectItem value="awesome-shop">Awesome Shop</SelectItem>
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
                        <CardDescription>A list of all stock adjustments for the selected period.</CardDescription>
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
                                        <TableHead>Date</TableHead>
                                        <TableHead>Reference No</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Adjustment Type</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                        <TableHead className="text-right">Total Amount Recovered</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Added By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.referenceNo}</TableCell>
                                            <TableCell>{item.location}</TableCell>
                                            <TableCell><Badge variant="outline" className="capitalize">{item.adjustmentType}</Badge></TableCell>
                                            <TableCell className="text-right">${item.totalAmount.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">${item.totalAmountRecovered.toFixed(2)}</TableCell>
                                            <TableCell>{item.reason}</TableCell>
                                            <TableCell>{item.addedBy}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={4} className="font-bold text-right">Total:</TableCell>
                                        <TableCell className="text-right font-bold">${totalAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold">${totalAmountRecovered.toFixed(2)}</TableCell>
                                        <TableCell colSpan={2}></TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="print:hidden">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{filteredData.length}</strong> of <strong>{stockAdjustments.length}</strong> entries
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
