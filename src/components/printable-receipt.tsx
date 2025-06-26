
'use client';

import React from 'react';
import { type Sale, type DetailedProduct } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { useSettings } from '@/hooks/use-settings';
import { Logo } from '@/components/icons';

type PrintableReceiptProps = {
    sale: Sale | null;
    products: DetailedProduct[];
};

export const PrintableReceipt = ({ sale, products }: PrintableReceiptProps) => {
    const { formatCurrency } = useCurrency();
    const { appName } = useSettings();

    if (!sale) {
        return null;
    }
    
    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || 'Unknown Product';
    }

    const subtotal = sale.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const changeDue = sale.paymentStatus === 'Paid' ? sale.totalPaid - sale.totalAmount : 0;

    return (
        <div className="receipt-printable-area hidden print:block font-mono text-xs w-[300px] mx-auto">
            <div className="text-center p-4">
                <Logo className="mx-auto h-12 w-12 mb-2" />
                <h1 className="text-lg font-bold">{appName}</h1>
                <p>Awesome Shop</p>
                <p>123 Main Street, Phoenix, AZ</p>
                <p>Tel: 555-123-4567</p>
                <p className="mt-2 text-sm">Sale Invoice</p>
            </div>
            <div className="p-2 border-t border-dashed">
                <p><strong>Invoice:</strong> {sale.invoiceNo}</p>
                <p><strong>Date:</strong> {sale.date}</p>
                <p><strong>Customer:</strong> {sale.customerName}</p>
            </div>
            <table className="w-full text-[10px]">
                <thead>
                    <tr className="border-t border-b border-dashed">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item, index) => (
                        <tr key={index}>
                            <td className="py-1 align-top">{getProductName(item.productId)}</td>
                            <td className="text-center py-1 align-top">{item.quantity}</td>
                            <td className="text-right py-1 align-top">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-right py-1 align-top">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="p-2 border-t border-dashed space-y-1 text-xs">
                 <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(sale.taxAmount || 0)}</span>
                </div>
                 <div className="flex justify-between font-bold text-sm">
                    <span>Total:</span>
                    <span>{formatCurrency(sale.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Paid ({sale.paymentMethod}):</span>
                    <span>{formatCurrency(sale.totalPaid)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Change Due:</span>
                    <span>{formatCurrency(changeDue)}</span>
                </div>
            </div>
             <div className="text-center p-4 border-t border-dashed">
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
};
