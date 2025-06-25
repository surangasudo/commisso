
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Info } from 'lucide-react';
import { addCustomer } from '@/services/customerService';
import { useToast } from '@/hooks/use-toast';
import { type Customer } from '@/lib/data';
import { FirebaseError } from 'firebase/app';

export default function AddCustomerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [customerData, setCustomerData] = useState<Partial<Customer>>({
        customerGroup: 'retail',
        openingBalance: 0,
        totalSaleDue: 0,
        totalSaleReturnDue: 0,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setCustomerData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSelectChange = (value: string) => {
        setCustomerData(prev => ({...prev, customerGroup: value}));
    };

    const handleSave = async () => {
        if (!customerData.name || !customerData.mobile) {
            toast({
                title: "Validation Error",
                description: "Name and Mobile Number are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            const newCustomer: Omit<Customer, 'id'> = {
                contactId: customerData.contactId || '',
                name: customerData.name,
                email: customerData.email || null,
                taxNumber: customerData.taxNumber || '',
                customerGroup: customerData.customerGroup || 'retail',
                openingBalance: Number(customerData.openingBalance) || 0,
                addedOn: new Date().toLocaleDateString('en-CA'),
                address: customerData.address || '',
                mobile: customerData.mobile,
                totalSaleDue: 0,
                totalSaleReturnDue: 0,
                customField1: customerData.customField1 || ''
            };
            await addCustomer(newCustomer);
            toast({
                title: "Success",
                description: "Customer has been added successfully."
            });
            router.push('/admin/contacts/customers');
        } catch (error) {
            console.error("Failed to add customer:", error);
            if (error instanceof FirebaseError && error.code === 'permission-denied') {
                toast({
                    title: "Permission Error",
                    description: "You don't have permission to add customers. Please check your Firestore security rules.",
                    variant: "destructive",
                    duration: 9000,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add customer. Please try again.",
                    variant: "destructive"
                });
            }
        }
    };


    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Add a new Customer</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                    <CardDescription>Fill in the details below to add a new customer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="customer-group">Customer Group</Label>
                            <Select onValueChange={handleSelectChange} defaultValue="retail">
                                <SelectTrigger id="customer-group">
                                    <SelectValue placeholder="Select Customer Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="retail">Retail</SelectItem>
                                    <SelectItem value="wholesale">Wholesale</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactId">Contact ID</Label>
                            <Input id="contactId" placeholder="Leave blank to auto-generate" onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" placeholder="Customer's full name" required onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number *</Label>
                            <Input id="mobile" placeholder="Mobile Number" required onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Email address" onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxNumber">Tax number</Label>
                            <Input id="taxNumber" placeholder="Tax identification number" onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="openingBalance" className="flex items-center gap-1">Opening Balance <Info className="w-4 h-4 text-muted-foreground" /></Label>
                            <Input id="openingBalance" type="number" placeholder="0.00" onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customField1">Custom Field 1</Label>
                            <Input id="customField1" placeholder="Custom Field 1" onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" placeholder="Customer's physical address" onChange={handleInputChange} />
                    </div>

                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleSave}>Save Customer</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
