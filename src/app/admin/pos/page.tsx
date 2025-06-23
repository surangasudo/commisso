'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  UserPlus,
  X,
  CreditCard,
  PlusCircle,
  Minus,
  Calendar,
  Rewind,
  Save,
  Calculator,
  RefreshCw,
  Expand,
  HelpCircle,
  Plus,
  FileText,
  Pause,
  History,
  Info,
  Edit2,
  LayoutGrid,
  Copyright,
  Undo2,
  WalletCards
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { products, type Product } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils';

const productHints: { [key: string]: string } = {
  'prod-001': 'laptop computer',
  'prod-002': 'laptop computer',
  'prod-003': 'fuji apple',
  'prod-004': 'white smartphone',
  'prod-005': 'gray smartphone',
  'prod-006': 'silver laptop',
  'prod-007': 'banana bunch',
  'prod-008': 'pasta box',
  'prod-009': 'butter cookies',
  'prod-010': 'crew socks',
  'prod-011': 'book cover',
  'prod-012': 'book cover',
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function PosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [time, setTime] = useState('');
  const [activeFilter, setActiveFilter] = useState<'category' | 'brands'>('category');

  useEffect(() => {
    const updateCurrentTime = () => {
      setTime(new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', ''));
    };
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
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

  const clearCart = () => setCart([]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const tax = useMemo(() => subtotal * 0.08, [subtotal]); // 8% tax example
  const totalPayable = useMemo(() => subtotal + tax, [subtotal, tax]);
  
  return (
    <div className="flex flex-col h-[calc(100vh_-_60px)] bg-slate-100 text-slate-900 -m-6 font-sans">
      {/* Top Header */}
      <header className="bg-white shadow-sm p-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold hidden md:block">Location: <span className="font-bold">Awesome Shop</span></h2>
            <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{time}</span>
            </div>
        </div>
        <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex"><Rewind /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex"><X className="text-red-500" /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex"><Save /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex"><Calculator /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex"><RefreshCw /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600 hidden sm:flex"><Expand /></Button>
             <Button variant="ghost" size="icon" className="text-slate-600"><HelpCircle /></Button>
             <Button className="bg-red-500 hover:bg-red-600 text-white h-9 text-xs sm:text-sm">
                <PlusCircle className="mr-2 h-4 w-4"/> Add Expense
            </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-8 gap-4 p-4 overflow-hidden">
        
        {/* Left Side: Cart */}
        <div className="lg:col-span-3 flex flex-col gap-2">
            <Card className="p-3 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <UserPlus className="text-slate-500 flex-shrink-0"/>
                        <Select defaultValue="walk-in">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="walk-in">Walk-In Customer</SelectItem>
                            <SelectItem value="john-doe">John Doe</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="icon" className="bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0"><Plus/></Button>
                    </div>
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Product name/SKU"
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <Button size="icon" className="bg-blue-500 hover:bg-blue-600 text-white ml-2 flex-shrink-0"><Plus/></Button>
                    </div>
                </div>
            </Card>

            <Card className="flex-1 flex flex-col bg-white">
                <div className="p-4 flex-grow flex flex-col">
                  <div className="grid grid-cols-12 gap-2 font-bold border-b pb-2 text-sm text-slate-600">
                    <div className="col-span-5 flex items-center">Product <Info className="w-3 h-3 ml-1"/></div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">Subtotal</div>
                    <div className="col-span-1 text-center"><X className="w-4 h-4 mx-auto"/></div>
                  </div>
                  <ScrollArea className="flex-grow h-0">
                    <div className="py-2">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                           <div key={item.product.id} className="grid grid-cols-12 gap-2 items-center text-sm mb-2">
                                <div className="col-span-5 font-medium truncate">{item.product.name}</div>
                                <div className="col-span-2">
                                    <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)} className="h-8 w-16 text-center" />
                                </div>
                                <div className="col-span-2">${item.product.price.toFixed(2)}</div>
                                <div className="col-span-2 font-semibold">${(item.product.price * item.quantity).toFixed(2)}</div>
                                <div className="col-span-1 text-center">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.product.id)}><X className="w-4 h-4"/></Button>
                                </div>
                           </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-400">Cart is empty</div>
                    )}
                    </div>
                   </ScrollArea>
                </div>
                <div className="border-t p-3 mt-auto text-sm space-y-2 bg-slate-50">
                    <div className="flex justify-between"><span>Items: <span className="font-semibold">{cart.length} ({cart.reduce((a, b) => a + b.quantity, 0)})</span></span> <span>Total: <span className="font-semibold">${subtotal.toFixed(2)}</span></span></div>
                     <div className="flex justify-between items-center text-slate-600"><span>Discount (-): <Info className="w-3 h-3 inline"/> <Edit2 className="w-3 h-3 inline cursor-pointer"/></span> <span>$0.00</span></div>
                     <div className="flex justify-between items-center text-slate-600"><span>Order Tax (+): <Info className="w-3 h-3 inline"/> <Edit2 className="w-3 h-3 inline cursor-pointer"/></span> <span>${tax.toFixed(2)}</span></div>
                     <div className="flex justify-between items-center text-slate-600"><span>Shipping (+): <Info className="w-3 h-3 inline"/> <Edit2 className="w-3 h-3 inline cursor-pointer"/></span> <span>$0.00</span></div>
                </div>
            </Card>
        </div>
        
        {/* Right Side: Product Selection */}
        <div className="lg:col-span-5 flex flex-col gap-2">
           <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setActiveFilter('category')} className={cn("text-lg py-6", activeFilter === 'category' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-400 hover:bg-slate-500')}><LayoutGrid className="mr-2"/> Category</Button>
              <Button onClick={() => setActiveFilter('brands')} className={cn("text-lg py-6", activeFilter === 'brands' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-400 hover:bg-slate-500')}><Copyright className="mr-2"/> Brands</Button>
           </div>
           <Card className="flex-1 bg-white p-2">
            <ScrollArea className="h-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                    {filteredProducts.map(product => (
                        <Card key={product.id} className="cursor-pointer group overflow-hidden" onClick={() => addToCart(product)}>
                            <div className="relative aspect-square bg-slate-50">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={productHints[product.id] || 'product item'}
                                />
                            </div>
                            <div className="p-2 text-center bg-white">
                                <p className="text-xs font-semibold truncate">{product.name}</p>
                                <p className="text-xs text-slate-500">({product.sku})</p>
                                <p className="text-sm font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                                <p className="text-xs text-green-600">{product.stock} Pc(s) in stock</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
           </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] p-2 flex items-center justify-between z-10 flex-wrap gap-2">
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              <Button variant="outline" className="text-slate-700 text-xs sm:text-sm"><FileText className="mr-1 sm:mr-2 h-4 w-4"/> Draft</Button>
              <Button variant="outline" className="text-slate-700 text-xs sm:text-sm"><FileText className="mr-1 sm:mr-2 h-4 w-4"/> Quotation</Button>
              <Button variant="outline" className="text-red-600 border-red-300 text-xs sm:text-sm"><Pause className="mr-1 sm:mr-2 h-4 w-4"/> Suspend</Button>
              <Button variant="outline" className="text-slate-700 text-xs sm:text-sm"><Undo2 className="mr-1 sm:mr-2 h-4 w-4"/> Credit Sale</Button>
              <Button variant="outline" className="text-slate-700 text-xs sm:text-sm"><CreditCard className="mr-1 sm:mr-2 h-4 w-4"/> Card</Button>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"><WalletCards className="mr-1 sm:mr-2 h-4 w-4"/> Multiple Pay</Button>
            <Button className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm">Cash</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm" onClick={clearCart}>Cancel</Button>
          </div>
          <div className="text-right">
              <span className="text-xs sm:text-sm text-slate-500">Total Payable:</span>
              <h3 className="text-lg sm:text-2xl font-bold text-green-600">${totalPayable.toFixed(2)}</h3>
          </div>
      </footer>
      <div className="absolute bottom-20 right-4 flex flex-col gap-2">
        <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg h-12">
            <History className="mr-2"/> Recent Transactions
        </Button>
      </div>
      <div className="text-center text-xs text-slate-400 p-1 bg-slate-100">
        Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
      </div>
    </div>
  );
}
