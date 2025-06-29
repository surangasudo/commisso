
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Info, Calendar as CalendarIcon, Wallet, CreditCard } from "lucide-react";
import { AppFooter } from '@/components/app-footer';
import { useToast } from '@/hooks/use-toast';
import { addExpense } from '@/services/expenseService';
import { getExpenseCategories } from '@/services/expenseCategoryService';
import { type Expense, type ExpenseCategory, initialTaxRates } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FirebaseError } from 'firebase/app';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { Separator } from '@/components/ui/separator';

type TaxRate = { id: string; name: string; rate: number };

export default function AddExpensePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const settings = useBusinessSettings();

    const [formData, setFormData] = useState({
        location: settings.business.businessName,
        expenseCategory: '',
        subCategory: '',
        referenceNo: '',
        date: new Date(),
        expenseFor: 'none',
        taxId: 'none',
        totalAmount: '' as number | '',
        expenseNote: '',
        paidAmount: '' as number | '',
        paidOn: new Date(),
        paymentMethod: 'cash',
        paymentAccount: 'none',
        paymentNote: '',
    });

    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [cats] = await Promise.all([
                    getExpenseCategories(),
                ]);
                setCategories(cats);
                setTaxRates(initialTaxRates);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
                toast({ title: "Error", description: "Could not load required data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [toast]);
    
    const mainCategories = categories.filter(c => !c.parentId);
    const subCategories = formData.expenseCategory ? categories.filter(c => c.parentId === formData.expenseCategory) : [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || '' : value }));
    };

    const handleSelectChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'expenseCategory') {
                newState.subCategory = ''; // Reset subcategory when parent changes
            }
            return newState;
        });
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, paidOn: date }));
        }
    };
    
    const { totalWithTax, paymentDue } = useMemo(() => {
        const total = Number(formData.totalAmount) || 0;
        const paid = Number(formData.paidAmount) || 0;
        const selectedTaxRate = taxRates.find(t => t.id === formData.taxId)?.rate || 0;
        const taxAmount = (total * selectedTaxRate) / 100;
        const totalWithTax = total + taxAmount;
        const due = Math.max(0, totalWithTax - paid);
        return { totalWithTax, paymentDue: due };
    }, [formData.totalAmount, formData.paidAmount, formData.taxId, taxRates]);

    const handleSave = async () => {
        if (!formData.location || !formData.totalAmount) {
            toast({ title: "Validation Error", description: "Location and Total Amount are required.", variant: "destructive" });
            return;
        }

        try {
            const finalExpenseData: Omit<Expense, 'id'> = {
                date: formData.paidOn.toISOString(),
                referenceNo: formData.referenceNo || `EXP-${Date.now()}`,
                location: formData.location,
                expenseCategory: formData.expenseCategory === 'none' ? '' : categories.find(c => c.id === formData.expenseCategory)?.name || '',
                subCategory: formData.subCategory ? categories.find(c => c.id === formData.subCategory)?.name || null : null,
                paymentStatus: paymentDue === 0 ? 'Paid' : (paymentDue >= totalWithTax ? 'Due' : 'Partial'),
                tax: totalWithTax - Number(formData.totalAmount),
                totalAmount: totalWithTax,
                paymentDue: paymentDue,
                expenseFor: null,
                contact: null,
                addedBy: 'Admin', // Hardcoded for now
                expenseNote: formData.expenseNote || null,
            };

            await addExpense(finalExpenseData);
            toast({ title: "Success", description: "Expense added successfully." });
            router.push('/admin/expenses/list');
        } catch (error) {
            console.error("Failed to add expense:", error);
             if (error instanceof FirebaseError && error.code === 'permission-denied') {
                toast({
                    title: "Permission Error",
                    description: "You don't have permission to add expenses. Please check your Firestore security rules.",
                    variant: "destructive",
                    duration: 9000,
                });
            } else {
                toast({ title: "Error", description: "Failed to add expense. Please try again.", variant: "destructive" });
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Wallet className="w-8 h-8" />
                Add Expense
            </h1>

            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="location">Business Location:*</Label>
                            <Select value={formData.location} onValueChange={(value) => handleSelectChange('location', value)}><SelectTrigger id="location"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={settings.business.businessName}>{settings.business.businessName}</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expenseCategory">Expense Category:</Label>
                            <Select value={formData.expenseCategory} onValueChange={(value) => handleSelectChange('expenseCategory', value)}><SelectTrigger id="expenseCategory"><SelectValue placeholder="Please Select" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{mainCategories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subCategory">Sub category:</Label>
                            <Select value={formData.subCategory} onValueChange={(value) => handleSelectChange('subCategory', value)} disabled={subCategories.length === 0}><SelectTrigger id="subCategory"><SelectValue placeholder="Please Select" /></SelectTrigger><SelectContent>{subCategories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="referenceNo">Reference No:</Label>
                            <Input id="referenceNo" placeholder="Leave empty to autogenerate" value={formData.referenceNo} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paidOn">Date:*</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.paidOn && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.paidOn ? format(formData.paidOn, "PPP") : <span>Pick a date</span>}</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.paidOn} onSelect={handleDateChange} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalAmount">Total amount:*</Label>
                            <Input id="totalAmount" type="number" placeholder="Total amount" value={formData.totalAmount} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="taxId" className="flex items-center gap-1">Applicable Tax: <Info className="w-3 h-3"/></Label>
                            <Select value={formData.taxId} onValueChange={(value) => handleSelectChange('taxId', value)}><SelectTrigger id="taxId"><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{taxRates.map(tax => (<SelectItem key={tax.id} value={tax.id}>{tax.name}</SelectItem>))}</SelectContent></Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="expenseNote">Expense note:</Label>
                            <Textarea id="expenseNote" value={formData.expenseNote} onChange={handleChange} />
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-semibold">Add payment</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="paidAmount">Amount:*</Label>
                             <div className="relative">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input id="paidAmount" type="number" placeholder="0.00" value={formData.paidAmount} onChange={handleChange} className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method:*</Label>
                            <Select value={formData.paymentMethod} onValueChange={(value) => handleSelectChange('paymentMethod', value)}>
                                <SelectTrigger id="paymentMethod">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="cheque">Cheque</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem></SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="paymentAccount">Payment Account:</Label>
                            <Select value={formData.paymentAccount} onValueChange={(value) => handleSelectChange('paymentAccount', value)}>
                                <SelectTrigger id="paymentAccount">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="None" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent><SelectItem value="none">None</SelectItem></SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2 md:col-span-2 lg:col-span-3">
                            <Label htmlFor="paymentNote">Payment note:</Label>
                            <Textarea id="paymentNote" value={formData.paymentNote} onChange={handleChange}/>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-6">
                    <div>
                        <span className="text-lg font-semibold">Payment due:</span>
                        <span className="text-lg font-bold ml-2">{formatCurrency(paymentDue)}</span>
                    </div>
                    <div className="flex gap-2">
                         <Button size="lg" onClick={handleSave}>Save</Button>
                         <Button size="lg" variant="secondary" onClick={() => router.back()}>Close</Button>
                    </div>
                </CardFooter>
            </Card>
            <AppFooter />
        </div>
    );
}

