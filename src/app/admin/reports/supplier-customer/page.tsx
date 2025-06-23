'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { suppliers, customers, type Supplier, type Customer } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Input } from '@/components/ui/input';

type ContactReportTableProps<T> = {
    title: string;
    data: T[];
    columns: { key: keyof T, header: string, isNumeric?: boolean }[];
    totalKeys: { key: keyof T, label: string }[];
    idKey: keyof T;
};

const ContactReportTable = <T extends Record<string, any>>({ title, data, columns, totalKeys, idKey }: ContactReportTableProps<T>) => {

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = `${title.toLowerCase().replace(/ /g, '-')}-report`;
        const exportData = data.map(item => {
            const row: Record<string, any> = {};
            columns.forEach(col => {
                row[col.header] = item[col.key];
            });
            return row;
        });

        if (format === 'csv') exportToCsv(exportData, filename);
        if (format === 'xlsx') exportToXlsx(exportData, filename);
        if (format === 'pdf') {
            const headers = columns.map(c => c.header);
            const pdfData = data.map(item => columns.map(col => {
                const value = item[col.key];
                return typeof value === 'number' ? `$${value.toFixed(2)}` : value;
            }));
            exportToPdf(headers, pdfData, filename);
        }
    };
    
    return (
        <Card>
            <CardHeader className="print:hidden">
                <CardTitle>{title}</CardTitle>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="mr-2 h-4 w-4" />CSV</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}><Download className="mr-2 h-4 w-4" />Excel</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />PDF</Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(col => <TableHead key={String(col.key)} className={cn(col.isNumeric && 'text-right')}>{col.header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(item => (
                            <TableRow key={item[idKey]}>
                                {columns.map(col => (
                                     <TableCell key={String(col.key)} className={cn(col.isNumeric && 'text-right')}>
                                        {typeof item[col.key] === 'number' ? `$${(item[col.key] as number).toFixed(2)}` : item[col.key]}
                                     </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={columns.length - totalKeys.length} className="text-right font-bold">Total</TableCell>
                            {totalKeys.map(({key}) => (
                                <TableCell key={String(key)} className="text-right font-bold">
                                    {`$${data.reduce((acc, item) => acc + (item[key] || 0), 0).toFixed(2)}`}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
};

export default function SupplierCustomerReportPage() {
    const [date, setDate] = useState<DateRange | undefined>({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    });
    
    const [supplierSearch, setSupplierSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');

    const filteredSuppliers = suppliers.filter(s => s.businessName.toLowerCase().includes(supplierSearch.toLowerCase()));
    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

    const supplierColumns: { key: keyof Supplier, header: string, isNumeric?: boolean }[] = [
        { key: 'businessName', header: 'Supplier' },
        { key: 'contactId', header: 'Contact ID' },
        { key: 'totalPurchaseDue', header: 'Total Purchase Due', isNumeric: true },
        { key: 'totalPurchaseReturnDue', header: 'Total Purchase Return Due', isNumeric: true },
    ];
    const supplierTotalKeys = [{key: 'totalPurchaseDue' as keyof Supplier, label: ''}, {key: 'totalPurchaseReturnDue' as keyof Supplier, label: ''}];

    const customerColumns: { key: keyof Customer, header: string, isNumeric?: boolean }[] = [
        { key: 'name', header: 'Customer' },
        { key: 'contactId', header: 'Contact ID' },
        { key: 'totalSaleDue', header: 'Total Sale Due', isNumeric: true },
        { key: 'totalSaleReturnDue', header: 'Total Sale Return Due', isNumeric: true },
    ];
    const customerTotalKeys = [{key: 'totalSaleDue' as keyof Customer, label: ''}, {key: 'totalSaleReturnDue' as keyof Customer, label: ''}];

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between print:hidden">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Supplier & Customer Report
            </h1>
             <div className="flex items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                            date.to ? (
                                <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
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
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader className="print:hidden">
                    <div className="flex justify-between items-center">
                        <CardTitle>Supplier Report</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search suppliers..." className="pl-8" value={supplierSearch} onChange={(e) => setSupplierSearch(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ContactReportTable<Supplier>
                        title="Suppliers"
                        data={filteredSuppliers}
                        columns={supplierColumns}
                        totalKeys={supplierTotalKeys}
                        idKey="id"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="print:hidden">
                     <div className="flex justify-between items-center">
                        <CardTitle>Customer Report</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search customers..." className="pl-8" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ContactReportTable<Customer>
                        title="Customers"
                        data={filteredCustomers}
                        columns={customerColumns}
                        totalKeys={customerTotalKeys}
                        idKey="id"
                    />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
