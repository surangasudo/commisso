
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User as UserIcon, Phone, Mail, Banknote, Percent, Tag, ShoppingCart } from "lucide-react";
import { type CommissionProfile, type Sale, type DetailedProduct, type Commission } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCommissionProfile, getCommissionsForProfile } from '@/services/commissionService';
import { getSales } from '@/services/saleService';
import { getProducts } from '@/services/productService';

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
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { formatCurrency } = useCurrency();
    const { toast } = useToast();

    const [profile, setProfile] = useState<CommissionProfile | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof id !== 'string') return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [profileData, salesData, productsData, commissionsData] = await Promise.all([
                    getCommissionProfile(id),
                    getSales(),
                    getProducts(),
                    getCommissionsForProfile(id)
                ]);

                if (profileData) {
                    setProfile(profileData);
                    setSales(salesData);
                    setProducts(productsData);
                    setCommissions(commissionsData);
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

    const commissionableSales = useMemo(() => {
        if (!profile || !sales.length || !commissions.length) {
            return [];
        }

        const commissionsBySaleId = new Map<string, number>();
        commissions.forEach(commission => {
            const currentTotal = commissionsBySaleId.get(commission.transaction_id) || 0;
            commissionsBySaleId.set(commission.transaction_id, currentTotal + commission.commission_amount);
        });

        const salesWithCommission: CommissionableSale[] = [];
        commissionsBySaleId.forEach((commissionEarned, saleId) => {
            const sale = sales.find(s => s.id === saleId);
            if (sale) {
                salesWithCommission.push({
                    id: sale.id,
                    date: new Date(sale.date).toLocaleString(),
                    invoiceNo: sale.invoiceNo,
                    customerName: sale.customerName,
                    totalAmount: sale.totalAmount,
                    commissionEarned: commissionEarned,
                });
            }
        });
        
        return salesWithCommission.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [profile, sales, commissions]);
    
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
                    <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Commissionable Sales History</CardTitle>
                    <CardDescription>
                        A history of all sales this profile has received a commission for.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {commissionableSales.length > 0 ? (
                            commissionableSales.map(sale => (
                                <AccordionItem value={sale.id} key={sale.id}>
                                    <AccordionTrigger className="hover:bg-accent/50 px-4 py-2 rounded-md">
                                        <div className="grid grid-cols-5 gap-4 w-full text-sm text-left items-center">
                                            <span className="truncate">{sale.date}</span>
                                            <span className="font-mono">{sale.invoiceNo}</span>
                                            <span className="truncate">{sale.customerName}</span>
                                            <span className="text-right">{formatCurrency(sale.totalAmount)}</span>
                                            <span className="text-right font-semibold">{formatCurrency(sale.commissionEarned)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pl-8 pr-4 py-3 bg-muted/30">
                                            <h4 className="font-semibold text-xs mb-2 uppercase text-muted-foreground">Invoice Items:</h4>
                                             <ul>
                                               {sales.find(s => s.id === sale.id)?.items.map((item, index) => {
                                                   const product = products.find(p => p.id === item.productId);
                                                   return <li key={index} className="text-xs">{item.quantity} x {product?.name || 'Unknown'}</li>
                                               })}
                                           </ul>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))
                        ) : <div className="text-center py-10 text-muted-foreground">No sales data available for this profile.</div>}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
