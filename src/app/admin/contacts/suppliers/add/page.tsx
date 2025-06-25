'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Info } from 'lucide-react';
import { addSupplier } from '@/services/supplierService';
import { useToast } from '@/hooks/use-toast';
import { type Supplier } from '@/lib/data';
import { FirebaseError } from 'firebase/app';

const supplierSchema = z.object({
    businessName: z.string().min(1, { message: "Business name is required." }),
    contactId: z.string().optional(),
    name: z.string().min(1, { message: "Contact person's name is required." }),
    mobile: z.string().min(1, { message: "Mobile number is required." }),
    email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
    taxNumber: z.string().optional(),
    payTerm: z.coerce.number().optional(),
    payTermUnit: z.enum(['days', 'months']).default('days'),
    openingBalance: z.coerce.number().optional(),
    advanceBalance: z.coerce.number().optional(),
    address: z.string().optional(),
    customField1: z.string().optional(),
});

export default function AddSupplierPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof supplierSchema>>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            businessName: '',
            contactId: '',
            name: '',
            mobile: '',
            email: '',
            taxNumber: '',
            payTerm: 30,
            payTermUnit: 'days',
            openingBalance: 0,
            advanceBalance: 0,
            address: '',
            customField1: '',
        },
    });

    async function onSubmit(values: z.infer<typeof supplierSchema>) {
        try {
            const newSupplier: Omit<Supplier, 'id'> = {
                contactId: values.contactId || '',
                businessName: values.businessName,
                name: values.name,
                email: values.email || null,
                taxNumber: values.taxNumber || '',
                payTerm: values.payTerm || 0,
                openingBalance: values.openingBalance || 0,
                advanceBalance: values.advanceBalance || 0,
                addedOn: new Date().toLocaleDateString('en-CA'),
                address: values.address || '',
                mobile: values.mobile,
                totalPurchaseDue: 0,
                totalPurchaseReturnDue: 0,
                customField1: values.customField1 || ''
            };

            await addSupplier(newSupplier);
            toast({
                title: "Success",
                description: "Supplier has been added successfully."
            });
            router.push('/admin/contacts/suppliers');
        } catch (error) {
            console.error("Failed to add supplier:", error);
            if (error instanceof FirebaseError && error.code === 'permission-denied') {
                toast({
                    title: "Permission Error",
                    description: "You don't have permission to add suppliers. Please check your Firestore security rules.",
                    variant: "destructive",
                    duration: 9000,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add supplier. Please try again.",
                    variant: "destructive"
                });
            }
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Add a new Supplier</h1>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Details</CardTitle>
                            <CardDescription>Fill in the details below to add a new supplier.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField control={form.control} name="businessName" render={({ field }) => (
                                    <FormItem><FormLabel>Business Name *</FormLabel><FormControl><Input placeholder="Supplier's business name" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="contactId" render={({ field }) => (
                                    <FormItem><FormLabel>Contact ID</FormLabel><FormControl><Input placeholder="Leave blank to auto-generate" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="Contact person's name" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="mobile" render={({ field }) => (
                                    <FormItem><FormLabel>Mobile Number *</FormLabel><FormControl><Input placeholder="Mobile Number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Email address" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="taxNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Tax number</FormLabel><FormControl><Input placeholder="Tax identification number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormItem>
                                    <FormLabel>Pay Term</FormLabel>
                                    <div className="flex gap-2">
                                        <FormField control={form.control} name="payTerm" render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input type="number" placeholder="e.g. 30" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="payTermUnit" render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="days">Days</SelectItem>
                                                        <SelectItem value="months">Months</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}/>
                                    </div>
                                 </FormItem>
                                <FormField control={form.control} name="openingBalance" render={({ field }) => (
                                    <FormItem><FormLabel className="flex items-center gap-1">Opening Balance <Info className="w-4 h-4 text-muted-foreground" /></FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="advanceBalance" render={({ field }) => (
                                    <FormItem><FormLabel>Advance Balance</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="customField1" render={({ field }) => (
                                    <FormItem><FormLabel>Custom Field 1</FormLabel><FormControl><Input placeholder="Custom Field 1" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Supplier's physical address" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="flex justify-end">
                                <Button size="lg" type="submit">Save Supplier</Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}