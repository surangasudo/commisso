'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Award, Plus, Pencil, Trash2 } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getBrands, addBrand, updateBrand, deleteBrand, type Brand } from '@/services/brandService';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


export default function BrandsPage() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editedBrandName, setEditedBrandName] = useState('');

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);


  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch brands.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [toast]);

  const handleAddBrand = async () => {
    if (newBrandName.trim()) {
      const newBrandData: Omit<Brand, 'id'> = { name: newBrandName };
      try {
        await addBrand(newBrandData);
        toast({ title: "Success", description: "Brand added." });
        setIsAddDialogOpen(false);
        setNewBrandName('');
        fetchBrands();
      } catch (error) {
        toast({ title: "Error", description: "Failed to add brand.", variant: "destructive" });
      }
    }
  };
  
  const handleEditClick = (brand: Brand) => {
    setEditingBrand(brand);
    setEditedBrandName(brand.name);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateBrand = async () => {
    if (editingBrand && editedBrandName.trim()) {
        try {
            await updateBrand(editingBrand.id, { name: editedBrandName });
            toast({ title: "Success", description: "Brand updated." });
            setIsEditDialogOpen(false);
            setEditingBrand(null);
            fetchBrands();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update brand.", variant: "destructive" });
        }
    }
  };

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (brandToDelete) {
        try {
            await deleteBrand(brandToDelete.id);
            toast({ title: "Success", description: `Brand "${brandToDelete.name}" deleted.` });
            setIsDeleteDialogOpen(false);
            setBrandToDelete(null);
            fetchBrands();
        } catch(error) {
            toast({ title: "Error", description: "Failed to delete brand.", variant: "destructive" });
        }
    }
  };
  
  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Award className="w-8 h-8" />
          Brands
        </h1>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>All Brands</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Brand</DialogTitle>
                        <DialogDescription>
                          Create a new brand for your products.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand-name">Brand Name *</Label>
                            <Input 
                              id="brand-name" 
                              placeholder="Brand Name" 
                              required 
                              value={newBrandName}
                              onChange={(e) => setNewBrandName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddBrand}>Save</Button>
                        <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription className="pt-2">
              Manage brands for your products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand Name</TableHead>
                    <TableHead className="w-[180px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     Array.from({length: 3}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                            <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-[76px]"/><Skeleton className="h-8 w-[86px]"/></div></TableCell>
                        </TableRow>
                    ))
                  ) : brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(brand)}>
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(brand)}>
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
                  Showing <strong>1 to {brands.length}</strong> of <strong>{brands.length}</strong> entries
              </div>
          </CardFooter>
        </Card>
      
        {/* Edit Dialog */}
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Edit Brand</DialogTitle>
                  <DialogDescription>
                    Update the name for this brand.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="edit-brand-name">Brand Name *</Label>
                      <Input 
                        id="edit-brand-name" 
                        placeholder="Brand Name" 
                        required 
                        value={editedBrandName}
                        onChange={(e) => setEditedBrandName(e.target.value)}
                      />
                  </div>
              </div>
              <DialogFooter>
                  <Button onClick={handleUpdateBrand}>Save Changes</Button>
                  <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the brand "{brandToDelete?.name}".</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setBrandToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
