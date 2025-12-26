
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Landmark, MoreVertical, Banknote, ArrowRightLeft, Badge as BadgeIcon, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type PaymentAccount } from '@/lib/data';
import { getAccounts, addAccount, updateAccount, deleteAccount, setAsDefaultAccount } from '@/services/paymentAccountService';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import { AppFooter } from '@/components/app-footer';
import { Badge } from '@/components/ui/badge';


const initialFormState: Omit<PaymentAccount, 'id' | 'balance'> = {
    name: '',
    accountNumber: '',
    accountType: 'Savings',
    openingBalance: 0,
    note: '',
    businessId: null,
};

export default function ListAccountsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data states
    const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
    const [formData, setFormData] = useState<Omit<PaymentAccount, 'id' | 'balance'>>(initialFormState);
    const [accountToDelete, setAccountToDelete] = useState<PaymentAccount | null>(null);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            const data = await getAccounts(user?.businessId || undefined);
            setAccounts(data);
        } catch (error) {
            toast({ title: "Error", description: "Could not fetch accounts.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.businessId) {
            fetchAccounts();
        }
    }, [user?.businessId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSelectChange = (value: 'Savings' | 'Checking' | 'Credit Card' | 'Cash') => {
        setFormData(prev => ({ ...prev, accountType: value }));
    };

    const handleAddClick = () => {
        setEditingAccount(null);
        setFormData(initialFormState);
        setIsDialogOpen(true);
    };

    const handleEditClick = (account: PaymentAccount) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            openingBalance: account.openingBalance,
            note: account.note,
            businessId: account.businessId,
        });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (account: PaymentAccount) => {
        setAccountToDelete(account);
        setIsDeleteOpen(true);
    };

    const handleSetAsDefault = async (id: string) => {
        try {
            if (!user?.businessId) return;
            await setAsDefaultAccount(id, user.businessId);
            toast({ title: "Success", description: "Default account has been updated." });
            fetchAccounts();
        } catch (error) {
            toast({ title: "Error", description: "Failed to set default account.", variant: "destructive" });
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast({ title: "Validation Error", description: "Account Name is required.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingAccount) {
                await updateAccount(editingAccount.id, formData);
                toast({ title: "Success", description: "Account updated successfully." });
            } else {
                await addAccount(formData, user?.businessId || undefined);
                toast({ title: "Success", description: "Account created successfully." });
            }
            setIsDialogOpen(false);
            fetchAccounts();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save account.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (accountToDelete) {
            try {
                await deleteAccount(accountToDelete.id);
                toast({ title: "Success", description: "Account deleted." });
                fetchAccounts();
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" });
            } finally {
                setIsDeleteOpen(false);
                setAccountToDelete(null);
            }
        }
    };

    const totalBalance = useMemo(() => accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0), [accounts]);

    return (
        <>
            <div className="flex flex-col gap-6">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <Landmark className="w-8 h-8" />
                    List Accounts
                </h1>
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <CardTitle>All Accounts</CardTitle>
                            <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto" onClick={handleAddClick}>
                                <Plus className="h-4 w-4" />
                                <span>Add Account</span>
                            </Button>
                        </div>
                        <CardDescription>
                            Manage all your business payment accounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Account Type</TableHead>
                                        <TableHead>Account Number</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="text-center">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                                <TableCell><div className="flex justify-center gap-2"><Skeleton className="h-8 w-[100px]" /></div></TableCell>
                                            </TableRow>
                                        ))
                                    ) : accounts.map((account) => (
                                        <TableRow key={account.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                {account.name}
                                                {account.isDefault && <Badge>Default</Badge>}
                                            </TableCell>
                                            <TableCell>{account.accountType}</TableCell>
                                            <TableCell>{account.accountNumber}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(account.balance || 0)}</TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => handleEditClick(account)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleDeleteClick(account)} className="text-red-500 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                        {!account.isDefault && (
                                                            <>
                                                                <DropdownMenuItem onSelect={() => handleSetAsDefault(account.id)}><CheckCircle className="mr-2 h-4 w-4" />Set as Default</DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuItem disabled><Banknote className="mr-2 h-4 w-4" />Deposit</DropdownMenuItem>
                                                        <DropdownMenuItem disabled><ArrowRightLeft className="mr-2 h-4 w-4" />Fund Transfer</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(totalBalance)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1 to {accounts.length}</strong> of <strong>{accounts.length}</strong> entries
                        </div>
                    </CardFooter>
                </Card>
                <AppFooter />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingAccount ? 'Edit' : 'Add'} Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" value={formData.name} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="accountType">Account Type *</Label>
                            <Select value={formData.accountType} onValueChange={handleSelectChange}>
                                <SelectTrigger id="accountType"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Savings">Savings</SelectItem><SelectItem value="Checking">Checking</SelectItem><SelectItem value="Credit Card">Credit Card</SelectItem><SelectItem value="Cash">Cash</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label htmlFor="accountNumber">Account Number</Label><Input id="accountNumber" value={formData.accountNumber || ''} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="openingBalance">Opening Balance</Label><Input id="openingBalance" type="number" value={formData.openingBalance} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="note">Note</Label><Textarea id="note" value={formData.note || ''} onChange={handleInputChange} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the account "{accountToDelete?.name}". This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
