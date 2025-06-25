
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
import { addSupplier } from '@/services/supplierService';
import { useToast } from '@/hooks/use-toast';
import { type Supplier } from '@/lib/data';
import { FirebaseError } from 'firebase/app';

export default function AddSupplierPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [supplierData, setSupplierData] = useState<Partial<Omit<Supplier, 'id'>>>({
        payTerm: 30,
        openingBalance: 0,
        advanceBalance: 0,
        totalPurchaseDue: 0,
        totalPurchaseReturnDue: 0,
    });
    const [payTermUnit, setPayTermUnit] = useState('days');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSupplierData(prev => ({...prev, [id]: value }));
    };
    
    const handleSave = async () => {
        if (!supplierData.businessName || !supplierData.name || !supplierData.mobile) {
            toast({
                title: "Validation Error",
                description: "Business Name, Name, and Mobile Number are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            const newSupplier: Omit<Supplier, 'id'> = {
                contactId: supplierData.contactId || '',
                businessName: supplierData.businessName,
                name: supplierData.name,
                email: supplierData.email || null,
                taxNumber: supplierData.taxNumber || '',
                payTerm: Number(supplierData.payTerm) || 0, // In a real app, calculate based on unit
                openingBalance: Number(supplierData.openingBalance) || 0,
                advanceBalance: Number(supplierData.advanceBalance) || 0,
                addedOn: new Date().toLocaleDateString('en-CA'),
                address: supplierData.address || '',
                mobile: supplierData.mobile,
                totalPurchaseDue: 0,
                totalPurchaseReturnDue: 0,
                customField1: supplierData.customField1 || ''
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
    };


    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Add a new Supplier</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Supplier Details</CardTitle>
                    <CardDescription>Fill in the details below to add a new supplier.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input id="businessName" placeholder="Supplier's business name" required onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactId">Contact ID</Label>
                            <Input id="contactId" placeholder="Leave blank to auto-generate" onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" placeholder="Contact person's name" required onChange={handleInputChange} />
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
                            <Label htmlFor="payTerm">Pay Term</Label>
                            <div className="flex gap-2">
                                <Input id="payTerm" type="number" placeholder="e.g. 30" onChange={handleInputChange} />
                                <Select defaultValue="days" onValueChange={setPayTermUnit}>
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
                            <Label htmlFor="openingBalance" className="flex items-center gap-1">Opening Balance <Info className="w-4 h-4 text-muted-foreground" /></Label>
                            <Input id="openingBalance" type="number" placeholder="0.00" onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="advanceBalance">Advance Balance</Label>
                            <Input id="advanceBalance" type="number" placeholder="0.00" onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customField1">Custom Field 1</Label>
                            <Input id="customField1" placeholder="Custom Field 1" onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" placeholder="Supplier's physical address" onChange={handleInputChange} />
                    </div>

                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleSave}>Save Supplier</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
