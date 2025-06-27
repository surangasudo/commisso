
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar, ShoppingCart, Landmark, FileText, RefreshCw, Truck, AlertTriangle, Undo, Wallet, BarChart2 } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCurrency } from '@/hooks/use-currency';
import { getSales } from '@/services/saleService';
import { getPurchases } from '@/services/purchaseService';
import { getExpenses } from '@/services/expenseService';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays } from 'date-fns';
import { useSettings } from '@/hooks/use-settings';

export default function DashboardPage() {
  const { formatCurrency } = useCurrency();
  const { settings: businessSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Total Sales', value: 0, icon: ShoppingCart, color: 'bg-sky-100 text-sky-600' },
    { title: 'Net', value: 0, icon: Landmark, color: 'bg-green-100 text-green-600' },
    { title: 'Invoice due', value: 0, icon: FileText, color: 'bg-orange-100 text-orange-600' },
    { title: 'Total Sell Return', value: 0, icon: RefreshCw, color: 'bg-blue-100 text-blue-600' },
    { title: 'Total purchase', value: 0, icon: Truck, color: 'bg-sky-100 text-sky-600' },
    { title: 'Purchase due', value: 0, icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Total Purchase Return', value: 0, icon: Undo, color: 'bg-red-100 text-red-600' },
    { title: 'Expense', value: 0, icon: Wallet, color: 'bg-red-100 text-red-600' },
  ]);
  const [salesChartData, setSalesChartData] = useState<{ date: string; sales: number }[]>([]);
  
  const chartConfig = {
    sales: {
      label: businessSettings.business.businessName,
      color: "hsl(var(--chart-1))",
    },
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesData, purchasesData, expensesData] = await Promise.all([
          getSales(),
          getPurchases(),
          getExpenses(),
        ]);

        // Calculate stats
        const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalInvoiceDue = salesData.reduce((sum, sale) => sum + sale.sellDue, 0);
        const totalPurchases = purchasesData.reduce((sum, p) => sum + p.grandTotal, 0);
        const totalPurchaseDue = purchasesData.reduce((sum, p) => sum + p.paymentDue, 0);
        const totalExpenses = expensesData.reduce((sum, e) => sum + e.totalAmount, 0);
        
        // Assuming Net = Total Sales - Total Purchases - Total Expenses (simplified)
        const net = totalSales - totalPurchases - totalExpenses;

        setStats([
            { title: 'Total Sales', value: totalSales, icon: ShoppingCart, color: 'bg-sky-100 text-sky-600' },
            { title: 'Net', value: net, icon: Landmark, color: 'bg-green-100 text-green-600' },
            { title: 'Invoice due', value: totalInvoiceDue, icon: FileText, color: 'bg-orange-100 text-orange-600' },
            { title: 'Total Sell Return', value: 0, icon: RefreshCw, color: 'bg-blue-100 text-blue-600' }, // Mock
            { title: 'Total purchase', value: totalPurchases, icon: Truck, color: 'bg-sky-100 text-sky-600' },
            { title: 'Purchase due', value: totalPurchaseDue, icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
            { title: 'Total Purchase Return', value: 0, icon: Undo, color: 'bg-red-100 text-red-600' }, // Mock
            { title: 'Expense', value: totalExpenses, icon: Wallet, color: 'bg-red-100 text-red-600' },
        ]);

        // Calculate chart data for last 30 days
        const today = new Date();
        const salesByDay: { [key: string]: number } = {};
        for (let i = 29; i >= 0; i--) {
            const date = subDays(today, i);
            const formattedDate = format(date, 'd MMM');
            salesByDay[formattedDate] = 0;
        }

        salesData.forEach(sale => {
            const saleDate = new Date(sale.date);
            const thirtyDaysAgo = subDays(today, 30);
            if (saleDate >= thirtyDaysAgo) {
                const formattedDate = format(saleDate, 'd MMM');
                if (salesByDay[formattedDate] !== undefined) {
                    salesByDay[formattedDate] += sale.totalAmount;
                }
            }
        });

        const chartData = Object.entries(salesByDay).map(([date, sales]) => ({
            date,
            sales,
        }));
        setSalesChartData(chartData);


      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold">Welcome Admin, 👋</h1>
        <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span>Filter by date</span>
        </Button>
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
            <h2 className="text-lg font-semibold">Sales Last 30 Days</h2>
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
                    tickFormatter={(value) => value.replace(' ', '\n')}
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
