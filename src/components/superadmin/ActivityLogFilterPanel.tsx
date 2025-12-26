'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type SuperadminActivityLog } from '@/lib/data';
import { type ActivityLogFilters } from '@/services/activityLogService';
import { DateRange } from 'react-day-picker';

type User = {
    id: string;
    name: string;
    email: string;
};

type Props = {
    filters: ActivityLogFilters;
    onFiltersChange: (filters: ActivityLogFilters) => void;
    users: User[];
    onApply: () => void;
    onClear: () => void;
};

const LOG_TYPES: SuperadminActivityLog['logType'][] = ['Packages', 'Businesses', 'Payments', 'Settings', 'Emails'];
const ACTIONS: SuperadminActivityLog['action'][] = ['Create', 'Update', 'Delete', 'Activate', 'Deactivate', 'Approve', 'Decline'];
const STATUSES: SuperadminActivityLog['status'][] = ['Success', 'Failed', 'Pending', 'Info'];

export function ActivityLogFilterPanel({ filters, onFiltersChange, users, onApply, onClear }: Props) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        filters.dateFrom && filters.dateTo ? { from: filters.dateFrom, to: filters.dateTo } : undefined
    );

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        onFiltersChange({
            ...filters,
            dateFrom: range?.from,
            dateTo: range?.to,
        });
    };

    const handleQuickDate = (days: number) => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        setDateRange({ from, to });
        onFiltersChange({
            ...filters,
            dateFrom: from,
            dateTo: to,
        });
    };

    const handleToday = () => {
        const today = new Date();
        const from = new Date(today.setHours(0, 0, 0, 0));
        const to = new Date();
        to.setHours(23, 59, 59, 999);
        setDateRange({ from, to });
        onFiltersChange({
            ...filters,
            dateFrom: from,
            dateTo: to,
        });
    };

    return (
        <Card className="h-fit sticky top-4">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5" />
                    Filters
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="flex flex-wrap gap-1 mb-2">
                        <Button variant="outline" size="sm" className="text-xs" onClick={handleToday}>
                            Today
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => handleQuickDate(7)}>
                            Last 7 days
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => handleQuickDate(30)}>
                            Last 30 days
                        </Button>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !dateRange && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                                        </>
                                    ) : (
                                        format(dateRange.from, 'LLL dd, y')
                                    )
                                ) : (
                                    <span>Custom range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* User Filter */}
                <div className="space-y-2">
                    <Label>User</Label>
                    <Select
                        value={filters.userId || 'all'}
                        onValueChange={(value) => onFiltersChange({ ...filters, userId: value === 'all' ? undefined : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Users" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Log Type Filter */}
                <div className="space-y-2">
                    <Label>Log Type</Label>
                    <Select
                        value={filters.logType || 'all'}
                        onValueChange={(value) =>
                            onFiltersChange({
                                ...filters,
                                logType: value === 'all' ? undefined : (value as SuperadminActivityLog['logType']),
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {LOG_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Action Filter */}
                <div className="space-y-2">
                    <Label>Action</Label>
                    <Select
                        value={filters.action || 'all'}
                        onValueChange={(value) =>
                            onFiltersChange({
                                ...filters,
                                action: value === 'all' ? undefined : (value as SuperadminActivityLog['action']),
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            {ACTIONS.map((action) => (
                                <SelectItem key={action} value={action}>
                                    {action}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) =>
                            onFiltersChange({
                                ...filters,
                                status: value === 'all' ? undefined : (value as SuperadminActivityLog['status']),
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    status === 'Success'
                                                        ? '#22c55e'
                                                        : status === 'Failed'
                                                            ? '#ef4444'
                                                            : status === 'Pending'
                                                                ? '#eab308'
                                                                : '#3b82f6',
                                            }}
                                        />
                                        {status}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                    <Button className="flex-1" onClick={onApply}>
                        <Filter className="mr-2 h-4 w-4" />
                        Apply Filters
                    </Button>
                    <Button variant="outline" onClick={onClear}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
