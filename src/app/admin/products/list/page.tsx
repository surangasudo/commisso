'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Download,
  Printer,
  Search,
  Pencil,
  Trash2,
  Eye,
  PlusCircle,
  Filter,
  Columns3,
  FileText,
  ChevronDown,
  Info,
  Package as PackageIcon,
  BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { detailedProducts, type DetailedProduct } from '@/lib/data';

const productHints: { [key: string]: string } = {
    'prod-1': 'fashion sneaker',
    'prod-2': 'running shoe',
    'prod-3': 'oreo cookies',
    'prod-4': 'egg carton',
    'prod-5': 'dumbbells',
    'prod-6': 'wine bottle',
    'prod-7': 'brown sneaker',
    'prod-8': 'black sneaker',
    'prod-9': 'wine bottle',
};

export default function ListProductsPage() {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
            <h1 className="font-headline text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your products</p>
        </div>

        <Card>
            <CardHeader>
                 <Button variant="outline" size="sm" className="h-9 gap-1.5 w-fit">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all-products">
                <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
                  <TabsTrigger value="all-products"><PackageIcon className="mr-2 h-4 w-4" /> All Products</TabsTrigger>
                  <TabsTrigger value="stock-report"><BarChart2 className="mr-2 h-4 w-4" /> Stock Report</TabsTrigger>
                </TabsList>
                <TabsContent value="all-products" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <CardTitle>All your Products</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Link href="/admin/products/add">
                                      <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                                          <PlusCircle className="h-4 w-4" />
                                          <span>Add</span>
                                      </Button>
                                    </Link>
                                    <Button size="sm" variant="outline" className="h-9 gap-1.5 w-full sm:w-auto">
                                        <Download className="h-4 w-4" />
                                        <span>Download Excel</span>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
                              <div className="flex items-center gap-2">
                                  <Select defaultValue="25">
                                      <SelectTrigger className="w-[100px] h-9">
                                          <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="10">Show 10</SelectItem>
                                          <SelectItem value="25">Show 25</SelectItem>
                                          <SelectItem value="50">Show 50</SelectItem>
                                          <SelectItem value="100">Show 100</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <span className="text-sm text-muted-foreground hidden lg:inline">entries</span>
                              </div>
                              <div className="flex-1 flex flex-wrap items-center justify-start sm:justify-center gap-2">
                                  <Button variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span></Button>
                                  <Button variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export Excel</span></Button>
                                  <Button variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
                                  <Button variant="outline" size="sm" className="h-9 gap-1"><Columns3 className="h-4 w-4" /> <span className="hidden sm:inline">Column visibility</span></Button>
                                  <Button variant="outline" size="sm" className="h-9 gap-1"><FileText className="h-4 w-4" /> <span className="hidden sm:inline">Export PDF</span></Button>
                              </div>
                              <div className="relative">
                                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" />
                              </div>
                            </div>
                            <div className="border rounded-md">
                              <Table>
                                  <TableHeader>
                                  <TableRow>
                                      <TableHead><Checkbox /></TableHead>
                                      <TableHead>Product Image</TableHead>
                                      <TableHead>Action</TableHead>
                                      <TableHead>Product</TableHead>
                                      <TableHead className="flex items-center gap-1">Business Location <Info className="w-3 h-3" /></TableHead>
                                      <TableHead>Unit Purchase Price</TableHead>
                                      <TableHead>Selling Price</TableHead>
                                      <TableHead>Current stock</TableHead>
                                      <TableHead>Product Type</TableHead>
                                      <TableHead>Category</TableHead>
                                      <TableHead>Brand</TableHead>
                                      <TableHead>Tax</TableHead>
                                      <TableHead>SKU</TableHead>
                                  </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                  {detailedProducts.map((product) => (
                                      <TableRow key={product.id}>
                                      <TableCell><Checkbox /></TableCell>
                                      <TableCell>
                                        <Image src={product.image} alt={product.name} width={40} height={40} className="rounded" data-ai-hint={productHints[product.id] || 'product'} />
                                      </TableCell>
                                      <TableCell>
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                  <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                                  <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                  <DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem>Add or edit opening stock</DropdownMenuItem>
                                                  <DropdownMenuItem>Product stock history</DropdownMenuItem>
                                                  <DropdownMenuItem>Duplicate Product</DropdownMenuItem>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </TableCell>
                                      <TableCell className="font-medium">{product.name}</TableCell>
                                      <TableCell>{product.businessLocation}</TableCell>
                                      <TableCell>${product.unitPurchasePrice.toFixed(2)}</TableCell>
                                      <TableCell>${product.sellingPrice.toFixed(2)}</TableCell>
                                      <TableCell>{product.currentStock} Pieces</TableCell>
                                      <TableCell>{product.productType}</TableCell>
                                      <TableCell>{product.category}</TableCell>
                                      <TableCell>{product.brand}</TableCell>
                                      <TableCell>{product.tax}</TableCell>
                                      <TableCell>{product.sku}</TableCell>
                                      </TableRow>
                                  ))}
                                  </TableBody>
                              </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-4 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button variant="destructive" size="sm">Delete Selected</Button>
                                <Button variant="outline" size="sm">Add to location</Button>
                                <Button variant="outline" size="sm">Remove from location</Button>
                                <Button variant="outline" size="sm">Deactivate Selected</Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Showing <strong>1 to {detailedProducts.length}</strong> of <strong>{detailedProducts.length}</strong> entries
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="stock-report">
                    <Card>
                        <CardHeader><CardTitle>Stock Report</CardTitle><CardDescription>Detailed stock report will be available here.</CardDescription></CardHeader>
                        <CardContent><div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg"><p className="text-muted-foreground">Coming Soon...</p></div></CardContent>
                    </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
        </Card>
        <div className="text-center text-xs text-slate-400 p-1">
            Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
        </div>
    </div>
  );
}
