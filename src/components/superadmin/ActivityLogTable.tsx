'use client';

import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type SuperadminActivityLog } from '@/lib/data';
import { type SortOptions } from '@/services/activityLogService';

type Props = {
    logs: SuperadminActivityLog[];
    sort: SortOptions;
    onSortChange: (sort: SortOptions) => void;
    onRowClick: (log: SuperadminActivityLog) => void;
    isLoading: boolean;
    refreshCountdown: number;
};

const STATUS_COLORS: Record<SuperadminActivityLog['status'], string> = {
    Success: '#22c55e',
    Failed: '#ef4444',
    Pending: '#eab308',
    Info: '#3b82f6',
};

type SortableColumn = {
    key: keyof SuperadminActivityLog;
    label: string;
    sortable: boolean;
};

const COLUMNS: SortableColumn[] = [
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'userName', label: 'User', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'logType', label: 'Log Type', sortable: true },
    { key: 'entity', label: 'Entity', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'details', label: 'Details', sortable: false },
];

export function ActivityLogTable({
    logs,
    sort,
    onSortChange,
    onRowClick,
    isLoading,
    refreshCountdown,
}: Props) {
    const handleSort = (field: keyof SuperadminActivityLog) => {
        if (sort.field === field) {
            onSortChange({
                field,
                direction: sort.direction === 'asc' ? 'desc' : 'asc',
            });
        } else {
            onSortChange({ field, direction: 'desc' });
        }
    };

    const getSortIcon = (field: keyof SuperadminActivityLog) => {
        if (sort.field !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
        }
        return sort.direction === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    return (
        <div className="space-y-2">
            {/* Auto-refresh indicator */}
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
                <span>Auto-refresh in {refreshCountdown}s</span>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {COLUMNS.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={cn(column.sortable && 'cursor-pointer select-none hover:bg-muted/50')}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center">
                                        {column.label}
                                        {column.sortable && getSortIcon(column.key)}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Loading activity logs...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No activity logs found for the selected filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow
                                    key={log.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => onRowClick(log)}
                                >
                                    <TableCell className="font-mono text-xs">
                                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{log.userName}</span>
                                            <span className="text-xs text-muted-foreground">{log.userEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.action}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{log.logType}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={log.entity}>
                                        {log.entity}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            style={{
                                                backgroundColor: STATUS_COLORS[log.status],
                                                color: log.status === 'Pending' ? '#000' : '#fff',
                                            }}
                                        >
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={log.details}>
                                        {log.details}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
