'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Printer, Calendar as CalendarIcon, Download, Columns3 } from 'lucide-react';
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
import { profitData, productProfitData, categoryProfitData, brandProfitData, locationProfitData, invoiceProfitData, dateProfitData, customerProfitData, dayProfitData, serviceStaffProfitData, agentProfitData, subAgentProfitData, companyProfitData, type ProductProfit, type CategoryProfit, type BrandProfit, type LocationProfit, type InvoiceProfit, type DateProfit, type CustomerProfit, type DayProfit, type ServiceStaffProfit, type AgentProfit, type SubAgentProfit, type CompanyProfit } from '@/lib/data';

const ReportItem = ({ label, value, note }: { label: string; value: string; note?: string }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <div>
            <p className="font-medium text-sm">{label}</p>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
        <p className="font-semibold text-sm">{value}</p>
    </div>
);

const ReportTable = <T extends {}>({ title, data, columns, getPdfData }: { title: string, data: T[], columns: { key: keyof T, header: string, isNumeric?: boolean }[], getPdfData: (d: T[]) => any[][] }) => {
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
            <div className="flex justify-between items-center mb-4">
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
                    <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
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
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            {columns.map(col => columnVisibility[col.key] && <TableCell key={String(col.key)} className={cn(col.isNumeric && 'text-right')}>{String(item[col.key])}</TableCell>)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
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
    const [date, setDate] = useState<DateRange | undefined>({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    });
    const [selectedPreset, setSelectedPreset] = useState<string>('This Year');

    const handlePresetSelect = (preset: string) => {
        const today = new Date();
        let newDate: DateRange | undefined;
        
        switch (preset) {
            case 'Today':
                newDate = { from: startOfToday(), to: endOfToday() };
                break;
            case 'Yesterday':
                const yesterdayStart = startOfYesterday();
                const yesterdayEnd = endOfYesterday();
                newDate = { from: yesterdayStart, to: yesterdayEnd };
                break;
            case 'Last 7 Days':
                newDate = { from: subDays(today, 6), to: today };
                break;
            case 'Last 30 Days':
                newDate = { from: subDays(today, 29), to: today };
                break;
            case 'This Month':
                newDate = { from: startOfMonth(today), to: endOfMonth(today) };
                break;
            case 'Last Month':
                const lastMonth = subMonths(today, 1);
                newDate = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
                break;
            case 'This month last year':
                const thisMonthLastYear = subYears(today, 1);
                newDate = { from: startOfMonth(thisMonthLastYear), to: endOfMonth(thisMonthLastYear) };
                break;
            case 'This Year':
                newDate = { from: startOfYear(today), to: endOfYear(today) };
                break;
            case 'Last Year':
                const lastYear = subYears(today, 1);
                newDate = { from: startOfYear(lastYear), to: endOfYear(lastYear) };
                break;
            case 'Current financial year': // Assuming same as calendar year
                newDate = { from: startOfYear(today), to: endOfYear(today) };
                break;
            case 'Last financial year': // Assuming same as calendar year
                const prevYear = subYears(today, 1);
                newDate = { from: startOfYear(prevYear), to: endOfYear(prevYear) };
                break;
            default:
                break;
        }

        if (newDate) {
            setDate(newDate);
        }
        setSelectedPreset(preset);
    }
    
    const handleCustomDateSelect = (newDate: DateRange | undefined) => {
      setDate(newDate);
      setSelectedPreset('Custom Range');
    }

    const displayLabel = () => {
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
            <div className="flex items-center justify-between">
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
                                variant={"default"}
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
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={handleCustomDateSelect}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                    <ReportItem label="Opening Stock" value={`$${profitData.openingStockPurchase.toFixed(2)}`} note="(By purchase price):" />
                    <ReportItem label="Opening Stock" value={`$${profitData.openingStockSale.toFixed(2)}`} note="(By sale price):" />
                    <ReportItem label="Total purchase:" value={`$${profitData.totalPurchase.toFixed(2)}`} note="(Exc. tax, Discount)" />
                    <ReportItem label="Total Stock Adjustment:" value={`$${profitData.totalStockAdjustment.toFixed(2)}`} />
                    <ReportItem label="Total Expense:" value={`$${profitData.totalExpense.toFixed(2)}`} />
                    <ReportItem label="Total purchase shipping charge:" value={`$${profitData.totalPurchaseShipping.toFixed(2)}`} />
                    <ReportItem label="Purchase additional expenses:" value={`$${profitData.purchaseAdditionalExpense.toFixed(2)}`} />
                    <ReportItem label="Total transfer shipping charge:" value={`$${profitData.totalTransferShipping.toFixed(2)}`} />
                    <ReportItem label="Total Sell discount:" value={`$${profitData.totalSellDiscount.toFixed(2)}`} />
                    <ReportItem label="Total customer reward:" value={`$${profitData.totalCustomerReward.toFixed(2)}`} />
                    <ReportItem label="Total Sell Return:" value={`$${profitData.totalSellReturn.toFixed(2)}`} />
                    <ReportItem label="Total Payroll:" value={`$${profitData.totalPayroll.toFixed(2)}`} />
                    <ReportItem label="Total Production Cost:" value={`$${profitData.totalProductionCost.toFixed(2)}`} />
                </Card>
                 <Card className="p-4">
                    <ReportItem label="Closing stock" value={`$${profitData.closingStockPurchase.toFixed(2)}`} note="(By purchase price):" />
                    <ReportItem label="Closing stock" value={`$${profitData.closingStockSale.toFixed(2)}`} note="(By sale price):" />
                    <ReportItem label="Total Sales:" value={`$${profitData.totalSales.toFixed(2)}`} note="(Exc. tax, Discount)" />
                    <ReportItem label="Total sell shipping charge:" value={`$${profitData.totalSellShipping.toFixed(2)}`} />
                    <ReportItem label="Sell additional expenses:" value={`$${profitData.sellAdditionalExpenses.toFixed(2)}`} />
                    <ReportItem label="Total Stock Recovered:" value={`$${profitData.totalStockRecovered.toFixed(2)}`} />
                    <ReportItem label="Total Purchase Return:" value={`$${profitData.totalPurchaseReturn.toFixed(2)}`} />
                    <ReportItem label="Total Purchase discount:" value={`$${profitData.totalPurchaseDiscount.toFixed(2)}`} />
                    <ReportItem label="Total sell round off:" value={`$${profitData.totalSellRoundOff.toFixed(2)}`} />
                    <ReportItem label="Hms Total:" value={`$${profitData.hmsTotal.toFixed(2)}`} />
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="font-bold text-lg">COGS: <span className="font-mono">$0.00</span></h3>
                    <p className="text-xs text-muted-foreground">Cost of Goods Sold = Starting inventory(opening stock) + purchases - ending inventory(closing stock)</p>
                    <h3 className="font-bold text-lg mt-4">Gross Profit: <span className="font-mono">$0.00</span></h3>
                    <p className="text-xs text-muted-foreground">(Total sell price - Total purchase price) + Hms Total + Project Invoice</p>
                    <h3 className="font-bold text-lg mt-4">Net Profit: <span className="font-mono">$0.00</span></h3>
                    <p className="text-xs text-muted-foreground">Gross Profit + (Total sell shipping charge + Sell additional expenses + Total Stock Recovered + Total Purchase discount + Total sell round off + Hms Total ) - ( Total Stock Adjustment + Total Expense + Total purchase shipping charge + Total transfer shipping charge + Purchase additional expenses + Total Sell discount + Total customer reward + Total Payroll + Total Production Cost )</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-end">
                        <Button variant="default" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="products">
                        <TabsList className="flex-wrap h-auto">
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
                                data={productProfitData}
                                columns={[{key: 'product', header: 'Product'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.product, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="categories" className="mt-4">
                             <ReportTable<CategoryProfit> 
                                title="Profit by Categories"
                                data={categoryProfitData}
                                columns={[{key: 'category', header: 'Category'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.category, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="brands" className="mt-4">
                             <ReportTable<BrandProfit> 
                                title="Profit by Brands"
                                data={brandProfitData}
                                columns={[{key: 'brand', header: 'Brand'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.brand, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="locations" className="mt-4">
                             <ReportTable<LocationProfit> 
                                title="Profit by Locations"
                                data={locationProfitData}
                                columns={[{key: 'location', header: 'Location'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.location, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="invoice" className="mt-4">
                            <ReportTable<InvoiceProfit> 
                                title="Profit by Invoice"
                                data={invoiceProfitData}
                                columns={[
                                    {key: 'invoiceNo', header: 'Invoice No.'}, 
                                    {key: 'customer', header: 'Customer'}, 
                                    {key: 'profit', header: 'Gross Profit', isNumeric: true}
                                ]}
                                getPdfData={(d) => d.map(item => [item.invoiceNo, item.customer, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="date" className="mt-4">
                             <ReportTable<DateProfit> 
                                title="Profit by Date"
                                data={dateProfitData}
                                columns={[{key: 'date', header: 'Date'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.date, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="customer" className="mt-4">
                            <ReportTable<CustomerProfit> 
                                title="Profit by Customer"
                                data={customerProfitData}
                                columns={[{key: 'customer', header: 'Customer'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.customer, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="day" className="mt-4">
                            <ReportTable<DayProfit> 
                                title="Profit by Day"
                                data={dayProfitData}
                                columns={[{key: 'day', header: 'Day of the week'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.day, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="service-staff" className="mt-4">
                            <ReportTable<ServiceStaffProfit> 
                                title="Profit by Service Staff"
                                data={serviceStaffProfitData}
                                columns={[{key: 'staffName', header: 'Service Staff'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.staffName, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="agent" className="mt-4">
                            <ReportTable<AgentProfit> 
                                title="Profit by Agent"
                                data={agentProfitData}
                                columns={[{key: 'agentName', header: 'Agent'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.agentName, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="sub-agent" className="mt-4">
                             <ReportTable<SubAgentProfit> 
                                title="Profit by Sub-Agent"
                                data={subAgentProfitData}
                                columns={[{key: 'subAgentName', header: 'Sub-Agent'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.subAgentName, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                        <TabsContent value="company" className="mt-4">
                             <ReportTable<CompanyProfit> 
                                title="Profit by Company"
                                data={companyProfitData}
                                columns={[{key: 'company', header: 'Company'}, {key: 'profit', header: 'Gross Profit', isNumeric: true}]}
                                getPdfData={(d) => d.map(item => [item.company, `$${item.profit.toFixed(2)}`])}
                           />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
