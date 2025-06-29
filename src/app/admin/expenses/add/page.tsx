
'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
import { getUsers } from '@/services/userService';
import { type Expense, type ExpenseCategory, type Customer, type Supplier, type User, initialTaxRates } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FirebaseError } from 'firebase/app';
import { useBusinessSettings } from '@/hooks/use-business-settings';

type Contact = { id: string; name: string };
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
        expenseFor: '',
        contact: '',
        attachDocument: null as File | null,
        taxId: 'none',
        totalAmount: '' as number | '',
        expenseNote: '',
        isRefund: false,
        isRecurring: false,
        recurringInterval: '1',
        recurringUnit: 'days',
        repetitions: '',
        paidAmount: '' as number | '',
        paidOn: new Date(),
        paymentMethod: 'cash',
        paymentAccount: 'none',
        paymentNote: '',
    });

    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [cats, custs, supps, fetchedUsers] = await Promise.all([
                    getExpenseCategories(),
                    getCustomers(),
                    getSuppliers(),
                    getUsers()
                ]);
                setCategories(cats);
                const combinedContacts = [
                    ...custs.map(c => ({ id: c.id, name: `${c.name} (Customer)` })),
                    ...supps.map(s => ({ id: s.id, name: `${s.businessName} (Supplier)` }))
                ];
                setAllContacts(combinedContacts);
                setUsers(fetchedUsers);
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

    const handleCheckboxChange = (field: keyof typeof formData, checked: boolean) => {
        setFormData(prev => ({ ...prev, [field]: checked }));
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, paidOn: date }));
        }
    };
    
    const { totalAmount, taxAmount, paymentDue } = useMemo(() => {
        const currentTotal = Number(formData.totalAmount) || 0;
        const selectedTaxRate = taxRates.find(t => t.id === formData.taxId)?.rate || 0;
        const currentTaxAmount = (currentTotal * selectedTaxRate) / 100;
        const totalWithTax = currentTotal + currentTaxAmount; // Assuming tax is added on top
        const currentPaidAmount = Number(formData.paidAmount) || 0;
        const currentPaymentDue = Math.max(0, totalWithTax - currentPaidAmount);

        return {
            totalAmount: totalWithTax,
            taxAmount: currentTaxAmount,
            paymentDue: currentPaymentDue,
        };
    }, [formData.totalAmount, formData.taxId, formData.paidAmount, taxRates]);

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
                paymentStatus: paymentDue === 0 ? 'Paid' : (paymentDue >= totalAmount ? 'Due' : 'Partial'),
                tax: taxAmount,
                totalAmount: totalAmount,
                paymentDue: paymentDue,
                expenseFor: formData.expenseFor === 'none' ? null : users.find(u => u.id === formData.expenseFor)?.name || null,
                contact: formData.contact === 'none' ? null : allContacts.find(c => c.id === formData.contact)?.name || null,
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

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="location">Business Location:*</Label>
                                <Select value={formData.location} onValueChange={(value) => handleSelectChange('location', value)}>
                                    <SelectTrigger id="location"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value={settings.business.businessName}>{settings.business.businessName}</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expenseCategory">Expense Category:</Label>
                                <Select value={formData.expenseCategory} onValueChange={(value) => handleSelectChange('expenseCategory', value)}>
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
                                <Select value={formData.subCategory} onValueChange={(value) => handleSelectChange('subCategory', value)} disabled={subCategories.length === 0}>
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
                                <Input id="referenceNo" placeholder="Leave empty to autogenerate" value={formData.referenceNo} onChange={handleChange} />
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
                                <Select value={formData.expenseFor} onValueChange={(value) => handleSelectChange('expenseFor', value)}>
                                    <SelectTrigger id="expenseFor"><SelectValue placeholder="None" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="contact">Expense for contact:</Label>
                                <Select value={formData.contact} onValueChange={(value) => handleSelectChange('contact', value)}>
                                    <SelectTrigger id="contact"><SelectValue placeholder="Please Select" /></SelectTrigger>
                                     <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {allContacts.map(contact => (
                                            <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attachDocument">Attach Document:</Label>
                                <Input id="attachDocument" type="file" />
                                <p className="text-xs text-muted-foreground">Max File size: 5MB.</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="taxId" className="flex items-center gap-1">Applicable Tax: <Info className="w-3 h-3"/></Label>
                                <Select value={formData.taxId} onValueChange={(value) => handleSelectChange('taxId', value)}>
                                    <SelectTrigger id="taxId"><SelectValue placeholder="None" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {taxRates.map(tax => (
                                            <SelectItem key={tax.id} value={tax.id}>{tax.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalAmount">Total amount:*</Label>
                                <Input id="totalAmount" type="number" placeholder="Total amount" value={formData.totalAmount} onChange={handleChange} />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="expenseNote">Expense note:</Label>
                                <Textarea id="expenseNote" value={formData.expenseNote} onChange={handleChange} />
                            </div>
                            <div className="md:col-span-3 flex items-center gap-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="isRefund" checked={formData.isRefund} onCheckedChange={(checked) => handleCheckboxChange('isRefund', !!checked)} />
                                    <Label htmlFor="isRefund" className="font-normal flex items-center gap-1">Is refund? <Info className="w-3 h-3"/></Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="isRecurring" checked={formData.isRecurring} onCheckedChange={(checked) => handleCheckboxChange('isRecurring', !!checked)} />
                                    <Label htmlFor="isRecurring" className="font-normal flex items-center gap-1">Is Recurring? <Info className="w-3 h-3"/></Label>
                                </div>
                            </div>
                        </div>

                        {formData.isRecurring && (
                            <div className="border-t pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="recurringInterval">Recurring interval:*</Label>
                                        <div className="flex gap-2">
                                            <Input id="recurringInterval" type="number" value={formData.recurringInterval} onChange={handleChange}/>
                                            <Select value={formData.recurringUnit} onValueChange={(value) => handleSelectChange('recurringUnit', value)}>
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
                                        <Input id="repetitions" type="number" value={formData.repetitions} onChange={handleChange}/>
                                        <p className="text-xs text-muted-foreground">If blank expense will be generated infinite times</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Add payment</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="paidAmount">Amount:*</Label>
                                <Input id="paidAmount" type="number" placeholder="0.00" value={formData.paidAmount} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paidOn">Paid on:*</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.paidOn && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.paidOn ? format(formData.paidOn, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.paidOn}
                                            onSelect={handleDateChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method:*</Label>
                                <Select value={formData.paymentMethod} onValueChange={(value) => handleSelectChange('paymentMethod', value)}>
                                    <SelectTrigger id="paymentMethod"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentAccount">Payment Account:</Label>
                                <Select value={formData.paymentAccount} onValueChange={(value) => handleSelectChange('paymentAccount', value)}>
                                    <SelectTrigger id="paymentAccount"><SelectValue placeholder="None" /></SelectTrigger>
                                    <SelectContent><SelectItem value="none">None</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="paymentNote">Payment note:</Label>
                                <Textarea id="paymentNote" value={formData.paymentNote} onChange={handleChange}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">Payment due: {formatCurrency(paymentDue)}</p>
                    <Button size="lg" onClick={handleSave}>Save</Button>
                </div>
            </div>
            <AppFooter />
        </div>
    );
}
