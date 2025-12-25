'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { closeRegister } from '@/services/registerLogService';
import { useToast } from '@/hooks/use-toast';
import { type RegisterLog } from '@/lib/data';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CloseRegisterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activeRegister: RegisterLog | null;
    onSuccess: () => void;
}

export function CloseRegisterDialog({ isOpen, onClose, activeRegister, onSuccess }: CloseRegisterDialogProps) {
    const [closingCash, setClosingCash] = useState<string>('');
    const [closingNote, setClosingNote] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!activeRegister) return null;

    const expectedCash = activeRegister.openingCash + activeRegister.totalCash - activeRegister.totalRefunds - activeRegister.totalExpenses;
    const currentClosingCash = parseFloat(closingCash) || 0;
    const difference = currentClosingCash - expectedCash;

    const handleClose = async () => {
        setLoading(true);
        try {
            await closeRegister(activeRegister.id, {
                closingCash: currentClosingCash,
                totalCardSlips: activeRegister.totalCardSlips,
                totalCheques: activeRegister.totalCheques,
                totalCash: activeRegister.totalCash,
                totalRefunds: activeRegister.totalRefunds,
                totalExpenses: activeRegister.totalExpenses,
                closingNote: closingNote || null,
            });
            toast({
                title: "Register Closed",
                description: "Cash register has been closed successfully.",
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error closing register:", error);
            toast({
                title: "Error",
                description: "Failed to close cash register.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Close Cash Register</DialogTitle>
                    <DialogDescription>
                        Summary for session started on {new Date(activeRegister.openTime).toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Opening Cash</p>
                        <p className="text-lg font-bold">${activeRegister.openingCash.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-green-700 uppercase font-bold mb-1">Cash Sales</p>
                        <p className="text-lg font-bold text-green-600">+${activeRegister.totalCash.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-red-700 uppercase font-bold mb-1">Refunds</p>
                        <p className="text-lg font-bold text-red-600">-${activeRegister.totalRefunds.toFixed(2)}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-orange-700 uppercase font-bold mb-1">Expenses</p>
                        <p className="text-lg font-bold text-orange-600">-${activeRegister.totalExpenses.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mb-6 space-y-4">
                    <div className="flex justify-between items-center bg-white/50 p-3 rounded-lg border border-primary/10">
                        <p className="font-semibold">Expected Cash in Drawer:</p>
                        <p className="text-xl font-black text-primary">${expectedCash.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="closing-cash" className="text-sm font-bold">Actual Cash in Drawer:*</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                            <Input
                                id="closing-cash"
                                type="number"
                                className="pl-8 text-lg font-bold h-12 bg-white"
                                value={closingCash}
                                onChange={(e) => setClosingCash(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {closingCash && (
                        <div className={`flex items-center gap-2 text-sm font-semibold p-2 rounded-md ${difference === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {difference === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {difference === 0 ? 'Cash drawer matches perfectly' : `Discrepancy: ${difference > 0 ? '+' : ''}${difference.toFixed(2)}`}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="closing-note" className="text-sm font-bold">Session Notes</Label>
                    <Textarea
                        id="closing-note"
                        placeholder="Mention any issues, damaged cash, or other notes here..."
                        className="bg-muted/20"
                        value={closingNote}
                        onChange={(e) => setClosingNote(e.target.value)}
                    />
                </div>

                <DialogFooter className="mt-6 gap-2 sm:gap-0">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleClose} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm & Close Register'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
