'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, User, Calendar, FilePlus } from "lucide-react";
import { detailedProducts, type DetailedProduct } from '@/lib/data';
import { customers } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type DraftItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
};

export default function AddDraftPage() {
    const { toast } = useToast();
    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
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
        if (!draftItems.some(item => item.product.id === product.id)) {
            setDraftItems([...draftItems, {
                product,
                quantity: 1,
                unitPrice: product.sellingPrice,
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
        // In a real app, this would save the draft to a server.
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

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FilePlus className="w-8 h-8" />
                Add Draft
            </h1>

            <Card>
                 <CardHeader>
                    <CardTitle>Create a New Sales Draft</CardTitle>
                    <CardDescription>Drafts can be saved and finalized into an invoice later.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="customer">Customer *</Label>
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
                        </div>
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
                        <div className="space-y-2">
                            <Label htmlFor="draft-date">Draft Date *</Label>
                            <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{currentDate}</span>
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
                                    <TableHead className="min-w-[250px]">Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead className="text-center w-12"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {draftItems.length > 0 ? draftItems.map((item) => (
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
                                        <TableCell colSpan={5} className="text-center h-24">No products added to the draft.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="mt-4 flex justify-between items-center">
                        <div className="space-y-2 w-1/2">
                            <Label htmlFor="draft-note">Draft Note</Label>
                            <Textarea id="draft-note" placeholder="Add any relevant notes for this draft..." />
                        </div>
                        <div className="text-right text-sm">
                            <div className="font-medium">Total Items: {totalItems.toFixed(2)}</div>
                            <div className="font-bold text-lg">Total Amount: ${subtotal.toFixed(2)}</div>
                        </div>
                    </div>
                    
                </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2">
                <Button size="lg" onClick={handleSaveDraft}>Save Draft</Button>
            </div>

            <div className="text-center text-xs text-slate-400 p-1">
                Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
            </div>
        </div>
    );
}
