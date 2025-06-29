'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons';
import { useCurrency } from '@/hooks/use-currency';

type CustomerDisplayData = {
    cart: {
        product: { name: string };
        quantity: number;
        sellingPrice: number;
    }[];
    subtotal: number;
    discount: number;
    orderTax: number;
    shipping: number;
    totalPayable: number;
};


export default function CustomerDisplayPage() {
    const { formatCurrency } = useCurrency();
    const [data, setData] = useState<CustomerDisplayData | null>(null);

    const updateState = () => {
        try {
            const storedData = localStorage.getItem('pos-customer-display-data');
            if (storedData) {
                setData(JSON.parse(storedData));
            } else {
                setData(null);
            }
        } catch (error) {
            console.error("Failed to parse customer display data from localStorage", error);
            setData(null);
        }
    };

    useEffect(() => {
        // Initial load
        updateState();

        // Listen for changes from other tabs
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'pos-customer-display-data') {
                updateState();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (!data || data.cart.length === 0) {
        return (
            <div className="flex h-screen bg-blue-900 text-white font-sans">
                <div className="w-full flex flex-col items-center justify-center p-12">
                    <Logo className="h-24 w-24 mb-4" />
                    <h1 className="font-headline text-6xl">Welcome</h1>
                    <p className="text-2xl mt-4 text-white/80">Your items will appear here as they are scanned</p>
                    <p className="text-white/50 mt-auto text-sm">Powered by Crimson POS</p>
                </div>
            </div>
        );
    }

    const { cart, subtotal, discount, orderTax, shipping, totalPayable } = data;
    
    return (
        <div className="flex h-screen bg-blue-900 text-white font-sans">
            <div className="w-2/3 p-12 flex flex-col">
                <div className="flex-1">
                    <h1 className="text-5xl font-bold mb-8">Your Order</h1>
                    <div className="space-y-4">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-2xl">
                                <span>{item.quantity}x {item.product.name}</span>
                                <span>{formatCurrency(item.quantity * item.sellingPrice)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                     <Separator className="bg-white/20 my-6" />
                     <div className="space-y-3 text-xl">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        {discount > 0 && <div className="flex justify-between text-red-300"><span>Discount</span><span>- {formatCurrency(discount)}</span></div>}
                        {orderTax > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(orderTax)}</span></div>}
                        {shipping > 0 && <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>}
                        <div className="flex justify-between text-4xl font-bold mt-4 pt-4 border-t-2 border-dashed border-white/50"><span>Total</span><span>{formatCurrency(totalPayable)}</span></div>
                     </div>
                </div>
            </div>
            <div className="w-1/3 bg-white/10 flex flex-col items-center justify-center p-12">
                 <div className="flex items-center gap-4 text-white mb-8">
                    <Logo className="h-16 w-16" />
                    <span className="font-headline text-4xl">Crimson POS</span>
                </div>
                <Card className="bg-white/90 text-blue-900 w-full">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-lg">Please see the cashier to complete your payment.</p>
                    </CardContent>
                </Card>
                 <p className="text-white/50 mt-auto text-sm">Powered by Crimson POS</p>
            </div>
        </div>
    );
}
