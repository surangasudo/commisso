
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { FileText, Printer, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSuppliers } from '@/services/supplierService';
import { getCustomers } from '@/services/customerService';
import { type Supplier, type Customer } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';

type ContactReportTableProps<T> = {
    title: string;
    data: T[];
    columns: { key: keyof T, header: string, isNumeric?: boolean }[];
    totalKeys: { key: keyof T, label: string }[];
    idKey: keyof T;
    isLoading: boolean;
    formatCurrency: (value: number) => string;
};

const ContactReportTable = <T extends Record<string, any>>({ title, data, columns, totalKeys, idKey, isLoading, formatCurrency }: ContactReportTableProps<T>) => {

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
                return col.isNumeric ? formatCurrency(value) : value;
            }));
            exportToPdf(headers, pdfData, filename);
        }
    };
    
    return (
        <Card>
            <CardHeader className="print:hidden flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="mr-2 h-4 w-4" />CSV</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}><Download className="mr-2 h-4 w-4" />Excel</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />PDF</Button>
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
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((col, j) => <TableCell key={j}><Skeleton className="h-5" /></TableCell>)}
                                </TableRow>
                            ))
                        ) : data.length > 0 ? (
                             data.map(item => (
                                <TableRow key={item[idKey]}>
                                    {columns.map(col => (
                                         <TableCell key={String(col.key)} className={cn(col.isNumeric && 'text-right')}>
                                            {col.isNumeric ? formatCurrency(item[col.key] as number) : item[col.key]}
                                         </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={columns.length} className="text-center h-24">No data found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={columns.length - totalKeys.length} className="text-right font-bold">Total</TableCell>
                            {totalKeys.map(({key}) => (
                                <TableCell key={String(key)} className="text-right font-bold">
                                    {formatCurrency(data.reduce((acc, item) => acc + (item[key] || 0), 0))}
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
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [supplierSearch, setSupplierSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const { formatCurrency } = useCurrency();
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [suppliersData, customersData] = await Promise.all([
                    getSuppliers(),
                    getCustomers()
                ]);
                setSuppliers(suppliersData);
                setCustomers(customersData);
            } catch (e) {
                console.error("Failed to fetch supplier/customer data", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

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
                 <Button variant="default" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 printable-area">
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
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
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
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
                    />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
