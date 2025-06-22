'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

const instructionsData = [
  { number: 1, name: 'SKU (Required)', instruction: 'Product SKU.' },
  { number: 2, name: 'Location (Optional)', instruction: 'Business Location Name. If blank, first business location will be used.' },
  { number: 3, name: 'Quantity (Required)', instruction: 'Opening stock quantity.' },
  { number: 4, name: 'Unit Cost (Before Tax) (Optional)', instruction: 'If blank, product default purchase price will be used.' },
  { number: 5, name: 'Lot Number (Optional)', instruction: '' },
  { number: 6, name: 'Expiry Date (Optional)', instruction: 'Stock expiry date in Y-m-d format (e.g. 2025-12-31)' },
];


export default function ImportOpeningStockPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Upload className="w-8 h-8" />
        <h1 className="font-headline text-3xl font-bold">Import Opening Stock</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csv-file">File To Import:</Label>
              <Input id="csv-file" type="file" accept=".csv" className="max-w-xs" />
              <p className="text-sm text-muted-foreground">Only .csv files are supported.</p>
            </div>
            <Button type="submit">Submit</Button>
          </form>
          <div className="pt-6">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="mr-2 h-4 w-4" />
              Download template file
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Follow the instructions carefully before importing the file.
            The columns of the CSV file must be in the following order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Column Number</TableHead>
                  <TableHead>Column Name</TableHead>
                  <TableHead>Instruction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructionsData.map(row => (
                  <TableRow key={row.number}>
                    <TableCell>{row.number}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                        <pre className="whitespace-pre-wrap font-sans">{row.instruction}</pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-slate-400 p-1">
        Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
      </div>
    </div>
  );
}
