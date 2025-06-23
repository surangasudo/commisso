'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Percent, Plus, Pencil, Trash2 } from "lucide-react";
import React, { useState } from 'react';
import { initialTaxRates, type TaxRate } from "@/lib/data";

export default function TaxRatesPage() {
  const [taxRates, setTaxRates] = useState(initialTaxRates);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaxRate, setNewTaxRate] = useState({ name: '', rate: '' });

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [editedTaxRate, setEditedTaxRate] = useState({ name: '', rate: '' });

  const handleAddTaxRate = () => {
    if (newTaxRate.name.trim() && newTaxRate.rate) {
      const rateToAdd: TaxRate = {
        id: `tax-${Date.now()}`,
        name: newTaxRate.name,
        rate: Number(newTaxRate.rate),
      };
      setTaxRates([...taxRates, rateToAdd]);
      setIsAddDialogOpen(false);
      setNewTaxRate({ name: '', rate: '' });
    }
  };
  
  const handleEditClick = (taxRate: TaxRate) => {
    setEditingTaxRate(taxRate);
    setEditedTaxRate({
        name: taxRate.name,
        rate: String(taxRate.rate),
    });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateTaxRate = () => {
    if (editingTaxRate && editedTaxRate.name.trim() && editedTaxRate.rate) {
        const updatedTaxRates = taxRates.map(t => 
            t.id === editingTaxRate.id 
            ? { ...t, 
                name: editedTaxRate.name,
                rate: Number(editedTaxRate.rate)
              } 
            : t
        );
        setTaxRates(updatedTaxRates);
        setIsEditDialogOpen(false);
        setEditingTaxRate(null);
    }
  };

  const handleDeleteTaxRate = (id: string) => {
    setTaxRates(taxRates.filter(t => t.id !== id));
  };
  
  return (
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Percent className="w-8 h-8" />
          Tax Rates
        </h1>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>All Tax Rates</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Tax Rate</DialogTitle>
                        <DialogDescription>
                          Create a new tax rate to apply to products and sales.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="tax-name">Name *</Label>
                            <Input id="tax-name" placeholder="e.g. VAT" value={newTaxRate.name} onChange={(e) => setNewTaxRate(p => ({...p, name: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="tax-rate">Rate (%) *</Label>
                            <Input id="tax-rate" type="number" placeholder="e.g. 10" value={newTaxRate.rate} onChange={(e) => setNewTaxRate(p => ({...p, rate: e.target.value}))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddTaxRate}>Save</Button>
                        <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription className="pt-2">
                Manage tax rates for your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rate (%)</TableHead>
                    <TableHead className="w-[180px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-medium">{tax.name}</TableCell>
                      <TableCell>{tax.rate}%</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(tax)}>
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteTaxRate(tax.id)}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                          </Button>
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
                  Showing <strong>1 to {taxRates.length}</strong> of <strong>{taxRates.length}</strong> entries
              </div>
          </CardFooter>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Tax Rate</DialogTitle>
                    <DialogDescription>
                      Update the details for this tax rate.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-tax-name">Name *</Label>
                        <Input id="edit-tax-name" value={editedTaxRate.name} onChange={(e) => setEditedTaxRate(p => ({...p, name: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-tax-rate">Rate (%) *</Label>
                        <Input id="edit-tax-rate" type="number" value={editedTaxRate.rate} onChange={(e) => setEditedTaxRate(p => ({...p, rate: e.target.value}))} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdateTaxRate}>Save Changes</Button>
                    <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
         <div className="text-center text-xs text-slate-400 p-1">
            Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
        </div>
      </div>
  );
}
