'use client';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, PlusCircle } from 'lucide-react';

export default function AddSalesCommissionAgentPage() {
    const [categoryCommissions, setCategoryCommissions] = useState<{id: number, category: string, rate: string}[]>([]);

    const addCategoryCommission = () => {
        setCategoryCommissions([...categoryCommissions, { id: Date.now(), category: '', rate: '' }]);
    };

    const removeCategoryCommission = (id: number) => {
        setCategoryCommissions(categoryCommissions.filter(c => c.id !== id));
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Add Commission Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entity-type">Entity Type *</Label>
                                    <Select>
                                        <SelectTrigger id="entity-type">
                                            <SelectValue placeholder="Select an entity type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="agent">Agent</SelectItem>
                                            <SelectItem value="sub-agent">Sub-Agent</SelectItem>
                                            <SelectItem value="company">Company</SelectItem>
                                            <SelectItem value="salesperson">Salesperson</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="agent-name">Name *</Label>
                                    <Input id="agent-name" placeholder="Enter entity's full name" />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone-number">Phone Number *</Label>
                                    <Input id="phone-number" placeholder="Enter phone number" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter email address" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="overall-commission">Overall Commission Rate (%) *</Label>
                                <Input id="overall-commission" type="number" placeholder="e.g. 5" />
                                <p className="text-xs text-muted-foreground">This is the default commission rate if no category-specific rate applies.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Category-Specific Commission Rates</CardTitle>
                            <CardDescription>
                                Add specific commission rates for different product categories. These will override the overall rate.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {categoryCommissions.map((comm, index) => (
                                    <div key={comm.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                                        <div className="grid grid-cols-2 gap-4 flex-1">
                                            <div className="space-y-2">
                                                <Label htmlFor={`category-${index}`}>Product Category</Label>
                                                <Select>
                                                    <SelectTrigger id={`category-${index}`}>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="electronics">Electronics</SelectItem>
                                                        <SelectItem value="groceries">Groceries</SelectItem>
                                                        <SelectItem value="apparel">Apparel</SelectItem>
                                                        <SelectItem value="books">Books</SelectItem>
                                                        <SelectItem value="furniture">Furniture</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`rate-${index}`}>Commission Rate (%)</Label>
                                                <Input id={`rate-${index}`} type="number" placeholder="e.g. 10" />
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => removeCategoryCommission(comm.id)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-4" onClick={addCategoryCommission}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Category Commission
                            </Button>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button size="lg">Save Profile</Button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                     <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 text-sm text-muted-foreground space-y-4">
                             <p>Create commission profiles for different entities like Agents, Companies, or Salespersons.</p>
                            <p>Fill in the profile details and their commission structure.</p>
                            <p>The <span className="font-bold text-foreground">Overall Commission Rate</span> is the default percentage applied to all sales unless a more specific rate is defined for a product's category.</p>
                            <p><span className="font-bold text-foreground">Category-Specific Rates</span> allow you to set different commissions for items from different categories, offering more granular control.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
