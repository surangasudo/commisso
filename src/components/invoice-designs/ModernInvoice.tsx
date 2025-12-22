import React from 'react';
import type { Sale, DetailedProduct } from '@/lib/data';
import type { AllSettings } from '@/hooks/use-settings';

type Props = {
    sale: Sale;
    products: DetailedProduct[];
    settings: AllSettings;
    formatCurrency: (value: number) => string;
};

export const ModernInvoice = React.forwardRef<HTMLDivElement, Props>(
    ({ sale, products, settings, formatCurrency }, ref) => {
        const layout = settings.invoice;
        const business = settings.business;

        // Helper to get product details
        const getProduct = (id: string) => products.find(p => p.id === id);

        return (
            <div ref={ref} className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-10 text-sm md:text-base text-gray-800 font-sans leading-relaxed relative">
                {/* Header Section */}
                <header className="flex flex-col items-center border-b border-gray-200 pb-8 mb-8 text-center">
                    {/* Logo Section */}
                    {layout.showLogo && business.logo && (
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', textAlign: 'center', marginBottom: '3rem' }}>
                            <img
                                src={business.logo}
                                alt="Business Logo"
                                style={{
                                    height: `${(layout.logoSize || 100) * 1.2}px`,
                                    width: 'auto',
                                    maxWidth: '100%',
                                    display: 'inline-block'
                                }}
                            />
                        </div>
                    )}

                    {/* Business Info Section */}
                    <div className="flex flex-col gap-2 mb-6">
                        {layout.showBusinessName && (
                            <h1 className="text-3xl font-bold text-primary">{business.businessName}</h1>
                        )}
                        <div className="text-gray-500 text-sm space-y-1">
                            {layout.showLocationName && <p>{sale.location}</p>}
                            <p>Phone: {layout.showMobileNumber ? '123-456-7890' : ''}</p>
                        </div>
                    </div>

                    {/* Invoice Meta Section (Centered for better balance) */}
                    <div className="w-full flex flex-col items-center border-t border-gray-100 pt-6 mt-2">
                        <h2 className="text-4xl font-light text-gray-300 uppercase tracking-widest mb-4">
                            {layout.invoiceHeading || "INVOICE"}
                        </h2>
                        <div className="flex flex-wrap justify-center gap-8 text-sm">
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium">Invoice No:</span>
                                <span className="font-bold">{sale.invoiceNo}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium">Date:</span>
                                <span>{new Date(sale.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-gray-500 font-medium">Status:</span>
                                <span className={`font-bold capitalize ${sale.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
                                    {sale.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Customer Section */}
                <section className="flex justify-between mb-12">
                    <div className="w-1/2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                        <div className="font-bold text-lg mb-1">{sale.customerName}</div>
                        <div className="text-gray-600 text-sm">
                            {sale.contactNumber && <p>Phone: {sale.contactNumber}</p>}
                            {/* Address would go here */}
                        </div>
                    </div>
                    {/* Optional: Ship To or Extra Info */}
                </section>

                {/* Items Table */}
                <section className="mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-primary/20">
                                <th className="py-3 text-left font-semibold text-gray-600 w-12">#</th>
                                <th className="py-3 text-left font-semibold text-gray-600">Item Description</th>
                                <th className="py-3 text-center font-semibold text-gray-600 w-24">Qty</th>
                                <th className="py-3 text-right font-semibold text-gray-600 w-32">Unit Price</th>
                                <th className="py-3 text-right font-semibold text-gray-600 w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map((item, index) => {
                                const product = getProduct(item.productId);
                                return (
                                    <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                        <td className="py-3 text-gray-500 text-sm">{index + 1}</td>
                                        <td className="py-3 font-medium text-gray-800">
                                            {product?.name || 'Unknown Product'}
                                            {/* Variant/SKU could go here */}
                                        </td>
                                        <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                                        <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                                        <td className="py-3 text-right font-bold text-gray-800">
                                            {formatCurrency(item.quantity * item.unitPrice)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>

                {/* Totals Section */}
                <section className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                            <span>Subtotal</span>
                            <span>{formatCurrency(sale.totalAmount - (sale.taxAmount || 0))}</span>
                        </div>
                        {(sale.taxAmount || 0) > 0 && (
                            <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                                <span>Tax</span>
                                <span>{formatCurrency(sale.taxAmount || 0)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                            <span>Shipping</span>
                            <span>{formatCurrency(0)}</span> {/* Placeholder if shipping logic exists */}
                        </div>
                        <div className="flex justify-between text-xl font-bold text-primary pt-2">
                            <span>Total</span>
                            <span>{formatCurrency(sale.totalAmount)}</span>
                        </div>

                        {/* Payments Info */}
                        <div className="bg-gray-50 p-3 rounded text-sm space-y-1 mt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Paid</span>
                                <span className="font-medium text-gray-800">{formatCurrency(sale.totalPaid)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Due</span>
                                <span className="font-medium text-red-500">{formatCurrency(sale.sellDue)}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Notes */}
                <footer className="border-t border-gray-200 pt-8 absolute bottom-10 left-10 right-10">
                    <div className="grid grid-cols-2 gap-8 text-sm text-gray-500">
                        <div>
                            <h4 className="font-bold text-gray-700 mb-2">Terms & Conditions</h4>
                            <p className="whitespace-pre-wrap">{layout.footerText || "Thank you for your business!"}</p>
                        </div>
                        <div className="text-right">
                            {/* Optional QR Code or Banking Details */}
                            {layout.showQrCode && (
                                <div className="inline-block bg-gray-100 p-2 rounded">
                                    <span className="text-xs">QR Code</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-400 mt-8">
                        Generated by Crimson POS
                    </div>
                </footer>
            </div>
        );
    }
);

ModernInvoice.displayName = 'ModernInvoice';
