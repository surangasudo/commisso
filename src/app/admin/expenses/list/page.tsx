'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Printer,
  Search,
  Pencil,
  Trash2,
  PlusCircle,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Wallet
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type Expense } from '@/lib/data';
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
import { AppFooter } from '@/components/app-footer';
import { getExpenses, deleteExpense } from '@/services/expenseService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';

const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'due':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'partial':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

export default function ListExpensesPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (error) {
        toast({ title: "Error", description: "Could not fetch expenses.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, [toast]);

  const totalAmount = expenses.reduce((acc, expense) => acc + expense.totalAmount, 0);
  const totalDue = expenses.reduce((acc, expense) => acc + expense.paymentDue, 0);
  
  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete.id);
        setExpenses(expenses.filter(e => e.id !== expenseToDelete.id));
        toast({ title: "Success", description: "Expense deleted successfully." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete expense.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setExpenseToDelete(null);
      }
    }
  };
  
  const handleEdit = (expenseId: string) => {
    alert(`Editing expense ${expenseId} is not yet implemented.`);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-2">
              <h1 className="font-headline text-3xl font-bold flex items-center gap-2"><Wallet className="w-8 h-8"/> List Expenses</h1>
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
                              <CardTitle>All Expenses</CardTitle>
                              <div className="flex items-center gap-2">
                                  <Link href="/admin/expenses/add">
                                  <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                                      <PlusCircle className="h-4 w-4" />
                                      <span>Add</span>
                                  </Button>
                                  </Link>
                              </div>
                          </div>
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
                                  <TableHead><div className="flex items-center gap-1">Reference No <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead><div className="flex items-center gap-1">Expense Category <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead>Location</TableHead>
                                  <TableHead><div className="flex items-center gap-1">Payment Status <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead><div className="flex items-center gap-1">Total Amount <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead><div className="flex items-center gap-1">Payment due <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                                  <TableHead>Expense Note</TableHead>
                                  <TableHead><div className="flex items-center gap-1">Added By <ArrowUpDown className="h-3 w-3" /></div></TableHead>
                              </TableRow>
                              </TableHeader>
                              <TableBody>
                              {isLoading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    </TableRow>
                                ))
                              ) : expenses.map((expense) => (
                                  <TableRow key={expense.id}>
                                  <TableCell>
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="outline" size="sm" className="h-8">Actions <ChevronDown className="ml-2 h-3 w-3" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuItem onSelect={() => handleEdit(expense.id)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                              <DropdownMenuItem onSelect={() => handleDelete(expense)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </TableCell>
                                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{expense.referenceNo}</TableCell>
                                  <TableCell>{expense.expenseCategory}</TableCell>
                                  <TableCell>{expense.location}</TableCell>
                                  <TableCell><Badge variant="outline" className={cn("capitalize", getPaymentStatusBadge(expense.paymentStatus))}>{expense.paymentStatus}</Badge></TableCell>
                                  <TableCell>{formatCurrency(expense.totalAmount)}</TableCell>
                                  <TableCell>{formatCurrency(expense.paymentDue)}</TableCell>
                                  <TableCell>{expense.expenseNote || 'N/A'}</TableCell>
                                  <TableCell>{expense.addedBy}</TableCell>
                                  </TableRow>
                              ))}
                              </TableBody>
                              <TableFooter>
                                  <TableRow>
                                      <TableCell colSpan={6} className="text-right font-bold">Total:</TableCell>
                                      <TableCell className="font-bold">{formatCurrency(totalAmount)}</TableCell>
                                      <TableCell className="font-bold">{formatCurrency(totalDue)}</TableCell>
                                      <TableCell colSpan={2}></TableCell>
                                  </TableRow>
                              </TableFooter>
                          </Table>
                          </div>
                      </CardContent>
                      <CardFooter className="py-4">
                          <div className="text-xs text-muted-foreground">
                              Showing <strong>1 to {expenses.length}</strong> of <strong>{expenses.length}</strong> entries
                          </div>
                      </CardFooter>
                  </Card>
              </CardContent>
          </Card>
          <AppFooter />
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense
              with reference "{expenseToDelete?.referenceNo}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
