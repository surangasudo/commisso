'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { FileText, Printer, Calendar as CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { expenses, type Purchase, type Sale } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { getSales } from '@/services/saleService';
import { getPurchases } from '@/services/purchaseService'; // Assuming this service exists

// Reusable table component
const TaxReportTable = ({ title, data, columns, footerData, handleExport }: { title: string, data: any[], columns: { key: string, header: string }[], footerData: { label: string, value: string }[], handleExport: (format: 'csv' | 'xlsx' | 'pdf') => void }) => {
    return (
        <Card>
            <CardHeader>
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
                            {columns.map(col => <TableHead key={col.key}>{col.header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow key={item.id || index}>
                                {columns.map(col => (
                                    <TableCell key={col.key}>
                                        {col.key.toLowerCase().includes('tax') ? `$${item[col.key].toFixed(2)}` : item[col.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        {footerData.map(footer => (
                            <TableRow key={footer.label}>
                                <TableCell colSpan={columns.length - 1} className="text-right font-bold">{footer.label}</TableCell>
                                <TableCell className="font-bold">{footer.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function TaxReportPage() {
    const [date, setDate] = useState<DateRange | undefined>({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    });
    
    const [sales, setSales] = useState<Sale[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const salesData = await getSales();
            // const purchasesData = await getPurchases(); // You need to create this service
            setSales(salesData);
            // setPurchases(purchasesData);
        };
        fetchData();
    }, []);

    // Calculations
    const totalInputTax = purchases.reduce((acc, p) => acc + (p.taxAmount || 0), 0);
    const totalOutputTax = sales.reduce((acc, s) => acc + (s.taxAmount || 0), 0);
    const totalExpenseTax = expenses.reduce((acc, e) => acc + (e.tax || 0), 0); // using existing tax field for expenses
    const netTax = totalOutputTax - totalInputTax - totalExpenseTax;

    const inputTaxData = purchases.map(p => ({
        id: p.id,
        date: p.date,
        ref: p.referenceNo,
        contact: p.supplier,
        tax: p.taxAmount || 0,
    }));
    
    const outputTaxData = sales.map(s => ({
        id: s.id,
        date: s.date,
        ref: s.invoiceNo,
        contact: s.customerName,
        tax: s.taxAmount || 0,
    }));
    
    const expenseTaxData = expenses.map(e => ({
        id: e.id,
        date: e.date,
        ref: e.referenceNo,
        contact: e.contact || 'N/A',
        tax: e.tax || 0,
    }));

    const taxColumns = [
        { key: 'date', header: 'Date' },
        { key: 'ref', header: 'Reference No.' },
        { key: 'contact', header: 'Contact' },
        { key: 'tax', header: 'Tax Amount' },
    ];
    
    const handleExport = (type: 'input' | 'output' | 'expense', format: 'csv' | 'xlsx' | 'pdf') => {
        let data, filename;

        switch (type) {
            case 'input':
                data = inputTaxData;
                filename = 'input-tax-report';
                break;
            case 'output':
                data = outputTaxData;
                filename = 'output-tax-report';
                break;
            case 'expense':
                data = expenseTaxData;
                filename = 'expense-tax-report';
                break;
        }

        const dataToExport = data.map(d => ({
            "Date": d.date,
            "Reference No.": d.ref,
            "Contact": d.contact,
            "Tax Amount": d.tax,
        }));
        const headers = ["Date", "Reference No.", "Contact", "Tax Amount"];
        const pdfData = data.map(d => [d.date, d.ref, d.contact, `$${d.tax.toFixed(2)}`]);

        if (format === 'csv') exportToCsv(dataToExport, filename);
        if (format === 'xlsx') exportToXlsx(dataToExport, filename);
        if (format === 'pdf') {
            exportToPdf(headers, pdfData, filename);
        }
    };


  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Tax Report
            </h1>
             <div className="flex items-center gap-4">
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All locations</SelectItem>
                    </SelectContent>
                </Select>
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
      
        <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-4 bg-blue-50">
                    <h3 className="font-semibold text-lg mb-2 text-blue-800">Input Tax</h3>
                    <p className="text-2xl font-bold text-blue-900">${totalInputTax.toFixed(2)}</p>
                </Card>
                <Card className="p-4 bg-green-50">
                    <h3 className="font-semibold text-lg mb-2 text-green-800">Output Tax</h3>
                    <p className="text-2xl font-bold text-green-900">${totalOutputTax.toFixed(2)}</p>
                </Card>
                 <Card className="p-4 bg-yellow-50">
                    <h3 className="font-semibold text-lg mb-2 text-yellow-800">Expense Tax</h3>
                    <p className="text-2xl font-bold text-yellow-900">${totalExpenseTax.toFixed(2)}</p>
                </Card>
                 <Card className="p-4 bg-red-50">
                    <h3 className="font-semibold text-lg mb-2 text-red-800">Tax Due</h3>
                    <p className="text-2xl font-bold text-red-900">${netTax.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">(Output - Input - Expense)</p>
                </Card>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
            <TaxReportTable 
                title="Input Tax"
                data={inputTaxData}
                columns={taxColumns}
                footerData={[{ label: 'Total Input Tax', value: `$${totalInputTax.toFixed(2)}`}]}
                handleExport={(format) => handleExport('input', format)}
            />
            <TaxReportTable 
                title="Output Tax"
                data={outputTaxData}
                columns={taxColumns}
                footerData={[{ label: 'Total Output Tax', value: `$${totalOutputTax.toFixed(2)}`}]}
                handleExport={(format) => handleExport('output', format)}
            />
             <TaxReportTable 
                title="Expense Tax"
                data={expenseTaxData}
                columns={taxColumns}
                footerData={[{ label: 'Total Expense Tax', value: `$${totalExpenseTax.toFixed(2)}`}]}
                handleExport={(format) => handleExport('expense', format)}
            />
        </div>

    </div>
  );
}
