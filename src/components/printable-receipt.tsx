
'use client';

import React from 'react';
import type { Sale, DetailedProduct } from '@/lib/data';
import type { AllSettings } from '@/hooks/use-settings';

type PrintableReceiptProps = {
    sale: Sale | null;
    products: DetailedProduct[];
    settings: AllSettings | null;
    formatCurrency: (value: number) => string;
};

import { ModernInvoice } from './invoice-designs/ModernInvoice';

export const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(
    ({ sale, products, settings, formatCurrency }, ref) => {
        if (!sale || !settings) {
            return <div ref={ref}>Loading...</div>;
        }

        if (settings.invoice.design === 'modern') {
            return <ModernInvoice ref={ref} sale={sale} products={products} settings={settings} formatCurrency={formatCurrency} />;
        }

        const layoutSettings = settings.invoice;

        const containerStyle: React.CSSProperties = {
            width: '100%',
            maxWidth: '288px', // Limit to 80mm
            margin: '0 auto',
            padding: '8px',
            fontFamily: '"Courier New", Courier, monospace', // Reliable monospace
            fontSize: '12px',
            color: 'black',
            backgroundColor: 'white',
        };

        const headerStyle: React.CSSProperties = {
            textAlign: 'center',
            marginBottom: '16px',
        };

        const itemRowStyle: React.CSSProperties = {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px',
        };

        const totalsStyle: React.CSSProperties = {
            marginTop: '16px',
            borderTop: '1px dashed black',
            paddingTop: '8px',
        };

        return (
            <div ref={ref}>
                <div style={containerStyle}>
                    <header style={headerStyle}>
                        {layoutSettings?.showBusinessName !== false && (
                            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                                {settings.business.businessName}
                            </h2>
                        )}
                        {layoutSettings?.showLocationName !== false && (
                            <p style={{ margin: 0 }}>{sale.location}</p>
                        )}
                        <p style={{ margin: '4px 0 0' }}>{layoutSettings?.invoiceHeading || 'Invoice'}</p>
                        <p style={{ margin: 0 }}>Invoice No: {sale.invoiceNo}</p>
                        <p style={{ margin: 0 }}>Date: {new Date(sale.date).toLocaleString()}</p>
                    </header>

                    <section>
                        <div style={{ ...itemRowStyle, fontWeight: 'bold', borderBottom: '1px dashed black', paddingBottom: '4px' }}>
                            <span style={{ flex: '1 1 60%' }}>Item</span>
                            <span style={{ flex: '0 0 15%', textAlign: 'right' }}>Qty</span>
                            <span style={{ flex: '0 0 25%', textAlign: 'right' }}>Total</span>
                        </div>
                        <div style={{ paddingTop: '4px' }}>
                            {sale.items.map(item => {
                                const product = products.find(p => p.id === item.productId);
                                const productName = product?.name || 'Unknown Product';
                                return (
                                    <div key={item.productId} style={itemRowStyle}>
                                        <span style={{ flex: '1 1 60%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {productName}
                                        </span>
                                        <span style={{ flex: '0 0 15%', textAlign: 'right' }}>{item.quantity}</span>
                                        <span style={{ flex: '0 0 25%', textAlign: 'right' }}>
                                            {formatCurrency(item.quantity * item.unitPrice)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section style={totalsStyle}>
                        <div style={itemRowStyle}>
                            <span>Subtotal:</span>
                            <span>{formatCurrency(sale.totalAmount - (sale.taxAmount || 0))}</span>
                        </div>
                        <div style={itemRowStyle}>
                            <span>Tax:</span>
                            <span>{formatCurrency(sale.taxAmount || 0)}</span>
                        </div>
                        <div style={{ ...itemRowStyle, fontSize: '14px', fontWeight: 'bold' }}>
                            <span>Total:</span>
                            <span>{formatCurrency(sale.totalAmount)}</span>
                        </div>

                        <div style={itemRowStyle}>
                            <span>Payment Method:</span>
                            <span>{sale.paymentMethod}</span>
                        </div>
                        {sale.paymentReference && (
                            <div style={itemRowStyle}>
                                <span>Ref:</span>
                                <span>{sale.paymentReference}</span>
                            </div>
                        )}
                        <div style={itemRowStyle}>
                            <span>Paid:</span>
                            <span>{formatCurrency(sale.totalPaid)}</span>
                        </div>
                        <div style={itemRowStyle}>
                            <span>Due:</span>
                            <span>{formatCurrency(sale.sellDue)}</span>
                        </div>
                        {sale.totalPaid > sale.totalAmount && (
                            <div style={itemRowStyle}>
                                <span>Change Return:</span>
                                <span>{formatCurrency(sale.totalPaid - sale.totalAmount)}</span>
                            </div>
                        )}
                    </section>

                    <footer style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px dashed black', paddingTop: '8px' }}>
                        <p>{layoutSettings?.footerText || 'Thank you!'}</p>
                    </footer>
                </div>
            </div>
        );
    }
);

PrintableReceipt.displayName = 'PrintableReceipt';
