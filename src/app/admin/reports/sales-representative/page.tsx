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
import { FileText, Printer, Calendar as CalendarIcon, Download, Search, Filter, Users as UsersIcon, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { commissionProfiles, users, type CommissionProfile } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ReportData = {
  id: string;
  name: string;
  totalSales: number;
  totalCommission: number;
};

const ReportTable = ({ data }: { data: ReportData[] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredData = useMemo(() => {
        return data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [data, searchTerm]);
    
    const totalSales = filteredData.reduce((acc, item) => acc + item.totalSales, 0);
    const totalCommission = filteredData.reduce((acc, item) => acc + item.totalCommission, 0);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'sales-rep-report';
        const exportData = filteredData.map(item => ({
            "Name": item.name,
            "Total Sales (Gross)": item.totalSales.toFixed(2),
            "Total Commission": item.totalCommission.toFixed(2),
        }));

        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = ["Name", "Total Sales (Gross)", "Total Commission"];
            const data = filteredData.map(item => [item.name, `$${item.totalSales.toFixed(2)}`, `$${item.totalCommission.toFixed(2)}`]);
            exportToPdf(headers, data, filename);
        }
    };
    
    return (
        <div>
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
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Total Sales (Gross)</TableHead>
                            <TableHead className="text-right">Total Commission</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? filteredData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">${item.totalSales.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${item.totalCommission.toFixed(2)}</TableCell>
                            </TableRow>
                        )) : (
                           <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">No data available for this entity type.</TableCell>
                           </TableRow> 
                        )}
                    </TableBody>
                     <TableFooter>
                        <TableRow>
                            <TableCell className="font-bold">Total</TableCell>
                            <TableCell className="text-right font-bold">${totalSales.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-bold">${totalCommission.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    )
};


export default function SalesRepresentativeReportPage() {
    const defaultDateRange = {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    };

    const [filters, setFilters] = useState({
        date: defaultDateRange as DateRange | undefined,
        user: 'all',
    });

    const reportData = useMemo(() => {
        // This is mock data generation for demonstration purposes.
        // In a real application, this data would come from an API based on the filters.
        return commissionProfiles.map(p => {
            const totalSales = Math.random() * 40000 + 5000;
            const specialCategory = p.commission.categories?.[0];
            let totalCommission = 0;

            if (specialCategory) {
                const specialSales = totalSales * 0.3; // Assume 30% are special category sales
                const regularSales = totalSales * 0.7;
                totalCommission = (regularSales * (p.commission.overall / 100)) + (specialSales * (specialCategory.rate / 100));
            } else {
                totalCommission = totalSales * (p.commission.overall / 100);
            }

            return {
                ...p,
                totalSales,
                totalCommission,
            };
        });
    }, [filters]); // In a real app, filters would be a dependency here

    const agentData = reportData.filter(p => p.entityType === 'Agent');
    const subAgentData = reportData.filter(p => p.entityType === 'Sub-Agent');
    const companyData = reportData.filter(p => p.entityType === 'Company');
    const salespersonData = reportData.filter(p => p.entityType === 'Salesperson');
    
    const totalSales = reportData.reduce((acc, item) => acc + item.totalSales, 0);
    const totalCommission = reportData.reduce((acc, item) => acc + item.totalCommission, 0);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <UsersIcon className="w-8 h-8" />
                Sales Representative Report
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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>User</Label>
                        <Select value={filters.user} onValueChange={(value) => setFilters(f => ({...f, user: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {users.map(user => <SelectItem key={user.id} value={user.username}>{user.name}</SelectItem>)}
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
                                    className={cn("w-full justify-start text-left font-normal", !filters.date && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.date?.from ? (filters.date.to ? (<>{format(filters.date.from, "LLL dd, y")} - {format(filters.date.to, "LLL dd, y")}</>) : (format(filters.date.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={filters.date?.from}
                                    selected={filters.date}
                                    onSelect={(date) => setFilters(f => ({...f, date: date || defaultDateRange}))}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales (Gross)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales Commission</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalCommission.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Tabs defaultValue="agents">
                        <TabsList>
                            <TabsTrigger value="agents">Agents</TabsTrigger>
                            <TabsTrigger value="sub_agents">Sub-Agents</TabsTrigger>
                            <TabsTrigger value="companies">Companies</TabsTrigger>
                            <TabsTrigger value="salespersons">Salespersons</TabsTrigger>
                        </TabsList>
                        <TabsContent value="agents" className="mt-4">
                           <ReportTable data={agentData} />
                        </TabsContent>
                        <TabsContent value="sub_agents" className="mt-4">
                           <ReportTable data={subAgentData} />
                        </TabsContent>
                         <TabsContent value="companies" className="mt-4">
                           <ReportTable data={companyData} />
                        </TabsContent>
                         <TabsContent value="salespersons" className="mt-4">
                           <ReportTable data={salespersonData} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
