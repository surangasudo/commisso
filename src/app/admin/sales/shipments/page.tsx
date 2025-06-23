'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Printer,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Columns3,
  FileText,
  ArrowUpDown,
  ChevronDown,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { sales, type Sale } from '@/lib/data';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const getShippingStatusBadge = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
        case 'ordered':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'packed':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'shipped':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'delivered':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

export default function ShipmentsPage() {
    const router = useRouter();
    const [shipments, setShipments] = useState<Sale[]>(sales.filter(sale => sale.shippingStatus));
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [shipmentToDelete, setShipmentToDelete] = useState<Sale | null>(null);
    
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [shipmentToEdit, setShipmentToEdit] = useState<Sale | null>(null);
    const [editedStatus, setEditedStatus] = useState<string | null>('');
    const [editedDetails, setEditedDetails] = useState<string | null>('');

    const handleViewSale = (saleId: string) => {
        router.push(`/admin/sales/view/${saleId}`);
    };

    const handleEditClick = (shipment: Sale) => {
        setShipmentToEdit(shipment);
        setEditedStatus(shipment.shippingStatus);
        setEditedDetails(shipment.shippingDetails);
        setIsEditDialogOpen(true);
    };
    
    const handleUpdateShipment = () => {
        if (shipmentToEdit) {
            setShipments(shipments.map(s => 
                s.id === shipmentToEdit.id 
                ? { ...s, shippingStatus: editedStatus, shippingDetails: editedDetails } 
                : s
            ));
            setIsEditDialogOpen(false);
            setShipmentToEdit(null);
        }
    };

    const handleDeleteClick = (shipment: Sale) => {
        setShipmentToDelete(shipment);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (shipmentToDelete) {
            setShipments(shipments.filter(s => s.id !== shipmentToDelete.id));
            setIsDeleteDialogOpen(false);
            setShipmentToDelete(null);
        }
    };

  return (
    <>
    <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Truck className="w-8 h-8" />
                Shipments
            </h1>
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
                            <CardTitle>All Shipments</CardTitle>
                        </div>
                        <CardDescription>
                            Manage all your shipments from this screen.
                        </CardDescription>
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
                                <TableHead><div className="flex items-center gap-1">Invoice No. <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Customer name <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead>Contact No.</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead><div className="flex items-center gap-1">Shipping Status <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                <TableHead>Added By</TableHead>
                                <TableHead>Shipping Details</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {shipments.map((shipment) => (
                                <TableRow key={shipment.id}>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleViewSale(shipment.id)}><Eye className="mr-2 h-4 w-4" /> View Sale</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleEditClick(shipment)}><Pencil className="mr-2 h-4 w-4" /> Edit Shipping</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleDeleteClick(shipment)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell>{shipment.date}</TableCell>
                                <TableCell>{shipment.invoiceNo}</TableCell>
                                <TableCell>{shipment.customerName}</TableCell>
                                <TableCell>{shipment.contactNumber}</TableCell>
                                <TableCell>{shipment.location}</TableCell>
                                <TableCell><Badge variant="outline" className={cn("capitalize", getShippingStatusBadge(shipment.shippingStatus))}>{shipment.shippingStatus}</Badge></TableCell>
                                <TableCell>{shipment.addedBy}</TableCell>
                                <TableCell>{shipment.shippingDetails || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1 to {shipments.length}</strong> of <strong>{shipments.length}</strong> entries
                        </div>
                    </CardFooter>
                </Card>
            </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-400 p-1">
            Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
        </div>
    </div>
    
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Shipment</DialogTitle>
                 <DialogDescription>
                    Update the shipping status and details for invoice {shipmentToEdit?.invoiceNo}.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="shipping-status">Shipping Status</Label>
                    <Select value={editedStatus || ''} onValueChange={(value) => setEditedStatus(value)}>
                    <SelectTrigger id="shipping-status">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="packed">Packed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shipping-details">Shipping Details</Label>
                    <Textarea
                    id="shipping-details"
                    value={editedDetails || ''}
                    onChange={(e) => setEditedDetails(e.target.value)}
                    placeholder="Enter shipping details"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateShipment}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete the shipment for invoice "{shipmentToDelete?.invoiceNo}". This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShipmentToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
