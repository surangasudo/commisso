
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Printer, Calendar as CalendarIcon, Download, Columns3, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { 
    format, 
    startOfToday,
    endOfToday,
    startOfYesterday,
    endOfYesterday,
    subDays,
    startOfMonth,
    endOfMonth,
    subMonths,
    startOfYear,
    endOfYear,
    subYears,
} from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { getSales } from '@/services/saleService';
import { getPurchases } from '@/services/purchaseService';
import { getExpenses } from '@/services/expenseService';
import { getProducts } from '@/services/productService';
import { type Sale, type Purchase, type Expense, type DetailedProduct, type CustomerProfit, type AgentProfit, type BrandProfit, type CategoryProfit, type CompanyProfit, type DateProfit, type DayProfit, type InvoiceProfit, type LocationProfit, type ProductProfit, type ServiceStaffProfit, type SubAgentProfit } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';

const ReportItem = ({ label, value, note, isLoading }: { label: string; value: string; note?: string, isLoading?: boolean }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <div>
            <p className="font-medium text-sm">{label}</p>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
        {isLoading ? <Skeleton className="h-5 w-24" /> : <p className="font-semibold text-sm">{value}</p>}
    </div>
);

const ReportTable = <T extends {}>({ title, data, columns, getPdfData, isLoading }: { title: string, data: T[], columns: { key: keyof T, header: string, isNumeric?: boolean }[], getPdfData: (d: T[]) => any[][], isLoading?: boolean }) => {
    const { formatCurrency } = useCurrency();
    const [columnVisibility, setColumnVisibility] = useState(
        columns.reduce((acc, col) => ({...acc, [col.key]: true}), {} as Record<keyof T, boolean>)
    );
    const toggleColumn = (key: keyof T) => setColumnVisibility(prev => ({...prev, [key]: !prev[key]}));

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const filename = title.toLowerCase().replace(/ /g, '-');
        if (format === 'csv') exportToCsv(data, filename);
        if (format === 'xlsx') exportToXlsx(data, filename);
        if (format === 'pdf') exportToPdf(columns.map(c => c.header), getPdfData(data), filename);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4 print:hidden">
                <div className="flex items-center gap-2">
                    <Label>Show</Label>
                    <Select defaultValue="25">
                        <SelectTrigger className="w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label>entries</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}><Download className="mr-2 h-4 w-4" />Export Excel</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm"><Columns3 className="mr-2 h-4 w-4" />Column visibility</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {columns.map(col => (
                                <DropdownMenuCheckboxItem key={String(col.key)} checked={columnVisibility[col.key]} onCheckedChange={() => toggleColumn(col.key)} onSelect={e => e.preventDefault()}>
                                    {col.header}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />Export PDF</Button>
                </div>
                <div>
                    <Input placeholder="Search..." />
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map(col => columnVisibility[col.key] && <TableHead key={String(col.key)} className={cn(col.isNumeric && 'text-right')}>{col.header}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                         Array.from({length: 3}).map((_, i) => (
                            <TableRow key={i}>
                                {columns.map((col, j) => columnVisibility[col.key] && <TableCell key={j}><Skeleton className="h-5 w-full"/></TableCell>)}
                            </TableRow>
                        ))
                    ) : data.length > 0 ? data.map((item, index) => (
                        <TableRow key={index}>
                            {columns.map(col => columnVisibility[col.key] && (
                                <TableCell key={String(col.key)} className={cn(col.isNumeric && 'text-right')}>
                                    {col.isNumeric ? formatCurrency(Number(item[col.key] || 0)) : String(item[col.key])}
                                </TableCell>
                            ))}
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center h-24">No data available</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground print:hidden">
                <span>Showing 1 to {data.length} of {data.length} entries</span>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button variant="default" size="sm" className="w-8 h-8 p-0">1</Button>
                    <Button variant="outline" size="sm">Next</Button>
                </div>
            </div>
        </>
    );
};


export default function ProfitLossReportPage() {
    const [activeDate, setActiveDate] = useState<DateRange | undefined>({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    });
    const [selectedPreset, setSelectedPreset] = useState<string>('This Year');

    const [sales, setSales] = useState<Sale[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [salesData, purchasesData, expensesData, productsData] = await Promise.all([
                    getSales(),
                    getPurchases(),
                    getExpenses(),
                    getProducts(),
                ]);
                setSales(salesData);
                setPurchases(purchasesData);
                setExpenses(expensesData);
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const reportData = useMemo(() => {
        if (isLoading) return null;

        const dateFilter = (item: { date: string }) => {
            const itemDate = new Date(item.date);
            return activeDate?.from && activeDate?.to && itemDate >= activeDate.from && itemDate <= activeDate.to;
        };

        const filteredSales = sales.filter(dateFilter);
        const filteredPurchases = purchases.filter(dateFilter);
        const filteredExpenses = expenses.filter(dateFilter);

        const productsById = new Map(products.map(p => [p.id, p]));

        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.grandTotal, 0);
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.totalAmount, 0);

        let costOfGoodsSold = 0;
        filteredSales.forEach(sale => {
            (sale.items || []).forEach(item => {
                const product = productsById.get(item.productId);
                if (product) {
                    costOfGoodsSold += item.quantity * product.unitPurchasePrice;
                }
            });
        });

        const grossProfit = totalSales - costOfGoodsSold;
        const netProfit = grossProfit - totalExpenses;

        const productProfitMap = new Map<string, number>();
        filteredSales.forEach(sale => {
            (sale.items || []).forEach(item => {
                const product = productsById.get(item.productId);
                if (product) {
                    const profit = (item.unitPrice - product.unitPurchasePrice) * item.quantity;
                    const currentProfit = productProfitMap.get(product.name) || 0;
                    productProfitMap.set(product.name, currentProfit + profit);
                }
            });
        });
        const productProfitData: ProductProfit[] = Array.from(productProfitMap, ([product, profit]) => ({ product, profit }));


        return {
            totalSales,
            totalPurchases,
            totalExpenses,
            grossProfit,
            netProfit,
            productProfitData
        };

    }, [isLoading, sales, purchases, expenses, products, activeDate]);

    const handlePresetSelect = (preset: string) => {
        const today = new Date();
        let newDate: DateRange | undefined;
        
        switch (preset) {
            case 'Today': newDate = { from: startOfToday(), to: endOfToday() }; break;
            case 'Yesterday': newDate = { from: startOfYesterday(), to: endOfYesterday() }; break;
            case 'Last 7 Days': newDate = { from: subDays(today, 6), to: today }; break;
            case 'Last 30 Days': newDate = { from: subDays(today, 29), to: today }; break;
            case 'This Month': newDate = { from: startOfMonth(today), to: endOfMonth(today) }; break;
            case 'Last Month': const lastMonth = subMonths(today, 1); newDate = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }; break;
            case 'This month last year': const thisMonthLastYear = subYears(today, 1); newDate = { from: startOfMonth(thisMonthLastYear), to: endOfMonth(thisMonthLastYear) }; break;
            case 'This Year': newDate = { from: startOfYear(today), to: endOfYear(today) }; break;
            case 'Last Year': const lastYear = subYears(today, 1); newDate = { from: startOfYear(lastYear), to: endOfYear(lastYear) }; break;
            case 'Current financial year': newDate = { from: startOfYear(today), to: endOfYear(today) }; break;
            case 'Last financial year': const prevYear = subYears(today, 1); newDate = { from: startOfYear(prevYear), to: endOfYear(prevYear) }; break;
            default: break;
        }

        if (newDate) {
            setActiveDate(newDate);
        }
        setSelectedPreset(preset);
    }
    
    const handleCustomDateSelect = (newDate: DateRange | undefined) => {
      setActiveDate(newDate);
      setSelectedPreset('Custom Range');
    }

    const displayLabel = () => {
        const date = activeDate;
        if (selectedPreset === 'Custom Range' && date?.from) {
            if (date.to) {
                 if (format(date.from, 'PPP') === format(date.to, 'PPP')) {
                    return format(date.from, 'PPP');
                }
                return `${format(date.from, 'PPP')} - ${format(date.to, 'PPP')}`;
            }
            return format(date.from, 'PPP');
        }
        return selectedPreset;
    };

    const datePresets = [
        'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month',
        'This month last year', 'This Year', 'Last Year', 'Current financial year', 'Last financial year'
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between print:hidden">
                 <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <FileText className="w-8 h-8" />
                    Profit / Loss Report
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button
                                id="date"
                                variant={"outline"}
                                className={cn("w-[260px] justify-start text-left font-normal")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>{displayLabel()}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            {datePresets.map(preset => (
                                <DropdownMenuItem key={preset} onClick={() => handlePresetSelect(preset)}>
                                    {preset}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        Custom Range
                                    </DropdownMenuItem>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={activeDate?.from}
                                        selected={activeDate}
                                        onSelect={handleCustomDateSelect}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="default" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
                <Card className="p-4">
                    <ReportItem isLoading={isLoading} label="Total Sales:" value={formatCurrency(reportData?.totalSales || 0)} note="(Exc. tax, Discount)" />
                    <ReportItem isLoading={isLoading} label="Total purchase:" value={formatCurrency(reportData?.totalPurchases || 0)} note="(Exc. tax, Discount)" />
                    <ReportItem isLoading={isLoading} label="Total Expense:" value={formatCurrency(reportData?.totalExpenses || 0)} />
                    <ReportItem isLoading={isLoading} label="Total Sell Return:" value={formatCurrency(0)} />
                    <ReportItem isLoading={isLoading} label="Total Purchase Return:" value={formatCurrency(0)} />
                </Card>
                 <Card className="p-4">
                    <ReportItem isLoading={isLoading} label="Opening Stock" value={formatCurrency(0)} note="(By purchase price):" />
                    <ReportItem isLoading={isLoading} label="Closing stock" value={formatCurrency(0)} note="(By purchase price):" />
                    <ReportItem isLoading={isLoading} label="Total Stock Adjustment:" value={formatCurrency(0)} />
                    <ReportItem isLoading={isLoading} label="Total Stock Recovered:" value={formatCurrency(0)} />
                 </Card>
            </div>
            
            <div className="printable-area space-y-6">
                <Card>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <>
                                <h3 className="font-bold text-lg flex items-center gap-2">COGS: <Skeleton className="h-6 w-32" /></h3>
                                <Skeleton className="h-4 w-full mt-1 max-w-lg"/>
                                <h3 className="font-bold text-lg mt-4 flex items-center gap-2">Gross Profit: <Skeleton className="h-6 w-32" /></h3>
                                <Skeleton className="h-4 w-full mt-1 max-w-md"/>
                                <h3 className="font-bold text-lg mt-4 flex items-center gap-2">Net Profit: <Skeleton className="h-6 w-32" /></h3>
                                <Skeleton className="h-4 w-full mt-1 max-w-xl"/>
                            </>
                        ) : (
                            <>
                                <h3 className="font-bold text-lg">COGS: <span className="font-mono">{formatCurrency(reportData?.totalPurchases || 0)}</span></h3>
                                <p className="text-xs text-muted-foreground">Cost of Goods Sold (simplified as Total Purchases)</p>
                                <h3 className="font-bold text-lg mt-4">Gross Profit: <span className="font-mono">{formatCurrency(reportData?.grossProfit || 0)}</span></h3>
                                <p className="text-xs text-muted-foreground">(Total Sales - COGS)</p>
                                <h3 className="font-bold text-lg mt-4">Net Profit: <span className="font-mono">{formatCurrency(reportData?.netProfit || 0)}</span></h3>
                                <p className="text-xs text-muted-foreground">(Gross Profit - Total Expenses)</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Tabs defaultValue="products">
                            <TabsList className="flex-wrap h-auto print:hidden">
                                <TabsTrigger value="products">Profit by products</TabsTrigger>
                                <TabsTrigger value="categories">Profit by categories</TabsTrigger>
                                <TabsTrigger value="brands">Profit by brands</TabsTrigger>
                                <TabsTrigger value="locations">Profit by locations</TabsTrigger>
                                <TabsTrigger value="invoice">Profit by invoice</TabsTrigger>
                                <TabsTrigger value="date">Profit by date</TabsTrigger>
                                <TabsTrigger value="customer">Profit by customer</TabsTrigger>
                                <TabsTrigger value="day">Profit by day</TabsTrigger>
                                <TabsTrigger value="service-staff">Profit by service staff</TabsTrigger>
                                <TabsTrigger value="agent">Profit by Agent</TabsTrigger>
                                <TabsTrigger value="sub-agent">Profit by Sub-Agent</TabsTrigger>
                                <TabsTrigger value="company">Profit by Company</TabsTrigger>
                            </TabsList>
                            <TabsContent value="products" className="mt-4">
                            <ReportTable<ProductProfit> 
                                    title="Profit by Products"
                                    data={reportData?.productProfitData || []}
                                    columns={[{key: 'product', header: 'Product'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.product, formatCurrency(item.profit)])}
                                    isLoading={isLoading}
                            />
                            </TabsContent>
                            <TabsContent value="categories" className="mt-4">
                                <ReportTable<CategoryProfit> 
                                    title="Profit by Categories"
                                    data={[]}
                                    columns={[{key: 'category', header: 'Category'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.category, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="brands" className="mt-4">
                                <ReportTable<BrandProfit> 
                                    title="Profit by Brands"
                                    data={[]}
                                    columns={[{key: 'brand', header: 'Brand'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.brand, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="locations" className="mt-4">
                                <ReportTable<LocationProfit> 
                                    title="Profit by Locations"
                                    data={[]}
                                    columns={[{key: 'location', header: 'Location'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.location, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="invoice" className="mt-4">
                                <ReportTable<InvoiceProfit> 
                                    title="Profit by Invoice"
                                    data={[]}
                                    columns={[
                                        {key: 'invoiceNo', header: 'Invoice No.'}, 
                                        {key: 'customer', header: 'Customer'}, 
                                        {key: 'profit', header: 'Gross Profit', isNumeric: true}
                                    ]}
                                    getPdfData={(d) => d.map(item => [item.invoiceNo, item.customer, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="date" className="mt-4">
                                <ReportTable<DateProfit> 
                                    title="Profit by Date"
                                    data={[]}
                                    columns={[{key: 'date', header: 'Date'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.date, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="customer" className="mt-4">
                                <ReportTable<CustomerProfit> 
                                    title="Profit by Customer"
                                    data={[]}
                                    columns={[{key: 'customer', header: 'Customer'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.customer, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="day" className="mt-4">
                                <ReportTable<DayProfit> 
                                    title="Profit by Day"
                                    data={[]}
                                    columns={[{key: 'day', header: 'Day of the week'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.day, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="service-staff" className="mt-4">
                                <ReportTable<ServiceStaffProfit> 
                                    title="Profit by Service Staff"
                                    data={[]}
                                    columns={[{key: 'staffName', header: 'Service Staff'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.staffName, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="agent" className="mt-4">
                                <ReportTable<AgentProfit> 
                                    title="Profit by Agent"
                                    data={[]}
                                    columns={[{key: 'agentName', header: 'Agent'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.agentName, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="sub-agent" className="mt-4">
                                <ReportTable<SubAgentProfit> 
                                    title="Profit by Sub-Agent"
                                    data={[]}
                                    columns={[{key: 'subAgentName', header: 'Sub-Agent'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.subAgentName, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                            <TabsContent value="company" className="mt-4">
                                <ReportTable<CompanyProfit> 
                                    title="Profit by Company"
                                    data={[]}
                                    columns={[{key: 'company', header: 'Company'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                    getPdfData={(d) => d.map(item => [item.company, formatCurrency(item.profit)])}
                            />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
