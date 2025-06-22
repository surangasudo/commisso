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

// This is the component that will be rendered for printing.
// It's hidden on screen and only becomes visible when printing.
const LabelSheet = ({ products, options, packingDate }: { 
    products: ProductForLabel[], 
    options: {
        showName: boolean,
        showVariations: boolean,
        showPrice: boolean,
        showBusinessName: boolean,
        showPackingDate: boolean,
    },
    packingDate: string,
}) => {
  const labels = products.flatMap(product =>
    Array.from({ length: product.labelCount }, (_, i) => ({ ...product, key: `${product.id}-${i}` }))
  );

  return (
    <div className="hidden print:block">
      <div className="grid grid-cols-4 gap-x-2 gap-y-1 p-4">
        {labels.map((label) => (
          <div key={label.key} className="border p-1 text-center text-[8px] break-words flex flex-col justify-center items-center h-20">
            {options.showBusinessName && <p className="font-bold">Awesome Shop</p>}
            {options.showName && <p className="font-medium leading-tight">{label.name}</p>}
            {options.showVariations && <p className="text-gray-600">({label.sku})</p>}
            {options.showPrice && <p className="font-bold text-[10px]">${label.sellingPrice.toFixed(2)}</p>}
            {options.showPackingDate && <p className="text-gray-600 mt-1 text-[7px]">Packed: {packingDate}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PrintLabelsPage() {
  const [productsToPrint, setProductsToPrint] = useState<ProductForLabel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for label options
  const [showName, setShowName] = useState(true);
  const [showVariations, setShowVariations] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [showPackingDate, setShowPackingDate] = useState(false);
  const [packingDate, setPackingDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD

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
    window.print();
  };
  
  const printOptions = { showName, showVariations, showPrice, showBusinessName, showPackingDate };
  const formattedPackingDate = packingDate 
    ? new Date(packingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Prevent timezone shift issues
      })
    : '';

  return (
    <>
      <div className="print:hidden flex flex-col gap-6">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-2 text-sm items-center">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="show-name" checked={showName} onCheckedChange={(c) => setShowName(!!c)} />
                        <Label htmlFor="show-name">Product Name</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="show-variations" checked={showVariations} onCheckedChange={(c) => setShowVariations(!!c)} />
                        <Label htmlFor="show-variations">Product Variation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="show-price" checked={showPrice} onCheckedChange={(c) => setShowPrice(!!c)} />
                        <Label htmlFor="show-price">Product Price</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="show-business-name" checked={showBusinessName} onCheckedChange={(c) => setShowBusinessName(!!c)} />
                        <Label htmlFor="show-business-name">Business name</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="show-packing-date" checked={showPackingDate} onCheckedChange={(c) => setShowPackingDate(!!c)} />
                        <Label htmlFor="show-packing-date">Packing date</Label>
                    </div>
                    {showPackingDate && (
                      <div className="flex items-center space-x-2">
                          <Input 
                              type="date" 
                              value={packingDate} 
                              onChange={e => setPackingDate(e.target.value)} 
                              className="h-9 w-auto"
                          />
                      </div>
                    )}
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
      <LabelSheet products={productsToPrint} options={printOptions} packingDate={formattedPackingDate} />
    </>
  );
}
