
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useBusinessSettings } from '@/hooks/use-business-settings';

const purchaseItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.coerce.number().min(1, "Min 1"),
    purchasePrice: z.coerce.number().min(0, "Cannot be negative"),
});

const purchaseSchema = z.object({
    supplier: z.string().min(1, { message: "Supplier is required." }),
    referenceNo: z.string().optional(),
    purchaseDate: z.date({ required_error: "Purchase date is required." }),
    purchaseStatus: z.enum(['Received', 'Pending', 'Ordered']),
    location: z.string(),
    purchaseItems: z.array(purchaseItemSchema).min(1, { message: "Please add at least one product." }),
    discountType: z.enum(['Fixed', 'Percentage']),
    discountAmount: z.coerce.number().optional(),
    taxRate: z.coerce.number().optional(),
    shippingCharges: z.coerce.number().optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export default function AddPurchasePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const settings = useBusinessSettings();
    
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ businessName: '', name: '', mobile: '', email: '' });
    
    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            location: 'Awesome Shop',
            purchaseStatus: 'Received',
            purchaseDate: new Date(),
            purchaseItems: [],
            discountType: 'Fixed',
            discountAmount: 0,
            taxRate: 0,
            shippingCharges: 0,
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "purchaseItems"
    });

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
        if (!fields.some(item => item.productId === product.id)) {
            append({
                productId: product.id,
                productName: product.name,
                quantity: 1,
                purchasePrice: product.unitPurchasePrice,
            });
        }
        setSearchTerm('');
    };

    const formValues = form.watch();

    const { subtotal, calculatedDiscount, calculatedTax, grandTotal } = useMemo(() => {
        const sub = formValues.purchaseItems.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
        
        let discount = 0;
        if (formValues.discountType === 'Fixed') {
            discount = formValues.discountAmount || 0;
        } else {
            discount = (sub * (formValues.discountAmount || 0)) / 100;
        }

        const taxableAmount = sub - discount;
        const tax = (taxableAmount * (formValues.taxRate || 0)) / 100;
        
        const total = sub - discount + tax + (formValues.shippingCharges || 0);
        
        return { subtotal: sub, calculatedDiscount: discount, calculatedTax: tax, grandTotal: total };
    }, [formValues]);

    async function onSubmit(values: PurchaseFormValues) {
        try {
            const selectedSupplier = suppliers.find(s => s.id === values.supplier);
            if (!selectedSupplier) {
                toast({
                    title: "Error",
                    description: "A valid supplier must be selected.",
                    variant: "destructive"
                });
                return;
            }

            const newPurchase: Omit<Purchase, 'id'> = {
                date: values.purchaseDate.toISOString(),
                referenceNo: values.referenceNo || `PO-${Date.now()}`,
                location: values.location,
                supplier: selectedSupplier.businessName, // Use the name for storage
                purchaseStatus: values.purchaseStatus,
                paymentStatus: 'Due', // Defaulting to Due on creation
                grandTotal,
                paymentDue: grandTotal, // Initially, full amount is due
                addedBy: 'Admin', // Hardcoded
                items: values.purchaseItems.map(item => ({
                    productId: item.productId,
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
    }
    
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
    
    const handleTaxSelectChange = (value: string) => {
        if (value === 'none') {
            form.setValue('taxRate', 0);
            return;
        }
        const rateString = value.split('@')[1]?.replace('%', '');
        form.setValue('taxRate', parseFloat(rateString) || 0);
    };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Download className="w-8 h-8" />
        Add Purchase
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier *</FormLabel>
                                <div className="flex gap-2">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger id="supplier"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {suppliers.map(s => (<SelectItem key={s.id} value={s.id}>{s.businessName}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
                                        <DialogTrigger asChild>
                                            <Button type="button" size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Add New Supplier</DialogTitle>
                                                <DialogDescription>Quickly add a new supplier to the system.</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2"><Label htmlFor="businessName">Business Name *</Label><Input id="businessName" value={newSupplier.businessName} onChange={handleNewSupplierChange} placeholder="Business Name" /></div>
                                                <div className="space-y-2"><Label htmlFor="name">Contact Name *</Label><Input id="name" value={newSupplier.name} onChange={handleNewSupplierChange} placeholder="Contact Person's Name" /></div>
                                                <div className="space-y-2"><Label htmlFor="mobile">Mobile Number *</Label><Input id="mobile" value={newSupplier.mobile} onChange={handleNewSupplierChange} placeholder="Mobile Number" /></div>
                                                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={newSupplier.email} onChange={handleNewSupplierChange} placeholder="Email Address" /></div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="secondary" onClick={() => setIsAddSupplierOpen(false)}>Cancel</Button>
                                                <Button type="button" onClick={handleSaveSupplier}>Save Supplier</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField control={form.control} name="referenceNo" render={({ field }) => ( <FormItem><FormLabel>Reference No:</FormLabel><FormControl><Input placeholder="e.g. PO2025/0001" {...field} /></FormControl><p className="text-xs text-muted-foreground">Leave blank to auto generate.</p><FormMessage /></FormItem> )}/>

                    <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Purchase Date *</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                        <FormMessage /></FormItem>
                    )}/>
                    
                    {settings.purchase.enablePurchaseStatus && (
                        <FormField control={form.control} name="purchaseStatus" render={({ field }) => (<FormItem><FormLabel>Purchase Status *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Received">Received</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Ordered">Ordered</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                    )}
                    <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Business Location *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Awesome Shop">Awesome Shop</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                     
                     <div className="space-y-2"><Label htmlFor="attach-document">Attach Document</Label><Input id="attach-document" type="file" /><p className="text-xs text-muted-foreground">Max 2MB</p></div>
                </div>
            </CardContent>
          </Card>
      
          <Card>
            <CardHeader><CardTitle>Products</CardTitle><CardDescription>Add products to this purchase order.</CardDescription></CardHeader>
            <CardContent>
                 <div className="relative mb-4">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search products by name or SKU..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1">{searchResults.map(product => (<div key={product.id} className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center text-sm" onClick={() => handleAddProduct(product)}><span>{product.name} ({product.sku})</span><Plus className="w-4 h-4" /></div>))}</div>
                  )}
                </div>
                
                <div className="border rounded-md">
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-[40%]">Product</TableHead><TableHead>Quantity</TableHead><TableHead>Unit Purchase Price</TableHead><TableHead>Subtotal</TableHead><TableHead className="text-center"><Trash2 className="w-4 h-4 mx-auto" /></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {fields.length > 0 ? fields.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell><FormField control={form.control} name={`purchaseItems.${index}.quantity`} render={({ field }) => (<Input type="number" className="w-24 h-9" {...field} />)}/></TableCell>
                                    <TableCell>
                                        {settings.purchase.enableEditingProductPrice ? (
                                            <FormField control={form.control} name={`purchaseItems.${index}.purchasePrice`} render={({ field }) => (<Input type="number" className="w-32 h-9" {...field} />)}/>
                                        ) : (
                                            <span>{formatCurrency(item.purchasePrice)}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold">{formatCurrency((formValues.purchaseItems[index]?.quantity || 0) * (formValues.purchaseItems[index]?.purchasePrice || 0))}</TableCell>
                                    <TableCell className="text-center"><Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50" onClick={() => remove(index)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                                </TableRow>
                            )) : ( <TableRow><TableCell colSpan={5} className="text-center h-24">No products added yet.</TableCell></TableRow> )}
                        </TableBody>
                    </Table>
                </div>
                 <FormMessage className="mt-2">{form.formState.errors.purchaseItems?.root?.message || form.formState.errors.purchaseItems?.message}</FormMessage>

                <div className="flex justify-end mt-4">
                    <div className="w-full max-w-sm space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="discount-type" className="flex items-center gap-1 text-muted-foreground">Discount: <Info className="w-3 h-3"/></Label>
                            <div className="flex gap-2 w-2/3">
                                <FormField control={form.control} name="discountType" render={({ field }) => (<FormItem className="flex-1"><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-9"><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Fixed">Fixed</SelectItem><SelectItem value="Percentage">Percentage</SelectItem></SelectContent></Select></FormItem>)}/>
                                <FormField control={form.control} name="discountAmount" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="0.00" className="h-9" {...field} /></FormControl></FormItem>)}/>
                            </div>
                        </div>
                        <div className="flex justify-end"><span className="text-muted-foreground text-xs">Discount Amount (-): {formatCurrency(calculatedDiscount)}</span></div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="purchase-tax" className="flex items-center gap-1 text-muted-foreground">Purchase Tax: <Info className="w-3 h-3"/></Label>
                            <div className="w-2/3">
                                <Select onValueChange={handleTaxSelectChange}>
                                    <SelectTrigger id="purchase-tax" className="h-9"><SelectValue placeholder="Select Tax"/></SelectTrigger>
                                    <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="VAT@10%">VAT@10%</SelectItem><SelectItem value="GST@5%">GST @5%</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="flex justify-end"><span className="text-muted-foreground text-xs">Tax Amount (+): {formatCurrency(calculatedTax)}</span></div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="shipping-charges" className="flex items-center gap-1 text-muted-foreground">Shipping: <Info className="w-3 h-3"/></Label>
                            <div className="w-2/3">
                                <FormField control={form.control} name="shippingCharges" render={({ field }) => (<FormItem><FormControl><Input placeholder="Shipping charges" className="h-9" type="number" {...field}/></FormControl></FormItem>)}/>
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
            <Button size="lg" type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>

      <AppFooter />
    </div>
  );
}
