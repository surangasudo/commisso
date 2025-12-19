'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Trash2, Pencil, Eye, Plus } from "lucide-react";
import { getQuotations, deleteQuotation } from '@/services/saleService';
import { Sale } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import { useCurrency } from '@/hooks/use-currency';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ListQuotationsPage() {
  const [quotations, setQuotations] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const data = await getQuotations();
      setQuotations(data);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      toast({
        title: "Error",
        description: "Failed to load quotations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteQuotation(deleteId);
      toast({
        title: "Success",
        description: "Quotation deleted successfully.",
      });
      fetchQuotations();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to delete quotation.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          List Quotations
        </h1>
        <Link href="/admin/sales/quotation/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Quotation
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Quotation No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Loading quotes...
                    </TableCell>
                  </TableRow>
                ) : quotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No quotations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotations.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        {quote.date ? format(new Date(quote.date), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">{quote.invoiceNo}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{quote.customerName}</span>
                          <span className="text-xs text-muted-foreground">{quote.contactNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>{quote.totalItems}</TableCell>
                      <TableCell>{formatCurrency(quote.totalAmount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit/View could be added here later */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(quote.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the quotation.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
