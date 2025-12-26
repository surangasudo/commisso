'use client';

import React from 'react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type SuperadminActivityLog } from '@/lib/data';

type Props = {
    log: SuperadminActivityLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const STATUS_COLORS: Record<SuperadminActivityLog['status'], string> = {
    Success: '#22c55e',
    Failed: '#ef4444',
    Pending: '#eab308',
    Info: '#3b82f6',
};

export function ActivityLogDetailModal({ log, open, onOpenChange }: Props) {
    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Log Details
                        <Badge
                            style={{
                                backgroundColor: STATUS_COLORS[log.status],
                                color: log.status === 'Pending' ? '#000' : '#fff',
                            }}
                        >
                            {log.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Activity log entry from {format(new Date(log.timestamp), 'PPpp')}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Log ID</label>
                                <p className="font-mono text-sm">{log.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                                <p className="font-mono text-sm">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* User Info */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">User</label>
                            <div className="mt-1 p-3 bg-muted rounded-md">
                                <p className="font-medium">{log.userName}</p>
                                <p className="text-sm text-muted-foreground">{log.userEmail}</p>
                                <p className="text-xs text-muted-foreground mt-1">ID: {log.userId}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Action Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Action</label>
                                <div className="mt-1">
                                    <Badge variant="outline" className="text-base">{log.action}</Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Log Type</label>
                                <div className="mt-1">
                                    <Badge variant="secondary" className="text-base">{log.logType}</Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Entity Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Entity</label>
                                <p className="mt-1">{log.entity}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Entity ID</label>
                                <p className="font-mono text-sm mt-1">{log.entityId}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Details */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Details</label>
                            <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">{log.details}</p>
                        </div>

                        {/* Metadata */}
                        {log.metadata && (
                            <>
                                <Separator />
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Metadata</label>
                                    <div className="mt-2 space-y-3">
                                        {log.metadata.ipAddress && (
                                            <div>
                                                <label className="text-xs text-muted-foreground">IP Address</label>
                                                <p className="font-mono text-sm">{log.metadata.ipAddress}</p>
                                            </div>
                                        )}
                                        {log.metadata.userAgent && (
                                            <div>
                                                <label className="text-xs text-muted-foreground">User Agent</label>
                                                <p className="font-mono text-xs break-all">{log.metadata.userAgent}</p>
                                            </div>
                                        )}
                                        {log.metadata.beforeState && (
                                            <div>
                                                <label className="text-xs text-muted-foreground">Before State</label>
                                                <pre className="mt-1 p-3 bg-red-50 dark:bg-red-950/20 rounded-md text-xs overflow-x-auto">
                                                    {JSON.stringify(log.metadata.beforeState, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {log.metadata.afterState && (
                                            <div>
                                                <label className="text-xs text-muted-foreground">After State</label>
                                                <pre className="mt-1 p-3 bg-green-50 dark:bg-green-950/20 rounded-md text-xs overflow-x-auto">
                                                    {JSON.stringify(log.metadata.afterState, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
