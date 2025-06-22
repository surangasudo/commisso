'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, Search } from "lucide-react";
import { detailedProducts as initialProducts, type DetailedProduct } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type ProductPriceUpdate = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  newPrice: string; // Use string to handle intermediate input state
};

export default function UpdatePricePage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductPriceUpdate[]>(
    initialProducts.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      sellingPrice: p.sellingPrice,
      newPrice: p.sellingPrice.toString(),
    }))
  );
  const [searchTerm, setSearchTerm] = useState('');

  const handlePriceChange = (productId: string, newPriceValue: string) => {
    setProducts(products.map(p => p.id === productId ? { ...p, newPrice: newPriceValue } : p));
  };
  
  const handleUpdateAll = () => {
    // In a real app, this would send the updated prices to a server.
    // For now, we'll just log it and show a toast.
    const updatedProducts = products
      .filter(p => parseFloat(p.newPrice) !== p.sellingPrice)
      .map(p => ({ ...p, sellingPrice: parseFloat(p.newPrice) || p.sellingPrice }));
    
    if (updatedProducts.length > 0) {
        setProducts(products.map(p => {
            const updated = updatedProducts.find(up => up.id === p.id);
            if (updated) {
                return { ...p, sellingPrice: updated.sellingPrice, newPrice: updated.sellingPrice.toString() };
            }
            return p;
        }));

        toast({
            title: "Success!",
            description: `Updated prices for ${updatedProducts.length} product(s).`,
        });
    } else {
         toast({
            title: "No Changes",
            description: "No prices were modified.",
            variant: "destructive",
        });
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Tag className="w-8 h-8" />
        Update Product Prices
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Bulk Price Update</CardTitle>
          <CardDescription>
            Update prices for multiple products at once. Enter the new price and click "Update All Prices" to save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8 w-full sm:w-80 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead className="w-[150px]">New Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>${product.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={product.newPrice}
                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                        className="w-32"
                        placeholder="New Price"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleUpdateAll}>Update All Prices</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
