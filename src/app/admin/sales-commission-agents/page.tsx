'use client';
import React from 'react';
import Link from 'next/link';
import {
  Download,
  Printer,
  Search,
  Pencil,
  Trash2,
  Eye,
  PlusCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Badge } from '@/components/ui/badge';
import { commissionProfiles } from '@/lib/data';

export default function SalesCommissionAgentsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>Commission Profiles</CardTitle>
            <Link href="/admin/sales-commission-agents/add">
              <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                <PlusCircle className="h-4 w-4" />
                <span>Add Profile</span>
              </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search profiles..." className="pl-8 w-full sm:w-auto h-9" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span></Button>
            <Button variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
          </div>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell><Badge variant="outline">{profile.entityType}</Badge></TableCell>
                  <TableCell>{profile.phone}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 items-center">
                        <Badge variant="secondary">Overall: {profile.commission.overall}%</Badge>
                        {profile.commission.categories?.map(c => (
                            <Badge key={c.category} variant="outline">{c.category}: {c.rate}%</Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                              <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-cyan-600 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700">
                              <Eye className="mr-1 h-3 w-3" /> View
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
          Showing <strong>1 to 4</strong> of <strong>4</strong> entries
        </div>
      </CardFooter>
    </Card>
  );
}
