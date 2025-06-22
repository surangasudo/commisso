'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgePercent, Plus, Pencil, Trash2 } from "lucide-react";
import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { discounts as initialDiscounts, type Discount } from '@/lib/data';

type DiscountType = 'Fixed' | 'Percentage';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDiscountName, setNewDiscountName] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<DiscountType>('Percentage');
  const [newDiscountValue, setNewDiscountValue] = useState<number | ''>('');
  const [newDiscountIsActive, setNewDiscountIsActive] = useState(true);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [editedDiscountName, setEditedDiscountName] = useState('');
  const [editedDiscountType, setEditedDiscountType] = useState<DiscountType>('Percentage');
  const [editedDiscountValue, setEditedDiscountValue] = useState<number | ''>('');
  const [editedDiscountIsActive, setEditedDiscountIsActive] = useState(true);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);


  const handleAddDiscount = () => {
    if (newDiscountName.trim() && newDiscountValue) {
      const newDiscount: Discount = {
        id: `disc-${Date.now()}`,
        name: newDiscountName,
        type: newDiscountType,
        value: newDiscountValue,
        isActive: newDiscountIsActive
      };
      setDiscounts([...discounts, newDiscount]);
      setIsAddDialogOpen(false);
      setNewDiscountName('');
      setNewDiscountType('Percentage');
      setNewDiscountValue('');
      setNewDiscountIsActive(true);
    }
  };
  
  const handleEditClick = (discount: Discount) => {
    setEditingDiscount(discount);
    setEditedDiscountName(discount.name);
    setEditedDiscountType(discount.type);
    setEditedDiscountValue(discount.value);
    setEditedDiscountIsActive(discount.isActive);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateDiscount = () => {
    if (editingDiscount && editedDiscountName.trim() && editedDiscountValue) {
        const updatedDiscounts = discounts.map(d => 
            d.id === editingDiscount.id 
            ? { ...d, name: editedDiscountName, type: editedDiscountType, value: editedDiscountValue, isActive: editedDiscountIsActive } 
            : d
        );
        setDiscounts(updatedDiscounts);
        setIsEditDialogOpen(false);
        setEditingDiscount(null);
    }
  };

  const handleDeleteClick = (discount: Discount) => {
    setDiscountToDelete(discount);
    setIsDeleteDialogOpen(true);
  }

  const confirmDelete = () => {
    if (discountToDelete) {
      setDiscounts(discounts.filter(d => d.id !== discountToDelete.id));
      setIsDeleteDialogOpen(false);
      setDiscountToDelete(null);
    }
  };

  return (
    <>
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <BadgePercent className="w-8 h-8" />
        Discounts
      </h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>All Discounts</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>Add Discount</DialogTitle>
                      <DialogDescription>
                        Create a new discount for your sales.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="discount-name">Discount Name *</Label>
                          <Input 
                            id="discount-name" 
                            placeholder="e.g. Summer Sale" 
                            required 
                            value={newDiscountName}
                            onChange={(e) => setNewDiscountName(e.target.value)}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="discount-type">Discount Type</Label>
                              <Select value={newDiscountType} onValueChange={(value: DiscountType) => setNewDiscountType(value)}>
                                  <SelectTrigger id="discount-type">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Percentage">Percentage</SelectItem>
                                      <SelectItem value="Fixed">Fixed</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                                <Label htmlFor="discount-value">Discount Value *</Label>
                                <Input 
                                    id="discount-value" 
                                    type="number"
                                    placeholder={newDiscountType === 'Percentage' ? "e.g. 15" : "e.g. 50"}
                                    required 
                                    value={newDiscountValue}
                                    onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                                />
                          </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch id="is-active" checked={newDiscountIsActive} onCheckedChange={setNewDiscountIsActive} />
                        <Label htmlFor="is-active">Is Active?</Label>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleAddDiscount}>Save</Button>
                      <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="pt-2">
            Manage your discounts. These can be applied to sales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[180px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">{discount.name}</TableCell>
                    <TableCell>{discount.type}</TableCell>
                    <TableCell>{discount.type === 'Percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}</TableCell>
                    <TableCell>
                        <Badge variant={discount.isActive ? "default" : "secondary"}>
                            {discount.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(discount)}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(discount)}>
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
                Showing <strong>1 to {discounts.length}</strong> of <strong>{discounts.length}</strong> entries
            </div>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Discount</DialogTitle>
                <DialogDescription>
                  Update the details for this discount.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-discount-name">Discount Name *</Label>
                    <Input 
                      id="edit-discount-name" 
                      placeholder="e.g. Summer Sale" 
                      required 
                      value={editedDiscountName}
                      onChange={(e) => setEditedDiscountName(e.target.value)}
                    />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-discount-type">Discount Type</Label>
                        <Select value={editedDiscountType} onValueChange={(value: DiscountType) => setEditedDiscountType(value)}>
                            <SelectTrigger id="edit-discount-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Percentage">Percentage</SelectItem>
                                <SelectItem value="Fixed">Fixed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                          <Label htmlFor="edit-discount-value">Discount Value *</Label>
                          <Input 
                              id="edit-discount-value" 
                              type="number"
                              placeholder={editedDiscountType === 'Percentage' ? "e.g. 15" : "e.g. 50"}
                              required 
                              value={editedDiscountValue}
                              onChange={(e) => setEditedDiscountValue(Number(e.target.value))}
                          />
                    </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="edit-is-active" checked={editedDiscountIsActive} onCheckedChange={setEditedDiscountIsActive} />
                  <Label htmlFor="edit-is-active">Is Active?</Label>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleUpdateDiscount}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              "{discountToDelete?.name}" discount.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDiscountToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
}
