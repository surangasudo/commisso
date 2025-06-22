'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

const instructionsData = [
  { number: 1, name: 'Customer Name (Required)', instruction: 'Name of the customer.' },
  { number: 2, name: 'Invoice No (Optional)', instruction: 'Leave blank to auto generate.' },
  { number: 3, name: 'Sale Date (Optional)', instruction: 'Format: YYYY-MM-DD hh:mm:ss (e.g. 2025-07-25 15:30:00). If blank, current date will be used.' },
  { number: 4, name: 'Status (Required)', instruction: 'Available options: Final, Draft, Quotation.' },
  { number: 5, name: 'Payment Method (Required)', instruction: 'Available options: Cash, Card, Cheque, Bank Transfer, Other.' },
  { number: 6, name: 'Product Name (Required)', instruction: 'Name of the product.' },
  { number: 7, name: 'Quantity (Required)', instruction: 'Quantity of the product sold.' },
  { number: 8, name: 'Unit Price (Optional)', instruction: 'If blank, product selling price will be used.' },
  { number: 9, name: 'Discount Type (Optional)', instruction: 'Available options: Fixed, Percentage.' },
  { number: 10, name: 'Discount Amount (Optional)', instruction: 'Discount amount for the sale.' },
  { number: 11, name: 'Order Tax (Optional)', instruction: 'Name of the Tax Rate.' },
  { number: 12, name: 'Shipping Details (Optional)', instruction: 'Details for shipping.' },
  { number: 13, name: 'Shipping Charges (Optional)', instruction: 'Cost of shipping.' },
  { number: 14, name: 'Shipping Status (Optional)', instruction: 'Available options: Ordered, Packed, Shipped, Delivered, Cancelled.' },
];


export default function ImportSalesPage() {

  const handleDownloadTemplate = () => {
    // Generate the CSV header row from instructionsData
    const headers = instructionsData.map(item => `"${item.name.replace(/"/g, '""')}"`).join(',');

    // Create a Blob from the CSV string
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a link to trigger the download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sales_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Upload className="w-8 h-8" />
        <h1 className="font-headline text-3xl font-bold">Import Sales</h1>
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
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleDownloadTemplate}>
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
