
'use client';

import React from 'react';
import { type Sale, type DetailedProduct } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { useSettings } from '@/hooks/use-settings';
import { Logo } from '@/components/icons';

type PrintableReceiptProps = {
    sale: Sale;
    products: DetailedProduct[];
};

export const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(({ sale, products }, ref) => {
    const { formatCurrency } = useCurrency();
    const { settings } = useSettings();
    const productMap = React.useMemo(() => {
        return new Map(products.map(p => [p.id, p]));
    }, [products]);

    return (
        <div ref={ref} className="font-sans bg-white text-gray-800 p-8">
            {/* Header */}
            <header className="flex justify-between items-start pb-8 border-b-2 border-gray-100">
                <div className="flex items-center gap-4">
                    <Logo className="h-16 w-16 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{settings?.business?.businessName ?? 'Your Business'}</h1>
                        <p className="text-sm text-gray-500">123 Business St, City, 12345</p>
                        <p className="text-sm text-gray-500">{settings?.email?.fromAddress ?? 'contact@business.com'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold uppercase text-gray-700">Invoice</h2>
                    <p className="text-gray-500 mt-1"># {sale.invoiceNo}</p>
                </div>
            </header>

            {/* Billing Info */}
            <section className="flex justify-between my-8">
                <div>
                    <h3 className="font-bold mb-2">Bill To:</h3>
                    <p className="text-gray-600">{sale.customerName}</p>
                    {sale.contactNumber && <p className="text-gray-600">{sale.contactNumber}</p>}
                </div>
                <div className="text-right">
                    <p><strong className="text-gray-600">Invoice Date:</strong> {new Date(sale.date).toLocaleDateString()}</p>
                    <p><strong className="text-gray-600">Payment Status:</strong> {sale.paymentStatus}</p>
                </div>
            </section>

            {/* Items Table */}
            <section>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left font-semibold p-3">#</th>
                            <th className="text-left font-semibold p-3">Product</th>
                            <th className="text-left font-semibold p-3">SKU</th>
                            <th className="text-center font-semibold p-3">Qty</th>
                            <th className="text-right font-semibold p-3">Rate</th>
                            <th className="text-right font-semibold p-3">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map((item, index) => (
                            <tr key={item.productId || index} className="border-b border-gray-100">
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3">{productMap.get(item.productId)?.name ?? 'Unknown Product'}</td>
                                <td className="p-3">{productMap.get(item.productId)?.sku ?? 'N/A'}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-3 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Totals */}
            <section className="flex justify-end mt-8">
                <div className="w-full max-w-xs space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>{formatCurrency(sale.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span>+ {formatCurrency(sale.taxAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-gray-200 pt-3">
                        <span>Grand Total:</span>
                        <span>{formatCurrency(sale.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid ({sale.paymentMethod}):</span>
                        <span>{formatCurrency(sale.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-primary">
                        <span>Amount Due:</span>
                        <span>{formatCurrency(sale.sellDue)}</span>
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="mt-12 text-center text-gray-500 text-xs border-t border-gray-100 pt-6">
                <p>Thank you for your business!</p>
                <p>Please contact us with any questions regarding this invoice.</p>
            </footer>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';
