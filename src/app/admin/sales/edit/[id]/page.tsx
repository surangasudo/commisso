
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, Info, User, ShoppingBag, Calendar, PlusCircle, X, FileEdit } from "lucide-react";
import { type DetailedProduct, customers, users, type Sale, type SaleItem } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { getSale, updateSale } from '@/services/saleService';
import { getProducts } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';

type SaleItemWithProduct = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
};

export default function EditSalePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [originalSale, setOriginalSale] = useState<Sale | null>(null);
    const [sale, setSale] = useState<Sale | null>(null);
    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [saleItems, setSaleItems] = useState<SaleItemWithProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // State for the Add Customer Dialog
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerMobile, setNewCustomerMobile] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [newCustomerAddress, setNewCustomerAddress] = useState('');
    
    const [sellNote, setSellNote] = useState('');
    const [shippingDetails, setShippingDetails] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [saleData, productsData] = await Promise.all([
                    getSale(id),
                    getProducts()
                ]);

                if (!saleData) {
                    toast({ title: "Error", description: "Sale not found.", variant: "destructive" });
                    router.push('/admin/sales/all');
                    return;
                }
                
                const itemsWithDetails: SaleItemWithProduct[] = saleData.items.map(item => {
                    const product = productsData.find(p => p.id === item.productId);
                    return {
                        product: product || {} as DetailedProduct,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discount: 0,
                        tax: item.tax,
                    }
                }).filter(item => item.product.id);

                setSale(saleData);
                setOriginalSale(saleData);
                setProducts(productsData);
                setSaleItems(itemsWithDetails);
                setSellNote(saleData.sellNote || '');
                setShippingDetails(saleData.shippingDetails || '');

            } catch (error) {
                console.error("Failed to fetch sale data:", error);
                toast({ title: "Error", description: "Could not load sale details.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [id, router, toast]);
    
    const searchResults = searchTerm
    ? products.filter(p =>
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

    const handleItemChange = (productId: string, field: keyof SaleItemWithProduct, value: any) => {
        setSaleItems(saleItems.map(item =>
            item.product.id === productId ? { ...item, [field]: value } : item
        ));
    };

    const subtotal = useMemo(() => {
        return saleItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }, [saleItems]);
    
    const totalItems = useMemo(() => {
        return saleItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [saleItems]);

    const handleSaveCustomer = () => {
        // This is a placeholder as customer service is not fully implemented
        toast({
            title: "Feature not available",
            description: "Adding customers from this screen is not yet implemented.",
        });
        setIsAddCustomerOpen(false);
    };

    const handleSaveChanges = async () => {
        if (!sale || !originalSale) {
            toast({ title: "Error", description: "Sale data is not loaded.", variant: "destructive" });
            return;
        }

        const newTotalAmount = subtotal; // Simplified for now
        
        const updatedSaleData: Omit<Sale, 'id'> = {
            ...originalSale,
            items: saleItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                tax: item.tax,
            })),
            totalAmount: newTotalAmount,
            sellDue: newTotalAmount - originalSale.totalPaid,
            totalItems: totalItems,
            shippingDetails: shippingDetails,
            sellNote: sellNote,
        };

        try {
            await updateSale(id, updatedSaleData, originalSale);
            toast({
                title: "Success!",
                description: `Sale ${sale.invoiceNo} has been updated.`,
            });
            router.push('/admin/sales/all');
        } catch (error) {
            console.error("Failed to update sale:", error);
            toast({ title: "Error", description: "Failed to update sale.", variant: "destructive" });
        }
    };


    if (isLoading || !sale) {
        return (
            <div className="flex flex-col gap-6">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <FileEdit className="w-8 h-8" />
                    Edit Sale
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Please wait while we load the sale details.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileEdit className="w-8 h-8" />
                Edit Sale
            </h1>
            <CardDescription>
                Editing invoice: {sale.invoiceNo}
            </CardDescription>

            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="location">Business Location *</Label>
                            <Select defaultValue={sale.location}>
                                <SelectTrigger id="location"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Awesome Shop">Awesome Shop</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sale-date">Sale Date *</Label>
                            <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-50">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(sale.date).toLocaleString()}</span>
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
                                    <div key={product.id} className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center text-sm" onClick={() => handleAddProduct(product)}>
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
                                    <TableHead>#</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead className="text-center"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {saleItems.length > 0 ? saleItems.map((item, index) => (
                                    <TableRow key={item.product.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.product.id, 'quantity', parseInt(e.target.value))} className="w-24 h-9" /></TableCell>
                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50" onClick={() => handleRemoveItem(item.product.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No products in this sale.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="flex justify-end mt-2 text-sm font-medium">
                        Items: {totalItems.toFixed(2)} | Total: ${subtotal.toFixed(2)}
                    </div>
                    <hr className="my-4"/>
                     <div className="space-y-2 mt-4">
                        <Label htmlFor="sell-note">Sell Note</Label>
                        <Textarea id="sell-note" value={sellNote} onChange={(e) => setSellNote(e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>Shipping Details</Label>
                        <Textarea placeholder="Shipping Details" value={shippingDetails} onChange={(e) => setShippingDetails(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button size="lg" variant="default" onClick={handleSaveChanges}>Save Changes</Button>
            </div>

            <div className="text-center text-xs text-slate-400 p-1">
                Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
            </div>
        </div>
    );
}
