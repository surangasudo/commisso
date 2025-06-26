'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Plus, Pencil, Trash2 } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getProductCategories, addProductCategory, updateProductCategory, deleteProductCategory, type ProductCategory } from '@/services/productCategoryService';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AppFooter } from "@/components/app-footer";


export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryCode, setNewCategoryCode] = useState('');
  const [newParentCategoryId, setNewParentCategoryId] = useState<string | undefined>(undefined);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editedCategoryCode, setEditedCategoryCode] = useState('');
  const [editedParentCategoryId, setEditedParentCategoryId] = useState<string | undefined>(undefined);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);


  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getProductCategories();
      setCategories(data);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch product categories.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [toast]);

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      const newCategoryData: Omit<ProductCategory, 'id'> = {
        name: newCategoryName,
        code: newCategoryCode,
        parentId: newParentCategoryId || null,
      };
      try {
        await addProductCategory(newCategoryData);
        toast({ title: "Success", description: "Category added." });
        setIsAddDialogOpen(false);
        setNewCategoryName('');
        setNewCategoryCode('');
        setNewParentCategoryId(undefined);
        fetchCategories(); // Re-fetch
      } catch (error) {
        toast({ title: "Error", description: "Failed to add category.", variant: "destructive" });
      }
    }
  };
  
  const handleEditClick = (category: ProductCategory) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setEditedCategoryCode(category.code);
    setEditedParentCategoryId(category.parentId || undefined);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateCategory = async () => {
    if (editingCategory && editedCategoryName.trim()) {
        const updatedData: Partial<Omit<ProductCategory, 'id'>> = {
            name: editedCategoryName,
            code: editedCategoryCode,
            parentId: editedParentCategoryId || null
        };
        try {
            await updateProductCategory(editingCategory.id, updatedData);
            toast({ title: "Success", description: "Category updated." });
            setIsEditDialogOpen(false);
            setEditingCategory(null);
            fetchCategories(); // Re-fetch
        } catch (error) {
            toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
        }
    }
  };

  const handleDeleteClick = (category: ProductCategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      // Also delete sub-categories client-side for immediate feedback, though backend logic should handle this ideally
      const subCategoryIds = categories.filter(c => c.parentId === categoryToDelete.id).map(c => c.id);
      try {
        await deleteProductCategory(categoryToDelete.id);
        for(const subId of subCategoryIds) {
            await deleteProductCategory(subId);
        }
        toast({ title: "Success", description: `Category "${categoryToDelete.name}" deleted.` });
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
        fetchCategories(); // Re-fetch
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
      }
    }
  };
  
  const getCategoryName = (id: string | null | undefined) => {
      if (!id) return 'None';
      return categories.find(c => c.id === id)?.name || 'Unknown';
  }
  
  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Folder className="w-8 h-8" />
          Categories
        </h1>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>All Product Categories</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogDescription>
                          Create a new category for your products.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="category-name">Category Name *</Label>
                            <Input 
                              id="category-name" 
                              placeholder="Category Name" 
                              required 
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category-code">Category Code</Label>
                            <Input 
                              id="category-code" 
                              placeholder="Unique category code" 
                              value={newCategoryCode}
                              onChange={(e) => setNewCategoryCode(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parent-category">Add as sub-category</Label>
                           <Select value={newParentCategoryId || 'none'} onValueChange={(value) => setNewParentCategoryId(value === 'none' ? undefined : value)}>
                                <SelectTrigger id="parent-category">
                                    <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {categories.filter(cat => !cat.parentId).map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleAddCategory}>Save</Button>
                      <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription className="pt-2">
              Manage categories for your products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Parent Category</TableHead>
                    <TableHead className="w-[180px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                            <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                            <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                            <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-[76px]"/><Skeleton className="h-8 w-[86px]"/></div></TableCell>
                        </TableRow>
                    ))
                  ) : categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.code}</TableCell>
                      <TableCell>{getCategoryName(category.parentId)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(category)}>
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(category)}>
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
                  Showing <strong>1 to {categories.length}</strong> of <strong>{categories.length}</strong> entries
              </div>
          </CardFooter>
        </Card>
      
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Edit Category</DialogTitle>
                  <DialogDescription>
                    Update the details for this category.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="edit-category-name">Category Name *</Label>
                      <Input 
                        id="edit-category-name" 
                        placeholder="Category Name" 
                        required 
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-category-code">Category Code</Label>
                      <Input 
                        id="edit-category-code" 
                        placeholder="Unique category code" 
                        value={editedCategoryCode}
                        onChange={(e) => setEditedCategoryCode(e.target.value)}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-parent-category">Add as sub-category</Label>
                      <Select value={editedParentCategoryId || 'none'} onValueChange={(value) => setEditedParentCategoryId(value === 'none' ? undefined : value)}>
                          <SelectTrigger id="edit-parent-category">
                              <SelectValue placeholder="Select parent category" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="none">None</SelectItem>
                            {categories
                                .filter(cat => cat.id !== editingCategory?.id && !cat.parentId)
                                .map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter>
                  <Button onClick={handleUpdateCategory}>Save Changes</Button>
                  <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
        <AppFooter />
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              "{categoryToDelete?.name}" and all its sub-categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
