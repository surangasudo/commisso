'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, User, Calendar, FilePlus, Info, PlusCircle, X } from "lucide-react";
import { detailedProducts, type DetailedProduct, customers, users } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppFooter } from '@/components/app-footer';

type DraftItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
};

export default function AddDraftPage() {
    const { toast } = useToast();
    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [additionalExpenses, setAdditionalExpenses] = useState<{ id: number, name: string, amount: string }[]>([]);

    // State for the Add Customer Dialog
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerMobile, setNewCustomerMobile] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [newCustomerAddress, setNewCustomerAddress] = useState('');

    useEffect(() => {
        const now = new Date();
        const formatted = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setCurrentDate(formatted);
    }, []);
    
    const searchResults = searchTerm
    ? detailedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

    const handleAddProduct = (product: DetailedProduct) => {
        if (!draftItems.some(item => item.product.id === product.id)) {
            setDraftItems([...draftItems, {
                product,
                quantity: 1,
                unitPrice: product.sellingPrice,
                discount: 0,
                tax: 0,
            }]);
        }
        setSearchTerm('');
    };
    
    const handleRemoveItem = (productId: string) => {
        setDraftItems(draftItems.filter(item => item.product.id !== productId));
    };

    const handleItemChange = (productId: string, field: keyof DraftItem, value: any) => {
        setDraftItems(draftItems.map(item =>
            item.product.id === productId ? { ...item, [field]: value } : item
        ));
    };

    const calculateSubtotal = (item: DraftItem) => {
        return item.quantity * item.unitPrice;
    }
    
    const totalItems = draftItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = draftItems.reduce((acc, item) => acc + calculateSubtotal(item), 0);

    const handleSaveDraft = () => {
        if (draftItems.length === 0) {
             toast({
                title: "Draft is empty",
                description: "Please add products to the draft before saving.",
                variant: "destructive",
            });
            return;
        }

        console.log("Saving draft:", draftItems);
        toast({
            title: "Success!",
            description: "Your draft has been saved successfully.",
        });
        setDraftItems([]);
    }
    
    const addAdditionalExpense = () => {
        setAdditionalExpenses([...additionalExpenses, { id: Date.now(), name: '', amount: '' }]);
    };

    const removeAdditionalExpense = (id: number) => {
        setAdditionalExpenses(additionalExpenses.filter(exp => exp.id !== id));
    };

    const handleSaveCustomer = () => {
        if (!newCustomerName || !newCustomerMobile) {
            toast({
                title: "Error",
                description: "Name and Mobile Number are required.",
                variant: "destructive",
            });
            return;
        }

        // In a real app, you would save this data to your backend
        // and likely update the customer list.
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

        // Reset form and close dialog
        setNewCustomerName('');
        setNewCustomerMobile('');
        setNewCustomerEmail('');
        setNewCustomerAddress('');
        setIsAddCustomerOpen(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FilePlus className="w-8 h-8" />
                Add Draft
            </h1>

            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="location">Business Location *</Label>
                            <Select defaultValue="awesome-shop">
                                <SelectTrigger id="location">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="awesome-shop">Awesome Shop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-4 border rounded-md space-y-4">
                            <div className="flex gap-2">
                                <Select>
                                    <SelectTrigger id="customer">
                                        <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Select Customer" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="walk-in">Walk-in Customer</SelectItem>
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
                            <div>
                                <h4 className="font-semibold text-sm">Billing Address:</h4>
                                <p className="text-sm text-muted-foreground">Walk-in Customer, <br/>Linking Street, Phoenix, Arizona, USA</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Shipping Address:</h4>
                                <p className="text-sm text-muted-foreground">Walk-in Customer</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pay-term" className="flex items-center gap-1">Pay term: <Info className="w-3 h-3 text-muted-foreground" /></Label>
                                <div className="flex gap-2">
                                    <Input id="pay-term-value" type="number" placeholder="e.g. 30" />
                                    <Select>
                                        <SelectTrigger id="pay-term-unit" className="w-[120px]">
                                            <SelectValue placeholder="Please Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="days">Days</SelectItem>
                                            <SelectItem value="months">Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sale-date">Sale Date *</Label>
                                <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-100">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{currentDate}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice-scheme">Invoice scheme:</Label>
                                <Select defaultValue="Default">
                                    <SelectTrigger id="invoice-scheme"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Default">Default</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice-no">Invoice No.:</Label>
                                <Input id="invoice-no" placeholder="Keep blank to auto generate" />
                            </div>
                            <div className="space-y-2 col-span-full">
                                <Label htmlFor="attach-document">Attach Document:</Label>
                                <Input id="attach-document" type="file" />
                                <p className="text-xs text-muted-foreground">Max File size: 5MB. Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                     <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Enter Product name / SKU / Scan bar code"
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
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead className="min-w-[200px]">Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Tax</TableHead>
                                    <TableHead>Price inc. tax</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead className="text-center w-12"><X className="w-4 h-4 mx-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {draftItems.length > 0 ? draftItems.map((item, index) => (
                                    <TableRow key={item.product.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.product.id, 'quantity', parseInt(e.target.value))} className="w-24 h-9" /></TableCell>
                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>0.00</TableCell>
                                        <TableCell>0.00</TableCell>
                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>${calculateSubtotal(item).toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50" onClick={() => handleRemoveItem(item.product.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24">No products added yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="flex justify-end mt-2 text-sm font-medium">
                        Items: {totalItems.toFixed(2)} Total: ${subtotal.toFixed(2)}
                    </div>
                    <hr className="my-4"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                             <Label htmlFor="discount-type" className="flex items-center gap-1">Discount Type:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                             <Select defaultValue="Percentage">
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fixed">Fixed</SelectItem>
                                    <SelectItem value="Percentage">Percentage</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                         <div className="space-y-2">
                             <Label htmlFor="discount-amount" className="flex items-center gap-1">Discount Amount:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                             <Input id="discount-amount" type="number" defaultValue="10.00"/>
                        </div>
                        <div>
                             <p className="text-sm mt-6">Discount Amount(-): $0.00</p>
                        </div>
                         <div className="space-y-2">
                             <Label htmlFor="order-tax" className="flex items-center gap-1">Order Tax:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                             <Select>
                                <SelectTrigger><SelectValue placeholder="None"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="vat-10">VAT@10%</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                         <div className="flex items-end">
                            <p className="text-sm">Order Tax(+): $0.00</p>
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="sell-note">Sell Note</Label>
                        <Textarea id="sell-note" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2"><Label>Shipping Details</Label><Textarea placeholder="Shipping Details"/></div>
                    <div className="space-y-2"><Label>Shipping Address</Label><Textarea placeholder="Shipping Address"/></div>
                    <div className="space-y-2"><Label>Shipping Charges</Label><Input type="number" defaultValue="0.00"/></div>
                    <div className="space-y-2">
                        <Label>Shipping Status</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ordered">Ordered</SelectItem>
                                <SelectItem value="packed">Packed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>Delivered To</Label><Input placeholder="Delivered To"/></div>
                    <div className="space-y-2">
                        <Label>Delivery Person</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2"><Label>Shipping Document</Label><Input type="file" /></div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center p-4 border rounded-md">
                <Button variant="outline" onClick={addAdditionalExpense}><PlusCircle className="mr-2 h-4 w-4" /> Add additional expenses</Button>
                <div className="text-right font-bold">Total Payable: $0.00</div>
            </div>

            <div className="flex justify-end gap-2">
                <Button size="lg" variant="default" onClick={handleSaveDraft}>Save</Button>
                <Button size="lg" variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleSaveDraft}>Save and print</Button>
            </div>

            <AppFooter />
        </div>
    );
}
