'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Plus, Pencil, Trash2 } from "lucide-react";
import React, { useState } from 'react';

type Category = {
  id: string;
  name: string;
  code: string;
  parentId?: string | null;
};

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Accessories', code: 'ACC', parentId: null },
  { id: 'cat-2', name: 'Shoes', code: 'SHOE', parentId: 'cat-1' },
  { id: 'cat-3', name: 'Food & Grocery', code: 'F&G', parentId: null },
  { id: 'cat-4', name: 'Sports', code: 'SPO', parentId: null },
  { id: 'cat-5', name: 'Exercise & Fitness', code: 'E&F', parentId: 'cat-4' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryCode, setNewCategoryCode] = useState('');
  const [newParentCategoryId, setNewParentCategoryId] = useState<string | undefined>(undefined);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editedCategoryCode, setEditedCategoryCode] = useState('');
  const [editedParentCategoryId, setEditedParentCategoryId] = useState<string | undefined>(undefined);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: newCategoryName,
        code: newCategoryCode,
        parentId: newParentCategoryId || null,
      };
      setCategories([...categories, newCategory]);
      setIsAddDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryCode('');
      setNewParentCategoryId(undefined);
    }
  };
  
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setEditedCategoryCode(category.code);
    setEditedParentCategoryId(category.parentId || undefined);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateCategory = () => {
    if (editingCategory && editedCategoryName.trim()) {
        const updatedCategories = categories.map(c => 
            c.id === editingCategory.id 
            ? { ...c, name: editedCategoryName, code: editedCategoryCode, parentId: editedParentCategoryId || null } 
            : c
        );
        setCategories(updatedCategories);
        setIsEditDialogOpen(false);
        setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };
  
  const getCategoryName = (id: string | null | undefined) => {
      if (!id) return 'None';
      return categories.find(c => c.id === id)?.name || 'Unknown';
  }

  return (
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
                                    {categories.map(cat => (
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
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.code}</TableCell>
                    <TableCell>{getCategoryName(category.parentId)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(category)}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteCategory(category.id)}>
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
                                .filter(cat => cat.id !== editingCategory?.id)
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
    </div>
  );
}
