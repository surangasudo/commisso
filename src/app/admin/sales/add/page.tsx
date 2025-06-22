'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, Info, User, ShoppingBag, Calendar, PlusCircle, X } from "lucide-react";
import { detailedProducts, type DetailedProduct } from '@/lib/data';
import { customers } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';

type SaleItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
};

export default function AddSalePage() {
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [additionalExpenses, setAdditionalExpenses] = useState<{ id: number, name: string, amount: string }[]>([]);

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
    
    const addAdditionalExpense = () => {
        setAdditionalExpenses([...additionalExpenses, { id: Date.now(), name: '', amount: '' }]);
    };

    const removeAdditionalExpense = (id: number) => {
        setAdditionalExpenses(additionalExpenses.filter(exp => exp.id !== id));
    };
    
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
                                <Button size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Billing Address:</h4>
                                <p className="text-sm text-muted-foreground">Walk-in Customer, <br/>Linking Street, Phoenix, Arizona, USA</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Shipping Address:</h4>
                                <p className="text-sm text-muted-foreground">Walk-in Customer, <br/>Linking Street, Phoenix, Arizona, USA</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pay-term" className="flex items-center gap-1">Pay term: <Info className="w-3 h-3 text-muted-foreground" /></Label>
                                <div className="flex gap-2">
                                    <Input id="pay-term-value" type="number" placeholder="e.g. 30" />
                                    <Select defaultValue="days">
                                        <SelectTrigger id="pay-term-unit" className="w-[120px]">
                                            <SelectValue />
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
                                <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{currentDate}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sale-status">Status *</Label>
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
                            <div className="space-y-2">
                                <Label htmlFor="invoice-scheme">Invoice scheme:</Label>
                                <Select defaultValue="Default">
                                    <SelectTrigger id="invoice-scheme"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Default">Default</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice-no">Invoice No.:</Label>
                                <Input id="invoice-no" placeholder="Leave blank to auto generate" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attach-document">Attach Document:</Label>
                                <Input id="attach-document" type="file" />
                                <p className="text-xs text-muted-foreground">Max File size: 5MB</p>
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
                                    <TableHead className="text-center w-12"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {saleItems.length > 0 ? saleItems.map((item, index) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                             <Input id="discount-amount" type="number" placeholder="10.00" />
                        </div>
                        <div className="flex items-end"><p className="text-sm">Discount Amount(-): $0.00</p></div>
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
                    <div className="space-y-2"><Label>Shipping Details</Label><Input/></div>
                    <div className="space-y-2"><Label>Shipping Address</Label><Input/></div>
                    <div className="space-y-2"><Label>Shipping Charges</Label><Input type="number"/></div>
                    <div className="space-y-2"><Label>Shipping Status</Label><Select><SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger></Select></div>
                    <div className="space-y-2"><Label>Delivered To</Label><Input/></div>
                    <div className="space-y-2"><Label>Delivery Person</Label><Select><SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger></Select></div>
                    <div className="space-y-2 md:col-span-2"><Label>Shipping Document</Label><Input type="file" /></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Additional Expenses</CardTitle>
                        <Button variant="outline" onClick={addAdditionalExpense}><PlusCircle className="mr-2 h-4 w-4" /> Add additional expenses</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {additionalExpenses.map((exp, index) => (
                         <div key={exp.id} className="flex items-end gap-2 mb-2">
                            <div className="flex-1 space-y-2"><Label>Additional expense name</Label><Input/></div>
                            <div className="flex-1 space-y-2"><Label>Amount</Label><Input type="number" /></div>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeAdditionalExpense(exp.id)}><X/></Button>
                         </div>
                    ))}
                    <div className="text-right font-bold mt-4">Total Payable: $0.00</div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Add Payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount *:</Label>
                            <Input id="amount" type="number" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment-date">Paid on *:</Label>
                             <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{currentDate}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment-method">Payment method *:</Label>
                            <Select>
                                <SelectTrigger id="payment-method"><SelectValue placeholder="Cash" /></SelectTrigger>
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
                            <Select><SelectTrigger id="payment-account"><SelectValue placeholder="None" /></SelectTrigger></Select>
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="payment-note">Payment note:</Label>
                            <Textarea id="payment-note" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-6 mt-4">
                        <div className="font-bold text-lg">Change Return: $0.00</div>
                        <div className="font-bold text-lg text-right">Balance: $0.00</div>
                     </div>
                </CardContent>
            </Card>
      
            <div className="flex justify-end gap-2">
                <Button size="lg" variant="default">Save</Button>
                <Button size="lg" variant="default" className="bg-green-600 hover:bg-green-700">Save and print</Button>
            </div>

            <div className="text-center text-xs text-slate-400 p-1">
                Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
            </div>
        </div>
    );
}
