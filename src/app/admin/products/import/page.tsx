'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

const instructionsData = [
  { number: 1, name: 'Product Name (Required)', instruction: '' },
  { number: 2, name: 'SKU (Optional)', instruction: 'Leave blank to auto generate SKU.' },
  { number: 3, name: 'Product Type (Required)', instruction: 'Available Options: Single or Variable' },
  { number: 4, name: 'Unit (Required)', instruction: 'Name of the unit.' },
  { number: 5, name: 'Brand (Optional)', instruction: '' },
  { number: 6, name: 'Category (Optional)', instruction: '' },
  { number: 7, name: 'Business Location(s) (Optional)', instruction: 'Comma separated names of business locations where product will be available.' },
  { number: 8, name: 'Manage Stock? (Required)', instruction: 'Available Options: 1 = Yes, 0 = No' },
  { number: 9, name: 'Alert Quantity (Optional)', instruction: '' },
  { number: 10, name: 'Default Purchase Price (Required)', instruction: 'Excluding Tax.' },
  { number: 11, name: 'Default Selling Price (Required)', instruction: 'Excluding Tax.' },
  { number: 12, name: 'Applicable Tax (Optional)', instruction: 'Name of the Tax Rate. If purchase & sell tax are different then text should be in this format: PurchaseTaxName:SellTaxName' },
  { number: 13, name: 'Product Description (Optional)', instruction: '' },
  { number: 14, name: 'Custom Field 1 (Optional)', instruction: '' },
  { number: 15, name: 'Custom Field 2 (Optional)', instruction: '' },
  { number: 16, name: 'Custom Field 3 (Optional)', instruction: '' },
  { number: 17, name: 'Custom Field 4 (Optional)', instruction: '' },
];


export default function ImportProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Upload className="w-8 h-8" />
        <h1 className="font-headline text-3xl font-bold">Import Products</h1>
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
