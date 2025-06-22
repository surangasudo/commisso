'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Plus, Trash2, Info } from "lucide-react";
import { detailedProducts, type DetailedProduct } from '@/lib/data';

type PurchaseItem = {
  product: DetailedProduct;
  quantity: number;
  purchasePrice: number;
};

export default function AddPurchasePage() {
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const searchResults = searchTerm
    ? detailedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5) // Limit results
    : [];

    const handleAddProduct = (product: DetailedProduct) => {
        if (!purchaseItems.some(item => item.product.id === product.id)) {
            setPurchaseItems([...purchaseItems, {
                product,
                quantity: 1,
                purchasePrice: product.unitPurchasePrice,
            }]);
        }
        setSearchTerm('');
    };
    
    const handleRemoveItem = (productId: string) => {
        setPurchaseItems(purchaseItems.filter(item => item.product.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setPurchaseItems(purchaseItems.map(item =>
            item.product.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ));
    };
    
    const handlePriceChange = (productId: string, price: number) => {
        setPurchaseItems(purchaseItems.map(item =>
            item.product.id === productId ? { ...item, purchasePrice: Math.max(0, price) } : item
        ));
    };

    const subtotal = purchaseItems.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
    const discount = 0; // Placeholder
    const purchaseTax = 0; // Placeholder
    const grandTotal = subtotal - discount + purchaseTax;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Download className="w-8 h-8" />
        Add Purchase
      </h1>

      <Card>
        <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <div className="flex gap-2">
                        <Select>
                            <SelectTrigger id="supplier">
                                <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="univer-suppliers">Univer Suppliers, Jackson Hill</SelectItem>
                                <SelectItem value="alpha-clothings">Alpha Clothings, Michael</SelectItem>
                                <SelectItem value="manhattan-clothing">Manhattan Clothing Ltd., Philip</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reference-no">Reference No:</Label>
                    <Input id="reference-no" placeholder="e.g. PO2025/0001" />
                    <p className="text-xs text-muted-foreground">Leave blank to auto generate.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="purchase-date">Purchase Date *</Label>
                    <Input id="purchase-date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="purchase-status">Purchase Status *</Label>
                    <Select defaultValue="Received">
                        <SelectTrigger id="purchase-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Received">Received</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Ordered">Ordered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Business Location *</Label>
                    <Select defaultValue="Awesome Shop">
                        <SelectTrigger id="location">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Awesome Shop">Awesome Shop</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="attach-document">Attach Document</Label>
                    <Input id="attach-document" type="file" />
                    <p className="text-xs text-muted-foreground">Max 2MB</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Add products to this purchase order.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
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
                            <TableHead className="w-[40%]">Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Purchase Price</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead className="text-center"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseItems.length > 0 ? purchaseItems.map(item => (
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
                                <TableCell>
                                     <Input 
                                        type="number" 
                                        value={item.purchasePrice} 
                                        onChange={e => handlePriceChange(item.product.id, parseFloat(e.target.value) || 0)}
                                        className="w-32 h-9"
                                    />
                                </TableCell>
                                <TableCell className="font-semibold">${(item.quantity * item.purchasePrice).toFixed(2)}</TableCell>
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
            
            <div className="flex justify-end mt-4">
                <div className="w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <Label htmlFor="discount-type" className="flex items-center gap-1 text-muted-foreground">Discount: <Info className="w-3 h-3"/></Label>
                        <div className="flex gap-2 w-2/3">
                            <Select defaultValue="Fixed">
                                <SelectTrigger id="discount-type" className="h-9">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fixed">Fixed</SelectItem>
                                    <SelectItem value="Percentage">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="number" placeholder="0.00" className="h-9" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="purchase-tax" className="flex items-center gap-1 text-muted-foreground">Purchase Tax: <Info className="w-3 h-3"/></Label>
                        <div className="w-2/3">
                            <Select>
                                <SelectTrigger id="purchase-tax" className="h-9">
                                    <SelectValue placeholder="Select Tax"/>
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="vat-10">VAT @10%</SelectItem>
                                    <SelectItem value="gst-5">GST @5%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <Label htmlFor="shipping-details" className="flex items-center gap-1 text-muted-foreground">Shipping: <Info className="w-3 h-3"/></Label>
                        <div className="w-2/3">
                            <Input id="shipping-details" placeholder="Shipping charges" className="h-9" />
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Add Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount *:</Label>
                    <Input id="amount" type="number" placeholder="0.00" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="payment-date">Paid on *:</Label>
                    <Input id="payment-date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment method *:</Label>
                    <Select>
                        <SelectTrigger id="payment-method">
                            <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="payment-account">Payment account:</Label>
                     <Select>
                        <SelectTrigger id="payment-account">
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="test-account">Test Account (Cash)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="font-bold text-xl text-right mt-6">
                Purchase due: <span className="text-red-600">${grandTotal.toFixed(2)}</span>
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button size="lg">Save</Button>
      </div>

       <div className="text-center text-xs text-slate-400 p-1">
        Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
      </div>
    </div>
  );
}
