
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  WalletCards,
  Power,
  BookOpen,
  History,
  BarChart3,
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
import { type Supplier } from '@/lib/data';
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import { useCurrency } from '@/hooks/use-currency';
import { getSuppliers, deleteSupplier } from '@/services/supplierService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function SuppliersPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const totalPurchaseDue = suppliers.reduce((acc, supplier) => acc + (supplier.totalPurchaseDue || 0), 0);
  
  const getExportData = () => suppliers.map(s => ({
    contactId: s.contactId,
    businessName: s.businessName,
    name: s.name,
    email: s.email,
    taxNumber: s.taxNumber,
    payTerm: s.payTerm,
    openingBalance: s.openingBalance,
    advanceBalance: s.advanceBalance,
    addedOn: s.addedOn,
    address: s.address,
    mobile: s.mobile,
    totalPurchaseDue: s.totalPurchaseDue,
    totalPurchaseReturnDue: s.totalPurchaseReturnDue,
    customField1: s.customField1 || '',
  }));
  
  const handleExportCsv = () => exportToCsv(getExportData(), 'suppliers');
  const handleExportXlsx = () => exportToXlsx(getExportData(), 'suppliers');
  const handlePrint = () => window.print();
  const handleExportPdf = () => {
    const headers = ["Contact ID", "Business Name", "Name", "Email", "Tax number", "Pay term", "Opening Balance", "Advance Balance", "Added On", "Address", "Mobile", "Total Purchase Due", "Total Purchase Return Due", "Custom Field 1"];
    const data = suppliers.map(s => [
        s.contactId, s.businessName, s.name, s.email, s.taxNumber, `${s.payTerm} Days`,
        formatCurrency(s.openingBalance), formatCurrency(s.advanceBalance), s.addedOn, s.address, s.mobile,
        formatCurrency(s.totalPurchaseDue), formatCurrency(s.totalPurchaseReturnDue), s.customField1 || ''
    ]);
    exportToPdf(headers, data, 'suppliers');
  };

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (supplierToDelete) {
      try {
        await deleteSupplier(supplierToDelete.id);
        setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id));
        toast({ title: "Success", description: "Supplier deleted successfully." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete supplier.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setSupplierToDelete(null);
      }
    }
  };

  return (
    <>
    <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
            <h1 className="font-headline text-3xl font-bold">Suppliers</h1>
            <p className="text-muted-foreground">Manage your Suppliers</p>
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
                            <CardTitle>All your Suppliers</CardTitle>
                            <div className="flex items-center gap-2">
                                <Link href="/admin/contacts/suppliers/add">
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
                            <Button onClick={handleExportCsv} variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span></Button>
                            <Button onClick={handleExportXlsx} variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export Excel</span></Button>
                            <Button onClick={handlePrint} variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
                            <Button variant="outline" size="sm" className="h-9 gap-1"><Columns3 className="h-4 w-4" /> <span className="hidden sm:inline">Column visibility</span></Button>
                            <Button onClick={handleExportPdf} variant="outline" size="sm" className="h-9 gap-1"><FileText className="h-4 w-4" /> <span className="hidden sm:inline">Export PDF</span></Button>
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
                                <TableHead><div className="flex items-center gap-1">Contact ID <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Business Name <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Tax number <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Pay term <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Opening Balance <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Advance Balance <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Added On <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead><div className="flex items-center gap-1">Mobile <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Total Purchase Due <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Total Purchase Return Due <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Custom Field 1 <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 15 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton className="h-5" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><WalletCards className="mr-2 h-4 w-4" /> Pay</DropdownMenuItem>
                                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                            <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDelete(supplier); }} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            <DropdownMenuItem><Power className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem><BookOpen className="mr-2 h-4 w-4" /> Ledger</DropdownMenuItem>
                                            <DropdownMenuItem><History className="mr-2 h-4 w-4" /> Purchases</DropdownMenuItem>
                                            <DropdownMenuItem><BarChart3 className="mr-2 h-4 w-4" /> Stock Report</DropdownMenuItem>
                                            <DropdownMenuItem><FileText className="mr-2 h-4 w-4" /> Documents & Note</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell>{supplier.contactId}</TableCell>
                                <TableCell className="font-medium">{supplier.businessName}</TableCell>
                                <TableCell>{supplier.name}</TableCell>
                                <TableCell>{supplier.email}</TableCell>
                                <TableCell>{supplier.taxNumber}</TableCell>
                                <TableCell>{supplier.payTerm} Days</TableCell>
                                <TableCell>{formatCurrency(supplier.openingBalance)}</TableCell>
                                <TableCell>{formatCurrency(supplier.advanceBalance)}</TableCell>
                                <TableCell>{supplier.addedOn}</TableCell>
                                <TableCell>{supplier.address}</TableCell>
                                <TableCell>{supplier.mobile}</TableCell>
                                <TableCell>{formatCurrency(supplier.totalPurchaseDue)}</TableCell>
                                <TableCell>{formatCurrency(supplier.totalPurchaseReturnDue)}</TableCell>
                                <TableCell>{supplier.customField1 || ''}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={12} className="text-right font-bold">Total:</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(totalPurchaseDue)}</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(0)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="py-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1 to {suppliers.length}</strong> of <strong>{suppliers.length}</strong> entries
                        </div>
                    </CardFooter>
                </Card>
            </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-400 p-1">
            Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
        </div>
    </div>
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the supplier
            "{supplierToDelete?.businessName}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSupplierToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
