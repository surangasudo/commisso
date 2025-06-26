
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { ArrowLeft, User as UserIcon, Phone, Mail, Banknote, Percent, Tag, DollarSign, ShoppingCart } from "lucide-react";
import { type CommissionProfile, type Sale, type DetailedProduct } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCommissionProfile } from '@/services/commissionService';
import { getSales } from '@/services/saleService';
import { getProducts } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';

const DetailItem = ({ icon, label, value, children }: { icon: React.ElementType, label: string, value?: string | undefined, children?: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="bg-muted p-2 rounded-full">
            {React.createElement(icon, { className: "w-5 h-5 text-muted-foreground" })}
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {value && <p className="font-semibold">{value}</p>}
            {children}
        </div>
    </div>
);

type CommissionBreakdown = {
    category: string;
    totalSales: number;
    commissionEarned: number;
};

type CustomerContribution = {
    name: string;
    totalSpent: number;
};

type CommissionableSale = {
    id: string;
    date: string;
    invoiceNo: string;
    customerName: string;
    totalAmount: number;
    commissionEarned: number;
};

export default function ViewCommissionProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();

    const [profile, setProfile] = useState<CommissionProfile | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof id !== 'string') return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [profileData, salesData, productsData] = await Promise.all([
                    getCommissionProfile(id),
                    getSales(),
                    getProducts()
                ]);

                if (profileData) {
                    setProfile(profileData);
                    setSales(salesData);
                    setProducts(productsData);
                } else {
                    toast({ title: "Error", description: "Commission profile not found.", variant: "destructive" });
                    router.push('/admin/sales-commission-agents');
                }
            } catch (error) {
                console.error("Failed to fetch profile details:", error);
                toast({ title: "Error", description: "Failed to load profile data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, router, toast]);
    
    const { commissionBreakdown, customerContributions, commissionableSales, otherSalesData } = useMemo(() => {
        if (!profile || !sales.length || !products.length) {
            return { commissionBreakdown: [], customerContributions: [], commissionableSales: [], otherSalesData: null };
        }

        const productMap = new Map(products.map(p => [p.id, p]));
        const relevantSales = sales.filter(s => s.commissionAgentIds?.includes(profile.id));

        // Initialize categoryData with only categories from the profile
        const categoryData: { [key: string]: { totalSales: number; commissionEarned: number } } = {};
        profile.commission.categories?.forEach(c => {
            categoryData[c.category] = { totalSales: 0, commissionEarned: 0 };
        });

        const otherSalesSummary = { totalSales: 0, commissionEarned: 0 };
        const customerData: { [key: string]: { totalSpent: number } } = {};
        const commissionableSalesResult: CommissionableSale[] = [];

        for (const sale of relevantSales) {
            if (!customerData[sale.customerName]) {
                customerData[sale.customerName] = { totalSpent: 0 };
            }
            customerData[sale.customerName].totalSpent += sale.totalAmount;

            let commissionForThisSale = 0;
            for (const item of sale.items) {
                const product = productMap.get(item.productId);
                if (!product) continue;

                const itemValue = item.quantity * item.unitPrice;
                
                const category = product.category;
                const categoryRateData = profile.commission.categories?.find(c => c.category === category);

                if (categoryRateData) {
                    // This sale item falls into a specific commission category
                    const commissionAmount = itemValue * (categoryRateData.rate / 100);
                    categoryData[categoryRateData.category].totalSales += itemValue;
                    categoryData[categoryRateData.category].commissionEarned += commissionAmount;
                    commissionForThisSale += commissionAmount;
                } else {
                    // This sale item falls under the overall commission rate
                    const commissionAmount = itemValue * (profile.commission.overall / 100);
                    otherSalesSummary.totalSales += itemValue;
                    otherSalesSummary.commissionEarned += commissionAmount;
                    commissionForThisSale += commissionAmount;
                }
            }

            if (sale.items.length > 0 && sale.totalAmount > 0) {
                commissionableSalesResult.push({
                    id: sale.id,
                    date: new Date(sale.date).toLocaleString(),
                    invoiceNo: sale.invoiceNo,
                    customerName: sale.customerName,
                    totalAmount: sale.totalAmount,
                    commissionEarned: commissionForThisSale,
                });
            }
        }
        
        const commissionBreakdownResult: CommissionBreakdown[] = Object.entries(categoryData)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a,b) => b.commissionEarned - a.commissionEarned);

        const customerContributionsResult: CustomerContribution[] = Object.entries(customerData)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a,b) => b.totalSpent - a.totalSpent);


        return { 
            commissionBreakdown: commissionBreakdownResult, 
            customerContributions: customerContributionsResult, 
            commissionableSales: commissionableSalesResult.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            otherSalesData: otherSalesSummary 
        };
    }, [profile, sales, products]);
    
    if (isLoading || !profile) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                        <UserIcon className="w-8 h-8" />
                        <Skeleton className="h-9 w-72" />
                    </h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                        <CardDescription><Skeleton className="h-6 w-20" /></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <UserIcon className="w-8 h-8" />
                    View Commission Profile
                </h1>
                <Button variant="outline" onClick={() => router.push('/admin/sales-commission-agents')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile List
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>
                        <Badge variant="outline">{profile.entityType}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DetailItem icon={Phone} label="Phone Number" value={profile.phone} />
                        <DetailItem icon={Mail} label="Email" value={profile.email || 'N/A'} />
                        <DetailItem icon={Banknote} label="Bank Details" value={profile.bankDetails || 'N/A'} />
                    </div>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold mb-4">Commission Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DetailItem icon={Percent} label="Overall Commission Rate" value={`${profile.commission.overall}%`} />
                        {profile.commission.categories && profile.commission.categories.length > 0 && (
                             <DetailItem icon={Tag} label="Category-Specific Rates">
                                <div className="flex flex-col gap-1 mt-1">
                                    {profile.commission.categories.map(c => (
                                        <div key={c.category} className="flex justify-between gap-4">
                                            <span className="text-sm">{c.category}:</span>
                                            <span className="font-semibold">{c.rate}%</span>
                                        </div>
                                    ))}
                                </div>
                            </DetailItem>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5"/> Commission by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Total Sales</TableHead><TableHead className="text-right">Commission Earned</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {commissionBreakdown.length > 0 ? commissionBreakdown.map(item => (
                                    <TableRow key={item.category}>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.totalSales)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(item.commissionEarned)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-12">No sales with category-specific commissions.</TableCell>
                                    </TableRow>
                                )}
                                
                                {otherSalesData && otherSalesData.totalSales > 0 && (
                                     <TableRow>
                                        <TableCell>Other Sales (at {profile.commission.overall}% overall rate)</TableCell>
                                        <TableCell className="text-right">{formatCurrency(otherSalesData.totalSales)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(otherSalesData.commissionEarned)}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter><TableRow><TableCell colSpan={2} className="text-right font-bold">Total Commission Earned</TableCell><TableCell className="text-right font-bold">{formatCurrency(commissionBreakdown.reduce((acc, item) => acc + item.commissionEarned, 0) + (otherSalesData?.commissionEarned || 0))}</TableCell></TableRow></TableFooter>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserIcon className="w-5 h-5"/> Top Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Customer Name</TableHead><TableHead className="text-right">Total Spent</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {customerContributions.length > 0 ? customerContributions.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(item.totalSpent)}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={2} className="text-center h-24">No customer data available.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Commissionable Sales</CardTitle>
                    <CardDescription>
                        Individual sales that have generated commission for this profile.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Invoice No.</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Sale Amount</TableHead>
                                <TableHead className="text-right">Commission Earned</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commissionableSales.length > 0 ? commissionableSales.map(sale => (
                                <TableRow key={sale.id}>
                                    <TableCell>{sale.date}</TableCell>
                                    <TableCell>{sale.invoiceNo}</TableCell>
                                    <TableCell>{sale.customerName}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(sale.commissionEarned)}</TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={5} className="text-center h-24">No sales data available for this profile.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
