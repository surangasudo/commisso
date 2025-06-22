'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SlidersHorizontal, Search, Plus, Trash2, Info, Calendar } from "lucide-react";
import { detailedProducts, type DetailedProduct } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';

type AdjustmentItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
};

export default function AddStockAdjustmentPage() {
    const [adjustmentItems, setAdjustmentItems] = useState<AdjustmentItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');

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
        if (!adjustmentItems.some(item => item.product.id === product.id)) {
            setAdjustmentItems([...adjustmentItems, {
                product,
                quantity: 1,
                unitPrice: product.sellingPrice,
            }]);
        }
        setSearchTerm('');
    };
    
    const handleRemoveItem = (productId: string) => {
        setAdjustmentItems(adjustmentItems.filter(item => item.product.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setAdjustmentItems(adjustmentItems.map(item =>
            item.product.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ));
    };

    const calculateSubtotal = (item: AdjustmentItem) => {
        return item.quantity * item.unitPrice;
    }

    const totalAmount = adjustmentItems.reduce((acc, item) => acc + calculateSubtotal(item), 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <SlidersHorizontal className="w-8 h-8" />
        Add Stock Adjustment
      </h1>

      <Card>
        <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="location">Business Location:*</Label>
                    <Select>
                        <SelectTrigger id="location">
                            <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="awesome-shop">Awesome Shop</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reference-no">Reference No:</Label>
                    <Input id="reference-no" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Date:*</Label>
                     <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-100 cursor-not-allowed">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{currentDate}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="adjustment-type" className="flex items-center gap-1">Adjustment type:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                    <Select>
                        <SelectTrigger id="adjustment-type">
                            <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
             <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products for stock adjustment"
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
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead className="text-center w-[50px]"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {adjustmentItems.length > 0 ? adjustmentItems.map(item => (
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
                                <TableCell className="font-semibold">${calculateSubtotal(item).toFixed(2)}</TableCell>
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
                     <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">Total Amount:</TableCell>
                        <TableCell className="font-bold">${totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                </Table>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="total-recovered" className="flex items-center gap-1">Total amount recovered: <Info className="w-3 h-3 text-muted-foreground" /></Label>
                <Input id="total-recovered" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="reason">Reason:</Label>
                <Textarea id="reason" placeholder="Reason" />
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
