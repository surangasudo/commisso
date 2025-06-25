'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Info, Calendar as CalendarIcon, Wallet } from "lucide-react";
import { AppFooter } from '@/components/app-footer';
import { useToast } from '@/hooks/use-toast';
import { addExpense } from '@/services/expenseService';
import { getExpenseCategories } from '@/services/expenseCategoryService';
import { getCustomers } from '@/services/customerService';
import { getSuppliers } from '@/services/supplierService';
import { type Expense, type ExpenseCategory, type Customer, type Supplier } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Contact = { id: string; name: string };

export default function AddExpensePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();

    const [expenseData, setExpenseData] = useState<Partial<Expense>>({
        location: 'Awesome Shop',
        paymentStatus: 'Paid',
        tax: 0,
        paymentDue: 0,
        addedBy: 'Admin', // Assume logged in user
    });
    const [isRecurring, setIsRecurring] = useState(false);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [paidAmount, setPaidAmount] = useState<number | ''>('');
    const [paidOnDate, setPaidOnDate] = useState(new Date());
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, custs, supps] = await Promise.all([
                    getExpenseCategories(),
                    getCustomers(),
                    getSuppliers()
                ]);
                setCategories(cats);
                const combinedContacts = [
                    ...custs.map(c => ({ id: c.id, name: `${c.name} (Customer)` })),
                    ...supps.map(s => ({ id: s.id, name: `${s.businessName} (Supplier)` }))
                ];
                setAllContacts(combinedContacts);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
                toast({ title: "Error", description: "Could not load required data.", variant: "destructive" });
            }
        };
        fetchData();
    }, [toast]);
    
    const mainCategories = categories.filter(c => !c.parentId);
    const subCategories = expenseData.expenseCategory ? categories.filter(c => c.parentId === expenseData.expenseCategory) : [];
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setExpenseData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: keyof Expense, value: string) => {
        setExpenseData(prev => ({ ...prev, [field]: value }));
    };

    const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTotalAmount = parseFloat(e.target.value) || 0;
        
        // This is a common UX for quick entry. User enters total, we assume it's paid in full.
        setPaidAmount(newTotalAmount || ''); // Update paid amount state. Use '' if 0 to clear input.
        setExpenseData(prev => ({
            ...prev,
            totalAmount: newTotalAmount,
            paymentDue: 0 // Since paid amount now matches total amount
        }));
    };
    
    const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPaidAmountStr = e.target.value;
        const newPaidAmount = parseFloat(newPaidAmountStr) || 0;
        const currentTotalAmount = expenseData.totalAmount || 0;
        
        setPaidAmount(newPaidAmountStr === '' ? '' : newPaidAmount);
        setExpenseData(prev => ({
            ...prev, 
            paymentDue: Math.max(0, currentTotalAmount - newPaidAmount)
        }));
    };
    
    const handleSave = async () => {
        if (!expenseData.location || !expenseData.totalAmount) {
            toast({ title: "Validation Error", description: "Location and Total Amount are required.", variant: "destructive" });
            return;
        }

        try {
            const finalExpenseData: Omit<Expense, 'id'> = {
                date: paidOnDate.toLocaleString('en-CA'),
                referenceNo: expenseData.referenceNo || `EXP-${Date.now()}`,
                location: expenseData.location || 'Awesome Shop',
                expenseCategory: expenseData.expenseCategory || '',
                subCategory: expenseData.subCategory || null,
                paymentStatus: expenseData.paymentDue === 0 ? 'Paid' : (expenseData.paymentDue === expenseData.totalAmount ? 'Due' : 'Partial'),
                tax: expenseData.tax || 0,
                totalAmount: expenseData.totalAmount,
                paymentDue: expenseData.paymentDue || 0,
                expenseFor: expenseData.expenseFor || null,
                contact: expenseData.contact || null,
                addedBy: 'Admin', // Hardcoded for now
                expenseNote: expenseData.expenseNote || null
            };

            await addExpense(finalExpenseData);
            toast({ title: "Success", description: "Expense added successfully." });
            router.push('/admin/expenses/list');
        } catch (error) {
            console.error("Failed to add expense:", error);
            toast({ title: "Error", description: "Failed to add expense. Please try again.", variant: "destructive" });
        }
    };

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
                                <Select value={expenseData.location} onValueChange={(value) => handleSelectChange('location', value)}>
                                    <SelectTrigger id="location"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="awesome-shop">Awesome Shop</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expenseCategory">Expense Category:</Label>
                                <Select value={expenseData.expenseCategory} onValueChange={(value) => handleSelectChange('expenseCategory', value)}>
                                    <SelectTrigger id="expenseCategory"><SelectValue placeholder="Please Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {mainCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subCategory">Sub category:</Label>
                                <Select value={expenseData.subCategory || ''} onValueChange={(value) => handleSelectChange('subCategory', value)} disabled={subCategories.length === 0}>
                                    <SelectTrigger id="subCategory"><SelectValue placeholder="Please Select" /></SelectTrigger>
                                     <SelectContent>
                                        {subCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="referenceNo">Reference No:</Label>
                                <Input id="referenceNo" placeholder="Leave empty to autogenerate" value={expenseData.referenceNo || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date:*</Label>
                                <div className="flex items-center gap-2 border rounded-md px-3 h-10 text-sm bg-slate-100 cursor-not-allowed">
                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                    <span>{new Date().toLocaleString()}</span>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="expenseFor">Expense for:</Label>
                                <Select><SelectTrigger id="expenseFor"><SelectValue placeholder="None" /></SelectTrigger></Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="contact">Expense for contact:</Label>
                                <Select value={expenseData.contact || ''} onValueChange={(value) => handleSelectChange('contact', value)}>
                                    <SelectTrigger id="contact"><SelectValue placeholder="Please Select" /></SelectTrigger>
                                     <SelectContent>
                                        {allContacts.map(contact => (
                                            <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attach-document">Attach Document:</Label>
                                <Input id="attach-document" type="file" />
                                <p className="text-xs text-muted-foreground">Max File size: 5MB. Allowed File: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="tax" className="flex items-center gap-1">Applicable Tax: <Info className="w-3 h-3"/></Label>
                                <Select><SelectTrigger id="tax"><SelectValue placeholder="None" /></SelectTrigger></Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="totalAmount">Total amount:*</Label>
                                <Input 
                                    id="totalAmount" 
                                    type="number" 
                                    placeholder="Total amount"
                                    value={expenseData.totalAmount || ''}
                                    onChange={handleTotalAmountChange}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-full">
                                <Label htmlFor="expenseNote">Expense note:</Label>
                                <Textarea id="expenseNote" value={expenseData.expenseNote || ''} onChange={handleInputChange} />
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
                                <Input 
                                    id="amount" 
                                    type="number" 
                                    placeholder="0.00"
                                    value={paidAmount}
                                    onChange={handlePaidAmountChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paid-on">Paid on:*</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !paidOnDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {paidOnDate ? format(paidOnDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={paidOnDate}
                                            onSelect={(date) => date && setPaidOnDate(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment-method">Payment Method:*</Label>
                                <Select defaultValue="cash">
                                    <SelectTrigger id="payment-method"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
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
                        <div className="text-right font-semibold mt-4">Payment due: {formatCurrency(expenseData.paymentDue || 0)}</div>
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <Button size="lg" onClick={handleSave}>Save</Button>
                </div>
            </div>
            <AppFooter />
        </div>
    );
}
