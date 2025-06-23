'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar, ShoppingCart, Landmark, FileText, RefreshCw, Truck, AlertTriangle, Undo, Wallet, BarChart2 } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCurrency } from '@/hooks/use-currency';

const salesData = [
  { date: '24 May', sales: 1500 },
  { date: '25 May', sales: 1800 },
  { date: '26 May', sales: 1600 },
  { date: '27 May', sales: 2200 },
  { date: '28 May', sales: 2100 },
  { date: '29 May', sales: 2500 },
  { date: '30 May', sales: 2300 },
  { date: '31 May', sales: 2800 },
  { date: '1 Jun', sales: 3000 },
  { date: '2 Jun', sales: 3200 },
  { date: '3 Jun', sales: 3500 },
  { date: '4 Jun', sales: 3400 },
  { date: '5 Jun', sales: 3700 },
  { date: '6 Jun', sales: 4000 },
  { date: '7 Jun', sales: 4100 },
  { date: '8 Jun', sales: 4300 },
  { date: '9 Jun', sales: 4500 },
  { date: '10 Jun', sales: 4400 },
  { date: '11 Jun', sales: 4800 },
  { date: '12 Jun', sales: 5000 },
  { date: '13 Jun', sales: 5200 },
  { date: '14 Jun', sales: 5100 },
  { date: '15 Jun', sales: 5500 },
  { date: '16 Jun', sales: 5800 },
  { date: '17 Jun', sales: 5600 },
  { date: '18 Jun', sales: 6000 },
  { date: '19 Jun', sales: 6200 },
  { date: '20 Jun', sales: 8800 },
  { date: '21 Jun', sales: 2500 },
  { date: '22 Jun', sales: 3200 },
];

const chartConfig = {
  sales: {
    label: "Awesome Shop",
    color: "hsl(var(--chart-1))",
  },
};

const stats = [
    { title: 'Total Sales', value: 1162.50, icon: ShoppingCart, color: 'bg-sky-100 text-sky-600' },
    { title: 'Net', value: 1162.50, icon: Landmark, color: 'bg-green-100 text-green-600' },
    { title: 'Invoice due', value: 0.00, icon: FileText, color: 'bg-orange-100 text-orange-600' },
    { title: 'Total Sell Return', value: 0.00, icon: RefreshCw, color: 'bg-blue-100 text-blue-600' },
    { title: 'Total purchase', value: 235656.00, icon: Truck, color: 'bg-sky-100 text-sky-600' },
    { title: 'Purchase due', value: 235656.00, icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Total Purchase Return', value: 0.00, icon: Undo, color: 'bg-red-100 text-red-600' },
    { title: 'Expense', value: 0.00, icon: Wallet, color: 'bg-red-100 text-red-600' },
]

export default function DashboardPage() {
  const { formatCurrency } = useCurrency();

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
        {stats.map((stat, index) => (
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
        ))}
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Sales Last 30 Days</h2>
          </div>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                    tickFormatter={(value) => `${value/1000}K`}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={<ChartTooltipContent indicator="dot" />}
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
