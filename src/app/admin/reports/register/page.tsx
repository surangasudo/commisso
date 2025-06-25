
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download, Search, Filter, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type RegisterLog, users as allUsers, type User } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';

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
    const { formatCurrency } = useCurrency();
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
                    <div className="flex justify-between"><span>Total Card Slips:</span><span>{formatCurrency(log.totalCardSlips)}</span></div>
                    <div className="flex justify-between"><span>Total Cheques:</span><span>{formatCurrency(log.totalCheques)}</span></div>
                    <div className="flex justify-between"><span>Total Cash:</span><span>{formatCurrency(log.totalCash)}</span></div>
                </div>
            </div>
            <Separator className="my-4"/>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                    <h4 className="font-semibold text-base">Details</h4>
                    <div className="flex justify-between"><span>Total Sales:</span><span>{formatCurrency(totalSales)}</span></div>
                    <div className="flex justify-between"><span>Total Refunds:</span><span>{formatCurrency(log.totalRefunds)}</span></div>
                    <div className="flex justify-between"><span>Total Expenses:</span><span>{formatCurrency(log.totalExpenses)}</span></div>
                </div>
                 <div className="space-y-4">
                    <h4 className="font-semibold text-base">Cash Calculation</h4>
                    <div className="flex justify-between"><span>Opening Cash:</span><span>{formatCurrency(log.openingCash)}</span></div>
                    <div className="flex justify-between text-green-600"><span>Expected in Cash:</span><span className="font-semibold">{formatCurrency(expectedCash)}</span></div>
                    <div className="flex justify-between text-blue-600"><span>Closing Cash:</span><span className="font-semibold">{formatCurrency(log.closingCash)}</span></div>
                    <div className="flex justify-between font-bold text-red-600"><span>Difference:</span><span>{formatCurrency(difference)}</span></div>
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
    const { formatCurrency } = useCurrency();
    const [allLogs, setAllLogs] = useState<RegisterLog[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    
    useEffect(() => {
        // In a real app, this would be a fetch call.
        // For now, we simulate it with mock data.
        setIsLoading(true);
        // import { registerLogs as allRegisterLogs } from '@/lib/data';
        // setAllLogs(allRegisterLogs);
        setUsers(allUsers);
        setIsLoading(false);
    }, []);

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    };

    const filteredData = useMemo(() => {
        return allLogs.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.user.toLowerCase().includes(searchTerm.toLowerCase());
            
            const itemDate = new Date(item.openTime);
            const dateMatch = activeFilters.date?.from && activeFilters.date.to ? (itemDate >= activeFilters.date.from && itemDate <= activeFilters.date.to) : true;

            const locationMatch = activeFilters.location === 'all' || item.location === activeFilters.location;
            const userMatch = activeFilters.user === 'all' || item.user === activeFilters.user;
            
            return searchMatch && dateMatch && locationMatch && userMatch;
        });
    }, [searchTerm, activeFilters, allLogs]);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'register-report';
        const exportData = filteredData.map(item => {
             const expectedCash = item.openingCash + item.totalCash - item.totalRefunds - item.totalExpenses;
             const difference = item.closingCash - expectedCash;
            return {
                "Opened": item.openTime,
                "Closed": item.closeTime || 'N/A',
                "Location": item.location,
                "User": item.user,
                "Total Card Slips": item.totalCardSlips,
                "Total Cheques": item.totalCheques,
                "Total Cash": item.totalCash,
                "Difference": difference,
                "Status": item.status,
            }
        });

        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = Object.keys(exportData[0]);
            const data = exportData.map(row => Object.values(row).map((val, i) => [4,5,6,7].includes(i) ? formatCurrency(val as number) : val));
            exportToPdf(headers, data, filename);
        }
    };
    
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between print:hidden">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <FileText className="w-8 h-8" />
                    Register Report
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

            <div className="printable-area">
                <Card>
                    <CardHeader>
                        <CardTitle>Report Details</CardTitle>
                        <CardDescription>A list of all register closures for the selected period.</CardDescription>
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
                                        <TableHead>Opened</TableHead>
                                        <TableHead>Closed</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Total Card</TableHead>
                                        <TableHead className="text-right">Total Cheque</TableHead>
                                        <TableHead className="text-right">Total Cash</TableHead>
                                        <TableHead className="text-right">Difference</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="print:hidden">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 10 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5" /></TableCell>)}
                                            </TableRow>
                                        ))
                                    ) : filteredData.length > 0 ? filteredData.map((item) => {
                                        const expectedCash = item.openingCash + item.totalCash - item.totalRefunds - item.totalExpenses;
                                        const difference = item.status === 'Closed' ? item.closingCash - expectedCash : 0;
                                        return (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.openTime}</TableCell>
                                            <TableCell>{item.closeTime || 'N/A'}</TableCell>
                                            <TableCell>{item.location}</TableCell>
                                            <TableCell>{item.user}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.totalCardSlips)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.totalCheques)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.totalCash)}</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(difference)}</TableCell>
                                            <TableCell><Badge variant="outline" className={cn(getStatusBadge(item.status))}>{item.status}</Badge></TableCell>
                                            <TableCell className="print:hidden">
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
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="print:hidden">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{filteredData.length}</strong> of <strong>{allLogs.length}</strong> entries
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
