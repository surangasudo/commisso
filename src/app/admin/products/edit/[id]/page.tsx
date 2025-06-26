'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Info } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { type DetailedProduct } from '@/lib/data';
import { getProduct, updateProduct } from '@/services/productService';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { getProductCategories, type ProductCategory } from '@/services/productCategoryService';
import { getBrands, type Brand } from '@/services/brandService';


export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const fetchProduct = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      const [productToEdit, catData, brandData] = await Promise.all([
          getProduct(productId),
          getProductCategories(),
          getBrands()
      ]);

      setCategories(catData);
      setBrands(brandData);
      
      if (productToEdit) {
        setProduct(productToEdit);
      } else {
        toast({
          title: "Error",
          description: "Product not found.",
          variant: "destructive",
        });
        router.push('/admin/products/list');
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast({
        title: "Error",
        description: "Could not load product details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (product) {
      const { name, value, type } = e.target;
      const newValue = type === 'number' ? parseFloat(value) || 0 : value;
      setProduct({ ...product, [name]: newValue as any });
    }
  };

  const handleSelectChange = (name: keyof DetailedProduct, value: string) => {
    if (product) {
      setProduct({ ...product, [name]: value as any });
    }
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    // Placeholder for future implementation
  };

  const handleUpdateProduct = async () => {
    if (!product || typeof id !== 'string') return;
    
    setIsLoading(true);
    try {
        const { id: productId, ...productToUpdate } = product;
        await updateProduct(id, productToUpdate);
        toast({
            title: "Product Updated",
            description: `"${product.name}" has been successfully updated.`,
        });
        router.push('/admin/products/list');
    } catch (error) {
        console.error("Failed to update product:", error);
        if (error instanceof FirebaseError && error.code === 'permission-denied') {
            toast({
                title: "Permission Error",
                description: "You don't have permission to update products.",
                variant: "destructive",
                duration: 9000,
            });
        } else {
            toast({
                title: "Error",
                description: "Failed to update the product. Please try again.",
                variant: "destructive",
            });
        }
    } finally {
        setIsLoading(false);
    }
  }

  if (isLoading || !product) {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Package className="w-8 h-8" />
                Edit Product
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Edit Product
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
                            <Input id="name" name="name" value={product.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU <Info className="inline w-3 h-3 text-muted-foreground" /></Label>
                            <Input id="sku" name="sku" value={product.sku} onChange={handleInputChange} />
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
                                    {brands.map(brand => (
                                        <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                                    ))}
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
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
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
                             <div className="flex items-center gap-4">
                                <Image src={product.image} alt={product.name} width={60} height={60} className="rounded-md" />
                                <Input id="product-image" type="file" />
                             </div>
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
                            <Label htmlFor="unitPurchasePrice">Default Purchase Price</Label>
                            <Input id="unitPurchasePrice" name="unitPurchasePrice" type="number" value={product.unitPurchasePrice} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sellingPrice">Default Selling Price *</Label>
                            <Input id="sellingPrice" name="sellingPrice" type="number" value={product.sellingPrice} onChange={handleInputChange}/>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button size="lg" onClick={handleUpdateProduct} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    </div>
  );
}
