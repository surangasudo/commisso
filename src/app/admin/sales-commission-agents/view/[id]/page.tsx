
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


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
    
    const { commissionableSales } = useMemo(() => {
        if (!profile || !sales.length || !products.length) {
            return { commissionableSales: [] };
        }

        const productMap = new Map(products.map(p => [p.id, p]));
        const relevantSales = sales.filter(s => s.commissionAgentIds?.includes(profile.id));

        const commissionableSalesResult: CommissionableSale[] = [];

        for (const sale of relevantSales) {
            let commissionForThisSale = 0;
            for (const item of sale.items) {
                const product = productMap.get(item.productId);
                if (!product) continue;

                const itemValue = item.quantity * item.unitPrice;
                
                const category = product.category;
                const categoryRateData = profile.commission.categories?.find(c => c.category === category);

                if (categoryRateData) {
                    const commissionAmount = itemValue * (categoryRateData.rate / 100);
                    commissionForThisSale += commissionAmount;
                } else {
                    const commissionAmount = itemValue * (profile.commission.overall / 100);
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

        return { 
            commissionableSales: commissionableSalesResult.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
    }, [profile, sales, products]);
    
    const totalCommissionEarned = useMemo(() => {
        return commissionableSales.reduce((acc, sale) => acc + sale.commissionEarned, 0);
    }, [commissionableSales]);

    if (isLoading || !profile) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                        <UserIcon className="w-8 h-8" />
                        <Skeleton className="h-9 w-72" />
                    </h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commission Earned</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalCommissionEarned)}</div>
                        <p className="text-xs text-muted-foreground">All-time earnings from all sales</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commission Paid</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(profile.totalCommissionPaid || 0)}</div>
                        <p className="text-xs text-muted-foreground">All-time payouts recorded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(profile.totalCommissionPending || 0)}</div>
                        <p className="text-xs text-muted-foreground">Current outstanding balance</p>
                    </CardContent>
                </Card>
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
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Commissionable Sales</CardTitle>
                    <CardDescription>
                        Click on a sale to see the items in the invoice.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-4 w-full text-sm font-semibold px-4 pb-2 border-b">
                        <span className="col-span-1">Date</span>
                        <span className="col-span-1">Invoice No.</span>
                        <span className="col-span-1">Customer</span>
                        <span className="text-right">Sale Amount</span>
                        <span className="text-right">Commission Earned</span>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        {commissionableSales.length > 0 ? (
                            commissionableSales.map(sale => {
                                const fullSale = sales.find(s => s.id === sale.id);
                                const saleItems = fullSale?.items || [];

                                return (
                                    <AccordionItem value={sale.id} key={sale.id} className="border-b">
                                        <AccordionTrigger className="hover:bg-accent/50 px-4 py-2 rounded-md [&[data-state=open]]:bg-accent/50">
                                            <div className="grid grid-cols-5 gap-4 w-full text-sm text-left">
                                                <span className="truncate col-span-1">{sale.date}</span>
                                                <span className="font-mono col-span-1">{sale.invoiceNo}</span>
                                                <span className="truncate col-span-1">{sale.customerName}</span>
                                                <span className="text-right">{formatCurrency(sale.totalAmount)}</span>
                                                <span className="text-right font-semibold">{formatCurrency(sale.commissionEarned)}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pl-8 pr-4 py-3 bg-muted/30">
                                                <h4 className="font-semibold text-xs mb-2 uppercase text-muted-foreground">Invoice Items:</h4>
                                                <ul className="space-y-1 text-sm">
                                                    {saleItems.map((item, index) => {
                                                        const product = products.find(p => p.id === item.productId);
                                                        return (
                                                            <li key={index} className="flex justify-between items-center">
                                                                <span className="text-muted-foreground">{item.quantity} x {product?.name || 'Unknown'}</span>
                                                                <span className="text-muted-foreground">@{formatCurrency(item.unitPrice)}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })
                        ) : <div className="text-center py-10 text-muted-foreground">No sales data available for this profile.</div>}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}

