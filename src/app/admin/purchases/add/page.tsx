
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Plus, Trash2, Info, Calendar as CalendarIcon } from "lucide-react";
import { type DetailedProduct, type Supplier, type Purchase } from '@/lib/data';
import { AppFooter } from '@/components/app-footer';
import { useToast } from '@/hooks/use-toast';
import { getSuppliers, addSupplier } from '@/services/supplierService';
import { getProducts } from '@/services/productService';
import { addPurchase } from '@/services/purchaseService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/use-currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

type PurchaseItem = {
  product: DetailedProduct;
  quantity: number;
  purchasePrice: number;
};

export default function AddPurchasePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [purchaseData, setPurchaseData] = useState<Partial<Omit<Purchase, 'id' | 'items'>>>({
        location: 'Awesome Shop',
        purchaseStatus: 'Received',
        paymentStatus: 'Due', // Default to due
        paymentDue: 0,
    });
    const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for Add Supplier Dialog
    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        businessName: '',
        name: '',
        mobile: '',
        email: ''
    });
    
    const [discountType, setDiscountType] = useState<'Fixed' | 'Percentage'>('Fixed');
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [taxRate, setTaxRate] = useState<number>(0);
    const [shippingCharges, setShippingCharges] = useState<number>(0);

    const fetchSuppliers = useCallback(async () => {
        try {
            const suppliersData = await getSuppliers();
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
            toast({ title: "Error", description: "Could not load suppliers.", variant: "destructive" });
        }
    }, [toast]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                await fetchSuppliers();
                const productsData = await getProducts();
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
                toast({ title: "Error", description: "Could not load initial data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [fetchSuppliers, toast]);
    
    const searchResults = searchTerm
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

    const handleAddProduct = (product: DetailedProduct) => {
        if (!purchaseItems.some(item => item.product.id === product.id)) {
            setPurchaseItems([...purchaseItems, {
                product,
                quantity: 1,
                purchasePrice: product.unitPurchasePrice,
            }]);
        }
        setSearchTerm('');
    };
    
    const handleRemoveItem = (productId: string) => {
        setPurchaseItems(purchaseItems.filter(item => item.product.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setPurchaseItems(purchaseItems.map(item =>
            item.product.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ));
    };
    
    const handlePriceChange = (productId: string, price: number) => {
        setPurchaseItems(purchaseItems.map(item =>
            item.product.id === productId ? { ...item, purchasePrice: Math.max(0, price) } : item
        ));
    };

    const subtotal = useMemo(() => {
        return purchaseItems.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
    }, [purchaseItems]);

    const calculatedDiscount = useMemo(() => {
        if (discountType === 'Fixed') {
            return discountAmount;
        }
        return (subtotal * discountAmount) / 100;
    }, [subtotal, discountType, discountAmount]);

    const calculatedTax = useMemo(() => {
        const taxableAmount = subtotal - calculatedDiscount;
        return (taxableAmount * taxRate) / 100;
    }, [subtotal, calculatedDiscount, taxRate]);

    const grandTotal = useMemo(() => {
        return subtotal - calculatedDiscount + calculatedTax + shippingCharges;
    }, [subtotal, calculatedDiscount, calculatedTax, shippingCharges]);

    const handleTaxChange = (value: string) => {
        if (value === 'none') {
            setTaxRate(0);
            return;
        }
        const rateString = value.split('@')[1]?.replace('%', '');
        setTaxRate(parseFloat(rateString) || 0);
    };

    const handleSave = async () => {
        if (!purchaseData.supplier || purchaseItems.length === 0) {
            toast({
                title: "Validation Error",
                description: "Supplier and at least one product are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            const newPurchase: Omit<Purchase, 'id'> = {
                date: purchaseDate?.toISOString() || new Date().toISOString(),
                referenceNo: purchaseData.referenceNo || `PO-${Date.now()}`,
                location: purchaseData.location || 'Awesome Shop',
                supplier: purchaseData.supplier,
                purchaseStatus: purchaseData.purchaseStatus || 'Received',
                paymentStatus: 'Due', // Defaulting to Due on creation
                grandTotal: grandTotal,
                paymentDue: grandTotal, // Initially, full amount is due
                addedBy: 'Admin', // Hardcoded
                items: purchaseItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.purchasePrice,
                    tax: 0, // Simplified for now
                })),
                taxAmount: calculatedTax,
            };

            await addPurchase(newPurchase);
            toast({
                title: "Success",
                description: "Purchase has been added successfully."
            });
            router.push('/admin/purchases/list');
        } catch (error) {
            console.error("Failed to add purchase:", error);
            toast({
                title: "Error",
                description: "Failed to add purchase. Please try again.",
                variant: "destructive"
            });
        }
    };
    
    const handleNewSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewSupplier(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveSupplier = async () => {
        if (!newSupplier.businessName || !newSupplier.name || !newSupplier.mobile) {
            toast({
                title: "Validation Error",
                description: "Business Name, Contact Name, and Mobile are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            const supplierToAdd: Omit<Supplier, 'id'> = {
                businessName: newSupplier.businessName,
                name: newSupplier.name,
                mobile: newSupplier.mobile,
                email: newSupplier.email || null,
                contactId: '',
                taxNumber: '',
                payTerm: 0,
                openingBalance: 0,
                advanceBalance: 0,
                addedOn: new Date().toISOString(),
                address: '',
                totalPurchaseDue: 0,
                totalPurchaseReturnDue: 0,
            };

            await addSupplier(supplierToAdd);
            toast({
                title: "Supplier Added",
                description: `${newSupplier.businessName} has been successfully added.`
            });
            setIsAddSupplierOpen(false);
            setNewSupplier({ businessName: '', name: '', mobile: '', email: '' });
            await fetchSuppliers(); // Re-fetch suppliers to update the list
        } catch (error) {
            console.error("Failed to add supplier:", error);
            toast({
                title: "Error",
                description: "Failed to add supplier. Please try again.",
                variant: "destructive"
            });
        }
    };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Download className="w-8 h-8" />
        Add Purchase
      </h1>

      <Card>
        <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <div className="flex gap-2">
                        <Select
                            onValueChange={(value) => setPurchaseData(p => ({...p, supplier: value }))}
                        >
                            <SelectTrigger id="supplier">
                                <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map(s => (
                                    <SelectItem key={s.id} value={s.businessName}>{s.businessName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New Supplier</DialogTitle>
                                    <DialogDescription>Quickly add a new supplier to the system.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName">Business Name *</Label>
                                        <Input id="businessName" value={newSupplier.businessName} onChange={handleNewSupplierChange} placeholder="Business Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Contact Name *</Label>
                                        <Input id="name" value={newSupplier.name} onChange={handleNewSupplierChange} placeholder="Contact Person's Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile Number *</Label>
                                        <Input id="mobile" value={newSupplier.mobile} onChange={handleNewSupplierChange} placeholder="Mobile Number" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={newSupplier.email} onChange={handleNewSupplierChange} placeholder="Email Address" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="secondary" onClick={() => setIsAddSupplierOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSaveSupplier}>Save Supplier</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reference-no">Reference No:</Label>
                    <Input id="reference-no" placeholder="e.g. PO2025/0001" onChange={(e) => setPurchaseData(p => ({...p, referenceNo: e.target.value }))} />
                    <p className="text-xs text-muted-foreground">Leave blank to auto generate.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="purchase-date">Purchase Date *</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !purchaseDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {purchaseDate ? format(purchaseDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={purchaseDate}
                                onSelect={setPurchaseDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="purchase-status">Purchase Status *</Label>
                    <Select defaultValue="Received" onValueChange={(value: 'Received' | 'Pending' | 'Ordered' | 'Partial') => setPurchaseData(p => ({...p, purchaseStatus: value }))}>
                        <SelectTrigger id="purchase-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Received">Received</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Ordered">Ordered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Business Location *</Label>
                    <Select defaultValue="Awesome Shop" onValueChange={(value) => setPurchaseData(p => ({...p, location: value }))}>
                        <SelectTrigger id="location">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Awesome Shop">Awesome Shop</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="attach-document">Attach Document</Label>
                    <Input id="attach-document" type="file" />
                    <p className="text-xs text-muted-foreground">Max 2MB</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Add products to this purchase order.</CardDescription>
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
                            <TableHead className="w-[40%]">Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Purchase Price</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead className="text-center"><Trash2 className="w-4 h-4 mx-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseItems.length > 0 ? purchaseItems.map(item => (
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
                                        value={item.purchasePrice} 
                                        onChange={e => handlePriceChange(item.product.id, parseFloat(e.target.value) || 0)}
                                        className="w-32 h-9"
                                    />
                                </TableCell>
                                <TableCell className="font-semibold">{formatCurrency(item.quantity * item.purchasePrice)}</TableCell>
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
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <Label htmlFor="discount-type" className="flex items-center gap-1 text-muted-foreground">Discount: <Info className="w-3 h-3"/></Label>
                        <div className="flex gap-2 w-2/3">
                            <Select value={discountType} onValueChange={(value: 'Fixed' | 'Percentage') => setDiscountType(value)}>
                                <SelectTrigger id="discount-type" className="h-9">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fixed">Fixed</SelectItem>
                                    <SelectItem value="Percentage">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="number" placeholder="0.00" className="h-9" value={discountAmount || ''} onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}/>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <span className="text-muted-foreground text-xs">Discount Amount (-): {formatCurrency(calculatedDiscount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="purchase-tax" className="flex items-center gap-1 text-muted-foreground">Purchase Tax: <Info className="w-3 h-3"/></Label>
                        <div className="w-2/3">
                            <Select onValueChange={handleTaxChange}>
                                <SelectTrigger id="purchase-tax" className="h-9">
                                    <SelectValue placeholder="Select Tax"/>
                                </SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="VAT@10%">VAT@10%</SelectItem>
                                    <SelectItem value="GST@5%">GST @5%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <span className="text-muted-foreground text-xs">Tax Amount (+): {formatCurrency(calculatedTax)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <Label htmlFor="shipping-charges" className="flex items-center gap-1 text-muted-foreground">Shipping: <Info className="w-3 h-3"/></Label>
                        <div className="w-2/3">
                            <Input id="shipping-charges" placeholder="Shipping charges" className="h-9" type="number" value={shippingCharges || ''} onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}/>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t font-bold">
                        <span>Grand Total:</span>
                        <span>{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <AppFooter />
    </div>
  );
}

