
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FileText, Printer, Download, Search } from 'lucide-react';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { useCurrency } from '@/hooks/use-currency';
import { getMoneyExchanges } from '@/services/moneyExchangeService';
import { type MoneyExchange } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function MoneyExchangeReportPage() {
    const { formatCurrency } = useCurrency();
    const [exchanges, setExchanges] = useState<MoneyExchange[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getMoneyExchanges();
                setExchanges(data);
            } catch (error) {
                console.error("Failed to fetch money exchanges:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm) return exchanges;
        return exchanges.filter(item => 
            item.fromCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.toCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.addedBy.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [exchanges, searchTerm]);

    const totalAmount = useMemo(() => filteredData.reduce((sum, item) => sum + item.amount, 0), [filteredData]);
    const totalProfit = useMemo(() => filteredData.reduce((sum, item) => sum + item.profit, 0), [filteredData]);

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = 'money-exchange-report';
        const exportData = filteredData.map(item => ({
            "Date": new Date(item.date).toLocaleString(),
            "From": `${item.amount.toFixed(2)} ${item.fromCurrency}`,
            "To": `${item.convertedAmount.toFixed(2)} ${item.toCurrency}`,
            "Base Rate": item.baseRate.toFixed(4),
            "Offered Rate": item.offeredRate.toFixed(4),
            "Markup": `${item.markupPercent}%`,
            "Profit": `${item.profit.toFixed(2)} ${item.fromCurrency}`,
            "Added By": item.addedBy,
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
            <div className="flex items-center justify-between print:hidden">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <FileText className="w-8 h-8" />
                    Money Exchange Report
                </h1>
                <Button variant="default" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>

            <Card className="printable-area">
                <CardHeader>
                    <CardTitle>Transaction Log</CardTitle>
                    <CardDescription>A complete log of all money exchange transactions.</CardDescription>
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
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Offered Rate</TableHead>
                                    <TableHead className="text-right">Profit</TableHead>
                                    <TableHead>Added By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5" /></TableCell>)}
                                        </TableRow>
                                    ))
                                ) : filteredData.length > 0 ? filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                                        <TableCell>{item.amount.toFixed(2)} {item.fromCurrency}</TableCell>
                                        <TableCell>{item.convertedAmount.toFixed(2)} {item.toCurrency}</TableCell>
                                        <TableCell>1 {item.fromCurrency} = {item.offeredRate.toFixed(4)} {item.toCurrency}</TableCell>
                                        <TableCell className="text-right font-medium text-green-600">{item.profit.toFixed(2)} {item.fromCurrency}</TableCell>
                                        <TableCell>{item.addedBy}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No exchange transactions found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} className="font-bold text-right">Total Profit:</TableCell>
                                    <TableCell className="font-bold text-right text-green-600">{formatCurrency(totalProfit)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="print:hidden">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredData.length}</strong> of <strong>{exchanges.length}</strong> entries
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
