'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Printer,
  Search,
  Pencil,
  Trash2,
  Eye,
  PlusCircle,
  Filter,
  Columns3,
  FileText,
  ArrowUpDown,
  ChevronDown,
  WalletCards,
  BookOpen,
  History,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { customers, type Customer } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { useCurrency } from '@/hooks/use-currency';

export default function CustomersContactPage() {
  const { formatCurrency } = useCurrency();
  const [visibleColumns, setVisibleColumns] = useState({
    action: true,
    contactId: true,
    customerGroup: true,
    name: true,
    email: true,
    mobile: true,
    address: true,
    totalSaleDue: true,
    totalSaleReturnDue: true,
    openingBalance: true,
    addedOn: true,
    customField1: true,
  });

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({...prev, [column]: !prev[column]}));
  };

  const totalSaleDue = customers.reduce((acc, customer) => acc + customer.totalSaleDue, 0);
  const totalSaleReturnDue = customers.reduce((acc, customer) => acc + customer.totalSaleReturnDue, 0);
  const totalOpeningBalance = customers.reduce((acc, customer) => acc + customer.openingBalance, 0);
  
  const getExportData = () => customers.map(c => ({
    contactId: c.contactId,
    customerGroup: c.customerGroup,
    name: c.name,
    email: c.email,
    mobile: c.mobile,
    address: c.address,
    totalSaleDue: c.totalSaleDue,
    totalSaleReturnDue: c.totalSaleReturnDue,
    openingBalance: c.openingBalance,
    addedOn: c.addedOn,
    customField1: c.customField1 || '',
  }));
  
  const handleExportCsv = () => exportToCsv(getExportData(), 'customers');
  const handleExportXlsx = () => exportToXlsx(getExportData(), 'customers');
  const handlePrint = () => window.print();
  const handleExportPdf = () => {
    const headers = ["Contact ID", "Customer Group", "Name", "Email", "Mobile", "Address", "Total Sale Due", "Total Sale Return Due", "Opening Balance", "Added On", "Custom Field 1"];
    const data = customers.map(c => [
        c.contactId, c.customerGroup, c.name, c.email, c.mobile, c.address, 
        formatCurrency(c.totalSaleDue), formatCurrency(c.totalSaleReturnDue), formatCurrency(c.openingBalance),
        c.addedOn, c.customField1 || ''
    ]);
    exportToPdf(headers, data, 'customers');
  };

  const colSpan1 = (visibleColumns.action ? 1 : 0) + (visibleColumns.contactId ? 1 : 0) + (visibleColumns.customerGroup ? 1 : 0) + (visibleColumns.name ? 1 : 0) + (visibleColumns.email ? 1 : 0) + (visibleColumns.mobile ? 1 : 0) + (visibleColumns.address ? 1 : 0);
  const colSpan2 = (visibleColumns.addedOn ? 1 : 0) + (visibleColumns.customField1 ? 1 : 0);


  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
            <h1 className="font-headline text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">Manage your Customers</p>
        </div>

        <Card>
            <CardHeader>
                 <Button variant="outline" size="sm" className="h-9 gap-1.5 w-fit">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                </Button>
            </CardHeader>
            <CardContent>
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <CardTitle>All your Customers</CardTitle>
                            <div className="flex items-center gap-2">
                                <Link href="/admin/contacts/customers/add">
                                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add</span>
                                </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Select defaultValue="25">
                                <SelectTrigger className="w-[100px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">Show 10</SelectItem>
                                    <SelectItem value="25">Show 25</SelectItem>
                                    <SelectItem value="50">Show 50</SelectItem>
                                    <SelectItem value="100">Show 100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground hidden lg:inline">entries</span>
                        </div>
                        <div className="flex-1 flex flex-wrap items-center justify-start sm:justify-center gap-2">
                            <Button onClick={handleExportCsv} variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span></Button>
                            <Button onClick={handleExportXlsx} variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export Excel</span></Button>
                            <Button onClick={handlePrint} variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-1"><Columns3 className="h-4 w-4" /> <span className="hidden sm:inline">Column visibility</span></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {Object.keys(visibleColumns).map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column}
                                            className="capitalize"
                                            checked={visibleColumns[column as keyof typeof visibleColumns]}
                                            onCheckedChange={() => toggleColumn(column as keyof typeof visibleColumns)}
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            {column.replace(/([A-Z])/g, ' $1')}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={handleExportPdf} variant="outline" size="sm" className="h-9 gap-1"><FileText className="h-4 w-4" /> <span className="hidden sm:inline">Export PDF</span></Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" />
                        </div>
                        </div>
                        <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                {visibleColumns.action && <TableHead>Action</TableHead>}
                                {visibleColumns.contactId && <TableHead><div className="flex items-center gap-1">Contact ID <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.customerGroup && <TableHead><div className="flex items-center gap-1">Customer Group <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.name && <TableHead><div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.email && <TableHead><div className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.mobile && <TableHead><div className="flex items-center gap-1">Mobile <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.address && <TableHead>Address</TableHead>}
                                {visibleColumns.totalSaleDue && <TableHead><div className="flex items-center gap-1">Total Sale Due <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.totalSaleReturnDue && <TableHead><div className="flex items-center gap-1">Total Sale Return Due <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.openingBalance && <TableHead><div className="flex items-center gap-1">Opening Balance <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.addedOn && <TableHead><div className="flex items-center gap-1">Added On <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                                {visibleColumns.customField1 && <TableHead><div className="flex items-center gap-1">Custom Field 1 <ArrowUpDown className="h-3 w-3" /></div></TableHead>}
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                {visibleColumns.action && <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><WalletCards className="mr-2 h-4 w-4" /> Pay</DropdownMenuItem>
                                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                            <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem><BookOpen className="mr-2 h-4 w-4" /> Ledger</DropdownMenuItem>
                                            <DropdownMenuItem><History className="mr-2 h-4 w-4" /> Sales</DropdownMenuItem>
                                            <DropdownMenuItem><BarChart3 className="mr-2 h-4 w-4" /> Stock Report</DropdownMenuItem>
                                            <DropdownMenuItem><FileText className="mr-2 h-4 w-4" /> Documents & Note</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>}
                                {visibleColumns.contactId && <TableCell>{customer.contactId}</TableCell>}
                                {visibleColumns.customerGroup && <TableCell>{customer.customerGroup}</TableCell>}
                                {visibleColumns.name && <TableCell className="font-medium">{customer.name}</TableCell>}
                                {visibleColumns.email && <TableCell>{customer.email}</TableCell>}
                                {visibleColumns.mobile && <TableCell>{customer.mobile}</TableCell>}
                                {visibleColumns.address && <TableCell>{customer.address}</TableCell>}
                                {visibleColumns.totalSaleDue && <TableCell>{formatCurrency(customer.totalSaleDue)}</TableCell>}
                                {visibleColumns.totalSaleReturnDue && <TableCell>{formatCurrency(customer.totalSaleReturnDue)}</TableCell>}
                                {visibleColumns.openingBalance && <TableCell>{formatCurrency(customer.openingBalance)}</TableCell>}
                                {visibleColumns.addedOn && <TableCell>{customer.addedOn}</TableCell>}
                                {visibleColumns.customField1 && <TableCell>{customer.customField1 || ''}</TableCell>}
                                </TableRow>
                            ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={colSpan1} className="text-right font-bold">Total:</TableCell>
                                    {visibleColumns.totalSaleDue && <TableCell className="font-bold">{formatCurrency(totalSaleDue)}</TableCell>}
                                    {visibleColumns.totalSaleReturnDue && <TableCell className="font-bold">{formatCurrency(totalSaleReturnDue)}</TableCell>}
                                    {visibleColumns.openingBalance && <TableCell className="font-bold">{formatCurrency(totalOpeningBalance)}</TableCell>}
                                    {colSpan2 > 0 && <TableCell colSpan={colSpan2}></TableCell>}
                                </TableRow>
                            </TableFooter>
                        </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="py-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1 to {customers.length}</strong> of <strong>{customers.length}</strong> entries
                        </div>
                    </CardFooter>
                </Card>
            </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-400 p-1">
            Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
        </div>
    </div>
  );
}
