'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Info, Calendar, DollarSign, Wallet } from "lucide-react";

export default function AddExpensePage() {
    const [currentDate, setCurrentDate] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    useEffect(() => {
        const now = new Date();
        const formatted = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setCurrentDate(formatted);
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Wallet className="w-8 h-8" />
                Add Expense
            </h1>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="location">Business Location:*</Label>
                                <Select defaultValue="awesome-shop">
                                    <SelectTrigger id="location"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="awesome-shop">Awesome Shop</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expense-category">Expense Category:</Label>
                                <Select><SelectTrigger id="expense-category"><SelectValue placeholder="Please Select" /></SelectTrigger></Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sub-category">Sub category:</Label>
                                <Select><SelectTrigger id="sub-category"><SelectValue placeholder="Please Select" /></SelectTrigger></Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reference-no">Reference No:</Label>
                                <Input id="reference-no" placeholder="Leave empty to autogenerate" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date:*</Label>
                                <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-100 cursor-not-allowed">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{currentDate}</span>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="expense-for">Expense for:</Label>
                                <Select><SelectTrigger id="expense-for"><SelectValue placeholder="None" /></SelectTrigger></Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="expense-for-contact">Expense for contact:</Label>
                                <Select><SelectTrigger id="expense-for-contact"><SelectValue placeholder="Please Select" /></SelectTrigger></Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attach-document">Attach Document:</Label>
                                <Input id="attach-document" type="file" />
                                <p className="text-xs text-muted-foreground">Max File size: 5MB. Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="applicable-tax" className="flex items-center gap-1">Applicable Tax: <Info className="w-3 h-3"/></Label>
                                <Select><SelectTrigger id="applicable-tax"><SelectValue placeholder="None" /></SelectTrigger></Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="total-amount">Total amount:*</Label>
                                <Input id="total-amount" type="number" placeholder="Total amount" />
                            </div>
                            <div className="space-y-2 md:col-span-full">
                                <Label htmlFor="expense-note">Expense note:</Label>
                                <Textarea id="expense-note" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is-refund" />
                                <Label htmlFor="is-refund" className="font-normal flex items-center gap-1">Is refund? <Info className="w-3 h-3"/></Label>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Checkbox id="is-recurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(!!checked)} />
                                <Label htmlFor="is-recurring" className="font-normal flex items-center gap-1">Is Recurring? <Info className="w-3 h-3"/></Label>
                            </div>
                            {isRecurring && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="recurring-interval">Recurring interval:*</Label>
                                        <div className="flex gap-2">
                                            <Input id="recurring-interval" type="number" />
                                            <Select defaultValue="days">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="days">Days</SelectItem>
                                                    <SelectItem value="months">Months</SelectItem>
                                                    <SelectItem value="years">Years</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="repetitions">No. of Repetitions:</Label>
                                        <Input id="repetitions" type="number" />
                                        <p className="text-xs text-muted-foreground">If blank expense will be generated infinite times</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Add payment</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount:*</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="amount" type="number" placeholder="0.00" className="pl-8" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paid-on">Paid on:*</Label>
                                 <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-100 cursor-not-allowed">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{currentDate}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment-method">Payment Method:*</Label>
                                <Select defaultValue="cash">
                                    <SelectTrigger id="payment-method"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment-account">Payment Account:</Label>
                                <Select><SelectTrigger id="payment-account"><SelectValue placeholder="None" /></SelectTrigger></Select>
                            </div>
                            <div className="space-y-2 md:col-span-full">
                                <Label htmlFor="payment-note">Payment note:</Label>
                                <Textarea id="payment-note" />
                            </div>
                        </div>
                        <div className="text-right font-semibold mt-4">Payment due: 0.00</div>
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <Button size="lg">Save</Button>
                </div>
            </div>
             <div className="text-center text-xs text-slate-400 p-1">
                Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
            </div>
        </div>
    );
}
