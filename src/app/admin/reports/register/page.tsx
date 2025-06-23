'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download, Search, Filter, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { registerLogs, type RegisterLog, users } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'closed':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'open':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const RegisterReportDetails = ({ log }: { log: RegisterLog }) => {
    const totalSales = log.totalCash + log.totalCardSlips + log.totalCheques;
    const expectedCash = log.openingCash + log.totalCash - log.totalRefunds - log.totalExpenses;
    const difference = log.closingCash - expectedCash;
    
    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Register Details ({log.openTime} - {log.closeTime || 'Now'})</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-sm">
                <div className="space-y-4">
                    <h4 className="font-semibold text-base">Register Details</h4>
                    <div className="flex justify-between"><span>User:</span><span>{log.user}</span></div>
                    <div className="flex justify-between"><span>Location:</span><span>{log.location}</span></div>
                    <div className="flex justify-between"><span>Status:</span><Badge variant="outline" className={cn(getStatusBadge(log.status))}>{log.status}</Badge></div>
                </div>
                 <div className="space-y-4">
                    <h4 className="font-semibold text-base">Payment Details</h4>
                    <div className="flex justify-between"><span>Total Card Slips:</span><span>${log.totalCardSlips.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Total Cheques:</span><span>${log.totalCheques.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Total Cash:</span><span>${log.totalCash.toFixed(2)}</span></div>
                </div>
            </div>
            <Separator className="my-4"/>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                    <h4 className="font-semibold text-base">Details</h4>
                    <div className="flex justify-between"><span>Total Sales:</span><span>${totalSales.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Total Refunds:</span><span>${log.totalRefunds.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Total Expenses:</span><span>${log.totalExpenses.toFixed(2)}</span></div>
                </div>
                 <div className="space-y-4">
                    <h4 className="font-semibold text-base">Cash Calculation</h4>
                    <div className="flex justify-between"><span>Opening Cash:</span><span>${log.openingCash.toFixed(2)}</span></div>
                    <div className="flex justify-between text-green-600"><span>Expected in Cash:</span><span className="font-semibold">${expectedCash.toFixed(2)}</span></div>
                    <div className="flex justify-between text-blue-600"><span>Closing Cash:</span><span className="font-semibold">${log.closingCash.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-red-600"><span>Difference:</span><span>${difference.toFixed(2)}</span></div>
                </div>
            </div>
            {log.closingNote && (
                 <>
                    <Separator className="my-4"/>
                    <div>
                        <h4 className="font-semibold text-base">Closing Note</h4>
                        <p className="text-sm text-muted-foreground mt-2">{log.closingNote}</p>
                    </div>
                </>
            )}
        </DialogContent>
    )
}

export default function RegisterReportPage() {
    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };

    const [pendingFilters, setPendingFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        user: 'all',
    });
    const [activeFilters, setActiveFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        location: 'all',
        user: 'all',
    });
    
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    };

    const filteredData = useMemo(() => {
        return registerLogs.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.user.toLowerCase().includes(searchTerm.toLowerCase());
            
            const itemDate = new Date(item.openTime);
            const dateMatch = activeFilters.date?.from && activeFilters.date.to ? (itemDate >= activeFilters.date.from && itemDate <= activeFilters.date.to) : true;

            const locationMatch = activeFilters.location === 'all' || item.location === activeFilters.location;
            const userMatch = activeFilters.user === 'all' || item.user === activeFilters.user;
            
            return searchMatch && dateMatch && locationMatch && userMatch;
        });
    }, [searchTerm, activeFilters]);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'register-report';
        const exportData = filteredData.map(item => {
             const expectedCash = item.openingCash + item.totalCash - item.totalRefunds - item.totalExpenses;
             const difference = item.closingCash - expectedCash;
            return {
                "Opened": item.openTime,
                "Closed": item.closeTime,
                "Location": item.location,
                "User": item.user,
                "Total Card Slips": item.totalCardSlips.toFixed(2),
                "Total Cheques": item.totalCheques.toFixed(2),
                "Total Cash": item.totalCash.toFixed(2),
                "Difference": difference.toFixed(2),
                "Status": item.status,
            }
        });

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
                Register Report
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
                        <Label>User</Label>
                        <Select value={pendingFilters.user} onValueChange={(value) => setPendingFilters(f => ({...f, user: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
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
                                    className={cn("w-full justify-start text-left font-normal", !pendingFilters.date && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {pendingFilters.date?.from ? (pendingFilters.date.to ? (<>{format(pendingFilters.date.from, "LLL dd, y")} - {format(pendingFilters.date.to, "LLL dd, y")}</>) : (format(pendingFilters.date.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
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
                    <CardDescription>A list of all register closures for the selected period.</CardDescription>
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
                                    <TableHead>Opened</TableHead>
                                    <TableHead>Closed</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Total Card</TableHead>
                                    <TableHead className="text-right">Total Cheque</TableHead>
                                    <TableHead className="text-right">Total Cash</TableHead>
                                    <TableHead className="text-right">Difference</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length > 0 ? filteredData.map((item) => {
                                    const expectedCash = item.openingCash + item.totalCash - item.totalRefunds - item.totalExpenses;
                                    const difference = item.status === 'Closed' ? item.closingCash - expectedCash : 0;
                                    return (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.openTime}</TableCell>
                                        <TableCell>{item.closeTime || 'N/A'}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>{item.user}</TableCell>
                                        <TableCell className="text-right">${item.totalCardSlips.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${item.totalCheques.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${item.totalCash.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold">${difference.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant="outline" className={cn(getStatusBadge(item.status))}>{item.status}</Badge></TableCell>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8 gap-1"><Eye className="w-3 h-3"/> View</Button>
                                                </DialogTrigger>
                                                <RegisterReportDetails log={item} />
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                    );
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center h-24">No data available for the selected filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={10}></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredData.length}</strong> of <strong>{registerLogs.length}</strong> entries
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
