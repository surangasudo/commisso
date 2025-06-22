'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Printer, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const profitData = {
  openingStockPurchase: 0.00,
  openingStockSale: 0.00,
  totalPurchase: 386936.00,
  totalStockAdjustment: 0.00,
  totalExpense: 0.00,
  totalPurchaseShipping: 0.00,
  purchaseAdditionalExpense: 0.00,
  totalTransferShipping: 0.00,
  totalSellDiscount: 0.00,
  totalCustomerReward: 0.00,
  totalSellReturn: 0.00,
  totalPayroll: 0.00,
  totalProductionCost: 0.00,
  closingStockPurchase: 386936.00,
  closingStockSale: 471020.00,
  totalSales: 9687.50,
  totalSellShipping: 0.00,
  sellAdditionalExpenses: 0.00,
  totalStockRecovered: 0.00,
  totalPurchaseReturn: 0.00,
  totalPurchaseDiscount: 0.00,
  totalSellRoundOff: 0.00,
  hmsTotal: 0.00,
};

const productProfitData = [
    { product: 'Barilla Pasta (AS0028)', profit: 0.00 },
    { product: 'Butter Cookies (AS0027)', profit: 0.00 },
    { product: "Levi's Men's Slimmy Fit Jeans - Waist Size - 28 (AS0002-1)", profit: 0.00 },
    { product: "Levi's Men's Slimmy Fit Jeans - Waist Size 30 (AS0002-2)", profit: 0.00 },
    { product: 'Pair Of Dumbbells (AS0021)', profit: 0.00 },
];

const ReportItem = ({ label, value, note }: { label: string; value: string; note?: string }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <div>
            <p className="font-medium text-sm">{label}</p>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
        <p className="font-semibold text-sm">{value}</p>
    </div>
);

export default function ProfitLossReportPage() {
    const [date, setDate] = useState<DateRange | undefined>({
      from: new Date(2025, 0, 20),
      to: addDays(new Date(2025, 0, 20), 20),
    })

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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[260px] justify-start text-left font-normal",
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
                        <Button variant="default"><Printer className="mr-2 h-4 w-4" /> Print</Button>
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
                        </TabsList>
                        <TabsContent value="products" className="mt-4">
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
                                     <Button variant="outline" size="sm">Export CSV</Button>
                                     <Button variant="outline" size="sm">Export Excel</Button>
                                     <Button variant="outline" size="sm">Print</Button>
                                     <Button variant="outline" size="sm">Column visibility</Button>
                                     <Button variant="outline" size="sm">Export PDF</Button>
                                </div>
                                <div>
                                    <Input placeholder="Search..." />
                                </div>
                            </div>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Gross Profit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productProfitData.map(item => (
                                        <TableRow key={item.product}>
                                            <TableCell>{item.product}</TableCell>
                                            <TableCell className="text-right">${item.profit.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                                <span>Showing 1 to 5 of 5 entries</span>
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm">Previous</Button>
                                    <Button variant="default" size="sm" className="w-8 h-8 p-0">1</Button>
                                    <Button variant="outline" size="sm">Next</Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
