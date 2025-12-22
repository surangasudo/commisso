
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { broadcastMessage, SystemMessage } from '@/services/messageService';
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send } from 'lucide-react';

export function BroadcastDialog({ open, onOpenChange, user }: { open: boolean; onOpenChange: (open: boolean) => void; user: any }) {
    const [content, setContent] = useState('');
    const [type, setType] = useState<SystemMessage['type']>('info');
    const [target, setTarget] = useState<SystemMessage['target']>('all');
    const [duration, setDuration] = useState('5'); // Default 5 minutes
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const handleSend = async () => {
        if (!content.trim()) return;

        setIsSending(true);
        try {
            await broadcastMessage({
                content,
                type,
                target,
                durationMinutes: parseInt(duration),
                createdBy: user?.name || 'Admin'
            });
            toast({ title: "Message Sent", description: "Broadcast message has been queued." });
            setContent('');
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to broadcast message.", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-indigo-600" />
                        Broadcast System Message
                    </DialogTitle>
                    <DialogDescription>
                        Send a real-time message to active POS terminals or Customer Displays.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message Content</Label>
                        <Textarea
                            id="message"
                            placeholder="e.g., Happy Hour starts in 10 minutes!"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Message Type</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="info">Info (Blue)</SelectItem>
                                    <SelectItem value="success">Success (Green)</SelectItem>
                                    <SelectItem value="warning">Warning (Yellow)</SelectItem>
                                    <SelectItem value="error">Error (Red)</SelectItem>
                                    <SelectItem value="promo">Promo / Celebration (Purple)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Target Audience</Label>
                            <Select value={target} onValueChange={(v: any) => setTarget(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Screens</SelectItem>
                                    <SelectItem value="pos_only">POS Terminals Only</SelectItem>
                                    <SelectItem value="customer_display_only">Customer Displays</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Display Duration (Minutes)</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Minute</SelectItem>
                                <SelectItem value="5">5 Minutes</SelectItem>
                                <SelectItem value="15">15 Minutes</SelectItem>
                                <SelectItem value="60">1 Hour</SelectItem>
                                <SelectItem value="1440">All Day (24 Hours)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSend} disabled={isSending || !content.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSending ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send Broadcast</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
