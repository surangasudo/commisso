'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Search, Plus, Trash2 } from 'lucide-react';
import { detailedProducts, type DetailedProduct } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ProductForLabel = DetailedProduct & { labelCount: number };

export default function PrintLabelsPage() {
  const [productsToPrint, setProductsToPrint] = useState<ProductForLabel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProduct = (product: DetailedProduct) => {
    if (!productsToPrint.some(p => p.id === product.id)) {
      setProductsToPrint([...productsToPrint, { ...product, labelCount: 24 }]);
    }
    setSearchTerm('');
  };

  const handleRemoveProduct = (productId: string) => {
    setProductsToPrint(productsToPrint.filter(p => p.id !== productId));
  };
  
  const handleLabelCountChange = (productId: string, count: number) => {
    setProductsToPrint(productsToPrint.map(p => 
      p.id === productId ? { ...p, labelCount: Math.max(1, count) } : p
    ));
  };

  const searchResults = searchTerm
    ? detailedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5) // Limit results
    : [];
    
  const handlePrint = () => {
    alert("Printing feature is not implemented in this prototype.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Printer className="w-8 h-8" />
        <h1 className="font-headline text-3xl font-bold">Print Labels</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add products to generate Labels</CardTitle>
          <CardDescription>Search for products to add them to the print queue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1">
                {searchResults.map(product => (
                  <div 
                    key={product.id} 
                    className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center text-sm"
                    onClick={() => handleAddProduct(product)}
                  >
                    <span>{product.name} ({product.sku})</span>
                    <Plus className="w-4 h-4" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {productsToPrint.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Label Queue</CardTitle>
            <CardDescription>Review products and set label quantities before printing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[150px]">No. of labels</TableHead>
                    <TableHead className="text-right w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsToPrint.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name} ({product.sku})</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="w-24 h-9"
                          value={product.labelCount}
                          onChange={(e) => handleLabelCountChange(product.id, parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500 hover:bg-red-50" onClick={() => handleRemoveProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-base">Information to show in Labels:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                      <Checkbox id="show-name" defaultChecked />
                      <Label htmlFor="show-name">Product Name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <Checkbox id="show-variations" defaultChecked />
                      <Label htmlFor="show-variations">Product Variation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <Checkbox id="show-price" defaultChecked />
                      <Label htmlFor="show-price">Product Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <Checkbox id="show-business-name" defaultChecked />
                      <Label htmlFor="show-business-name">Business name</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                      <Checkbox id="show-packing-date" />
                      <Label htmlFor="show-packing-date">Packing date</Label>
                  </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button size="lg" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
