'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Undo, Search, Plus, Trash2, Calendar, User } from "lucide-react";
import { detailedProducts, type DetailedProduct, customers } from '@/lib/data';

type ReturnItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export default function AddSellReturnPage() {
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const date = new Date();
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        setCurrentDate(formattedDate);
    }, []);

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

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Undo className="w-8 h-8" />
                Add Sell Return
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Return Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="customer">Customer *</Label>
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
                            <Label htmlFor="invoice-no">Invoice No.</Label>
                            <Input id="invoice-no" placeholder="Invoice No." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="date">Return Date *</Label>
                            <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-100 cursor-not-allowed">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{currentDate}</span>
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
                <Button size="lg">Save</Button>
            </div>

            <div className="text-center text-xs text-slate-400 p-1">
                Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
            </div>
        </div>
    );
}
