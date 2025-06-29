
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, Calendar, User, Pencil } from "lucide-react";
import { detailedProducts, type DetailedProduct, customers, sellReturns, type SellReturn } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { AppFooter } from '@/components/app-footer';

type ReturnItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

// Mock function to get items for a return since it's not in the data model
const getReturnItemsForId = (id: string): ReturnItem[] => {
    if (id === 'sr-1') {
        const product = detailedProducts.find(p => p.id === 'prod-6'); // Pinot Noir Red Wine
        if (!product) return [];
        const quantity = 1;
        const unitPrice = product.sellingPrice;
        return [{ product, quantity, unitPrice, subtotal: quantity * unitPrice }];
    }
    if (id === 'sr-2') {
        const product1 = detailedProducts.find(p => p.id === 'prod-7'); // Puma Brown Sneaker
        const product2 = detailedProducts.find(p => p.id === 'prod-8'); // PUMA Men's Black Sneaker
        if (!product1 || !product2) return [];
        const quantity1 = 1;
        const quantity2 = 1;
        const unitPrice1 = product1.sellingPrice;
        const unitPrice2 = product2.sellingPrice;
        return [
            { product: product1, quantity: quantity1, unitPrice: unitPrice1, subtotal: quantity1 * unitPrice1 },
            { product: product2, quantity: quantity2, unitPrice: unitPrice2, subtotal: quantity2 * unitPrice2 },
        ];
    }
    return [];
}

export default function EditSellReturnPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { id } = params;

    const [sellReturn, setSellReturn] = useState<SellReturn | null>(null);
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Add customer dialog state
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerMobile, setNewCustomerMobile] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [newCustomerAddress, setNewCustomerAddress] = useState('');

    useEffect(() => {
        if (id) {
            const returnToEdit = sellReturns.find(r => r.id === id);
            if (returnToEdit) {
                setSellReturn(returnToEdit);
                setReturnItems(getReturnItemsForId(id as string));
            } else {
                // Handle case where return is not found, maybe redirect
                router.push('/admin/sales/return/list');
            }
        }
    }, [id, router]);

    const searchResults = searchTerm
    ? detailedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

    const handleAddProduct = (product: DetailedProduct) => {
        if (!returnItems.some(item => item.product.id === product.id)) {
            setReturnItems([...returnItems, {
                product,
                quantity: 1,
                unitPrice: product.sellingPrice,
                subtotal: product.sellingPrice,
            }]);
        }
        setSearchTerm('');
    };

    const handleRemoveItem = (productId: string) => {
        setReturnItems(returnItems.filter(item => item.product.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setReturnItems(returnItems.map(item => {
            if (item.product.id === productId) {
                const newQuantity = Math.max(0, quantity);
                return { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice };
            }
            return item;
        }));
    };

    const totalAmount = returnItems.reduce((acc, item) => acc + item.subtotal, 0);

    const handleSaveCustomer = () => {
        if (!newCustomerName || !newCustomerMobile) {
            toast({
                title: "Error",
                description: "Name and Mobile Number are required.",
                variant: "destructive",
            });
            return;
        }
        console.log("New Customer:", { 
            name: newCustomerName, 
            mobile: newCustomerMobile, 
            email: newCustomerEmail, 
            address: newCustomerAddress 
        });
        toast({
            title: "Customer Added",
            description: `${newCustomerName} has been successfully added.`,
        });
        setNewCustomerName('');
        setNewCustomerMobile('');
        setNewCustomerEmail('');
        setNewCustomerAddress('');
        setIsAddCustomerOpen(false);
    };

    const handleSaveChanges = () => {
        toast({
            title: "Success!",
            description: `Sell return ${sellReturn?.invoiceNo} has been updated.`,
        });
        router.push('/admin/sales/return/list');
    };

    if (!sellReturn) {
        return (
            <div className="flex flex-col gap-6">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <Pencil className="w-7 h-7" />
                    Edit Sell Return
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Loading sell return details...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Pencil className="w-7 h-7" />
                Edit Sell Return
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Return Details</CardTitle>
                    <CardDescription>
                        Editing sell return with Invoice No: {sellReturn.invoiceNo}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="customer">Customer *</Label>
                            <div className="flex gap-2">
                                <Select defaultValue={customers.find(c => c.name === sellReturn.customerName)?.id}>
                                    <SelectTrigger id="customer">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select Customer" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                         {customers.map(customer => (
                                            <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add New Customer</DialogTitle>
                                            <DialogDescription>
                                                Quickly add a new customer to the system.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-customer-name">Name *</Label>
                                                <Input id="new-customer-name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Customer Name" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-customer-mobile">Mobile Number *</Label>
                                                <Input id="new-customer-mobile" value={newCustomerMobile} onChange={(e) => setNewCustomerMobile(e.target.value)} placeholder="Mobile Number" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-customer-email">Email</Label>
                                                <Input id="new-customer-email" type="email" value={newCustomerEmail} onChange={(e) => setNewCustomerEmail(e.target.value)} placeholder="Email Address" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-customer-address">Address</Label>
                                                <Textarea id="new-customer-address" value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} placeholder="Customer Address" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="secondary" onClick={() => setIsAddCustomerOpen(false)}>Cancel</Button>
                                            <Button onClick={handleSaveCustomer}>Save Customer</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoice-no">Invoice No.</Label>
                            <Input id="invoice-no" defaultValue={sellReturn.invoiceNo} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="date">Return Date *</Label>
                            <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <Input type="text" defaultValue={sellReturn.date} className="border-none focus-visible:ring-0" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Products to Return</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Products..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1">
                            {searchResults.map(product => (
                                <div
                                key={product.id}
                                className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center text-sm"
                                onClick={() => handleAddProduct(product)}
                                >
                                <span>{product.name} ({product.sku})</span>
                                <Plus className="w-4 h-4" />
                                </div>
                            ))}
                            </div>
                        )}
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">Product</TableHead>
                                    <TableHead>Return Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead className="text-center w-[50px]"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returnItems.length > 0 ? returnItems.map(item => (
                                    <TableRow key={item.product.id}>
                                        <TableCell className="font-medium">{item.product.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => handleQuantityChange(item.product.id, parseInt(e.target.value) || 0)}
                                                className="w-24 h-9"
                                            />
                                        </TableCell>
                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell className="font-semibold">${item.subtotal.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50" onClick={() => handleRemoveItem(item.product.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No products added for return.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end mt-4">
                        <div className="text-right">
                            <span className="text-muted-foreground">Total Return Value: </span>
                            <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveChanges}>Save Changes</Button>
            </div>

            <AppFooter />
        </div>
    );
}
