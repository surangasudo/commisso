'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Printer,
  Search,
  Pencil,
  Trash2,
  PlusCircle,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ArrowRightLeft
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
import { stockTransfers, type StockTransfer } from '@/lib/data';
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

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'in-transit':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

export default function ListStockTransfersPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>(stockTransfers);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<StockTransfer | null>(null);

  const totalAmount = transfers.reduce((acc, transfer) => acc + transfer.totalAmount, 0);

  const handleDelete = (transfer: StockTransfer) => {
    setTransferToDelete(transfer);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (transferToDelete) {
      setTransfers(transfers.filter(p => p.id !== transferToDelete.id));
      setIsDeleteDialogOpen(false);
      setTransferToDelete(null);
    }
  };

  return (
    <>
    <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2"><ArrowRightLeft className="w-8 h-8"/> Stock Transfers</h1>
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
                            <CardTitle>All Stock Transfers</CardTitle>
                            <div className="flex items-center gap-2">
                                <Link href="/admin/stock-transfers/add">
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
                                <Button onClick={() => window.print()} variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
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
                                <TableHead>Location (From)</TableHead>
                                <TableHead>Location (To)</TableHead>
                                <TableHead><div className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Shipping Charges <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Total Amount <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Added By <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {transfers.map((transfer) => (
                                <TableRow key={transfer.id}>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
                                            <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleDelete(transfer)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell>{transfer.date}</TableCell>
                                <TableCell>{transfer.referenceNo}</TableCell>
                                <TableCell>{transfer.locationFrom}</TableCell>
                                <TableCell>{transfer.locationTo}</TableCell>
                                <TableCell><Badge variant="outline" className={cn("capitalize", getStatusBadge(transfer.status))}>{transfer.status}</Badge></TableCell>
                                <TableCell>${transfer.shippingCharges.toFixed(2)}</TableCell>
                                <TableCell>${transfer.totalAmount.toFixed(2)}</TableCell>
                                <TableCell>{transfer.addedBy}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={7} className="text-right font-bold">Total:</TableCell>
                                    <TableCell className="font-bold">${totalAmount.toFixed(2)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="py-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1 to {transfers.length}</strong> of <strong>{transfers.length}</strong> entries
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
            This action cannot be undone. This will permanently delete the stock transfer
            with reference "{transferToDelete?.referenceNo}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setTransferToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
