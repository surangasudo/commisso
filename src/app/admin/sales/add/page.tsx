'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, Info, User, ShoppingBag, Calendar, X } from "lucide-react";
import { detailedProducts, type DetailedProduct, customers, commissionProfiles } from '@/lib/data';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AppFooter } from '@/components/app-footer';

type SaleItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
};

export default function AddSalePage() {
    const { toast } = useToast();
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerMobile, setNewCustomerMobile] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [newCustomerAddress, setNewCustomerAddress] = useState('');

    const [discount, setDiscount] = useState(0);
    const [taxPercentage, setTaxPercentage] = useState(0);
    const [shipping, setShipping] = useState(0);


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
        if (!saleItems.some(item => item.product.id === product.id)) {
            setSaleItems([...saleItems, {
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
        setSaleItems(saleItems.filter(item => item.product.id !== productId));
    };

    const handleItemChange = (productId: string, field: keyof SaleItem, value: any) => {
        setSaleItems(saleItems.map(item =>
            item.product.id === productId ? { ...item, [field]: value } : item
        ));
    };

    const calculateSubtotal = (item: SaleItem) => {
        return item.quantity * item.unitPrice;
    }
    
    const totalItems = saleItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = saleItems.reduce((acc, item) => acc + calculateSubtotal(item), 0);

    const taxAmount = useMemo(() => subtotal * (taxPercentage / 100), [subtotal, taxPercentage]);
    const totalPayable = useMemo(() => subtotal - discount + taxAmount + shipping, [subtotal, discount, taxAmount, shipping]);

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
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-8 h-8" />
                Add Sale
            </h1>

            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="customer">Customer *</Label>
                            <div className="flex gap-2">
                                <Select defaultValue="walk-in">
                                    <SelectTrigger id="customer">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue />
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
                                        <DialogHeader><DialogTitle>Add New Customer</DialogTitle><DialogDescription>Quickly add a new customer.</DialogDescription></DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2"><Label htmlFor="new-customer-name">Name *</Label><Input id="new-customer-name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Customer Name" /></div>
                                            <div className="space-y-2"><Label htmlFor="new-customer-mobile">Mobile Number *</Label><Input id="new-customer-mobile" value={newCustomerMobile} onChange={(e) => setNewCustomerMobile(e.target.value)} placeholder="Mobile Number" /></div>
                                            <div className="space-y-2"><Label htmlFor="new-customer-email">Email</Label><Input id="new-customer-email" type="email" value={newCustomerEmail} onChange={(e) => setNewCustomerEmail(e.target.value)} placeholder="Email Address" /></div>
                                            <div className="space-y-2"><Label htmlFor="new-customer-address">Address</Label><Textarea id="new-customer-address" value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} placeholder="Customer Address" /></div>
                                        </div>
                                        <DialogFooter><Button variant="secondary" onClick={() => setIsAddCustomerOpen(false)}>Cancel</Button><Button onClick={handleSaveCustomer}>Save Customer</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="commission-agent">Commission Agent</Label>
                             <Select>
                                <SelectTrigger id="commission-agent"><SelectValue placeholder="Select Agent" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {commissionProfiles.map(agent => (
                                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                         <div className="space-y-2">
                            <Label htmlFor="sale-date">Sale Date *</Label>
                            <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-50">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{currentDate}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="selling-price-group">Selling Price Group</Label>
                             <Select>
                                 <SelectTrigger id="selling-price-group"><SelectValue placeholder="Default Selling Price" /></SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="default">Default Selling Price</SelectItem>
                                     <SelectItem value="local">Local</SelectItem>
                                 </SelectContent>
                             </Select>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter Product name / SKU / Scan bar code" className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1">
                                        {searchResults.map(product => (
                                            <div key={product.id} className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center text-sm" onClick={() => handleAddProduct(product)}>
                                                <span>{product.name} ({product.sku})</span>
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button size="icon" className="flex-shrink-0"><Plus className="w-4 h-4"/></Button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="kitchen-order" />
                        <Label htmlFor="kitchen-order" className="font-normal flex items-center gap-1">Kitchen Order <Info className="w-3 h-3 text-muted-foreground" /></Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead className="text-center w-12"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {saleItems.length > 0 ? saleItems.map((item, index) => (
                                    <TableRow key={item.product.id}>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.product.id, 'quantity', parseInt(e.target.value))} className="w-24 h-9" /></TableCell>
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
                                        <TableCell colSpan={5} className="text-center h-24">No products added yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="discount-amount" className="flex items-center gap-1">Discount (-):</Label>
                                    <Input 
                                        id="discount-amount" 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={discount || ''}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="order-tax" className="flex items-center gap-1">Order Tax (+):</Label>
                                    <Select onValueChange={(value) => setTaxPercentage(Number(value))}>
                                        <SelectTrigger id="order-tax"><SelectValue placeholder="Select Tax"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">None</SelectItem>
                                            <SelectItem value="5">GST@5%</SelectItem>
                                            <SelectItem value="10">VAT@10%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-charges" className="flex items-center gap-1">Shipping (+):</Label>
                                    <Input 
                                        id="shipping-charges" 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={shipping || ''}
                                        onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-md space-y-2 text-sm">
                            <div className="flex justify-between"><span>Items: <b>{totalItems}</b> ({totalItems})</span> <span>Total: <b>${subtotal.toFixed(2)}</b></span></div>
                            <Separator/>
                            <div className="flex justify-between"><span>Discount:</span><span>(-) ${discount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Order Tax:</span><span>(+) ${taxAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Shipping:</span><span>(+) ${shipping.toFixed(2)}</span></div>
                            <Separator/>
                            <div className="flex justify-between font-bold text-base">
                                <span>Total Payable:</span>
                                <span>${totalPayable.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">Add to POS</Button>
            </div>

            <AppFooter />
        </div>
    );
}
