'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgePercent, Plus, Pencil, Trash2, ArrowUpDown, Info, Search, X, Calendar as CalendarIcon } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { discounts as initialDiscounts, detailedProducts, type Discount } from '@/lib/data';
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type DiscountType = 'Fixed' | 'Percentage';

const initialNewDiscountState = {
  name: '',
  brand: '',
  category: '',
  location: 'awesome-shop',
  priority: '',
  discountType: 'Percentage' as DiscountType,
  discountAmount: '',
  startsAt: undefined as Date | undefined,
  endsAt: undefined as Date | undefined,
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState(initialNewDiscountState);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    if (isAddDialogOpen) {
        setNewDiscount({ ...initialNewDiscountState, startsAt: new Date(), discountType: 'Percentage' });
        setSelectedProducts([]);
        setProductSearchTerm('');
    }
  }, [isAddDialogOpen]);

  const searchResults = productSearchTerm
    ? detailedProducts.filter(p =>
        p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
      ).slice(0, 5) // Limit results
    : [];

  const handleSelectProduct = (productName: string) => {
    if (!selectedProducts.includes(productName)) {
      setSelectedProducts([...selectedProducts, productName]);
    }
    setProductSearchTerm('');
  };

  const handleRemoveProduct = (productName: string) => {
    setSelectedProducts(selectedProducts.filter(p => p !== productName));
  };
  
  const handleAddDiscount = () => {
    if (newDiscount.name.trim() && newDiscount.location && newDiscount.discountType && newDiscount.discountAmount) {
      const discountToAdd: Discount = {
        id: `disc-${Date.now()}`,
        name: newDiscount.name,
        products: selectedProducts,
        brand: newDiscount.brand,
        category: newDiscount.category,
        location: newDiscount.location,
        priority: Number(newDiscount.priority) || 0,
        discountType: newDiscount.discountType,
        discountAmount: Number(newDiscount.discountAmount),
        startsAt: newDiscount.startsAt ? format(newDiscount.startsAt, 'MM/dd/yyyy') : '',
        endsAt: newDiscount.endsAt ? format(newDiscount.endsAt, 'MM/dd/yyyy') : null,
        isActive: true,
      };
      setDiscounts([...discounts, discountToAdd]);
      setIsAddDialogOpen(false);
    }
  };
  
  const handleInputChange = (field: keyof typeof newDiscount, value: string) => {
    setNewDiscount(prev => ({...prev, [field]: value}));
  };

  const handleSelectChange = (field: keyof typeof newDiscount, value: string) => {
    setNewDiscount(prev => ({...prev, [field]: value}));
  };
  
  return (
    <TooltipProvider>
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        Discount
      </h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                  <DialogHeader>
                      <DialogTitle>Add Discount</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name:*</Label>
                      <Input id="name" value={newDiscount.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="products">Products:</Label>
                       <div className="relative">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedProducts.map(product => (
                            <Badge key={product} variant="secondary">
                              {product}
                              <button onClick={() => handleRemoveProduct(product)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input 
                          id="products" 
                          placeholder="Search products to add..." 
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                          <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1">
                            {searchResults.map(product => (
                              <div 
                                key={product.id} 
                                className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center text-sm"
                                onClick={() => handleSelectProduct(product.name)}
                              >
                                <span>{product.name} ({product.sku})</span>
                                <Plus className="h-4 w-4" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand:</Label>
                      <Select value={newDiscount.brand} onValueChange={(value) => handleSelectChange('brand', value)}>
                        <SelectTrigger id="brand"><SelectValue placeholder="Please Select" /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="none">None</SelectItem>
                           <SelectItem value="nike">Nike</SelectItem>
                           <SelectItem value="puma">Puma</SelectItem>
                           <SelectItem value="oreo">Oreo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category:</Label>
                       <Select value={newDiscount.category} onValueChange={(value) => handleSelectChange('category', value)}>
                        <SelectTrigger id="category"><SelectValue placeholder="Please Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="shoes">Accessories -- Shoes</SelectItem>
                          <SelectItem value="food">Food & Grocery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location:*</Label>
                       <Select value={newDiscount.location} onValueChange={(value) => handleSelectChange('location', value)}>
                        <SelectTrigger id="location"><SelectValue placeholder="Please Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="awesome-shop">Awesome Shop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="flex items-center gap-1">
                        Priority:
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent><p>Higher priority discounts override lower ones.</p></TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input id="priority" placeholder="Priority" value={newDiscount.priority} onChange={(e) => handleInputChange('priority', e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount-type">Discount Type:*</Label>
                      <Select value={newDiscount.discountType} onValueChange={(value: DiscountType) => setNewDiscount(p => ({...p, discountType: value}))}>
                        <SelectTrigger id="discount-type"><SelectValue placeholder="Please Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fixed">Fixed</SelectItem>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount-amount">Discount Amount:*</Label>
                      <Input id="discount-amount" placeholder="Discount Amount" value={newDiscount.discountAmount} onChange={(e) => handleInputChange('discountAmount', e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="starts-at">Starts At:</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newDiscount.startsAt && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newDiscount.startsAt ? format(newDiscount.startsAt, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newDiscount.startsAt}
                              onSelect={(date) => setNewDiscount(p => ({...p, startsAt: date}))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ends-at">Ends At:</Label>
                       <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newDiscount.endsAt && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newDiscount.endsAt ? format(newDiscount.endsAt, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newDiscount.endsAt}
                              onSelect={(date) => setNewDiscount(p => ({...p, endsAt: date}))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                    </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleAddDiscount}>Save</Button>
                      <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
                <Select defaultValue="25">
                    <SelectTrigger className="w-[100px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">Show 10</SelectItem>
                        <SelectItem value="25">Show 25</SelectItem>
                        <SelectItem value="50">Show 50</SelectItem>
                        <SelectItem value="100">Show 100</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground hidden lg:inline">entries</span>
            </div>
             <Button variant="destructive" size="sm" disabled={selectedDiscounts.length === 0}>Deactivate Selected</Button>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Checkbox/></TableHead>
                  <TableHead><div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                  <TableHead><div className="flex items-center gap-1">Starts At <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                  <TableHead><div className="flex items-center gap-1">Ends At <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.length > 0 ? discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell><Checkbox/></TableCell>
                    <TableCell className="font-medium">{discount.name}</TableCell>
                    <TableCell>{discount.startsAt}</TableCell>
                    <TableCell>{discount.endsAt || 'N/A'}</TableCell>
                    <TableCell>{discount.category || 'All'}</TableCell>
                    <TableCell>{discount.products.join(', ') || 'All'}</TableCell>
                    <TableCell>{discount.location}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">Showing 0 to 0 of 0 entries</TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between py-4">
            <div className="text-xs text-muted-foreground">
                Showing <strong>{discounts.length} to {discounts.length}</strong> of <strong>{discounts.length}</strong> entries
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
            </div>
        </CardFooter>
      </Card>
      <div className="text-center text-xs text-slate-400 p-1">
          Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
      </div>
    </div>
    </TooltipProvider>
  );
}
