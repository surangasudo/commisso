'use client';
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download, Search, Filter, Users as UsersIcon, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { commissionProfiles, type CommissionProfile } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ReportData = {
  id: string;
  name: string;
  entityType: string;
  totalSales: number;
  totalCommission: number;
};

const ReportTable = ({ data, entityType }: { data: ReportData[], entityType: string }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredData = useMemo(() => {
        return data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [data, searchTerm]);
    
    const totalSales = filteredData.reduce((acc, item) => acc + item.totalSales, 0);
    const totalCommission = filteredData.reduce((acc, item) => acc + item.totalCommission, 0);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = `${entityType.toLowerCase().replace(' ', '-')}-report`;
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
                                <TableCell colSpan={3} className="text-center h-24">No data available for the selected filters.</TableCell>
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

    const [dateFilter, setDateFilter] = useState<DateRange | undefined>(defaultDateRange);
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [selectedSubAgent, setSelectedSubAgent] = useState('all');
    const [selectedCompany, setSelectedCompany] = useState('all');
    const [selectedSalesperson, setSelectedSalesperson] = useState('all');

    const reportData = useMemo(() => {
        // This is mock data generation for demonstration purposes.
        // In a real application, this data would come from an API based on the dateFilter.
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
    }, [dateFilter]); // The mock data will "re-fetch" when the date changes.

    const agentData = useMemo(() => {
        let data = reportData.filter(p => p.entityType === 'Agent');
        if (selectedAgent !== 'all') {
            data = data.filter(p => p.id === selectedAgent);
        }
        return data;
    }, [reportData, selectedAgent]);
    
    const subAgentData = useMemo(() => {
        let data = reportData.filter(p => p.entityType === 'Sub-Agent');
        if (selectedSubAgent !== 'all') {
            data = data.filter(p => p.id === selectedSubAgent);
        }
        return data;
    }, [reportData, selectedSubAgent]);
    
    const companyData = useMemo(() => {
        let data = reportData.filter(p => p.entityType === 'Company');
        if (selectedCompany !== 'all') {
            data = data.filter(p => p.id === selectedCompany);
        }
        return data;
    }, [reportData, selectedCompany]);
    
    const salespersonData = useMemo(() => {
        let data = reportData.filter(p => p.entityType === 'Salesperson');
        if (selectedSalesperson !== 'all') {
            data = data.filter(p => p.id === selectedSalesperson);
        }
        return data;
    }, [reportData, selectedSalesperson]);

    const totalSales = reportData.reduce((acc, item) => acc + item.totalSales, 0);
    const totalCommission = reportData.reduce((acc, item) => acc + item.totalCommission, 0);

    const agents = useMemo(() => commissionProfiles.filter(p => p.entityType === 'Agent'), []);
    const subAgents = useMemo(() => commissionProfiles.filter(p => p.entityType === 'Sub-Agent'), []);
    const companies = useMemo(() => commissionProfiles.filter(p => p.entityType === 'Company'), []);
    const salespersons = useMemo(() => commissionProfiles.filter(p => p.entityType === 'Salesperson'), []);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <UsersIcon className="w-8 h-8" />
                Sales Representative Report
            </h1>

            <Card className="print:hidden">
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="space-y-2 max-w-sm">
                        <Label>Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFilter?.from ? (dateFilter.to ? (<>{format(dateFilter.from, "LLL dd, y")} - {format(dateFilter.to, "LLL dd, y")}</>) : (format(dateFilter.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateFilter?.from}
                                    selected={dateFilter}
                                    onSelect={setDateFilter}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
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
                        <TabsList className="print:hidden">
                            <TabsTrigger value="agents">Agents</TabsTrigger>
                            <TabsTrigger value="sub_agents">Sub-Agents</TabsTrigger>
                            <TabsTrigger value="companies">Companies</TabsTrigger>
                            <TabsTrigger value="salespersons">Salespersons</TabsTrigger>
                        </TabsList>
                        <TabsContent value="agents" className="mt-4 space-y-4">
                           <div className="space-y-2 max-w-sm print:hidden">
                                <Label>Filter by Agent</Label>
                                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Agents</SelectItem>
                                        {agents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                           </div>
                           <ReportTable data={agentData} entityType="Agent" />
                        </TabsContent>
                        <TabsContent value="sub_agents" className="mt-4 space-y-4">
                           <div className="space-y-2 max-w-sm print:hidden">
                                <Label>Filter by Sub-Agent</Label>
                                <Select value={selectedSubAgent} onValueChange={setSelectedSubAgent}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sub-Agents</SelectItem>
                                        {subAgents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                           </div>
                           <ReportTable data={subAgentData} entityType="Sub-Agent" />
                        </TabsContent>
                         <TabsContent value="companies" className="mt-4 space-y-4">
                           <div className="space-y-2 max-w-sm print:hidden">
                                <Label>Filter by Company</Label>
                                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Companies</SelectItem>
                                        {companies.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                           </div>
                           <ReportTable data={companyData} entityType="Company" />
                        </TabsContent>
                         <TabsContent value="salespersons" className="mt-4 space-y-4">
                           <div className="space-y-2 max-w-sm print:hidden">
                                <Label>Filter by Salesperson</Label>
                                <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Salespersons</SelectItem>
                                        {salespersons.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                           </div>
                           <ReportTable data={salespersonData} entityType="Salesperson" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
