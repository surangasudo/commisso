
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SlidersHorizontal, Search, Plus, Trash2, Info, Calendar as CalendarIcon } from "lucide-react";
import { type DetailedProduct } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getProducts } from '@/services/productService';
import { addStockAdjustment } from '@/services/stockAdjustmentService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/use-currency';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AppFooter } from '@/components/app-footer';
import { useBusinessSettings } from '@/hooks/use-business-settings';

const adjustmentItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.coerce.number().refine(val => val !== 0, "Quantity cannot be zero"),
    unitPrice: z.coerce.number(),
});

const stockAdjustmentSchema = z.object({
    location: z.string().min(1, { message: "Location is required." }),
    referenceNo: z.string().optional(),
    date: z.date({ required_error: "Date is required." }),
    adjustmentType: z.enum(['Normal', 'Abnormal']),
    totalAmountRecovered: z.coerce.number().optional(),
    reason: z.string().optional(),
    items: z.array(adjustmentItemSchema).min(1, { message: "Please add at least one product." }),
});

type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;

export default function AddStockAdjustmentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const settings = useBusinessSettings();

    const [products, setProducts] = useState<DetailedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<StockAdjustmentFormValues>({
        resolver: zodResolver(stockAdjustmentSchema),
        defaultValues: {
            location: settings.business.businessName,
            date: new Date(),
            adjustmentType: 'Normal',
            items: [],
            totalAmountRecovered: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const productsData = await getProducts();
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch products", error);
                toast({ title: "Error", description: "Could not load products.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [toast]);

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
                unitPrice: product.sellingPrice, // Or purchase price, depends on business logic
            });
        }
        setSearchTerm('');
    };

    const formValues = form.watch();

    const totalAmount = useMemo(() => {
        return formValues.items.reduce((acc, item) => acc + (Math.abs(item.quantity) * item.unitPrice), 0);
    }, [formValues.items]);

    async function onSubmit(values: StockAdjustmentFormValues) {
        try {
            await addStockAdjustment({
                ...values,
                addedBy: 'Admin', // Hardcoded for now
            });
            toast({
                title: "Success",
                description: "Stock adjustment has been saved successfully."
            });
            router.push('/admin/stock-adjustment/list');
        } catch (error) {
            console.error("Failed to add stock adjustment:", error);
            toast({
                title: "Error",
                description: "Failed to save stock adjustment. Please try again.",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-8 h-8" />
                Add Stock Adjustment
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField control={form.control} name="location" render={({ field }) => (
                                    <FormItem><FormLabel>Business Location:*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value={settings.business.businessName}>{settings.business.businessName}</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="referenceNo" render={({ field }) => (
                                    <FormItem><FormLabel>Reference No:</FormLabel><FormControl><Input placeholder="Leave blank to auto generate" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="date" render={({ field }) => (
                                    <FormItem className="flex flex-col"><FormLabel>Date:*</FormLabel>
                                    <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="adjustmentType" render={({ field }) => (
                                    <FormItem><FormLabel className="flex items-center gap-1">Adjustment type:* <Info className="w-3 h-3 text-muted-foreground" /></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Abnormal">Abnormal</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Search & Add Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search products..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1">{searchResults.map(product => (<div key={product.id} className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center text-sm" onClick={() => handleAddProduct(product)}><span>{product.name} ({product.sku})</span><Plus className="w-4 h-4" /></div>))}</div>
                                )}
                            </div>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader><TableRow><TableHead className="w-[40%]">Product</TableHead><TableHead>Quantity</TableHead><TableHead>Unit Price</TableHead><TableHead>Subtotal</TableHead><TableHead className="text-center"><Trash2 className="w-4 h-4 mx-auto" /></TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {fields.length > 0 ? fields.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.productName}</TableCell>
                                                <TableCell><FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (<Input type="number" className="w-32 h-9" {...field} placeholder="e.g. -1 or 1" />)}/></TableCell>
                                                <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                                <TableCell className="font-semibold">{formatCurrency(Math.abs(formValues.items[index]?.quantity || 0) * (formValues.items[index]?.unitPrice || 0))}</TableCell>
                                                <TableCell className="text-center"><Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50" onClick={() => remove(index)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                                            </TableRow>
                                        )) : (<TableRow><TableCell colSpan={5} className="text-center h-24">No products added yet.</TableCell></TableRow>)}
                                    </TableBody>
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-right font-bold">Total Adjustment Value:</TableCell>
                                        <TableCell className="font-bold">{formatCurrency(totalAmount)}</TableCell>
                                    </TableRow>
                                </Table>
                            </div>
                            <FormMessage className="mt-2">{form.formState.errors.items?.root?.message || form.formState.errors.items?.message}</FormMessage>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="totalAmountRecovered" render={({ field }) => (
                                <FormItem><FormLabel className="flex items-center gap-1">Total amount recovered: <Info className="w-3 h-3 text-muted-foreground" /></FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="reason" render={({ field }) => (
                                <FormItem><FormLabel>Reason:</FormLabel><FormControl><Textarea placeholder="Reason for adjustment" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
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
