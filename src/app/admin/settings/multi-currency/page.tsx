
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Coins, Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import React, { useState, useMemo } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type Currency = {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  isBaseCurrency?: boolean;
};

const initialCurrencies: Currency[] = [
  { id: 'curr-1', name: 'US Dollar', code: 'USD', symbol: '$', exchangeRate: 1, isBaseCurrency: true },
  { id: 'curr-2', name: 'Euro', code: 'EUR', symbol: '€', exchangeRate: 0.92 },
  { id: 'curr-3', name: 'British Pound', code: 'GBP', symbol: '£', exchangeRate: 0.79 },
  { id: 'curr-4', name: 'Japanese Yen', code: 'JPY', symbol: '¥', exchangeRate: 157.25 },
];

export default function MultiCurrencyPage() {
  const [currencies, setCurrencies] = useState(initialCurrencies);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ name: '', code: '', symbol: '', exchangeRate: '' });

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [editedCurrency, setEditedCurrency] = useState({ name: '', code: '', symbol: '', exchangeRate: '' });

  const baseCurrency = useMemo(() => currencies.find(c => c.isBaseCurrency)!, [currencies]);

  const handleAddCurrency = () => {
    if (newCurrency.name.trim() && newCurrency.code.trim() && newCurrency.symbol.trim() && newCurrency.exchangeRate) {
      const currencyToAdd: Currency = {
        id: `curr-${Date.now()}`,
        name: newCurrency.name,
        code: newCurrency.code,
        symbol: newCurrency.symbol,
        exchangeRate: Number(newCurrency.exchangeRate),
      };
      setCurrencies([...currencies, currencyToAdd]);
      setIsAddDialogOpen(false);
      setNewCurrency({ name: '', code: '', symbol: '', exchangeRate: '' });
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
  
  const handleUpdateCurrency = () => {
    if (editingCurrency && editedCurrency.name.trim() && editedCurrency.code.trim()) {
        const updatedCurrencies = currencies.map(c => 
            c.id === editingCurrency.id 
            ? { ...c, 
                name: editedCurrency.name,
                code: editedCurrency.code,
                symbol: editedCurrency.symbol,
                exchangeRate: Number(editedCurrency.exchangeRate)
              } 
            : c
        );
        setCurrencies(updatedCurrencies);
        setIsEditDialogOpen(false);
        setEditingCurrency(null);
    }
  };

  const handleDeleteCurrency = (id: string) => {
    setCurrencies(currencies.filter(c => c.id !== id && !c.isBaseCurrency));
  };
  
  const handleSetAsBase = (id: string) => {
    const newBase = currencies.find(c => c.id === id);
    if (!newBase || newBase.isBaseCurrency) return;

    const oldBaseRate = newBase.exchangeRate;

    const updatedCurrencies = currencies.map(c => {
        const newRate = c.exchangeRate / oldBaseRate;
        return {
            ...c,
            exchangeRate: newRate,
            isBaseCurrency: c.id === id,
        }
    });

    setCurrencies(updatedCurrencies);
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
                          Add a new currency and its exchange rate against your base currency ({baseCurrency.code}).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="curr-name">Currency Name *</Label>
                            <Input id="curr-name" placeholder="e.g. Indian Rupee" value={newCurrency.name} onChange={(e) => setNewCurrency(p => ({...p, name: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="curr-code">Currency Code *</Label>
                            <Input id="curr-code" placeholder="e.g. INR" value={newCurrency.code} onChange={(e) => setNewCurrency(p => ({...p, code: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="curr-symbol">Currency Symbol *</Label>
                            <Input id="curr-symbol" placeholder="e.g. ₹" value={newCurrency.symbol} onChange={(e) => setNewCurrency(p => ({...p, symbol: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="curr-rate">Exchange Rate *</Label>
                            <Input id="curr-rate" type="number" placeholder="e.g. 83.50" value={newCurrency.exchangeRate} onChange={(e) => setNewCurrency(p => ({...p, exchangeRate: e.target.value}))} />
                             <p className="text-xs text-muted-foreground">1 {baseCurrency.code} = ? [Your Currency]</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddCurrency}>Save</Button>
                        <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription className="pt-2">
                Manage currencies for use in transactions. Your base currency is {baseCurrency.name} ({baseCurrency.code}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Exchange Rate</TableHead>
                    <TableHead className="w-[280px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {currency.name}
                        {currency.isBaseCurrency && <Badge>Base</Badge>}
                      </TableCell>
                      <TableCell>{currency.code}</TableCell>
                      <TableCell>{currency.symbol}</TableCell>
                      <TableCell>{currency.exchangeRate.toFixed(4)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(currency)} disabled={currency.isBaseCurrency}>
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteCurrency(currency.id)} disabled={currency.isBaseCurrency}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                          </Button>
                           {!currency.isBaseCurrency && (
                            <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" onClick={() => handleSetAsBase(currency.id)}>
                              <CheckCircle className="mr-1 h-3 w-3" /> Set as Base
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
              <div className="text-xs text-muted-foreground">
                  Showing <strong>1 to {currencies.length}</strong> of <strong>{currencies.length}</strong> entries
              </div>
          </CardFooter>
        </Card>
      </div>

       {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Currency</DialogTitle>
                <DialogDescription>
                  Update the details for this currency.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-curr-name">Currency Name *</Label>
                    <Input id="edit-curr-name" value={editedCurrency.name} onChange={(e) => setEditedCurrency(p => ({...p, name: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-curr-code">Currency Code *</Label>
                    <Input id="edit-curr-code" value={editedCurrency.code} onChange={(e) => setEditedCurrency(p => ({...p, code: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-curr-symbol">Currency Symbol *</Label>
                    <Input id="edit-curr-symbol" value={editedCurrency.symbol} onChange={(e) => setEditedCurrency(p => ({...p, symbol: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-curr-rate">Exchange Rate *</Label>
                    <Input id="edit-curr-rate" type="number" value={editedCurrency.exchangeRate} onChange={(e) => setEditedCurrency(p => ({...p, exchangeRate: e.target.value}))} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleUpdateCurrency}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
