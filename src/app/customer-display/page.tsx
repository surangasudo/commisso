'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons';

export default function CustomerDisplayPage() {
    // In a real application, this data would be synced from the POS terminal,
    // likely using WebSockets or localStorage with a BroadcastChannel.
    const mockCart = [
        { name: 'Nike Fashion Sneaker', quantity: 1, price: 165.00 },
        { name: 'Oreo Cookies', quantity: 2, price: 12.50 },
    ];
    const subtotal = mockCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <div className="flex h-screen bg-blue-900 text-white font-sans">
            <div className="w-2/3 p-12 flex flex-col">
                <div className="flex-1">
                    <h1 className="text-5xl font-bold mb-8">Your Order</h1>
                    <div className="space-y-4">
                        {mockCart.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-2xl">
                                <span>{item.quantity}x {item.name}</span>
                                <span>${(item.quantity * item.price).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                     <Separator className="bg-white/20 my-6" />
                     <div className="space-y-3 text-xl">
                        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                        <div className="flex justify-between text-4xl font-bold mt-4"><span>Total</span><span>${total.toFixed(2)}</span></div>
                     </div>
                </div>
            </div>
            <div className="w-1/3 bg-white/10 flex flex-col items-center justify-center p-12">
                 <div className="flex items-center gap-4 text-white mb-8">
                    <Logo className="h-16 w-16" />
                    <span className="font-headline text-4xl">Awesome Shop</span>
                </div>
                <Card className="bg-white/90 text-blue-900 w-full">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-lg">Please see the cashier to complete your payment.</p>
                    </CardContent>
                </Card>
                 <p className="text-white/50 mt-auto text-sm">Powered by UltimatePOS</p>
            </div>
        </div>
    );
}
