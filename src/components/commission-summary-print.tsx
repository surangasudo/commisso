'use client';

import React from 'react';
import { type CommissionProfile } from '@/lib/data';
import { type PendingCommission } from '@/services/commissionService';

interface CommissionSummaryPrintProps {
    profile: CommissionProfile;
    commissions: PendingCommission[];
    currencySymbol: string;
    formatCurrency: (val: number) => string;
}

export const CommissionSummaryPrint = React.forwardRef<HTMLDivElement, CommissionSummaryPrintProps>((props, ref) => {
    const { profile, commissions, currencySymbol, formatCurrency } = props;

    const totalSale = commissions.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
    const totalCommission = commissions.reduce((sum, c) => sum + (c.commissionEarned || 0), 0);

    // Group by category using the internal records
    const categoryBreakdown = commissions.reduce((acc, c) => {
        c.commissionRecords.forEach(record => {
            const catName = record.categoryName || 'Uncategorized';
            if (!acc[catName]) {
                acc[catName] = { amount: 0, count: 0, base: 0 };
            }
            acc[catName].amount += record.amount;
            acc[catName].base += record.baseAmount;
            acc[catName].count += 1;
        });
        return acc;
    }, {} as Record<string, { amount: number; count: number; base: number }>);

    return (
        <div ref={ref} className="p-8 text-black bg-white font-sans printable-content">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-wider">Commission Sales Summary</h1>
                <p className="text-sm text-gray-600 mt-1">Agent / Salesperson Payout Details</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 border-b pb-4">
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase">Agent Details</h2>
                    <p className="text-lg font-bold">{profile.name}</p>
                    <p className="text-sm">{profile.entityType} | {profile.phone}</p>
                    {profile.email && <p className="text-sm">{profile.email}</p>}
                </div>
                <div className="text-right">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase">Summary Date</h2>
                    <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
                    <p className="text-sm font-mono">#{profile.id.substring(0, 8).toUpperCase()}</p>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-md font-bold mb-4 border-b pb-1">Detailed Commission Breakdown</h2>
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="py-2 px-1">Date</th>
                            <th className="py-2 px-1">Invoice No</th>
                            <th className="py-2 px-1">Category</th>
                            <th className="py-2 px-1 text-center">Rate (%)</th>
                            <th className="py-2 px-1 text-right">Sale Value ({currencySymbol})</th>
                            <th className="py-2 px-1 text-right">Commission ({currencySymbol})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.map((c) => (
                            <React.Fragment key={c.id}>
                                {c.commissionRecords.map((record, idx) => (
                                    <tr key={`${c.id}-${idx}`} className="border-b">
                                        <td className="py-2 px-1">{idx === 0 ? c.date : ''}</td>
                                        <td className="py-2 px-1 font-mono">{idx === 0 ? c.invoiceNo : ''}</td>
                                        <td className="py-2 px-1">{record.categoryName}</td>
                                        <td className="py-2 px-1 text-center">{record.rate}%</td>
                                        <td className="py-2 px-1 text-right font-medium">{formatCurrency(record.baseAmount)}</td>
                                        <td className="py-2 px-1 text-right font-semibold">{formatCurrency(record.amount)}</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold bg-gray-100">
                            <td colSpan={4} className="py-2 px-1 text-right uppercase">Total:</td>
                            <td className="py-2 px-1 text-right">{formatCurrency(totalSale)}</td>
                            <td className="py-2 px-1 text-right text-red-600">{formatCurrency(totalCommission)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-md font-bold mb-4 border-b pb-1">Summary by Category</h2>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="py-1 px-1">Category</th>
                                    <th className="py-1 px-1 text-center">Lines</th>
                                    <th className="py-1 px-1 text-right">Sale Value</th>
                                    <th className="py-1 px-1 text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(categoryBreakdown).map(([name, data]) => (
                                    <tr key={name} className="border-b">
                                        <td className="py-1 px-1">{name}</td>
                                        <td className="py-1 px-1 text-center">{(data as any).count}</td>
                                        <td className="py-1 px-1 text-right">{formatCurrency((data as any).base)}</td>
                                        <td className="py-1 px-1 text-right font-bold">{formatCurrency((data as any).amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col justify-end items-end p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-sm text-gray-500 uppercase">Grand Total to Pay</p>
                        <p className="text-4xl font-black text-red-600">{formatCurrency(totalCommission)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-16">
                <div className="border-t border-black pt-2 text-center">
                    <p className="text-xs uppercase font-bold text-gray-500">Agent Signature</p>
                </div>
                <div className="border-t border-black pt-2 text-center">
                    <p className="text-xs uppercase font-bold text-gray-500">Authorized Signature</p>
                </div>
            </div>

            <div className="mt-12 text-center text-[10px] text-gray-400">
                <p>This is a system generated document. Powered by Crimson POS.</p>
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-content, .printable-content * {
                        visibility: visible;
                    }
                    .printable-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print-hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
});

CommissionSummaryPrint.displayName = 'CommissionSummaryPrint';
