'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Info } from "lucide-react";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const initialProductState = {
    id: '',
    name: '',
    sku: '',
    productType: 'Single',
    unit: 'Pieces',
    brand: '',
    category: '',
    businessLocation: 'Awesome Shop',
    image: 'https://placehold.co/40x40.png',
    unitPurchasePrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    tax: '',
};

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState(initialProductState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'number' ? parseFloat(value) || 0 : value;
      setProduct({ ...product, [name]: newValue as any });
  };

  const handleSelectChange = (name: string, value: string) => {
      setProduct({ ...product, [name]: value });
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    // Placeholder for future implementation
  };

  const handleSaveProduct = () => {
    if (!product.name.trim() || !product.unit || !product.sellingPrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Product Name, Unit, and Selling Price.",
        variant: "destructive",
      });
      return;
    }
    // In a real app, you would send this data to a server.
    console.log("Saving new product:", product);
    toast({
      title: "Product Saved",
      description: `"${product.name}" has been successfully added.`,
    });
    router.push('/admin/products/list');
  };

  return (
    <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Add New Product
        </h1>

        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" name="name" value={product.name} onChange={handleInputChange} placeholder="Product Name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU <Info className="inline w-3 h-3 text-muted-foreground" /></Label>
                            <Input id="sku" name="sku" value={product.sku} onChange={handleInputChange} placeholder="SKU" />
                            <p className="text-xs text-muted-foreground">Leave blank to auto generate SKU.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productType">Product Type *</Label>
                            <Select name="productType" value={product.productType} onValueChange={(value) => handleSelectChange('productType', value)}>
                                <SelectTrigger id="productType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Variable">Variable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit *</Label>
                            <Select name="unit" value={product.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                                <SelectTrigger id="unit">
                                    <SelectValue placeholder="Select Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pieces">Pieces</SelectItem>
                                    <SelectItem value="Kg">Kg</SelectItem>
                                    <SelectItem value="Box">Box</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                             <Select name="brand" value={product.brand} onValueChange={(value) => handleSelectChange('brand', value)}>
                                <SelectTrigger id="brand">
                                    <SelectValue placeholder="Select Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="Nike">Nike</SelectItem>
                                    <SelectItem value="Puma">Puma</SelectItem>
                                    <SelectItem value="Oreo">Oreo</SelectItem>
                                    <SelectItem value="Bowflex">Bowflex</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" value={product.category} onValueChange={(value) => handleSelectChange('category', value)}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="Accessories -- Shoes">Accessories -- Shoes</SelectItem>
                                    <SelectItem value="Food & Grocery">Food & Grocery</SelectItem>
                                    <SelectItem value="Sports -- Exercise & Fitness">Sports -- Exercise & Fitness</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label htmlFor="businessLocation">Business Locations</Label>
                            <Select name="businessLocation" value={product.businessLocation}>
                                <SelectTrigger id="businessLocation">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Awesome Shop">Awesome Shop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="manage-stock" defaultChecked onCheckedChange={(checked) => handleCheckboxChange('manageStock', !!checked)}/>
                        <Label htmlFor="manage-stock" className="font-normal">Manage Stock?</Label>
                         <Info className="inline w-3 h-3 text-muted-foreground" />
                    </div>
                     <p className="text-sm text-muted-foreground -mt-4 ml-6">Enable stock management at product level</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="alert-quantity">Alert quantity</Label>
                            <Input id="alert-quantity" type="number" placeholder="Alert quantity" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="product-image">Product Image</Label>
                             <Input id="product-image" type="file" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product-description">Product Description</Label>
                        <Textarea id="product-description" placeholder="Product Description" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pricing & Tax</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="tax">Applicable Tax</Label>
                            <Select name="tax" value={product.tax} onValueChange={(value) => handleSelectChange('tax', value)}>
                                <SelectTrigger id="tax">
                                    <SelectValue placeholder="Select Tax" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="VAT@10%">VAT@10%</SelectItem>
                                    <SelectItem value="GST@5%">GST@5%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purchase-price">Default Purchase Price</Label>
                            <Input id="purchase-price" name="unitPurchasePrice" type="number" value={product.unitPurchasePrice} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="selling-price">Default Selling Price *</Label>
                            <Input id="selling-price" name="sellingPrice" type="number" value={product.sellingPrice} onChange={handleInputChange}/>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveProduct}>Save Product</Button>
            </div>
        </div>
    </div>
  );
}
