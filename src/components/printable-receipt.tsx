

'use client';

import React from 'react';
import { type Sale, type DetailedProduct } from '@/lib/data';
import { useCurrency } from '@/hooks/use-currency';
import { useSettings } from '@/hooks/use-settings';
import { Logo } from '@/components/icons';

type PrintableReceiptProps = {
    sale: Sale | null;
    products: DetailedProduct[];
    onReadyToPrint?: () => void;
};

// This sub-component will trigger the print action only after it has been mounted.
const PrintTrigger = ({ onPrint }: { onPrint: () => void }) => {
    React.useEffect(() => {
        // We use a small timeout here as a final guard to ensure
        // all content is painted by the browser before the print dialog appears.
        onPrint();
    }, [onPrint]);

    return null; // This component renders nothing.
};

export const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(({ sale, products, onReadyToPrint }, ref) => {
    const { formatCurrency } = useCurrency();
    const { settings } = useSettings();

    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || 'Unknown Product';
    }

    return (
        <div ref={ref} className="font-mono text-xs w-[300px] mx-auto p-2 bg-white text-black">
            {sale && (
                <>
                    <div className="text-center p-4">
                        <Logo className="mx-auto h-12 w-12 mb-2" />
                        <h1 className="text-lg font-bold">{settings.system.appName}</h1>
                        <p>{settings.business.businessName}</p>
                        <p>123 Main Street, Phoenix, AZ</p>
                        <p>Tel: 555-123-4567</p>
                        <p className="mt-2 text-sm">Sale Invoice</p>
                    </div>
                    <div className="p-2 border-t border-dashed border-black">
                        <p><strong>Invoice:</strong> {sale.invoiceNo}</p>
                        <p><strong>Date:</strong> {sale.date}</p>
                        <p><strong>Customer:</strong> {sale.customerName}</p>
                    </div>
                    <table className="w-full text-[10px]">
                        <thead>
                            <tr className="border-t border-b border-dashed border-black">
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
                    <div className="p-2 border-t border-dashed border-black space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(sale.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0))}</span>
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
                            <span>{formatCurrency(sale.paymentStatus === 'Paid' ? sale.totalPaid - sale.totalAmount : 0)}</span>
                        </div>
                    </div>
                    <div className="text-center p-4 border-t border-dashed border-black">
                        <p>Thank you for your business!</p>
                    </div>

                    {/* The PrintTrigger is only rendered when there's a sale, and its useEffect will fire after it mounts. */}
                    {onReadyToPrint && <PrintTrigger onPrint={onReadyToPrint} />}
                </>
            )}
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';
