'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { openRegister } from '@/services/registerLogService';
import { useToast } from '@/hooks/use-toast';
import { Banknote, Loader2 } from 'lucide-react';

interface OpenRegisterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    businessId?: string; // Added businessId prop
    onSuccess: (registerId: string) => void;
    isAutoOpened?: boolean;
}

export function OpenRegisterDialog({ isOpen, onClose, userId, userName, businessId, onSuccess, isAutoOpened = false }: OpenRegisterDialogProps) {
    const [openingCash, setOpeningCash] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleOpen = async () => {
        const cashValue = parseFloat(openingCash) || 0;
        setLoading(true);
        try {
            const registerId = await openRegister(userId, userName, cashValue, 'Main Store', businessId); // Pass businessId
            toast({
                title: "Register Opened",
                description: `Cash register opened with $${cashValue.toLocaleString()}`,
            });
            onSuccess(registerId);
            onClose();
        } catch (error) {
            console.error("Error opening register:", error);
            toast({
                title: "Error",
                description: "Failed to open cash register.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Prevent closing if auto-opened (no active register)
            if (!open && !isAutoOpened) {
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
                // Prevent closing by clicking outside if auto-opened
                if (isAutoOpened) {
                    e.preventDefault();
                }
            }} onEscapeKeyDown={(e) => {
                // Prevent closing by ESC key if auto-opened
                if (isAutoOpened) {
                    e.preventDefault();
                }
            }}>
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Banknote className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">Open Cash Register</DialogTitle>
                    <DialogDescription className="text-center">
                        {isAutoOpened
                            ? "You must open the cash register before using the POS system."
                            : "Enter the starting cash amount in the drawer."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-6">
                    <div className="space-y-4">
                        <Label htmlFor="opening-cash" className="text-base font-semibold">Starting Cash Balance</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                            <Input
                                id="opening-cash"
                                type="number"
                                className="pl-8 text-lg h-12 focus-visible:ring-primary"
                                value={openingCash}
                                onChange={(e) => setOpeningCash(e.target.value)}
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    {!isAutoOpened && (
                        <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                    )}
                    <Button
                        className={`${isAutoOpened ? 'w-full' : 'flex-1'} bg-primary hover:bg-primary/90 text-white font-bold`}
                        onClick={handleOpen}
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                        ) : 'Open Register'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
