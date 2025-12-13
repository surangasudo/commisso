
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Download,
    Printer,
    Search,
    Pencil,
    Trash2,
    Eye,
    PlusCircle,
    Filter,
    Columns3,
    FileText,
    ArrowUpDown,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type Sale } from '@/lib/data';
import { getSales, deleteSale } from '@/services/saleService';
import { AppFooter } from '@/components/app-footer';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/use-currency';
import { Checkbox } from '@/components/ui/checkbox';


const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'due':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'partial':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

export default function AllSalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

    const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    const fetchSalesData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSales();
            setSales(data);
        } catch (error) {
            console.error("Failed to fetch sales:", error);
            toast({ title: "Error", description: "Could not load sales data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSalesData();
    }, [fetchSalesData]);

    const totalAmount = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const totalPaid = sales.reduce((acc, sale) => acc + sale.totalPaid, 0);
    const sellDue = sales.reduce((acc, sale) => acc + sale.sellDue, 0);
    const sellReturnDue = sales.reduce((acc, sale) => acc + sale.sellReturnDue, 0);

    const paidCount = sales.filter(s => s.paymentStatus === 'Paid').length;
    const cashCount = sales.filter(s => s.paymentMethod === 'Cash').length;

    const handleView = (saleId: string) => {
        router.push(`/admin/sales/view/${saleId}`);
    };

    const handleEdit = (saleId: string) => {
        router.push(`/admin/sales/edit/${saleId}`);
    };

    const handleDelete = (sale: Sale) => {
        setSaleToDelete(sale);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (saleToDelete) {
            try {
                await deleteSale(saleToDelete.id);
                setSales(sales.filter(s => s.id !== saleToDelete.id));
                toast({ title: "Success", description: "Sale deleted successfully." });
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete sale.", variant: "destructive" });
            } finally {
                setIsDeleteDialogOpen(false);
                setSaleToDelete(null);
            }
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedSales(new Set(sales.map(s => s.id)));
        } else {
            setSelectedSales(new Set());
        }
    };

    const handleSelectOne = (saleId: string, checked: boolean) => {
        const newSet = new Set(selectedSales);
        if (checked) {
            newSet.add(saleId);
        } else {
            newSet.delete(saleId);
        }
        setSelectedSales(newSet);
    };

    const confirmDeleteSelected = async () => {
        const idsToDelete = Array.from(selectedSales);
        if (idsToDelete.length === 0) {
            setIsBulkDeleteDialogOpen(false);
            return;
        }

        let successfulDeletions = 0;
        let failedDeletions = 0;

        for (const id of idsToDelete) {
            try {
                await deleteSale(id);
                successfulDeletions++;
            } catch (error) {
                console.error(`Failed to delete sale ${id}:`, error);
                failedDeletions++;
            }
        }

        await fetchSalesData();

        if (successfulDeletions > 0) {
            toast({
                title: "Bulk Deletion Complete",
                description: `${successfulDeletions} sale(s) deleted successfully.`,
            });
        }

        if (failedDeletions > 0) {
            toast({
                title: "Deletion Failed",
                description: `${failedDeletions} sale(s) could not be deleted. Please check the console for errors.`,
                variant: "destructive"
            });
        }

        setSelectedSales(new Set());
        setIsBulkDeleteDialogOpen(false);
    };

    const isAllSelected = sales.length > 0 && selectedSales.size === sales.length;
    const isSomeSelected = selectedSales.size > 0 && selectedSales.size < sales.length;


    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex items-baseline gap-2 print-hidden">
                    <h1 className="font-headline text-3xl font-bold">Sales</h1>
                </div>

                <Card className="print-hidden">
                    <CardHeader>
                        <Button variant="outline" size="sm" className="h-9 gap-1.5 w-fit">
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                        </Button>
                    </CardHeader>
                </Card>
                <div className="printable-area">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <CardTitle>All sales</CardTitle>
                                <div className="flex items-center gap-2 print-hidden">
                                    <Link href="/admin/sales/add">
                                        <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                                            <PlusCircle className="h-4 w-4" />
                                            <span>Add</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4 print-hidden">
                                <div className="flex items-center gap-2">
                                    <Select defaultValue="25">
                                        <SelectTrigger className="w-[100px] h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">Show 10</SelectItem>
                                            <SelectItem value="25">Show 25</SelectItem>
                                            <SelectItem value="50">Show 50</SelectItem>
                                            <SelectItem value="100">Show 100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-muted-foreground hidden lg:inline">entries</span>
                                </div>
                                <div className="flex-1 flex flex-wrap items-center justify-start sm:justify-center gap-2">
                                    <Button variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span></Button>
                                    <Button variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export Excel</span></Button>
                                    <Button onClick={() => window.print()} variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
                                    <Button variant="outline" size="sm" className="h-9 gap-1"><Columns3 className="h-4 w-4" /> <span className="hidden sm:inline">Column visibility</span></Button>
                                    <Button variant="outline" size="sm" className="h-9 gap-1"><FileText className="h-4 w-4" /> <span className="hidden sm:inline">Export PDF</span></Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" />
                                </div>
                            </div>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                                    aria-label="Select all rows"
                                                />
                                            </TableHead>
                                            <TableHead className="print-hidden">Action</TableHead>
                                            <TableHead><div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                            <TableHead><div className="flex items-center gap-1">Invoice No. <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                            <TableHead><div className="flex items-center gap-1">Customer name <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                            <TableHead>Contact Number</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead><div className="flex items-center gap-1">Payment Status <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead><div className="flex items-center gap-1">Total amount <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                            <TableHead><div className="flex items-center gap-1">Total paid <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                            <TableHead>Sell Due</TableHead>
                                            <TableHead>Sell Return Due</TableHead>
                                            <TableHead>Shipping Status</TableHead>
                                            <TableHead><div className="flex items-center gap-1">Total Items <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                            <TableHead><div className="flex items-center gap-1">Added By <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                            <TableHead>Sell note</TableHead>
                                            <TableHead>Staff note</TableHead>
                                            <TableHead>Shipping Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                                    <TableCell className="print-hidden"><Skeleton className="h-8 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : sales.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedSales.has(sale.id)}
                                                        onCheckedChange={(checked) => handleSelectOne(sale.id, !!checked)}
                                                        aria-label={`Select row for invoice ${sale.invoiceNo}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="print-hidden">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onSelect={() => handleView(sale.id)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleEdit(sale.id)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleDelete(sale)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                                <TableCell>{sale.date}</TableCell>
                                                <TableCell>{sale.invoiceNo}</TableCell>
                                                <TableCell>{sale.customerName}</TableCell>
                                                <TableCell>{sale.contactNumber}</TableCell>
                                                <TableCell>{sale.location}</TableCell>
                                                <TableCell><Badge variant="outline" className={cn("capitalize", getPaymentStatusBadge(sale.paymentStatus))}>{sale.paymentStatus}</Badge></TableCell>
                                                <TableCell>{sale.paymentMethod}</TableCell>
                                                <TableCell>{sale.paymentReference || '-'}</TableCell>
                                                <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                                                <TableCell>{formatCurrency(sale.totalPaid)}</TableCell>
                                                <TableCell>{formatCurrency(sale.sellDue)}</TableCell>
                                                <TableCell>{formatCurrency(sale.sellReturnDue)}</TableCell>
                                                <TableCell>{sale.shippingStatus || ''}</TableCell>
                                                <TableCell>{sale.totalItems}</TableCell>
                                                <TableCell>{sale.addedBy}</TableCell>
                                                <TableCell>{sale.sellNote || ''}</TableCell>
                                                <TableCell>{sale.staffNote || ''}</TableCell>
                                                <TableCell>{sale.shippingDetails || ''}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableHead colSpan={9} className="text-right font-bold print-hidden">Total:</TableHead>
                                            <TableHead colSpan={9} className="text-right font-bold hidden print:table-cell">Total:</TableHead>
                                            <TableCell className="font-bold">{formatCurrency(totalAmount)}</TableCell>
                                            <TableCell className="font-bold">{formatCurrency(totalPaid)}</TableCell>
                                            <TableCell className="font-bold">{formatCurrency(sellDue)}</TableCell>
                                            <TableCell className="font-bold">{formatCurrency(sellReturnDue)}</TableCell>
                                            <TableCell colSpan={6}></TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 print-hidden">
                            <div className="flex-1">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={selectedSales.size === 0}
                                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                                >
                                    Delete Selected ({selectedSales.size})
                                </Button>
                            </div>
                            <div className="flex-1 text-xs text-muted-foreground text-center">
                                Showing <strong>1 to {sales.length}</strong> of <strong>{sales.length}</strong> entries
                            </div>
                            <div className="flex-1 flex justify-end">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Previous</Button>
                                    <Button variant="default" size="sm" className="h-9 w-9 p-0">1</Button>
                                    <Button variant="outline" size="sm">Next</Button>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div className="print-hidden">
                    <AppFooter />
                </div>
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the sale
                            with invoice "{saleToDelete?.invoiceNo}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSaleToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedSales.size} selected sale(s). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteSelected} className="bg-red-600 hover:bg-red-700">
                            Delete Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
