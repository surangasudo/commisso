'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type Props = {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
};

const PAGE_SIZES = [25, 50, 100];

export function ActivityLogPagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: Props) {
    const [jumpToPage, setJumpToPage] = React.useState('');

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const handleJumpToPage = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(jumpToPage, 10);
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            setJumpToPage('');
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Results counter */}
            <div className="text-sm text-muted-foreground">
                Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
                <strong>{totalItems}</strong> results
            </div>

            <div className="flex items-center gap-4">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZES.map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Jump to page */}
                <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Go to:</span>
                    <Input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={jumpToPage}
                        onChange={(e) => setJumpToPage(e.target.value)}
                        placeholder={currentPage.toString()}
                        className="w-[60px] text-center"
                    />
                </form>

                {/* Page info */}
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>

                {/* Navigation buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
