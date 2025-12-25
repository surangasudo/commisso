'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type RegisterLog } from '@/lib/data';
import { format } from 'date-fns';
import { Printer, XCircle, CreditCard, Banknote, ScrollText, Wallet } from 'lucide-react';

interface RegisterDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activeRegister: RegisterLog | null;
}

export function RegisterDetailsDialog({ isOpen, onClose, activeRegister }: RegisterDetailsDialogProps) {
    if (!activeRegister) return null;

    const expectedCash = activeRegister.openingCash + activeRegister.totalCash - activeRegister.totalRefunds - activeRegister.totalExpenses;

    const stats = [
        { label: 'Opening Cash', value: activeRegister.openingCash, icon: Wallet, color: 'text-blue-600' },
        { label: 'Cash Sales', value: activeRegister.totalCash, icon: Banknote, color: 'text-green-600' },
        { label: 'Card Sales', value: activeRegister.totalCardSlips, icon: CreditCard, color: 'text-purple-600' },
        { label: 'Cheque Sales', value: activeRegister.totalCheques, icon: ScrollText, color: 'text-amber-600' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight">Register Details: {activeRegister.user}</DialogTitle>
                    <p className="text-sm text-muted-foreground">Session started at {format(new Date(activeRegister.openTime), 'MMM dd, yyyy HH:mm')}</p>
                </DialogHeader>

                <div className="py-6 space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-muted/30 p-3 rounded-xl border border-muted flex flex-col items-center justify-center text-center">
                                <stat.icon className={`w-5 h-5 mb-1 ${stat.color}`} />
                                <span className="text-[10px] uppercase font-black text-muted-foreground leading-tight mb-1">{stat.label}</span>
                                <span className="text-sm font-bold">${stat.value.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 font-black uppercase text-xs tracking-widest text-muted-foreground">Description</th>
                                    <th className="text-right px-6 py-4 font-black uppercase text-xs tracking-widest text-muted-foreground">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-6 py-4 text-gray-600">Initial Opening Cash</td>
                                    <td className="px-6 py-4 text-right font-semibold">${activeRegister.openingCash.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-green-700 font-medium">Total Cash Sales (+)</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600">${activeRegister.totalCash.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-red-700 font-medium">Total Refunds (-)</td>
                                    <td className="px-6 py-4 text-right font-bold text-red-600">${activeRegister.totalRefunds.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-orange-700 font-medium">Total Expenses (-)</td>
                                    <td className="px-6 py-4 text-right font-bold text-orange-600">${activeRegister.totalExpenses.toFixed(2)}</td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-primary text-white">
                                <tr>
                                    <td className="px-6 py-5 font-black text-lg">Expected Cash Drawer</td>
                                    <td className="px-6 py-5 text-right font-black text-2xl">${expectedCash.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" className="flex-1 h-12 font-bold" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Print X-Report
                    </Button>
                    <Button className="flex-1 h-12 font-bold bg-gray-900 text-white hover:bg-black" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
