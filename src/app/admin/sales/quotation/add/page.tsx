'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, User, Calendar, FilePlus, Info, PlusCircle, X } from "lucide-react";
import { type DetailedProduct, type Customer, type User as AppUser, type TaxRate, initialTaxRates } from '@/lib/data'; // Ensure User is imported if needed, or remove if unused locally beyond display
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
import { AppFooter } from '@/components/app-footer';
import { getProducts } from '@/services/productService';
import { getCustomers, addCustomer as addCustomerService } from '@/services/customerService';
import { addQuotation } from '@/services/saleService';
import { useRouter } from 'next/navigation';

type QuotationItem = {
    product: DetailedProduct;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
};

export default function AddQuotationPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [additionalExpenses, setAdditionalExpenses] = useState<{ id: number, name: string, amount: string }[]>([]);

    // Data State
    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [taxRates, setTaxRates] = useState<TaxRate[]>(initialTaxRates); // Using static for now, or fetch if available service exists

    // Form State
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [quotationNo, setQuotationNo] = useState('');
    const [payTerm, setPayTerm] = useState('');
    const [payTermUnit, setPayTermUnit] = useState('days');
    const [discountType, setDiscountType] = useState<'Fixed' | 'Percentage'>('Percentage');
    const [discountAmount, setDiscountAmount] = useState<string>('0');
    const [orderTaxId, setOrderTaxId] = useState<string>('none');
    const [shippingDetails, setShippingDetails] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCharges, setShippingCharges] = useState<string>('0');
    const [shippingStatus, setShippingStatus] = useState('');
    const [deliveredTo, setDeliveredTo] = useState('');
    const [sellNote, setSellNote] = useState('');

    // State for the Add Customer Dialog
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerMobile, setNewCustomerMobile] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [newCustomerAddress, setNewCustomerAddress] = useState('');

    useEffect(() => {
        const now = new Date();
        const formatted = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setCurrentDate(formatted);

        // Fetch Data
        getProducts().then(setProducts).catch(console.error);
        getCustomers().then(setCustomers).catch(console.error);
        // getTaxRates().then(setTaxRates); // If service existed
    }, []);

    const searchResults = searchTerm
        ? products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5)
        : [];

    const handleAddProduct = (product: DetailedProduct) => {
        if (!quotationItems.some(item => item.product.id === product.id)) {
            setQuotationItems([...quotationItems, {
                product,
                quantity: 1,
                unitPrice: product.sellingPrice,
                discount: 0,
                tax: 0, // Should ideally fetch product tax settings
            }]);
        }
        setSearchTerm('');
    };

    const handleRemoveItem = (productId: string) => {
        setQuotationItems(quotationItems.filter(item => item.product.id !== productId));
    };

    const handleItemChange = (productId: string, field: keyof QuotationItem, value: any) => {
        setQuotationItems(quotationItems.map(item =>
            item.product.id === productId ? { ...item, [field]: value } : item
        ));
    };

    const calculateItemSubtotal = (item: QuotationItem) => {
        return item.quantity * item.unitPrice;
    }

    // Calculations
    const totalItems = quotationItems.reduce((acc, item) => acc + item.quantity, 0);
    const itemsSubtotal = quotationItems.reduce((acc, item) => acc + calculateItemSubtotal(item), 0);

    const discountValue = parseFloat(discountAmount) || 0;
    const calculateOrderDiscount = () => {
        if (discountType === 'Percentage') {
            return itemsSubtotal * (discountValue / 100);
        }
        return discountValue;
    };
    const orderDiscountAmt = calculateOrderDiscount();

    const getOrderTaxRate = () => {
        if (orderTaxId === 'none') return 0;
        const tax = taxRates.find(t => t.id === orderTaxId);
        return tax ? tax.rate : 0;
    };
    const orderTaxRate = getOrderTaxRate();
    const calculateOrderTax = (amountAfterDiscount: number) => {
        return amountAfterDiscount * (orderTaxRate / 100);
    };
    const amountAfterDiscount = Math.max(0, itemsSubtotal - orderDiscountAmt);
    const orderTaxAmt = calculateOrderTax(amountAfterDiscount);

    const shippingChargesVal = parseFloat(shippingCharges) || 0;

    const totalPayable = amountAfterDiscount + orderTaxAmt + shippingChargesVal;

    const handleSaveQuotation = async () => {
        if (quotationItems.length === 0) {
            toast({
                title: "Quotation is empty",
                description: "Please add products to the quotation before saving.",
                variant: "destructive",
            });
            return;
        }

        if (!selectedCustomerId) {
            toast({
                title: "Customer Required",
                description: "Please select a customer.",
                variant: "destructive",
            });
            return;
        }

        const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

        const quotationData = {
            date: new Date().toISOString(),
            invoiceNo: quotationNo || 'PENDING', // Will be generated if needed or kept as draft/quote
            customerId: selectedCustomerId,
            customerName: selectedCustomer ? selectedCustomer.name : 'Unknown',
            contactNumber: selectedCustomer ? selectedCustomer.mobile : '',
            location: 'Awesome Shop', // Default for now
            paymentStatus: 'Due' as const, // Quotations usually don't have payment immediately
            paymentMethod: 'Quotation',
            totalAmount: totalPayable,
            totalPaid: 0,
            sellDue: totalPayable,
            sellReturnDue: 0,
            shippingStatus: shippingStatus || null,
            totalItems: totalItems,
            addedBy: 'Admin', // Get actual user
            sellNote: sellNote,
            staffNote: null,
            shippingDetails: shippingDetails,
            taxAmount: orderTaxAmt,
            items: quotationItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                tax: item.tax // This is 0 in UI for now
            })),
            isQuotation: true, // Marker for quotation if needed, though separate collection used
        };

        try {
            await addQuotation(quotationData);
            toast({
                title: "Success!",
                description: "Your quotation has been saved successfully.",
            });
            setQuotationItems([]);
            // Optionally redirect
            // router.push('/admin/sales/quotation');
        } catch (error) {
            console.error("Error saving quotation:", error);
            toast({
                title: "Error",
                description: "Failed to save quotation.",
                variant: "destructive",
            });
        }
    }

    const addAdditionalExpense = () => {
        setAdditionalExpenses([...additionalExpenses, { id: Date.now(), name: '', amount: '' }]);
    };

    // const removeAdditionalExpense = (id: number) => {
    //     setAdditionalExpenses(additionalExpenses.filter(exp => exp.id !== id));
    // };

    const handleSaveCustomer = async () => {
        if (!newCustomerName || !newCustomerMobile) {
            toast({
                title: "Error",
                description: "Name and Mobile Number are required.",
                variant: "destructive",
            });
            return;
        }

        const newCustomer = {
            name: newCustomerName,
            mobile: newCustomerMobile,
            email: newCustomerEmail || null,
            address: newCustomerAddress,
            contactId: `C-${Date.now()}`, // Simple ID generation
            taxNumber: '',
            customerGroup: 'Default',
            openingBalance: 0,
            addedOn: new Date().toISOString(),
            totalSaleDue: 0,
            totalSaleReturnDue: 0
        };

        try {
            await addCustomerService(newCustomer, 'CUST');
            toast({
                title: "Customer Added",
                description: `${newCustomerName} has been successfully added.`,
            });

            // Refresh customer list
            getCustomers().then(setCustomers).catch(console.error);

            // Reset form and close dialog
            setNewCustomerName('');
            setNewCustomerMobile('');
            setNewCustomerEmail('');
            setNewCustomerAddress('');
            setIsAddCustomerOpen(false);
        } catch (error) {
            console.error("Error adding customer:", error);
            toast({
                title: "Error",
                description: "Failed to add customer.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FilePlus className="w-8 h-8" />
                Add Quotation
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
                                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                    <SelectTrigger id="customer">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select Customer" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                                        {customers.map(customer => (
                                            <SelectItem key={customer.id} value={customer.id}>{customer.name} ({customer.mobile})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add New Customer</DialogTitle>
                                            <DialogDescription>
                                                Quickly add a new customer to the system.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-customer-name">Name *</Label>
                                                <Input id="new-customer-name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Customer Name" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-customer-mobile">Mobile Number *</Label>
                                                <Input id="new-customer-mobile" value={newCustomerMobile} onChange={(e) => setNewCustomerMobile(e.target.value)} placeholder="Mobile Number" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-customer-email">Email</Label>
                                                <Input id="new-customer-email" type="email" value={newCustomerEmail} onChange={(e) => setNewCustomerEmail(e.target.value)} placeholder="Email Address" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-customer-address">Address</Label>
                                                <Textarea id="new-customer-address" value={newCustomerAddress} onChange={(e) => setNewCustomerAddress(e.target.value)} placeholder="Customer Address" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="secondary" onClick={() => setIsAddCustomerOpen(false)}>Cancel</Button>
                                            <Button onClick={handleSaveCustomer}>Save Customer</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Billing Address:</h4>
                                <p className="text-sm text-muted-foreground">
                                    {selectedCustomerId && customers.find(c => c.id === selectedCustomerId)?.address || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Shipping Address:</h4>
                                <p className="text-sm text-muted-foreground">
                                    {selectedCustomerId && customers.find(c => c.id === selectedCustomerId)?.address || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pay-term" className="flex items-center gap-1">Pay term: <Info className="w-3 h-3 text-muted-foreground" /></Label>
                                <div className="flex gap-2">
                                    <Input id="pay-term-value" type="number" placeholder="e.g. 30" value={payTerm} onChange={e => setPayTerm(e.target.value)} />
                                    <Select value={payTermUnit} onValueChange={setPayTermUnit}>
                                        <SelectTrigger id="pay-term-unit" className="w-[120px]">
                                            <SelectValue placeholder="Please Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="days">Days</SelectItem>
                                            <SelectItem value="months">Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quotation-date">Quotation Date *</Label>
                                <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-100">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{currentDate}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice-scheme">Invoice scheme:</Label>
                                <Select defaultValue="Default">
                                    <SelectTrigger id="invoice-scheme"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Default">Default</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quotation-no">Quotation No.:</Label>
                                <Input id="quotation-no" placeholder="Keep blank to auto generate" value={quotationNo} onChange={e => setQuotationNo(e.target.value)} />
                            </div>
                            <div className="space-y-2 col-span-full">
                                <Label htmlFor="attach-document">Attach Document:</Label>
                                <Input id="attach-document" type="file" />
                                <p className="text-xs text-muted-foreground">Max File size: 5MB. Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</p>
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
                                    <TableHead className="text-center w-12"><X className="w-4 h-4 mx-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotationItems.length > 0 ? quotationItems.map((item, index) => (
                                    <TableRow key={item.product.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.product.id, 'quantity', parseInt(e.target.value))} className="w-24 h-9" /></TableCell>
                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>0.00</TableCell>
                                        <TableCell>0.00</TableCell>
                                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell>${calculateItemSubtotal(item).toFixed(2)}</TableCell>
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
                        Items: {totalItems.toFixed(2)} Total: ${itemsSubtotal.toFixed(2)}
                    </div>
                    <hr className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="discount-type" className="flex items-center gap-1">Discount Type:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                            <Select value={discountType} onValueChange={(v: 'Fixed' | 'Percentage') => setDiscountType(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fixed">Fixed</SelectItem>
                                    <SelectItem value="Percentage">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount-amount" className="flex items-center gap-1">Discount Amount:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                            <Input id="discount-amount" type="number" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} />
                        </div>
                        <div>
                            <p className="text-sm mt-6">Discount Amount(-): ${orderDiscountAmt.toFixed(2)}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="order-tax" className="flex items-center gap-1">Order Tax:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                            <Select value={orderTaxId} onValueChange={setOrderTaxId}>
                                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {taxRates.map(tax => (
                                        <SelectItem key={tax.id} value={tax.id}>{tax.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <p className="text-sm">Order Tax(+): ${orderTaxAmt.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="sell-note">Terms & Conditions</Label>
                        <Textarea id="sell-note" placeholder="Terms & Conditions" value={sellNote} onChange={e => setSellNote(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2"><Label>Shipping Details</Label><Textarea placeholder="Shipping Details" value={shippingDetails} onChange={e => setShippingDetails(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Shipping Address</Label><Textarea placeholder="Shipping Address" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Shipping Charges</Label><Input type="number" value={shippingCharges} onChange={e => setShippingCharges(e.target.value)} /></div>
                    <div className="space-y-2">
                        <Label>Shipping Status</Label>
                        <Select value={shippingStatus} onValueChange={setShippingStatus}>
                            <SelectTrigger><SelectValue placeholder="Please Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ordered">Ordered</SelectItem>
                                <SelectItem value="packed">Packed</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>Delivered To</Label><Input placeholder="Delivered To" value={deliveredTo} onChange={e => setDeliveredTo(e.target.value)} /></div>

                    <div className="space-y-2 md:col-span-1"><Label>Shipping Document</Label><Input type="file" /></div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center p-4 border rounded-md">
                <Button variant="outline" onClick={addAdditionalExpense}><PlusCircle className="mr-2 h-4 w-4" /> Add additional expenses</Button>
                <div className="text-right font-bold">Total Payable: ${totalPayable.toFixed(2)}</div>
            </div>

            <div className="flex justify-end gap-2">
                <Button size="lg" variant="default" onClick={handleSaveQuotation}>Save as Quotation</Button>
            </div>

            <AppFooter />
        </div>
    );
}
