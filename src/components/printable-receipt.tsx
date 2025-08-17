'use client';

import React from 'react';
import { type Sale, type DetailedProduct } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { type AllSettings } from '@/hooks/use-settings';

type PrintableReceiptProps = {
    sale: Sale | null; 
    products: DetailedProduct[];
    settings: AllSettings;
};

export const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(({ sale, products, settings }, ref) => {
    const { formatCurrency } = useCurrency();
    
    const productMap = React.useMemo(() => {
        return new Map(products.map(p => [p.id, p]));
    }, [products]);

    // Always render a DOM node that holds the ref, even if no sale.
    if (!sale) {
        return (
            <div ref={ref} style={{ width: '300px', minHeight: '100px' }}>
                <div>No receipt data available</div>
            </div>
        );
    }

    const subtotal = sale.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const discountAmount = subtotal > 0 ? (sale.totalAmount - subtotal - (sale.taxAmount || 0)) : 0;
    
    const { invoice: layoutSettings } = settings;

    return (
        <div 
            ref={ref} 
            className="bg-white text-black p-4 font-mono text-xs" 
            style={{ width: '300px' }} // Fixed width improves layout predictability in iframe
        >
            <header className="text-center mb-4">
                {layoutSettings.showLogo && settings.business.logo && (
                    <img 
                        src={settings.business.logo} 
                        alt="Business Logo" 
                        className="mx-auto h-16 w-auto object-contain mb-2" 
                        decoding="async"
                        loading="eager"
                    />
                )}
                {layoutSettings.showBusinessName && <h1 className="text-lg font-bold">{settings.business?.businessName || 'Business Name'}</h1>}
                {layoutSettings.showTax1 && settings.tax?.taxNumber1 && <p>GSTIN: {settings.tax.taxNumber1}</p>}
                <p>Date: {new Date(sale.date).toLocaleString()}</p>
            </header>

            <h2 className="text-center font-bold text-base mb-2">{layoutSettings.invoiceHeading || 'INVOICE'}</h2>
            <p><span className="font-semibold">Invoice No:</span> {sale.invoiceNo}</p>
            {sale.customerName && <p><span className="font-semibold">Customer:</span> {sale.customerName}</p>}
            {layoutSettings.showMobileNumber && sale.contactNumber && <p><span className="font-semibold">Contact:</span> {sale.contactNumber}</p>}

            <table className="w-full my-4">
                <thead>
                    <tr className="border-b-2 border-dashed border-black">
                        <th className="text-left font-bold">Product</th>
                        <th className="text-center font-bold">Qty</th>
                        <th className="text-right font-bold">Price</th>
                        <th className="text-right font-bold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item, index) => {
                        const product = productMap.get(item.productId);
                        return (
                            <tr key={index} className="border-b border-dashed border-gray-400">
                                <td className="py-1">{product?.name ?? 'Unknown'}</td>
                                <td className="text-center py-1">{item.quantity}</td>
                                <td className="text-right py-1">{item.unitPrice.toFixed(2)}</td>
                                <td className="text-right py-1">{(item.quantity * item.unitPrice).toFixed(2)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount !== 0 && (
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>(-) {formatCurrency(Math.abs(discountAmount))}</span>
                    </div>
                )}
                {sale.taxAmount !== undefined && sale.taxAmount > 0 && (
                    <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>(+) {formatCurrency(sale.taxAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t-2 border-dashed border-black pt-1">
                    <span>Total:</span>
                    <span>{formatCurrency(sale.totalAmount)}</span>
                </div>
            </div>

            <div className="mt-4 border-t-2 border-dashed border-black pt-2">
                {sale.paymentMethod && (
                    <div className="flex justify-between">
                        <span>{sale.paymentMethod}:</span>
                        <span>{formatCurrency(sale.totalPaid)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span>{formatCurrency(sale.totalPaid)}</span>
                </div>
                {sale.sellDue > 0 && (
                    <div className="flex justify-between font-bold">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(sale.sellDue)}</span>
                    </div>
                )}
            </div>

            <footer className="text-center mt-6">
                <p>{layoutSettings.footerText || 'Thank you for your business!'}</p>
            </footer>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';
