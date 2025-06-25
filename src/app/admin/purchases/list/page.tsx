'use client';
import React, { useState } from 'react';
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
  ChevronDown,
  Info,
  Undo2,
  CheckCircle,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { purchases as initialPurchases, type Purchase } from '@/lib/data';
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
import { AppFooter } from '@/components/app-footer';

const getPurchaseStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'received':
            return 'bg-green-100 text-green-800 border-green-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

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

export default function ListPurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);

  const totalGrandTotal = purchases.reduce((acc, purchase) => acc + purchase.grandTotal, 0);
  const totalPurchaseDue = purchases.reduce((acc, purchase) => acc + purchase.paymentDue, 0);

  const dueCount = purchases.filter(p => p.paymentStatus === 'Due').length;
  const paidCount = purchases.filter(p => p.paymentStatus === 'Paid').length;
  const partialCount = purchases.filter(p => p.paymentStatus === 'Partial').length;
  
  const handleView = (purchaseId: string) => {
    router.push(`/admin/purchases/view/${purchaseId}`);
  };

  const handleEdit = (purchaseId: string) => {
    router.push(`/admin/purchases/edit/${purchaseId}`);
  };

  const handleDelete = (purchase: Purchase) => {
    setPurchaseToDelete(purchase);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (purchaseToDelete) {
      setPurchases(purchases.filter(p => p.id !== purchaseToDelete.id));
      setIsDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    }
  };
  
  const handleUnsupportedAction = (actionName: string) => {
    alert(`${actionName} is not yet implemented.`);
  }

  return (
    <>
    <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
            <h1 className="font-headline text-3xl font-bold">Purchases</h1>
            <p className="text-muted-foreground">Manage your Purchases</p>
        </div>

        <Card>
            <CardHeader>
                 <Button variant="outline" size="sm" className="h-9 gap-1.5 w-fit">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                </Button>
            </CardHeader>
            <CardContent>
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <CardTitle>All Purchases</CardTitle>
                            <div className="flex items-center gap-2">
                                <Link href="/admin/purchases/add">
                                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add</span>
                                </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
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
                                <TableHead>Action</TableHead>
                                <TableHead><div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Reference No <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead><div className="flex items-center gap-1">Supplier <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Purchase Status <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Payment Status <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Grand Total <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Payment due <Info className="w-3 h-3 text-muted-foreground" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Added By <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {purchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleView(purchase.id)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleUnsupportedAction('Print')}><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleEdit(purchase.id)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleDelete(purchase)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => handleUnsupportedAction('View Payments')}><FileText className="mr-2 h-4 w-4" /> View Payments</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleUnsupportedAction('Add Payment')}><PlusCircle className="mr-2 h-4 w-4" /> Add Payment</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleUnsupportedAction('Purchase Return')}><Undo2 className="mr-2 h-4 w-4" /> Purchase Return</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleUnsupportedAction('Update Status')}><CheckCircle className="mr-2 h-4 w-4" /> Update Status</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleUnsupportedAction('Documents & Note')}><FileText className="mr-2 h-4 w-4" /> Documents & Note</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell>{purchase.date}</TableCell>
                                <TableCell>{purchase.referenceNo}</TableCell>
                                <TableCell>{purchase.location}</TableCell>
                                <TableCell>{purchase.supplier}</TableCell>
                                <TableCell><Badge variant="outline" className={cn("capitalize", getPurchaseStatusBadge(purchase.purchaseStatus))}>{purchase.purchaseStatus}</Badge></TableCell>
                                <TableCell><Badge variant="outline" className={cn("capitalize", getPaymentStatusBadge(purchase.paymentStatus))}>{purchase.paymentStatus}</Badge></TableCell>
                                <TableCell>${purchase.grandTotal.toFixed(2)}</TableCell>
                                <TableCell>Purchase: ${purchase.paymentDue.toFixed(2)}</TableCell>
                                <TableCell>{purchase.addedBy}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={7} className="text-right font-bold">Total:</TableCell>
                                    <TableCell className="font-bold">${totalGrandTotal.toFixed(2)}</TableCell>
                                    <TableCell colSpan={2}>
                                        <div className="font-bold">Purchase Due - ${totalPurchaseDue.toFixed(2)}</div>
                                        <div className="font-bold">Purchase Return - $0.00</div>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4 py-4">
                        <div className="text-sm text-muted-foreground">
                            Due - {dueCount} | Paid - {paidCount} | Partial - {partialCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1 to {purchases.length}</strong> of <strong>{purchases.length}</strong> entries
                        </div>
                         <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">Previous</Button>
                            <Button variant="default" size="sm" className="h-9 w-9 p-0">1</Button>
                            <Button variant="outline" size="sm">Next</Button>
                        </div>
                    </CardFooter>
                </Card>
            </CardContent>
        </Card>
        <AppFooter />
    </div>
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the purchase
            with reference "{purchaseToDelete?.referenceNo}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPurchaseToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
