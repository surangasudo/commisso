
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

    // Add a guard to ensure settings are loaded before rendering the receipt.
    if (!settings?.invoice) {
        return (
             <div ref={ref} style={{ width: '300px', minHeight: '100px' }}>
                <div>Loading settings...</div>
            </div>
        );
    }

    // Always render a DOM node that holds the ref, even if no sale.
    if (!sale) {
        return (
            <div ref={ref} style={{ width: '300px', minHeight: '100px' }}>
                {/* This div must be present for the ref to attach to, even if there's no data yet. */}
            </div>
        );
    }

    const subtotal = sale.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const discountAmount = subtotal > 0 ? (sale.totalAmount - subtotal - (sale.taxAmount || 0)) : 0;
    
    const { invoice: layoutSettings } = settings;

    return (
        <div 
            ref={ref} 
            style={{ 
                width: '300px', 
                padding: '16px', 
                backgroundColor: 'white', 
                color: 'black', 
                fontFamily: 'monospace', 
                fontSize: '12px' 
            }}
        >
            <header style={{ textAlign: 'center', marginBottom: '16px' }}>
                {/* {layoutSettings.showLogo && settings.business.logo && (
                    <img 
                        src={settings.business.logo} 
                        alt="Business Logo" 
                        className="mx-auto h-16 w-auto object-contain mb-2" 
                        decoding="async"
                        loading="eager"
                    />
                )} */}
                {layoutSettings.showBusinessName && <h1 style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{settings.business?.businessName || 'Business Name'}</h1>}
                {layoutSettings.showTax1 && settings.tax?.taxNumber1 && <p>GSTIN: {settings.tax.taxNumber1}</p>}
                <p>Date: {new Date(sale.date).toLocaleString()}</p>
            </header>

            <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', marginBottom: '8px' }}>{layoutSettings.invoiceHeading || 'INVOICE'}</h2>
            <p><span style={{ fontWeight: '600' }}>Invoice No:</span> {sale.invoiceNo}</p>
            {sale.customerName && <p><span style={{ fontWeight: '600' }}>Customer:</span> {sale.customerName}</p>}
            {layoutSettings.showMobileNumber && sale.contactNumber && <p><span style={{ fontWeight: '600' }}>Contact:</span> {sale.contactNumber}</p>}

            <table style={{ width: '100%', margin: '16px 0' }}>
                <thead>
                    <tr style={{ borderBottom: '2px dashed black' }}>
                        <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Product</th>
                        <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Qty</th>
                        <th style={{ textAlign: 'right', fontWeight: 'bold' }}>Price</th>
                        <th style={{ textAlign: 'right', fontWeight: 'bold' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item, index) => {
                        const product = productMap.get(item.productId);
                        return (
                            <tr key={index} style={{ borderBottom: '1px dashed #9ca3af' }}>
                                <td style={{ padding: '4px 0' }}>{product?.name ?? 'Unknown'}</td>
                                <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', padding: '4px 0' }}>{item.unitPrice.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '4px 0' }}>{(item.quantity * item.unitPrice).toFixed(2)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount !== 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Discount:</span>
                        <span>(-) {formatCurrency(Math.abs(discountAmount))}</span>
                    </div>
                )}
                {sale.taxAmount !== undefined && sale.taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tax:</span>
                        <span>(+) {formatCurrency(sale.taxAmount)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', borderTop: '2px dashed black', paddingTop: '4px' }}>
                    <span>Total:</span>
                    <span>{formatCurrency(sale.totalAmount)}</span>
                </div>
            </div>

            <div style={{ marginTop: '16px', borderTop: '2px dashed black', paddingTop: '8px' }}>
                {sale.paymentMethod && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{sale.paymentMethod}:</span>
                        <span>{formatCurrency(sale.totalPaid)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Paid:</span>
                    <span>{formatCurrency(sale.totalPaid)}</span>
                </div>
                {sale.sellDue > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Balance Due:</span>
                        <span>{formatCurrency(sale.sellDue)}</span>
                    </div>
                )}
            </div>

            <footer style={{ textAlign: 'center', marginTop: '24px' }}>
                <p>{layoutSettings.footerText || 'Thank you for your business!'}</p>
            </footer>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';
