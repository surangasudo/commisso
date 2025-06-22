'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Undo, Search, Plus, Trash2 } from "lucide-react";
import { detailedProducts, type DetailedProduct } from '@/lib/data';

type ReturnItem = {
  product: DetailedProduct;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
};

export default function AddPurchaseReturnPage() {
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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
                purchasePrice: product.unitPurchasePrice,
                subtotal: product.unitPurchasePrice,
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
                return { ...item, quantity: newQuantity, subtotal: newQuantity * item.purchasePrice };
            }
            return item;
        }));
    };

    const grandTotal = returnItems.reduce((acc, item) => acc + item.subtotal, 0);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Undo className="w-8 h-8" />
                Add Purchase Return
            </h1>

            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier *</Label>
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
                            <Label htmlFor="reference-no">Reference No:</Label>
                            <Input id="reference-no" placeholder="e.g. PR2025/0001" />
                            <p className="text-xs text-muted-foreground">Leave blank to auto generate.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Products to Return</CardTitle>
                    <CardDescription>Search for products to add to this return.</CardDescription>
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
                                    <TableHead className="w-[50%]">Product</TableHead>
                                    <TableHead>Return Quantity</TableHead>
                                    <TableHead>Purchase Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead className="text-center"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
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
                                        <TableCell>${item.purchasePrice.toFixed(2)}</TableCell>
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
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold">Net Total Amount:</TableCell>
                                    <TableCell className="font-bold">${grandTotal.toFixed(2)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
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
