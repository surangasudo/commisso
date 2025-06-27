
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Printer, Search, Pencil, Trash2, Eye, Plus, Wallet, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type CommissionProfile, type DetailedProduct } from '@/lib/data';
import { exportToCsv } from '@/lib/export';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteCommissionProfile, payCommission, getCommissionProfiles } from '@/services/commissionService';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/use-currency';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { getSales, type Sale } from '@/services/saleService';
import { getProducts } from '@/services/productService';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";

type PendingSale = {
    id: string;
    date: string;
    invoiceNo: string;
    totalAmount: number;
    commissionEarned: number;
};

const CommissionPayoutDialog = ({ 
    profile, 
    open, 
    onOpenChange, 
    onPaymentComplete
}: { 
    profile: CommissionProfile | null, 
    open: boolean, 
    onOpenChange: (open: boolean) => void,
    onPaymentComplete: (profileId: string, result: { paymentRecorded: boolean; smsSent: boolean; error?: string; }) => void
}) => {
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const settings = useBusinessSettings();
    
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [allProducts, setAllProducts] = useState<DetailedProduct[]>([]);
    const [allProfiles, setAllProfiles] = useState<CommissionProfile[]>([]);
    const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
    const [selectedSaleIds, setSelectedSaleIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    
    const [method, setMethod] = useState('');
    const [note, setNote] = useState('');
    const [isPaying, setIsPaying] = useState(false);

    const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

    useEffect(() => {
        const calculatePendingCommissions = async () => {
            if (!profile) return;
            setIsLoading(true);

            try {
                const [salesData, productsData, profilesData] = await Promise.all([getSales(), getProducts(), getCommissionProfiles()]);
                setAllSales(salesData);
                setAllProducts(productsData);
                setAllProfiles(profilesData);

                const productMap = new Map(productsData.map(p => [p.id, p]));
                const agentSales = salesData.filter(s => s.commissionAgentIds?.includes(profile.id));
                const sortedSales = [...agentSales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                let paidAmountCounter = round(profile.totalCommissionPaid || 0);
                const salesResult: PendingSale[] = [];
                
                for (const sale of sortedSales) {
                    let commissionForThisSale = 0;
                    for (const item of sale.items) {
                        const product = productMap.get(item.productId);
                        if (!product) continue;
                        
                        const saleValue = item.unitPrice * item.quantity;
                        const hasCategoryRates = profile.commission.categories && profile.commission.categories.length > 0;
                        let rate = 0;

                        if (hasCategoryRates) {
                            rate = profile.commission.categories?.find(c => c.category === product.category)?.rate || 0;
                        } else {
                            rate = profile.commission.overall;
                        }

                        commissionForThisSale += saleValue * (rate / 100);
                    }
                    
                    const roundedCommission = round(commissionForThisSale);

                    if (roundedCommission > 0) {
                        if (paidAmountCounter >= roundedCommission) {
                            // This commission is fully paid
                            paidAmountCounter = round(paidAmountCounter - roundedCommission);
                        } else {
                            // This commission is pending (or partially paid, but we treat it as fully pending for simplicity in selection)
                            salesResult.push({
                                id: sale.id,
                                date: new Date(sale.date).toLocaleDateString(),
                                invoiceNo: sale.invoiceNo,
                                totalAmount: sale.totalAmount,
                                commissionEarned: roundedCommission
                            });
                        }
                    }
                }
                
                setPendingSales(salesResult.reverse()); // Show newest pending first

            } catch (e) {
                console.error("Failed to calculate pending commissions", e);
                toast({ title: 'Error', description: 'Could not load pending commissions.', variant: 'destructive'});
            } finally {
                setIsLoading(false);
            }
        };

        if (open && profile) {
            calculatePendingCommissions();
            setSelectedSaleIds(new Set());
            setMethod(profile.entityType === 'Company' ? 'cheque' : 'cash');
            setNote('');
        }
    }, [open, profile, toast]);

    const totalToPay = useMemo(() => {
        const total = pendingSales
            .filter(sale => selectedSaleIds.has(sale.id))
            .reduce((sum, sale) => sum + sale.commissionEarned, 0);
        return round(total);
    }, [selectedSaleIds, pendingSales]);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedSaleIds(new Set(pendingSales.map(s => s.id)));
        } else {
            setSelectedSaleIds(new Set());
        }
    }

    const handleSelectOne = (saleId: string, checked: boolean) => {
        const newSet = new Set(selectedSaleIds);
        if (checked) {
            newSet.add(saleId);
        } else {
            newSet.delete(saleId);
        }
        setSelectedSaleIds(newSet);
    }

    const handleConfirmPayment = async () => {
        if (!profile || totalToPay <= 0) {
             toast({ title: 'Error', description: 'No commissions selected for payment.', variant: 'destructive' });
             return;
        }
        setIsPaying(true);

        try {
            const businessName = settings.business.businessName;
            const businessPhone = "555-123-4567"; 

            const productMap = new Map(allProducts.map(p => [p.id, p]));
            const categoryBreakdown: Record<string, { totalSale: number; commission: number }> = {};

            const selectedSales = allSales.filter(s => selectedSaleIds.has(s.id));

            for (const sale of selectedSales) {
                for (const item of sale.items) {
                    const product = productMap.get(item.productId);
                    if (!product || !product.category) continue;
                    
                    if (!categoryBreakdown[product.category]) {
                        categoryBreakdown[product.category] = { totalSale: 0, commission: 0 };
                    }
                    
                    const saleValue = item.unitPrice * item.quantity;

                    const hasCategoryRates = profile.commission.categories && profile.commission.categories.length > 0;
                    let rate = 0;
                    if (hasCategoryRates) {
                        rate = profile.commission.categories?.find(c => c.category === product.category)?.rate || 0;
                    } else {
                        rate = profile.commission.overall;
                    }

                    const commissionValue = saleValue * (rate / 100);

                    categoryBreakdown[product.category].totalSale += saleValue;
                    categoryBreakdown[product.category].commission += commissionValue;
                }
            }
            
            let smsMessage = '';
            if (profile.entityType === 'Sub-Agent') {
                const salesBreakdownString = Object.entries(categoryBreakdown)
                    .map(([category, data]) => `${category} ${formatCurrency(data.totalSale)}`)
                    .join(', ');
                
                let agentName = 'an agent';
                const firstSelectedSaleId = Array.from(selectedSaleIds)[0];
                const firstSale = allSales.find(s => s.id === firstSelectedSaleId);
                
                if (firstSale && firstSale.commissionAgentIds) {
                    const agentId = firstSale.commissionAgentIds.find(id => {
                        const agentProfile = allProfiles.find(p => p.id === id);
                        return agentProfile?.entityType === 'Agent';
                    });
                    if (agentId) {
                        const agentProfile = allProfiles.find(p => p.id === agentId);
                        if (agentProfile) {
                            agentName = agentProfile.name;
                        }
                    }
                }
                
                smsMessage = `Thank you for sending ${agentName}. Your total sales: ${salesBreakdownString}. Your total earnings: ${formatCurrency(totalToPay)}. For inquiries, call: ${businessPhone}`;

            } else {
                const breakdownString = Object.entries(categoryBreakdown)
                    .map(([category, data]) => `${category} ${formatCurrency(data.totalSale)}, com:${formatCurrency(data.commission)}`)
                    .join(', ');
                
                smsMessage = `Thank you for visiting ${businessName}. Your total sale ${breakdownString}. Total earnings: ${formatCurrency(totalToPay)}. Inquiry: ${businessPhone}`;
            }

            const result = await payCommission(profile, totalToPay, method, note, smsMessage);
            onPaymentComplete(profile.id, result);
        } catch (error: any) {
            toast({
                title: 'Payment Failed',
                description: `The payment transaction failed: ${error.message}`,
                variant: 'destructive'
            });
            console.error(error);
        } finally {
            setIsPaying(false);
        }
    };
    
    if (!profile) return null;

    const pendingAmount = round((profile.totalCommissionEarned || 0) - (profile.totalCommissionPaid || 0));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Pay Commission to {profile.name}</DialogTitle>
                    <DialogDescription>
                        Select invoices to pay. Total pending: <span className="font-bold">{formatCurrency(pendingAmount)}</span>
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64"><p>Loading pending commissions...</p></div>
                ) : pendingSales.length > 0 ? (
                    <div className="space-y-4 py-4">
                        <ScrollArea className="h-64 border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedSaleIds.size > 0 && selectedSaleIds.size === pendingSales.length}
                                                onCheckedChange={handleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Invoice No.</TableHead>
                                        <TableHead className="text-right">Commission Earned</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingSales.map(sale => (
                                        <TableRow key={sale.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedSaleIds.has(sale.id)}
                                                    onCheckedChange={(checked) => handleSelectOne(sale.id, !!checked)}
                                                    aria-label={`Select invoice ${sale.invoiceNo}`}
                                                />
                                            </TableCell>
                                            <TableCell>{sale.date}</TableCell>
                                            <TableCell>{sale.invoiceNo}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(sale.commissionEarned)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>

                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="pay-method">Payment Method *</Label>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger id="pay-method"><SelectValue placeholder="Select a method" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Label htmlFor="pay-note" className="mt-4 block">Payment Note</Label>
                                <Textarea id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} />
                            </div>
                            <div className="text-right space-y-2">
                                 <p className="text-sm text-muted-foreground">Total Selected for Payment</p>
                                 <p className="text-3xl font-bold">{formatCurrency(totalToPay)}</p>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32"><p>No pending commissions to pay.</p></div>
                )}
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirmPayment} disabled={isPaying || totalToPay <= 0}>
                        {isPaying ? 'Processing...' : `Pay Selected (${selectedSaleIds.size})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const PayoutsTable = ({ 
    profiles, 
    smsStatuses,
    handlePayClick, 
    handleView, 
    isLoading, 
    formatCurrency 
}: { 
    profiles: CommissionProfile[], 
    smsStatuses: Record<string, 'success' | 'failed'>,
    handlePayClick: (profile: CommissionProfile) => void, 
    handleView: (id: string) => void, 
    isLoading: boolean, 
    formatCurrency: (val: number) => string 
}) => {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead className="text-right">Total Commission (Pending)</TableHead>
                        <TableHead className="text-right">Total Commission (Paid)</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({length: 3}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                <TableCell><Skeleton className="h-6 w-24"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-28 ml-auto"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-28 ml-auto"/></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto"/></TableCell>
                            </TableRow>
                        ))
                    ) : profiles.length > 0 ? profiles.map(profile => {
                        const pendingAmount = (profile.totalCommissionEarned || 0) - (profile.totalCommissionPaid || 0);
                        const lastSmsStatus = smsStatuses[profile.id];

                        return (
                            <TableRow key={profile.id}>
                                <TableCell className="font-medium">{profile.name}</TableCell>
                                <TableCell><Badge variant="outline">{profile.entityType}</Badge></TableCell>
                                <TableCell className="text-right font-semibold text-red-600">{formatCurrency(pendingAmount)}</TableCell>
                                <TableCell className="text-right font-semibold text-green-600">{formatCurrency(profile.totalCommissionPaid || 0)}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="h-8 gap-1.5"
                                          onClick={() => handleView(profile.id)}
                                        >
                                            <Eye className="w-4 h-4"/> View
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          className="h-8 gap-1.5"
                                          disabled={pendingAmount <= 0}
                                          onClick={() => handlePayClick(profile)}
                                        >
                                            <Wallet className="w-4 h-4"/> Pay
                                        </Button>
                                        {lastSmsStatus && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    {lastSmsStatus === 'success' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Last payment attempt SMS: {lastSmsStatus}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    }) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No commission profiles found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};


export default function SalesCommissionAgentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const settings = useBusinessSettings();
  const [profiles, setProfiles] = useState<CommissionProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<CommissionProfile | null>(null);

  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [profileToPay, setProfileToPay] = useState<CommissionProfile | null>(null);

  const [profileFilter, setProfileFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [smsStatuses, setSmsStatuses] = useState<Record<string, 'success' | 'failed'>>({});

  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedSubAgent, setSelectedSubAgent] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedSalesperson, setSelectedSalesperson] = useState('all');


  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const profilesData = await getCommissionProfiles();
            setProfiles(profilesData);
        } catch (error) {
            console.error("Error fetching commission profiles:", error);
            toast({ title: 'Error', description: 'Could not load commission profiles.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [toast]);
  
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
        const filterMatch = profileFilter === 'All' || p.entityType === profileFilter;
        const searchMatch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm);
        return filterMatch && searchMatch;
    });
  }, [profiles, profileFilter, searchTerm]);

  const salespersons = useMemo(() => profiles.filter(p => p.entityType === 'Salesperson'), [profiles]);
  const agents = useMemo(() => profiles.filter(p => p.entityType === 'Agent'), [profiles]);
  const subAgents = useMemo(() => profiles.filter(p => p.entityType === 'Sub-Agent'), [profiles]);
  const companies = useMemo(() => profiles.filter(p => p.entityType === 'Company'), [profiles]);
  
  const salespersonData = useMemo(() => {
    let data = profiles.filter(p => p.entityType === 'Salesperson');
    if (selectedSalesperson !== 'all') {
        data = data.filter(p => p.id === selectedSalesperson);
    }
    return data;
  }, [profiles, selectedSalesperson]);

  const agentData = useMemo(() => {
    let data = profiles.filter(p => p.entityType === 'Agent');
    if (selectedAgent !== 'all') {
        data = data.filter(p => p.id === selectedAgent);
    }
    return data;
  }, [profiles, selectedAgent]);

  const subAgentData = useMemo(() => {
    let data = profiles.filter(p => p.entityType === 'Sub-Agent');
    if (selectedSubAgent !== 'all') {
        data = data.filter(p => p.id === selectedSubAgent);
    }
    return data;
  }, [profiles, selectedSubAgent]);

  const companyData = useMemo(() => {
    let data = profiles.filter(p => p.entityType === 'Company');
    if (selectedCompany !== 'all') {
        data = data.filter(p => p.id === selectedCompany);
    }
    return data;
  }, [profiles, selectedCompany]);


  const handleEdit = (profileId: string) => {
    router.push(`/admin/sales-commission-agents/edit/${profileId}`);
  };

  const handleView = (profileId: string) => {
    router.push(`/admin/sales-commission-agents/view/${profileId}`);
  };

  const handleDeleteClick = (profile: CommissionProfile) => {
    setProfileToDelete(profile);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (profileToDelete) {
      try {
        await deleteCommissionProfile(profileToDelete.id);
        toast({ title: 'Success', description: `Profile for ${profileToDelete.name} deleted.` });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete profile.', variant: 'destructive' });
        console.error("Failed to delete profile:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setProfileToDelete(null);
      }
    }
  };

  const handlePayClick = (profile: CommissionProfile) => {
    setProfileToPay(profile);
    setIsPayDialogOpen(true);
  };
  
  const handlePaymentComplete = (profileId: string, result: { paymentRecorded: boolean; smsSent: boolean; error?: string }) => {
    setSmsStatuses(prev => ({
        ...prev,
        [profileId]: result.smsSent ? 'success' : 'failed'
    }));

    if (result.smsSent) {
        toast({ title: 'Success', description: 'Payment recorded and SMS sent.' });
    } else {
        toast({
            title: 'Payment Recorded, SMS Failed',
            description: result.error || 'An unknown error occurred sending the SMS.',
            variant: 'destructive',
            duration: 9000,
        });
    }

    setIsPayDialogOpen(false);
    setProfileToPay(null);
  };

  const getExportData = () => filteredProfiles.map(p => ({
    name: p.name,
    entityType: p.entityType,
    phone: p.phone,
    bankDetails: p.bankDetails || 'N/A',
    overallCommission: `${p.commission.overall}%`,
    categoryCommissions: p.commission.categories?.map(c => `${c.category}: ${c.rate}%`).join('; ') || 'N/A'
  }));
  
  const handleExport = () => exportToCsv(getExportData(), 'commission-profiles');
  const handlePrint = () => window.print();

  return (
    <>
    <TooltipProvider>
      <Tabs defaultValue="profiles" className="space-y-4">
        <div className="printable-area">
            <TabsList className="print-hidden">
                <TabsTrigger value="profiles">Commission Profiles</TabsTrigger>
                {settings.modules.advancedCommission ? (
                    <>
                        <TabsTrigger value="salespersons">Salespersons</TabsTrigger>
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                        <TabsTrigger value="sub_agents">Sub-Agents</TabsTrigger>
                        <TabsTrigger value="companies">Companies</TabsTrigger>
                    </>
                ) : (
                    <TabsTrigger value="payouts">Commission Payouts</TabsTrigger>
                )}
            </TabsList>
            <TabsContent value="profiles">
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <CardTitle>Commission Profiles</CardTitle>
                    <div className="flex flex-col items-end gap-2 print-hidden">
                    <Link href="/admin/sales-commission-agents/add">
                        <Button>Add Profile</Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export</Button>
                        <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                    </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4 print-hidden">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="profile-filter" className="text-sm">Filter by Type:</Label>
                            <Select value={profileFilter} onValueChange={setProfileFilter}>
                                <SelectTrigger id="profile-filter" className="w-[180px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Types</SelectItem>
                                    <SelectItem value="Agent">Agent</SelectItem>
                                    <SelectItem value="Sub-Agent">Sub-Agent</SelectItem>
                                    <SelectItem value="Company">Company</SelectItem>
                                    <SelectItem value="Salesperson">Salesperson</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative sm:max-w-xs w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search profiles..." className="pl-8 w-full h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Entity Type</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Bank Details</TableHead>
                            <TableHead>Commission Rate</TableHead>
                            <TableHead className="print-hidden">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell className="print-hidden"><Skeleton className="h-8 w-48" /></TableCell>
                            </TableRow>
                            ))
                        ) : filteredProfiles.map((profile) => (
                            <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.name}</TableCell>
                            <TableCell><Badge variant="outline">{profile.entityType}</Badge></TableCell>
                            <TableCell>{profile.phone}</TableCell>
                            <TableCell>{profile.bankDetails || 'N/A'}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1 items-center">
                                    <Badge variant="secondary">Overall: {profile.commission.overall}%</Badge>
                                    {profile.commission.categories?.map(c => (
                                        <Badge key={c.category} variant="outline">{c.category}: {c.rate}%</Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="print-hidden">
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEdit(profile.id)}>
                                        <Pencil className="mr-1 h-3 w-3" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 text-cyan-600 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700" onClick={() => handleView(profile.id)}>
                                        <Eye className="mr-1 h-3 w-3" /> View
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(profile)}>
                                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                                    </Button>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
                <CardFooter className="py-4 print-hidden">
                    <div className="text-xs text-muted-foreground">
                    Showing <strong>{filteredProfiles.length}</strong> of <strong>{profiles.length}</strong> entries
                    </div>
                </CardFooter>
            </Card>
            </TabsContent>
             <TabsContent value="payouts">
                <Card>
                <CardHeader>
                    <CardTitle>Commission Payouts</CardTitle>
                    <p className="text-sm text-muted-foreground">View and manage all pending commission payouts.</p>
                </CardHeader>
                <CardContent>
                    <PayoutsTable 
                        profiles={filteredProfiles} 
                        smsStatuses={smsStatuses}
                        handlePayClick={handlePayClick}
                        handleView={handleView}
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
                    />
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="salespersons">
                <Card>
                <CardHeader>
                    <CardTitle>Salesperson Commission Payouts</CardTitle>
                    <p className="text-sm text-muted-foreground">View pending commissions for Salespersons.</p>
                </CardHeader>
                <CardContent>
                     <div className="space-y-2 max-w-sm print:hidden mb-4">
                        <Label>Filter by Salesperson</Label>
                        <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Salespersons</SelectItem>
                                {salespersons.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <PayoutsTable 
                        profiles={salespersonData} 
                        smsStatuses={smsStatuses}
                        handlePayClick={handlePayClick}
                        handleView={handleView}
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
                    />
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="agents">
                <Card>
                <CardHeader>
                    <CardTitle>Agent Commission Payouts</CardTitle>
                    <p className="text-sm text-muted-foreground">View pending commissions for Agents.</p>
                </CardHeader>
                <CardContent>
                     <div className="space-y-2 max-w-sm print:hidden mb-4">
                        <Label>Filter by Agent</Label>
                        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agents</SelectItem>
                                {agents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <PayoutsTable 
                        profiles={agentData} 
                        smsStatuses={smsStatuses}
                        handlePayClick={handlePayClick} 
                        handleView={handleView}
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
                    />
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="sub_agents">
                <Card>
                <CardHeader>
                    <CardTitle>Sub-Agent Commission Payouts</CardTitle>
                    <p className="text-sm text-muted-foreground">View pending commissions for Sub-Agents.</p>
                </CardHeader>
                <CardContent>
                     <div className="space-y-2 max-w-sm print:hidden mb-4">
                        <Label>Filter by Sub-Agent</Label>
                        <Select value={selectedSubAgent} onValueChange={setSelectedSubAgent}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sub-Agents</SelectItem>
                                {subAgents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <PayoutsTable 
                        profiles={subAgentData} 
                        smsStatuses={smsStatuses}
                        handlePayClick={handlePayClick} 
                        handleView={handleView}
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
                    />
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="companies">
                <Card>
                <CardHeader>
                    <CardTitle>Company Commission Payouts</CardTitle>
                    <p className="text-sm text-muted-foreground">View pending commissions for Companies.</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-w-sm print:hidden mb-4">
                        <Label>Filter by Company</Label>
                        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Companies</SelectItem>
                                {companies.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <PayoutsTable 
                        profiles={companyData}
                        smsStatuses={smsStatuses}
                        handlePayClick={handlePayClick} 
                        handleView={handleView}
                        isLoading={isLoading}
                        formatCurrency={formatCurrency}
                    />
                </CardContent>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
      </TooltipProvider>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the commission profile for "{profileToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProfileToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <CommissionPayoutDialog 
        profile={profileToPay}
        open={isPayDialogOpen}
        onOpenChange={setIsPayDialogOpen}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
}
