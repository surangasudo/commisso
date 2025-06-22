'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  UserPlus,
  XCircle,
  CreditCard,
  Save,
  Plus,
  Minus,
  ShoppingCart,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { products, type Product } from '@/lib/data';

const productHints: { [key: string]: string } = {
  'prod-001': 'espresso coffee',
  'prod-002': 'latte art',
  'prod-003': 'cappuccino foam',
  'prod-004': 'flaky croissant',
  'prod-005': 'blueberry muffin',
  'prod-006': 'iced tea',
  'prod-007': 'water bottle',
  'prod-008': 'club sandwich',
  'prod-009': 'caesar salad',
  'prod-010': 'sesame bagel',
  'prod-011': 'black coffee',
  'prod-012': 'hot chocolate',
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function PosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product.id !== productId)
    );
  };
  
  const clearCart = () => {
    setCart([]);
  }

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const tax = useMemo(() => subtotal * 0.08, [subtotal]); // 8% tax
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  return (
    <div className="h-[calc(100vh-60px-2rem)] grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection */}
      <div className="lg:col-span-2 h-full">
        <Card className="h-full flex flex-col shadow-md">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                className="pl-10 w-full text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-full p-6 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-xl transition-shadow overflow-hidden group border-2 border-transparent hover:border-primary"
                    onClick={() => addToCart(product)}
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={productHints[product.id] || 'product'}
                      />
                       <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <div className="p-3 bg-card">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      <p className="text-base font-bold text-primary">${product.price.toFixed(2)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Cart and Checkout */}
      <div className="lg:col-span-1 h-full">
        <Card className="h-full flex flex-col shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-headline">
                <ShoppingCart className="h-6 w-6" />
                Current Order
              </div>
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </CardTitle>
          </CardHeader>
          <div className="flex-grow flex flex-col overflow-hidden">
            {cart.length > 0 ? (
              <>
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4">
                     <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                        data-ai-hint={productHints[item.product.id] || 'product'}
                      />
                      <div className="flex-grow">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-6 text-center font-bold">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                      </div>
                      <div className="text-right w-16 font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.product.id)}>
                        <XCircle className="h-5 w-5"/>
                      </Button>
                  </div>
                ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t bg-muted/50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-xl">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                 <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={clearCart}>
                      <XCircle className="mr-2 h-4 w-4"/> Cancel
                  </Button>
                   <Button variant="outline" className="w-full">
                      <Save className="mr-2 h-4 w-4"/> Suspend
                  </Button>
                </div>
                <Button size="lg" className="w-full mt-2 text-lg h-12 font-bold">
                  <CreditCard className="mr-2 h-5 w-5"/> Payment
                </Button>
              </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                  <ShoppingCart className="h-16 w-16 mb-4 text-primary/20" />
                  <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
                  <p>Click on products to add them to the order.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
