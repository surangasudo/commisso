'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, Info, User, ShoppingBag } from "lucide-react";
import { detailedProducts, type DetailedProduct } from '@/lib/data';
import { customers } from '@/lib/data';

type SaleItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
};

export default function AddSalePage() {
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const searchResults = searchTerm
    ? detailedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5) // Limit results
    : [];

    const handleAddProduct = (product: DetailedProduct) => {
        if (!saleItems.some(item => item.product.id === product.id)) {
            setSaleItems([...saleItems, {
                product,
                quantity: 1,
                unitPrice: product.sellingPrice,
            }]);
        }
        setSearchTerm('');
    };
    
    const handleRemoveItem = (productId: string) => {
        setSaleItems(saleItems.filter(item => item.product.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setSaleItems(saleItems.map(item =>
            item.product.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ));
    };
    
    const handlePriceChange = (productId: string, price: number) => {
        setSaleItems(saleItems.map(item =>
            item.product.id === productId ? { ...item, unitPrice: Math.max(0, price) } : item
        ));
    };

    const subtotal = saleItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const discount = 0; // Placeholder
    const orderTax = 0; // Placeholder
    const grandTotal = subtotal - discount + orderTax;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <ShoppingBag className="w-8 h-8" />
        Add Sale
      </h1>

      <Card>
        <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="customer" className="flex items-center gap-1">Customer * <Info className="w-3 h-3 text-muted-foreground" /></Label>
                    <div className="flex gap-2">
                        <Select>
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
                        <Button size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="invoice-no">Invoice No:</Label>
                    <Input id="invoice-no" placeholder="e.g. INV2025/0001" />
                    <p className="text-xs text-muted-foreground">Leave blank to auto generate.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sale-date">Sale Date *</Label>
                    <Input id="sale-date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sale-status">Sale Status *</Label>
                    <Select defaultValue="Final">
                        <SelectTrigger id="sale-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Final">Final</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Quotation">Quotation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="relative">
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
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead className="text-center"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {saleItems.length > 0 ? saleItems.map(item => (
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
                                        value={item.unitPrice} 
                                        onChange={e => handlePriceChange(item.product.id, parseFloat(e.target.value) || 0)}
                                        className="w-32 h-9"
                                    />
                                </TableCell>
                                <TableCell className="font-semibold">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
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
                        <Label htmlFor="order-tax" className="flex items-center gap-1 text-muted-foreground">Order Tax: <Info className="w-3 h-3"/></Label>
                        <div className="w-2/3">
                            <Select>
                                <SelectTrigger id="order-tax" className="h-9">
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
                Total Amount: <span className="text-green-600">${grandTotal.toFixed(2)}</span>
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
        <Button size="lg" variant="default" className="bg-green-600 hover:bg-green-700">Save & Finalize</Button>
        <Button size="lg" variant="secondary">Save as Draft</Button>
      </div>

       <div className="text-center text-xs text-slate-400 p-1">
        Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
      </div>
    </div>
  );
}
