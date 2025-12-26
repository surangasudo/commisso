'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, FileText, Download, Search, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { type SuperadminActivityLog, SUPERADMIN_EMAILS } from '@/lib/data';
import {
    getActivityLogs,
    subscribeToActivityLogs,
    type ActivityLogFilters,
    type SortOptions,
} from '@/services/activityLogService';
import { getUsers } from '@/services/userService';
import { ActivityLogFilterPanel } from '@/components/superadmin/ActivityLogFilterPanel';
import { ActivityLogTable } from '@/components/superadmin/ActivityLogTable';
import { ActivityLogDetailModal } from '@/components/superadmin/ActivityLogDetailModal';
import { ActivityLogPagination } from '@/components/superadmin/ActivityLogPagination';
import { exportToCsv, exportToPdf } from '@/lib/export';

const AUTO_REFRESH_INTERVAL = 30; // seconds

export default function SuperadminActivityLogsPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<SuperadminActivityLog[]>([]);
    const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    // Filters
    const [filters, setFilters] = useState<ActivityLogFilters>({});
    const [appliedFilters, setAppliedFilters] = useState<ActivityLogFilters>({});
    const [searchTerm, setSearchTerm] = useState('');

    // Sorting
    const [sort, setSort] = useState<SortOptions>({ field: 'timestamp', direction: 'desc' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Modal
    const [selectedLog, setSelectedLog] = useState<SuperadminActivityLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Auto-refresh countdown
    const [refreshCountdown, setRefreshCountdown] = useState(AUTO_REFRESH_INTERVAL);

    // Check superadmin access
    const isSuperadmin = user && SUPERADMIN_EMAILS.includes(user.email.toLowerCase());

    // Load users for filter dropdown
    useEffect(() => {
        async function loadUsers() {
            try {
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers.map((u) => ({ id: u.id, name: u.name, email: u.email })));
            } catch (error) {
                console.error('Error loading users:', error);
            }
        }
        loadUsers();
    }, []);

    // Fetch logs
    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getActivityLogs(
                { ...appliedFilters, searchTerm },
                { pageSize },
                sort
            );
            setLogs(result.logs);
            setTotalItems(result.total);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        } finally {
            setIsLoading(false);
        }
    }, [appliedFilters, searchTerm, pageSize, sort]);

    // Subscribe to real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToActivityLogs(
            (updatedLogs) => {
                setLogs(updatedLogs);
            },
            { ...appliedFilters, searchTerm },
            sort,
            pageSize
        );

        return () => unsubscribe();
    }, [appliedFilters, searchTerm, sort, pageSize]);

    // Initial fetch
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Auto-refresh countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setRefreshCountdown((prev) => {
                if (prev <= 1) {
                    fetchLogs();
                    return AUTO_REFRESH_INTERVAL;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [fetchLogs]);

    // Apply filters
    const handleApplyFilters = () => {
        setAppliedFilters(filters);
        setCurrentPage(1);
    };

    // Clear filters
    const handleClearFilters = () => {
        setFilters({});
        setAppliedFilters({});
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    // Handle row click
    const handleRowClick = (log: SuperadminActivityLog) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    // Export to CSV
    const handleExportCSV = () => {
        const exportData = logs.map((log) => ({
            Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
            User: log.userName,
            Action: log.action,
            'Log Type': log.logType,
            Entity: log.entity,
            Status: log.status,
            Details: log.details,
        }));
        exportToCsv(exportData, `activity-logs-${format(new Date(), 'yyyy-MM-dd')}`);
    };

    // Export to PDF
    const handleExportPDF = () => {
        const headers = ['Timestamp', 'User', 'Action', 'Log Type', 'Entity', 'Status', 'Details'];
        const data = logs.map((log) => [
            format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
            log.userName,
            log.action,
            log.logType,
            log.entity,
            log.status,
            log.details.substring(0, 50) + (log.details.length > 50 ? '...' : ''),
        ]);
        exportToPdf(headers, data, `activity-logs-${format(new Date(), 'yyyy-MM-dd')}`);
    };

    // Calculate total pages
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Filter logs for current page (client-side pagination for now)
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return logs.slice(start, end);
    }, [logs, currentPage, pageSize]);

    if (!isSuperadmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground">
                <div className="container flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard">
                            <Button variant="ghost" size="icon" className="text-primary-foreground">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6" />
                            <h1 className="text-lg font-semibold">Superadmin Activity Logs</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={fetchLogs}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            CSV
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleExportPDF}>
                            <FileText className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filter Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0">
                        <ActivityLogFilterPanel
                            filters={filters}
                            onFiltersChange={setFilters}
                            users={users}
                            onApply={handleApplyFilters}
                            onClear={handleClearFilters}
                        />
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Activity Logs</CardTitle>
                                        <CardDescription>
                                            Monitor all superadmin activities across the system
                                        </CardDescription>
                                    </div>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search logs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ActivityLogTable
                                    logs={paginatedLogs}
                                    sort={sort}
                                    onSortChange={setSort}
                                    onRowClick={handleRowClick}
                                    isLoading={isLoading}
                                    refreshCountdown={refreshCountdown}
                                />

                                <ActivityLogPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    totalItems={totalItems}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>

            {/* Detail Modal */}
            <ActivityLogDetailModal
                log={selectedLog}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
}
