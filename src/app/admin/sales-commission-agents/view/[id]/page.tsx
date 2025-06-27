
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User as UserIcon, Phone, Mail, Banknote, Percent, Tag, ShoppingCart, CheckCircle, Clock } from "lucide-react";
import { type CommissionProfile, type Sale, type DetailedProduct } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCommissionProfile } from '@/services/commissionService';
import { getSales } from '@/services/saleService';
import { getProducts } from '@/services/productService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
    paymentStatus: 'Paid' | 'Pending';
};


export default function ViewCommissionProfilePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { formatCurrency } = useCurrency();
    const { toast } = useToast();

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
                    getProducts(),
                ]);

                if (profileData) {
                    setProfile(profileData);
                    setSales(salesData);
                    setProducts(productsData);
                } else {
                     toast({
                        title: "Error",
                        description: "Commission profile not found.",
                        variant: "destructive"
                    });
                    router.push('/admin/sales-commission-agents');
                }
            } catch (error) {
                console.error("Failed to fetch commission profile details:", error);
                 toast({
                    title: "Error",
                    description: "Could not load profile details.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router, toast]);

    const { commissionableSales, totalCommissionEarned } = useMemo(() => {
        if (!profile || !sales.length || !products.length) {
            return { commissionableSales: [], totalCommissionEarned: 0 };
        }

        const productMap = new Map(products.map(p => [p.id, p]));
        const relevantSales = sales.filter(s => s.commissionAgentIds?.includes(profile.id));

        // Sort sales from oldest to newest to apply payments correctly
        const sortedSales = [...relevantSales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let calculatedTotalCommission = 0;
        const salesWithCommission: Omit<CommissionableSale, 'paymentStatus'>[] = [];
        
        // First, calculate commission for each sale
        for (const sale of sortedSales) {
            let commissionForThisSale = 0;
            for (const item of sale.items) {
                const product = productMap.get(item.productId);
                if (!product) continue;
                
                const saleValue = item.unitPrice * item.quantity;
                const rate = profile.commission.categories?.find(c => c.category === product.category)?.rate ?? profile.commission.overall;
                commissionForThisSale += saleValue * (rate / 100);
            }
            calculatedTotalCommission += commissionForThisSale;

            if (sale.items.length > 0 && sale.totalAmount > 0) {
                 salesWithCommission.push({
                    id: sale.id,
                    date: new Date(sale.date).toLocaleString(),
                    invoiceNo: sale.invoiceNo,
                    customerName: sale.customerName,
                    totalAmount: sale.totalAmount,
                    commissionEarned: commissionForThisSale,
                });
            }
        }
        
        // Second, determine payment status using FIFO logic
        let paidAmountRemaining = profile.totalCommissionPaid || 0;
        const salesWithStatus: CommissionableSale[] = [];

        for (const sale of salesWithCommission) {
            let paymentStatus: 'Paid' | 'Pending' = 'Pending';
            // Check if there's any paid amount left to apply
            if (paidAmountRemaining > 0) {
                // If the remaining paid amount covers this sale's commission fully
                if (paidAmountRemaining >= sale.commissionEarned) {
                    paymentStatus = 'Paid';
                    // Reduce the paid amount by what was just "used"
                    paidAmountRemaining -= sale.commissionEarned;
                } else {
                    // If it doesn't cover it fully, this one is pending, and all subsequent ones will be too.
                    // Set remaining to 0 to ensure all future sales are marked pending.
                    paidAmountRemaining = 0;
                }
            }
            salesWithStatus.push({ ...sale, paymentStatus });
        }
        
        // Reverse the array to show newest sales first in the UI
        return { 
            commissionableSales: salesWithStatus.reverse(),
            totalCommissionEarned: calculatedTotalCommission
        };
    }, [profile, sales, products]);
    
    // Use the live total from the profile for the summary card, ensuring consistency.
    const pendingAmount = (profile?.totalCommissionEarned || 0) - (profile?.totalCommissionPaid || 0);
    
    if (isLoading || !profile) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                        <UserIcon className="w-8 h-8" />
                        <Skeleton className="h-9 w-72" />
                    </h1>
                </div>
                <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <TooltipProvider>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{profile.name}</CardTitle>
                            <CardDescription>
                                <Badge variant="outline">{profile.entityType}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <DetailItem icon={Phone} label="Phone Number" value={profile.phone} />
                                <DetailItem icon={Mail} label="Email" value={profile.email || 'N/A'} />
                                <DetailItem icon={Banknote} label="Bank Details" value={profile.bankDetails || 'N/A'} />
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
                            <CardTitle>Commission Summary</CardTitle>
                            <CardDescription>A summary of the agent's commission status.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Commission Earned</span>
                                <span className="font-semibold">{formatCurrency(profile.totalCommissionEarned || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">(-) Total Commission Paid</span>
                                <span className="font-semibold">({formatCurrency(profile.totalCommissionPaid || 0)})</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Pending Commission</span>
                                <span className="text-red-600">{formatCurrency(pendingAmount)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="text-xs text-muted-foreground">
                                The pending amount is calculated based on total earned commission minus total paid commission.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Commissionable Sales</CardTitle>
                        <CardDescription>
                            Click on a sale to see the items and commission breakdown for that invoice. Commission is calculated on the invoice value of each item.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-6 gap-4 w-full text-sm font-semibold px-4 pb-2 border-b">
                            <span className="col-span-1">Date</span>
                            <span className="col-span-1">Invoice No.</span>
                            <span className="col-span-1">Customer</span>
                            <span className="text-right">Sale Amount</span>
                            <span className="text-right">Commission Earned</span>
                            <span className="text-right">Status</span>
                        </div>
                        <Accordion type="single" collapsible className="w-full" defaultValue={commissionableSales[0]?.id}>
                            {commissionableSales.length > 0 ? (
                                commissionableSales.map(sale => {
                                    const fullSale = sales.find(s => s.id === sale.id);
                                    const saleItems = fullSale?.items || [];

                                    return (
                                        <AccordionItem value={sale.id} key={sale.id} className="border-b">
                                            <AccordionTrigger className="hover:bg-accent/50 px-4 py-2 rounded-md [&[data-state=open]]:bg-accent/50">
                                                <div className="grid grid-cols-6 gap-4 w-full text-sm text-left items-center">
                                                    <span className="truncate col-span-1">{sale.date}</span>
                                                    <span className="font-mono col-span-1">{sale.invoiceNo}</span>
                                                    <span className="truncate col-span-1">{sale.customerName}</span>
                                                    <span className="text-right">{formatCurrency(sale.totalAmount)}</span>
                                                    <span className="text-right font-semibold">{formatCurrency(sale.commissionEarned)}</span>
                                                    <span className="text-right">
                                                        <Badge variant="outline" className={cn("capitalize",
                                                            sale.paymentStatus === 'Paid' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        )}>
                                                            {sale.paymentStatus === 'Paid' 
                                                                ? <CheckCircle className="mr-1 h-3 w-3"/> 
                                                                : <Clock className="mr-1 h-3 w-3"/>
                                                            }
                                                            {sale.paymentStatus}
                                                        </Badge>
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="pl-8 pr-4 py-3 bg-muted/30">
                                                    <h4 className="font-semibold text-xs mb-2 uppercase text-muted-foreground">Invoice Items & Commission Breakdown:</h4>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Product</TableHead>
                                                                <TableHead className="text-right">Item Subtotal</TableHead>
                                                                <TableHead className="text-right">Commission Rate</TableHead>
                                                                <TableHead className="text-right">Commission Earned</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {saleItems.map((item, index) => {
                                                                const product = products.find(p => p.id === item.productId);
                                                                if (!product) return null;

                                                                const itemSubtotal = item.unitPrice * item.quantity;
                                                                const category = product.category;
                                                                const categoryRateData = profile.commission.categories?.find(c => c.category === category);
                                                                const commissionRate = categoryRateData ? categoryRateData.rate : profile.commission.overall;
                                                                const commissionEarnedForItem = itemSubtotal * (commissionRate / 100);
                                                                
                                                                const tooltipText = `Calculation: ${formatCurrency(itemSubtotal)} x ${commissionRate}%`;
                                                                
                                                                return (
                                                                    <TableRow key={index} className="text-xs">
                                                                        <TableCell>{item.quantity} x {product.name}</TableCell>
                                                                        <TableCell className="text-right">{formatCurrency(itemSubtotal)}</TableCell>
                                                                        <TableCell className="text-right">{commissionRate}%</TableCell>
                                                                        <TableCell className="text-right font-medium">
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span className="cursor-help border-b border-dashed border-muted-foreground">{formatCurrency(commissionEarnedForItem)}</span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>{tooltipText}</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
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
        </TooltipProvider>
    );
}
