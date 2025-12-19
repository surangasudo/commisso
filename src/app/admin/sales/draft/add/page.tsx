'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, User, Calendar, FilePlus, Info, PlusCircle, X, Monitor } from "lucide-react";
import { type DetailedProduct, type Customer, type Sale } from '@/lib/data';
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
import { addDraft } from '@/services/saleService';
import { useCurrency } from '@/hooks/use-currency';

type DraftItem = {
    product: DetailedProduct;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
};

export default function AddDraftPage() {
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    // Form State
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [discountType, setDiscountType] = useState('Percentage');
    const [discountAmount, setDiscountAmount] = useState('0');
    const [orderTaxId, setOrderTaxId] = useState('none');
    const [sellNote, setSellNote] = useState('');

    // Shipping State
    const [shippingDetails, setShippingDetails] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCharges, setShippingCharges] = useState('0');
    const [shippingStatus, setShippingStatus] = useState('');
    const [deliveredTo, setDeliveredTo] = useState('');

    // State for the Add Customer Dialog
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerMobile, setNewCustomerMobile] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [newCustomerAddress, setNewCustomerAddress] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const now = new Date();
        const formatted = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setCurrentDate(formatted);

        const loadData = async () => {
            try {
                const [productsData, customersData] = await Promise.all([
                    getProducts(),
                    getCustomers()
                ]);
                setProducts(productsData);
                setCustomers(customersData);
            } catch (error) {
                console.error("Failed to load initial data", error);
                toast({
                    title: "Error",
                    description: "Failed to load products or customers. Please refresh.",
                    variant: "destructive"
                });
            }
        };
        loadData();
    }, [toast]);

    const searchResults = searchTerm
        ? products.filter(p =>
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
                discount: 0,
                tax: 0,
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

    const calculateItemSubtotal = (item: DraftItem) => {
        return item.quantity * item.unitPrice;
    }

    const totalItems = draftItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = draftItems.reduce((acc, item) => acc + calculateItemSubtotal(item), 0);

    // Order level calculations
    const orderDiscount = discountType === 'Percentage'
        ? (subtotal * (parseFloat(discountAmount) || 0) / 100)
        : (parseFloat(discountAmount) || 0);

    const taxableAmount = subtotal - orderDiscount;
    const orderTaxRate = orderTaxId === 'vat-10' ? 0.10 : 0; // Hardcoded tax rate for demo
    const orderTax = taxableAmount * orderTaxRate;

    const shipping = parseFloat(shippingCharges) || 0;
    const totalPayable = taxableAmount + orderTax + shipping;

    const handleSaveDraft = async () => {
        if (draftItems.length === 0) {
            toast({
                title: "Draft is empty",
                description: "Please add products to the draft before saving.",
                variant: "destructive",
            });
            return;
        }

        if (!selectedCustomerId && selectedCustomerId !== 'walk-in') {
            toast({
                title: "Customer Required",
                description: "Please select a customer.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            const draftData: Omit<Sale, 'id'> = {
                invoiceNo: '', // Auto-generated by addDraft service now
                date: new Date().toISOString(),
                customerId: selectedCustomerId,
                customerName: customers.find(c => c.id === selectedCustomerId)?.name || 'Walk-in Customer',
                contactNumber: customers.find(c => c.id === selectedCustomerId)?.mobile || '',
                items: draftItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: calculateItemSubtotal(item),
                    discount: item.discount,
                    tax: item.tax
                })),
                totalAmount: totalPayable,
                paymentStatus: 'Due',
                paymentMethod: 'Draft',
                totalPaid: 0,
                sellDue: totalPayable,
                sellReturnDue: 0,
                location: 'Awesome Shop', // default
                addedBy: 'Admin', // default
                staffNote: '',
                totalItems: totalItems,
                // paymentReference is optional, undefined is fine
                sellNote: sellNote,
                shippingStatus: shippingStatus || null,
                shippingDetails: JSON.stringify({
                    details: shippingDetails,
                    address: shippingAddress,
                    charges: shipping,
                    deliveredTo: deliveredTo
                }),
                taxAmount: orderTax,
                commissionAgentIds: null,
            };

            await addDraft(draftData);

            toast({
                title: "Success!",
                description: "Your draft has been saved successfully.",
            });
            // Reset form
            setDraftItems([]);
            setSelectedCustomerId('');
            setSellNote('');
            setShippingCharges('0');
        } catch (error) {
            console.error("Error saving draft:", error);
            toast({
                title: "Error",
                description: "Failed to save draft. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    const handleSaveCustomer = async () => {
        if (!newCustomerName || !newCustomerMobile) {
            toast({
                title: "Error",
                description: "Name and Mobile Number are required.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Basic customer structure matching requirements
            const customerData: any = {
                name: newCustomerName,
                mobile: newCustomerMobile,
                email: newCustomerEmail,
                address: newCustomerAddress,
                contactId: `CUST-${Date.now()}`, // Temporary ID generation if service needs it, or service handles it
                createdAt: new Date().toISOString(),
                // Add other required fields with defaults
                openingBalance: 0,
                totalSaleDue: 0,
                totalSaleReturnDue: 0,
                customerGroup: 'default'
            };

            await addCustomerService(customerData, 'CUST'); // Assuming prefix is handled or passed

            toast({
                title: "Customer Added",
                description: `${newCustomerName} has been successfully added.`,
            });

            // Refresh customers
            const updatedCustomers = await getCustomers();
            setCustomers(updatedCustomers);

            // Allow selecting the new customer immediately
            // Needs to find the ID of the new customer, but for now just refresh is good enough.

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
                Add Draft
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
                                            <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
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
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sale-date">Sale Date *</Label>
                                <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-100">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{currentDate}</span>
                                </div>
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
                            <div className="absolute z-20 w-full bg-card border rounded-md shadow-lg mt-1 top-full">
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
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead className="text-center w-12"><X className="w-4 h-4 mx-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {draftItems.length > 0 ? draftItems.map((item, index) => (
                                    <TableRow key={item.product.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.product.id, 'quantity', parseInt(e.target.value))} className="w-24 h-9" /></TableCell>
                                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                        <TableCell>{formatCurrency(calculateItemSubtotal(item))}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50" onClick={() => handleRemoveItem(item.product.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No products added yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-end mt-2 text-sm font-medium">
                        Items: {totalItems.toFixed(2)} Total: {formatCurrency(subtotal)}
                    </div>
                    <hr className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="discount-type" className="flex items-center gap-1">Discount Type:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                            <Select value={discountType} onValueChange={setDiscountType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fixed">Fixed</SelectItem>
                                    <SelectItem value="Percentage">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount-amount" className="flex items-center gap-1">Discount Amount:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                            <Input id="discount-amount" type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
                        </div>
                        <div>
                            <p className="text-sm mt-6">Discount Amount(-): {formatCurrency(orderDiscount)}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="order-tax" className="flex items-center gap-1">Order Tax:* <Info className="w-3 h-3 text-muted-foreground" /></Label>
                            <Select value={orderTaxId} onValueChange={setOrderTaxId}>
                                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="vat-10">VAT@10%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <p className="text-sm">Order Tax(+): {formatCurrency(orderTax)}</p>
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="sell-note">Sell Note</Label>
                        <Textarea id="sell-note" value={sellNote} onChange={(e) => setSellNote(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2"><Label>Shipping Details</Label><Textarea placeholder="Shipping Details" value={shippingDetails} onChange={(e) => setShippingDetails(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Shipping Address</Label><Textarea placeholder="Shipping Address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Shipping Charges</Label><Input type="number" value={shippingCharges} onChange={(e) => setShippingCharges(e.target.value)} /></div>
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
                    <div className="space-y-2"><Label>Delivered To</Label><Input placeholder="Delivered To" value={deliveredTo} onChange={(e) => setDeliveredTo(e.target.value)} /></div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center p-4 border rounded-md">
                <div className="text-right font-bold w-full">Total Payable: {formatCurrency(totalPayable)}</div>
            </div>

            <div className="flex justify-end gap-2">
                <Button size="lg" variant="default" onClick={handleSaveDraft} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Draft"}
                </Button>
            </div>

            <AppFooter />
        </div>
    );
}
