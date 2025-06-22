'use client';
import React from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const customerGroups = [
  { name: 'Wholesale', calculationPercentage: 0 },
  { name: 'Retail', calculationPercentage: 0 },
];

export default function CustomerGroupsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <h1 className="font-headline text-3xl font-bold">Customer Groups</h1>
        <p className="text-muted-foreground">Manage your customer groups</p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <CardTitle>All customer groups</CardTitle>
                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </Button>
            </div>
            <CardDescription className="pt-2">
                Selling price group helps you to have different prices for same product for different customers. <br />
                Create a selling price group & add variation in selling price for that group.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-end mb-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" />
                </div>
            </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer group name</TableHead>
                  <TableHead>Calculation percentage (%)</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerGroups.map((group) => (
                  <TableRow key={group.name}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.calculationPercentage}%</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="py-4">
            <div className="text-xs text-muted-foreground">
                Showing <strong>1 to {customerGroups.length}</strong> of <strong>{customerGroups.length}</strong> entries
            </div>
        </CardFooter>
      </Card>
       <div className="text-center text-xs text-slate-400 p-1">
        Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
      </div>
    </div>
  );
}
