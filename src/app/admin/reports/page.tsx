'use client';
import React from 'react';
import { Download, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { commissions } from '@/lib/data';
import { Input } from '@/components/ui/input';

const statusStyles = {
    Paid: 'bg-green-100 text-green-800 border-green-200',
    Approved: 'bg-blue-100 text-blue-800 border-blue-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Reversed: 'bg-red-100 text-red-800 border-red-200',
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
       <h1 className="font-headline text-3xl font-bold">Commission Reports</h1>
       <Card>
        <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex-1">
                <CardTitle>Detailed Report</CardTitle>
                <CardDescription>View and filter all commission records.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Paid
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Approved</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Reversed</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <Input placeholder="Search by agent name or transaction ID..." />
            </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Agent/Profile</TableHead>
                    <TableHead>Sale Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                    <TableCell className="font-mono text-xs">{commission.transactionId}</TableCell>
                    <TableCell className="font-medium">{commission.profileName}</TableCell>
                    <TableCell>${commission.amount.toFixed(2)}</TableCell>
                    <TableCell className="font-medium text-primary">${commission.commissionAmount.toFixed(2)}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={statusStyles[commission.status]}>
                            {commission.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
