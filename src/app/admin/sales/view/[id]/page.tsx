'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Printer, Pencil, Package, ShoppingCart, User, Calendar, MapPin, CreditCard } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { sales, type Sale, detailedProducts, type DetailedProduct } from '@/lib/data';
import { cn } from "@/lib/utils";

const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'due':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'partial':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

const getShippingStatusBadge = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
        case 'ordered':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'packed':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'shipped':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'delivered':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

type SaleItem = {
  product: DetailedProduct;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

// Mock function to get items for a sale
const getSaleItems = (saleId: string): SaleItem[] => {
  // This is mock data. In a real application, you'd fetch this from your database.
  if (saleId === 'sale-1') {
    const product = detailedProducts.find(p => p.sku === 'AS0021'); // Pair Of Dumbbells
    if (!product) return [];
    const quantity = 1;
    const unitPrice = 750.00;
    return [{ product, quantity, unitPrice, subtotal: quantity * unitPrice }];
  }
  if (saleId === 'sale-2') {
    const product = detailedProducts.find(p => p.sku === 'AS0061'); // Red Wine
    if (!product) return [];
    const quantity = 1;
    const unitPrice = 412.50;
    return [{ product, quantity, unitPrice, subtotal: quantity * unitPrice }];
  }
  if (saleId === 'sale-3') {
     const product = detailedProducts.find(p => p.sku === 'AS0008'); // Nike Fashion Sneaker
     if (!product) return [];
     const quantity = 1;
     const unitPrice = 825.00;
     return [{ product, quantity, unitPrice, subtotal: quantity * unitPrice }];
  }
   if (saleId === 'sale-4') {
     const product1 = detailedProducts.find(p => p.sku === 'AS0010');
     const product2 = detailedProducts.find(p => p.sku === 'AS0009');
     if (!product1 || !product2) return [];
     const unitPrice = 3850;
     return [
         { product: product1, quantity: 1, unitPrice: unitPrice, subtotal: unitPrice },
         { product: product2, quantity: 1, unitPrice: unitPrice, subtotal: unitPrice },
     ];
   }
  return [];
}


export default function ViewSalePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [sale, setSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  useEffect(() => {
    if (id) {
      const saleData = sales.find(s => s.id === id);
      if (saleData) {
        setSale(saleData);
        setSaleItems(getSaleItems(id as string));
      } else {
        router.push('/admin/sales/all');
      }
    }
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (!sale || !saleItems) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Eye className="w-8 h-8" />
          View Sale
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading Sale Details...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Please wait...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" id="sale-details-page">
        <div className="flex items-center justify-between gap-4 print:hidden">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Eye className="w-8 h-8" />
                Sale Details
            </h1>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                <Button onClick={() => router.push(`/admin/sales/edit/${sale.id}`)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
            </div>
        </div>

        <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><ShoppingCart className="w-5 h-5 text-muted-foreground" /> Invoice No.</h3>
                    <p className="text-muted-foreground">{sale.invoiceNo}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Calendar className="w-5 h-5 text-muted-foreground" /> Date</h3>
                    <p className="text-muted-foreground">{sale.date}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><User className="w-5 h-5 text-muted-foreground" /> Customer</h3>
                    <p className="text-muted-foreground">{sale.customerName}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><MapPin className="w-5 h-5 text-muted-foreground" /> Location</h3>
                    <p className="text-muted-foreground">{sale.location}</p>
                </div>
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="font-semibold mb-2">Billing Address:</h4>
                    <p className="text-sm text-muted-foreground">
                        {sale.customerName}, <br/>
                        {sale.contactNumber} <br/>
                        Address not available.
                    </p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Shipping Address:</h4>
                    <p className="text-sm text-muted-foreground">
                        {sale.shippingDetails || "No shipping details available."}
                    </p>
                </div>
            </div>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package className="w-6 h-6" /> Products Sold</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {saleItems.map((item, index) => (
                                <TableRow key={item.product.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{item.product.name}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-semibold">${item.subtotal.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <div className="flex justify-end mt-6">
                    <div className="w-full max-w-sm space-y-2 text-muted-foreground">
                        <div className="flex justify-between"><span>Subtotal:</span><span>${sale.totalAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Shipping:</span><span>$0.00</span></div>
                        <div className="flex justify-between"><span>Tax:</span><span>$0.00</span></div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-foreground text-lg"><span>Total:</span><span>${sale.totalAmount.toFixed(2)}</span></div>
                         <div className="flex justify-between"><span>Total Paid:</span><span>${sale.totalPaid.toFixed(2)}</span></div>
                         <div className="flex justify-between font-bold text-red-600"><span>Total Due:</span><span>${sale.sellDue.toFixed(2)}</span></div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-6 h-6" /> Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h4 className="font-semibold mb-1">Payment Status</h4>
                        <Badge variant="outline" className={cn("capitalize", getPaymentStatusBadge(sale.paymentStatus))}>{sale.paymentStatus}</Badge>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1">Payment Method</h4>
                        <p className="text-muted-foreground">{sale.paymentMethod}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1">Shipping Status</h4>
                         <Badge variant="outline" className={cn("capitalize", getShippingStatusBadge(sale.shippingStatus))}>{sale.shippingStatus || 'Not Applicable'}</Badge>
                    </div>
                </div>
                 <Separator className="my-4" />
                <h4 className="font-semibold mb-2">Notes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h5 className="text-muted-foreground">Sell Note:</h5>
                        <p>{sale.sellNote || 'No sell note provided.'}</p>
                    </div>
                     <div>
                        <h5 className="text-muted-foreground">Staff Note:</h5>
                        <p>{sale.staffNote || 'No staff note provided.'}</p>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="flex justify-end print:hidden">
                <p className="text-sm text-muted-foreground">Added by: {sale.addedBy}</p>
            </CardFooter>
        </Card>

         <div className="text-center text-xs text-slate-400 p-1 print:hidden">
            Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
        </div>
    </div>
  );
}
