'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { type DetailedProduct } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import { getProducts, deleteProduct } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { AppFooter } from '@/components/app-footer';

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
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const { user, loading: isLoadingAuth } = useAuth();
  const [products, setProducts] = useState<DetailedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<DetailedProduct | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (isLoadingAuth) return;
      setIsLoading(true); // Ensure loading state is true when fetching starts/restarts
      try {
        const bizId = user?.businessId || undefined;
        const productsData = await getProducts(bizId);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [user, isLoadingAuth]);

  const handleView = (productId: string) => {
    router.push(`/admin/products/view/${productId}`);
  };

  const handleEdit = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`);
  };

  const handleDelete = (product: DetailedProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setProducts(products.filter(p => p.id !== productToDelete.id));
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    }
  };

  return (
    <>
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
                        <Button onClick={() => window.print()} variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
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
                          {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                              </TableRow>
                            ))
                          ) : products.map((product) => (
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
                                    <DropdownMenuItem onSelect={() => handleView(product.id)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleEdit(product.id)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleDelete(product)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Add or edit opening stock</DropdownMenuItem>
                                    <DropdownMenuItem>Product stock history</DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate Product</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.businessLocation}</TableCell>
                              <TableCell>{formatCurrency(product.unitPurchasePrice)}</TableCell>
                              <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
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
                      Showing <strong>1 to {products.length}</strong> of <strong>{products.length}</strong> entries
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="stock-report">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Report</CardTitle>
                    <CardDescription>Comprehensive inventory analysis and stock levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                          <PackageIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{products.length}</div>
                          <p className="text-xs text-muted-foreground">Active products</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                          <BarChart2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatCurrency(products.reduce((sum, p) => sum + (p.currentStock * p.unitPurchasePrice), 0))}
                          </div>
                          <p className="text-xs text-muted-foreground">At purchase price</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                          <Info className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-yellow-600">
                            {products.filter(p => p.currentStock > 0 && p.currentStock < 10).length}
                          </div>
                          <p className="text-xs text-muted-foreground">Below 10 units</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                          <Info className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {products.filter(p => p.currentStock === 0).length}
                          </div>
                          <p className="text-xs text-muted-foreground">Need restock</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search products..." className="pl-8" />
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Stock Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="in-stock">In Stock</SelectItem>
                          <SelectItem value="low-stock">Low Stock</SelectItem>
                          <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {Array.from(new Set(products.map(p => p.category)))
                            .filter(cat => cat && cat.trim() !== '')
                            .map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <Download className="h-4 w-4" /> Export CSV
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <Download className="h-4 w-4" /> Export Excel
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <FileText className="h-4 w-4" /> Export PDF
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-1" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" /> Print
                      </Button>
                    </div>

                    {/* Stock Table */}
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Current Stock</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Stock Value</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                              </TableRow>
                            ))
                          ) : products.map((product) => {
                            const stockValue = product.currentStock * product.unitPurchasePrice;
                            const stockStatus = product.currentStock === 0
                              ? 'out'
                              : product.currentStock < 10
                                ? 'low'
                                : 'in';

                            return (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      width={32}
                                      height={32}
                                      className="rounded"
                                      data-ai-hint={productHints[product.id] || 'product'}
                                    />
                                    <span className="font-medium">{product.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {product.currentStock} {product.unit}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(product.unitPurchasePrice)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(stockValue)}
                                </TableCell>
                                <TableCell>
                                  {stockStatus === 'out' && (
                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
                                      Out of Stock
                                    </span>
                                  )}
                                  {stockStatus === 'low' && (
                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                      Low Stock
                                    </span>
                                  )}
                                  {stockStatus === 'in' && (
                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                      In Stock
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">
                      Showing <strong>{products.length}</strong> products
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <AppFooter />
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
