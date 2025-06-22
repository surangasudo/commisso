'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Info } from 'lucide-react';

export default function AddCustomerPage() {
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
                            <Select>
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
                            <Label htmlFor="contact-id">Contact ID</Label>
                            <Input id="contact-id" placeholder="Leave blank to auto-generate" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" placeholder="Customer's full name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number *</Label>
                            <Input id="mobile" placeholder="Mobile Number" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Email address" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax-number">Tax number</Label>
                            <Input id="tax-number" placeholder="Tax identification number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="opening-balance" className="flex items-center gap-1">Opening Balance <Info className="w-4 h-4 text-muted-foreground" /></Label>
                            <Input id="opening-balance" type="number" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="custom-field-1">Custom Field 1</Label>
                            <Input id="custom-field-1" placeholder="Custom Field 1" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" placeholder="Customer's physical address" />
                    </div>

                    <div className="flex justify-end">
                        <Button size="lg">Save Customer</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
