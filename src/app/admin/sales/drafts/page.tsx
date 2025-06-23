'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  Printer,
  Search,
  Pencil,
  Trash2,
  Eye,
  PlusCircle,
  Filter,
  Columns3,
  FileText,
  ArrowUpDown,
  ChevronDown,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { drafts as initialDrafts, type Draft } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ListDraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<Draft | null>(null);

  const totalAmount = drafts.reduce((acc, draft) => acc + draft.totalAmount, 0);
  
  const handleEdit = (draftId: string) => {
    router.push(`/admin/sales/draft/edit/${draftId}`);
  };
  
  const handleDelete = (draft: Draft) => {
    setDraftToDelete(draft);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (draftToDelete) {
      setDrafts(drafts.filter(d => d.id !== draftToDelete.id));
      setIsDeleteDialogOpen(false);
      setDraftToDelete(null);
    }
  };

  const handleUnsupportedAction = (actionName: string) => {
    alert(`${actionName} is not yet implemented.`);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-2">
              <h1 className="font-headline text-3xl font-bold">Drafts</h1>
          </div>

          <Card>
              <CardHeader>
                   <Button variant="outline" size="sm" className="h-9 gap-1.5 w-fit">
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                  </Button>
              </CardHeader>
              <CardContent>
                  <Card>
                      <CardHeader>
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <CardTitle>All Drafts</CardTitle>
                              <div className="flex items-center gap-2">
                                  <Link href="/admin/sales/draft/add">
                                  <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                                      <PlusCircle className="h-4 w-4" />
                                      <span>Add</span>
                                  </Button>
                                  </Link>
                              </div>
                          </div>
                           <CardDescription>
                              Manage all your drafts from this screen.
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                              <Select defaultValue="25">
                                  <SelectTrigger className="w-[100px] h-9">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="10">Show 10</SelectItem>
                                      <SelectItem value="25">Show 25</SelectItem>
                                      <SelectItem value="50">Show 50</SelectItem>
                                      <SelectItem value="100">Show 100</SelectItem>
                                  </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground hidden lg:inline">entries</span>
                          </div>
                          <div className="flex-1 flex flex-wrap items-center justify-start sm:justify-center gap-2">
                              <Button variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span></Button>
                              <Button variant="outline" size="sm" className="h-9 gap-1"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export Excel</span></Button>
                              <Button onClick={() => window.print()} variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
                          </div>
                          <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" />
                          </div>
                          </div>
                          <div className="border rounded-md">
                          <Table>
                              <TableHeader>
                              <TableRow>
                                  <TableHead>Action</TableHead>
                                  <TableHead><div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead><div className="flex items-center gap-1">Draft No. <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead><div className="flex items-center gap-1">Customer name <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead>Location</TableHead>
                                  <TableHead><div className="flex items-center gap-1">Total amount <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead><div className="flex items-center gap-1">Total Items <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead><div className="flex items-center gap-1">Added By <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                              </TableRow>
                              </TableHeader>
                              <TableBody>
                              {drafts.map((draft) => (
                                  <TableRow key={draft.id}>
                                  <TableCell>
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuItem onSelect={() => handleUnsupportedAction('View')}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                              <DropdownMenuItem onSelect={() => handleEdit(draft.id)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem onSelect={() => handleUnsupportedAction('Finalize Sale')}><FileCheck className="mr-2 h-4 w-4" /> Finalize Sale</DropdownMenuItem>
                                              <DropdownMenuItem onSelect={() => handleDelete(draft)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </TableCell>
                                  <TableCell>{draft.date}</TableCell>
                                  <TableCell>{draft.draftNo}</TableCell>
                                  <TableCell>{draft.customerName}</TableCell>
                                  <TableCell>{draft.location}</TableCell>
                                  <TableCell>${draft.totalAmount.toFixed(2)}</TableCell>
                                  <TableCell>{draft.totalItems}</TableCell>
                                  <TableCell>{draft.addedBy}</TableCell>
                                  </TableRow>
                              ))}
                              </TableBody>
                              <TableFooter>
                                  <TableRow>
                                      <TableCell colSpan={5} className="text-right font-bold">Total:</TableCell>
                                      <TableCell className="font-bold">${totalAmount.toFixed(2)}</TableCell>
                                      <TableCell colSpan={2}></TableCell>
                                  </TableRow>
                              </TableFooter>
                          </Table>
                          </div>
                      </CardContent>
                      <CardFooter className="py-4">
                          <div className="text-xs text-muted-foreground">
                              Showing <strong>1 to {drafts.length}</strong> of <strong>{drafts.length}</strong> entries
                          </div>
                      </CardFooter>
                  </Card>
              </CardContent>
          </Card>
           <div className="text-center text-xs text-slate-400 p-1">
              Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
          </div>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the draft
              "{draftToDelete?.draftNo}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDraftToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
