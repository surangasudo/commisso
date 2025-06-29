
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Coins, Plus, Pencil, Trash2, CheckCircle, RefreshCw } from "lucide-react";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { type Currency } from '@/lib/data';
import { getCurrencies, addCurrency, updateCurrency, deleteCurrency, setBaseCurrency, updateAllExchangeRates } from '@/services/currencyService';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function MultiCurrencyPage() {
  const { settings, updateSection } = useSettings();
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ name: '', code: '', symbol: '', exchangeRate: '' });

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [editedCurrency, setEditedCurrency] = useState({ name: '', code: '', symbol: '', exchangeRate: '' });

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<Currency | null>(null);

  const baseCurrency = useMemo(() => {
    return currencies.find(c => c.isBaseCurrency) || null;
  }, [currencies]);

  const fetchCurrencies = useCallback(async () => {
    setIsLoading(true);
    try {
        const data = await getCurrencies();
        setCurrencies(data);
    } catch (error) {
        console.error("Failed to fetch currencies:", error);
        toast({ title: "Error", description: "Could not fetch currencies.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const handleAddCurrency = async () => {
    if (newCurrency.name.trim() && newCurrency.code.trim() && newCurrency.symbol.trim() && newCurrency.exchangeRate) {
      await addCurrency({
        name: newCurrency.name,
        code: newCurrency.code.toUpperCase(),
        symbol: newCurrency.symbol,
        exchangeRate: Number(newCurrency.exchangeRate),
      });
      toast({ title: "Success", description: "New currency added." });
      setIsAddDialogOpen(false);
      setNewCurrency({ name: '', code: '', symbol: '', exchangeRate: '' });
      await fetchCurrencies();
    }
  };
  
  const handleEditClick = (currency: Currency) => {
    if (currency.isBaseCurrency) return;
    setEditingCurrency(currency);
    setEditedCurrency({
        name: currency.name,
        code: currency.code,
        symbol: currency.symbol,
        exchangeRate: String(currency.exchangeRate)
    });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateCurrency = async () => {
    if (editingCurrency && editedCurrency.name.trim() && editedCurrency.code.trim()) {
      await updateCurrency(editingCurrency.id, {
        name: editedCurrency.name,
        code: editedCurrency.code.toUpperCase(),
        symbol: editedCurrency.symbol,
        exchangeRate: Number(editedCurrency.exchangeRate)
      });
      toast({ title: "Success", description: "Currency updated." });
      setIsEditDialogOpen(false);
      setEditingCurrency(null);
      await fetchCurrencies();
    }
  };

  const handleDeleteClick = (currency: Currency) => {
    if (currency.isBaseCurrency) return;
    setCurrencyToDelete(currency);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (currencyToDelete) {
      await deleteCurrency(currencyToDelete.id);
      toast({ title: "Success", description: "Currency deleted." });
      setIsDeleteDialogOpen(false);
      setCurrencyToDelete(null);
      await fetchCurrencies();
    }
  };
  
  const handleSetAsBase = async (id: string) => {
    const newBase = currencies.find(c => c.id === id);
    if (!newBase || newBase.isBaseCurrency) return;

    await setBaseCurrency(id);
    updateSection('business', { currency: newBase.code.toLowerCase() });
    
    toast({ title: "Success", description: `${newBase.name} is now the base currency. Updating all exchange rates...` });
    await handleUpdateRates();
  };
  
  const handleUpdateRates = async () => {
    setIsLoading(true);
    const result = await updateAllExchangeRates();
    if (result.success) {
      toast({ title: "Success", description: result.message });
      await fetchCurrencies();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive", duration: 9000 });
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Coins className="w-8 h-8" />
          Multi-currency Settings
        </h1>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>Configured Currencies</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-9 gap-1.5" onClick={handleUpdateRates} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Update All Rates via API</span>
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                    <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        <span>Add Currency</span>
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Currency</DialogTitle>
                            <DialogDescription>
                              Add a new currency and its exchange rate against your base currency ({baseCurrency?.code}).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label htmlFor="curr-name">Currency Name *</Label><Input id="curr-name" placeholder="e.g. Indian Rupee" value={newCurrency.name} onChange={(e) => setNewCurrency(p => ({...p, name: e.target.value}))} /></div>
                            <div className="space-y-2"><Label htmlFor="curr-code">Currency Code *</Label><Input id="curr-code" placeholder="e.g. INR" value={newCurrency.code} onChange={(e) => setNewCurrency(p => ({...p, code: e.target.value}))} /></div>
                            <div className="space-y-2"><Label htmlFor="curr-symbol">Currency Symbol *</Label><Input id="curr-symbol" placeholder="e.g. ₹" value={newCurrency.symbol} onChange={(e) => setNewCurrency(p => ({...p, symbol: e.target.value}))} /></div>
                            <div className="space-y-2"><Label htmlFor="curr-rate">Exchange Rate *</Label><Input id="curr-rate" type="number" placeholder="e.g. 83.50" value={newCurrency.exchangeRate} onChange={(e) => setNewCurrency(p => ({...p, exchangeRate: e.target.value}))} /><p className="text-xs text-muted-foreground">1 {baseCurrency?.code} = ? [Your Currency]</p></div>
                        </div>
                        <DialogFooter><Button onClick={handleAddCurrency}>Save</Button><Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </div>
            <CardDescription className="pt-2">
                Manage currencies for use in transactions. Your base currency is {baseCurrency?.name} ({baseCurrency?.code}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader><TableRow><TableHead>Currency Name</TableHead><TableHead>Code</TableHead><TableHead>Symbol</TableHead><TableHead>Exchange Rate</TableHead><TableHead className="w-[280px]">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-16"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-8"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                        <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-[76px]"/><Skeleton className="h-8 w-[86px]"/><Skeleton className="h-8 w-[120px]"/></div></TableCell>
                      </TableRow>
                    ))
                  ) : currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell className="font-medium flex items-center gap-2">{currency.name}{currency.isBaseCurrency && <Badge>Base</Badge>}</TableCell>
                      <TableCell>{currency.code}</TableCell><TableCell>{currency.symbol}</TableCell><TableCell>{currency.exchangeRate.toFixed(4)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(currency)} disabled={currency.isBaseCurrency}><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                          <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(currency)} disabled={currency.isBaseCurrency}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                           {!currency.isBaseCurrency && (<Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" onClick={() => handleSetAsBase(currency.id)}><CheckCircle className="mr-1 h-3 w-3" /> Set as Base</Button>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
              <div className="text-xs text-muted-foreground">Showing <strong>1 to {currencies.length}</strong> of <strong>{currencies.length}</strong> entries</div>
          </CardFooter>
        </Card>
      </div>

       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Edit Currency</DialogTitle><DialogDescription>Update the details for this currency.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2"><Label htmlFor="edit-curr-name">Currency Name *</Label><Input id="edit-curr-name" value={editedCurrency.name} onChange={(e) => setEditedCurrency(p => ({...p, name: e.target.value}))} /></div>
                <div className="space-y-2"><Label htmlFor="edit-curr-code">Currency Code *</Label><Input id="edit-curr-code" value={editedCurrency.code} onChange={(e) => setEditedCurrency(p => ({...p, code: e.target.value}))} /></div>
                <div className="space-y-2"><Label htmlFor="edit-curr-symbol">Currency Symbol *</Label><Input id="edit-curr-symbol" value={editedCurrency.symbol} onChange={(e) => setEditedCurrency(p => ({...p, symbol: e.target.value}))} /></div>
                <div className="space-y-2"><Label htmlFor="edit-curr-rate">Exchange Rate *</Label><Input id="edit-curr-rate" type="number" value={editedCurrency.exchangeRate} onChange={(e) => setEditedCurrency(p => ({...p, exchangeRate: e.target.value}))} /></div>
            </div>
            <DialogFooter><Button onClick={handleUpdateCurrency}>Save Changes</Button><Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the currency "{currencyToDelete?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrencyToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
