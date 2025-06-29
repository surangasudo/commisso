
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar as CalendarIcon, ShoppingCart, Landmark, FileText, RefreshCw, Truck, AlertTriangle, Undo, Wallet, BarChart2 } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCurrency } from '@/hooks/use-currency';
import { getSales, type Sale } from '@/services/saleService';
import { getPurchases, type Purchase } from '@/services/purchaseService';
import { getExpenses, type Expense } from '@/services/expenseService';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { useSettings } from '@/hooks/use-settings';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';


export default function DashboardPage() {
  const { formatCurrency } = useCurrency();
  const { settings: businessSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(true);

  // Raw data state
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

  // Filter state
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  // Fetch all data on component mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [salesData, purchasesData, expensesData] = await Promise.all([
          getSales(),
          getPurchases(),
          getExpenses(),
        ]);
        setAllSales(salesData);
        setAllPurchases(purchasesData);
        setAllExpenses(expensesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Memoized calculations based on filters
  const { stats, salesChartData } = useMemo(() => {
    const from = date?.from ? startOfDay(date.from) : undefined;
    const to = date?.to ? endOfDay(date.to) : undefined;

    const dateFilter = (item: { date: string }) => {
        if (!from || !to) return true;
        const itemDate = new Date(item.date);
        return itemDate >= from && itemDate <= to;
    };

    const filteredSales = allSales.filter(dateFilter);
    const filteredPurchases = allPurchases.filter(dateFilter);
    const filteredExpenses = allExpenses.filter(dateFilter);

    // Calculate stats
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalInvoiceDue = filteredSales.reduce((sum, sale) => sum + sale.sellDue, 0);
    const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.grandTotal, 0);
    const totalPurchaseDue = filteredPurchases.reduce((sum, p) => sum + p.paymentDue, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
    const net = totalSales - totalPurchases - totalExpenses;

    const calculatedStats = [
        { title: 'Total Sales', value: totalSales, icon: ShoppingCart, color: 'bg-sky-100 text-sky-600' },
        { title: 'Net', value: net, icon: Landmark, color: 'bg-green-100 text-green-600' },
        { title: 'Invoice due', value: totalInvoiceDue, icon: FileText, color: 'bg-orange-100 text-orange-600' },
        { title: 'Total Sell Return', value: 0, icon: RefreshCw, color: 'bg-blue-100 text-blue-600' },
        { title: 'Total purchase', value: totalPurchases, icon: Truck, color: 'bg-sky-100 text-sky-600' },
        { title: 'Purchase due', value: totalPurchaseDue, icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
        { title: 'Total Purchase Return', value: 0, icon: Undo, color: 'bg-red-100 text-red-600' },
        { title: 'Expense', value: totalExpenses, icon: Wallet, color: 'bg-red-100 text-red-600' },
    ];
    
    // Calculate chart data
    let chartData: { date: string; sales: number }[] = [];
    if (from && to) {
        const intervalDays = eachDayOfInterval({ start: from, end: to });
        const salesByDay: { [key: string]: number } = {};

        intervalDays.forEach(day => {
            const formattedDate = format(day, 'd MMM');
            salesByDay[formattedDate] = 0;
        });

        filteredSales.forEach(sale => {
            const formattedDate = format(new Date(sale.date), 'd MMM');
            if (salesByDay[formattedDate] !== undefined) {
                salesByDay[formattedDate] += sale.totalAmount;
            }
        });
        chartData = Object.entries(salesByDay).map(([date, sales]) => ({ date, sales }));
    }

    return { stats: calculatedStats, salesChartData: chartData };

  }, [allSales, allPurchases, allExpenses, date]);

  const chartConfig = {
    sales: {
      label: businessSettings.business.businessName,
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold">Welcome Admin, 👋</h1>
         <Popover>
            <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                        "w-[300px] justify-start text-left font-normal gap-2",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="h-4 w-4" />
                    {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
                 <Card key={index}>
                    <CardContent className="flex items-center justify-start gap-4 p-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-6 w-32" />
                        </div>
                    </CardContent>
                </Card>
            ))
        ) : (
            stats.map((stat, index) => (
                <Card key={index}>
                    <CardContent className="flex items-center justify-start gap-4 p-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <p className="text-xl font-bold">{formatCurrency(stat.value)}</p>
                        </div>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Sales For Selected Period</h2>
          </div>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => salesChartData.length > 40 ? '' : value.replace(' ', '\n')}
                    style={{
                        fontSize: '12px',
                        lineHeight: '16px',
                        textAlign: 'center'
                    }}
                />
                <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10} 
                    tickFormatter={(value) => value >= 1000 ? `${value/1000}K` : value}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={<ChartTooltipContent indicator="dot" formatter={(value) => formatCurrency(value as number)} />}
                />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="var(--color-sales)" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'var(--color-sales)' }}
                    activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
