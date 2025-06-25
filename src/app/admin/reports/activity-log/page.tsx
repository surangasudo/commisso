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
import { FileText, Printer, Calendar as CalendarIcon, Download, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { activityLogs, users, type ActivityLog } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';

export default function ActivityLogPage() {
    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };

    const [pendingFilters, setPendingFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        user: 'all',
    });
    const [activeFilters, setActiveFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        user: 'all',
    });
    
    const [searchTerm, setSearchTerm] = useState('');

    const handleApplyFilters = () => {
        setActiveFilters(pendingFilters);
    };

    const filteredData = useMemo(() => {
        return activityLogs.filter(item => {
            const searchMatch = searchTerm === '' ||
                item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.subjectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.note.toLowerCase().includes(searchTerm.toLowerCase());
            
            const itemDate = new Date(item.date);
            const dateMatch = activeFilters.date?.from && activeFilters.date.to ? (itemDate >= activeFilters.date.from && itemDate <= activeFilters.date.to) : true;

            const userMatch = activeFilters.user === 'all' || item.user === activeFilters.user;
            
            return searchMatch && dateMatch && userMatch;
        });
    }, [searchTerm, activeFilters]);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'activity-log-report';
        const exportData = filteredData.map(item => ({
            "Date": item.date,
            "Subject Type": item.subjectType,
            "Action": item.action,
            "Subject": item.subjectId,
            "By": item.user,
            "IP Address": item.ipAddress,
            "Notes": item.note,
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
                Activity Log
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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <CardTitle>Log Details</CardTitle>
                    <CardDescription>A record of all user activities for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 print:hidden">
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search logs..." 
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
                                    <TableHead>Subject Type</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>By</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length > 0 ? filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.subjectType}</TableCell>
                                        <TableCell>{item.action}</TableCell>
                                        <TableCell>{item.subjectId}</TableCell>
                                        <TableCell>{item.user}</TableCell>
                                        <TableCell>{item.ipAddress}</TableCell>
                                        <TableCell>{item.note}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">No data available for the selected filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="print:hidden">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredData.length}</strong> of <strong>{activityLogs.length}</strong> entries
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
