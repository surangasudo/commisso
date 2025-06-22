'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightLeft, Search, Plus, Trash2, Info, Calendar as CalendarIcon } from "lucide-react";
import { detailedProducts, type DetailedProduct } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type TransferItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
};

export default function AddStockTransferPage() {
    const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [shippingCharges, setShippingCharges] = useState(0);
    
    const searchResults = searchTerm
    ? detailedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

    const handleAddProduct = (product: DetailedProduct) => {
        if (!transferItems.some(item => item.product.id === product.id)) {
            setTransferItems([...transferItems, {
                product,
                quantity: 1,
                unitPrice: product.sellingPrice,
            }]);
        }
        setSearchTerm('');
    };
    
    const handleRemoveItem = (productId: string) => {
        setTransferItems(transferItems.filter(item => item.product.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setTransferItems(transferItems.map(item =>
            item.product.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ));
    };
    
    const calculateSubtotal = (item: TransferItem) => {
        return item.quantity * item.unitPrice;
    }

    const totalAmount = transferItems.reduce((acc, item) => acc + calculateSubtotal(item), 0);
    const finalTotal = totalAmount + shippingCharges;
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <ArrowRightLeft className="w-8 h-8" />
        Add Stock Transfer
      </h1>

      <Card>
        <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="date">Date & Time *</Label>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "flex-1 justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(newDate) => {
                                        if (!newDate) return;
                                        const oldDate = date || new Date();
                                        newDate.setHours(oldDate.getHours());
                                        newDate.setMinutes(oldDate.getMinutes());
                                        newDate.setSeconds(oldDate.getSeconds());
                                        setDate(newDate);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            type="time"
                            className="w-32"
                            value={date ? format(date, "HH:mm") : ""}
                            onChange={(e) => {
                                if (!e.target.value) return;
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = date ? new Date(date.getTime()) : new Date();
                                newDate.setHours(parseInt(hours, 10));
                                newDate.setMinutes(parseInt(minutes, 10));
                                setDate(newDate);
                            }}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reference-no">Reference No:</Label>
                    <Input id="reference-no" placeholder="e.g. ST2025/0001" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-1">Status:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                    <Select>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-transit">In-Transit</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location-from">Location (From):*</Label>
                    <Select>
                        <SelectTrigger id="location-from">
                            <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="awesome-shop">Awesome Shop</SelectItem>
                            <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                            <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location-to">Location (To):*</Label>
                    <Select>
                        <SelectTrigger id="location-to">
                            <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="awesome-shop">Awesome Shop</SelectItem>
                            <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                            <SelectItem value="warehouse-b">Warehouse B</SelectItem>
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
                        {transferItems.length > 0 ? transferItems.map(item => (
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
                        <TableCell colSpan={4} className="text-right font-bold">Total:</TableCell>
                        <TableCell className="font-bold">${totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                </Table>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="shipping-charges">Shipping Charges:</Label>
                    <Input 
                        id="shipping-charges" 
                        type="number"
                        value={shippingCharges}
                        onChange={(e) => setShippingCharges(Number(e.target.value) || 0)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="additional-notes">Additional Notes:</Label>
                    <Textarea id="additional-notes" />
                </div>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">Total Amount:</p>
                <p className="text-2xl font-bold">${finalTotal.toFixed(2)}</p>
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
