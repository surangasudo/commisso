'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AppFooter } from "@/components/app-footer";

const instructionsData = [
  {
    number: 1,
    name: 'Contact type (Required)',
    instruction: 'Available Options: 1 = Customer, 2 = Supplier, 3 = Both',
  },
  { number: 2, name: 'Prefix (Optional)', instruction: '' },
  { number: 3, name: 'First Name (Required)', instruction: '' },
  { number: 4, name: 'Middle name (Optional)', instruction: '' },
  { number: 5, name: 'Last Name (Optional)', instruction: '' },
  {
    number: 6,
    name: 'Business Name (Required if contact type is supplier or both)',
    instruction: '',
  },
  {
    number: 7,
    name: 'Contact ID (Optional)',
    instruction: 'Leave blank to auto generate Contact ID',
  },
  { number: 8, name: 'Tax number (Optional)', instruction: '' },
  { number: 9, name: 'Opening Balance (Optional)', instruction: '' },
  {
    number: 10,
    name: 'Pay term (Required if contact type is supplier or both)',
    instruction: '',
  },
  {
    number: 11,
    name: 'Pay term period (Required if contact type is supplier or both)',
    instruction: 'Available Options: days and months',
  },
  { number: 12, name: 'Credit Limit (Optional)', instruction: '' },
  { number: 13, name: 'Email (Optional)', instruction: '' },
  { number: 14, name: 'Mobile (Required)', instruction: '' },
  { number: 15, name: 'Alternate contact number (Optional)', instruction: '' },
  { number: 16, name: 'Landline (Optional)', instruction: '' },
  { number: 17, name: 'City (Optional)', instruction: '' },
  { number: 18, name: 'State (Optional)', instruction: '' },
  { number: 19, name: 'Country (Optional)', instruction: '' },
  { number: 20, name: 'Address line 1 (Optional)', instruction: '' },
  { number: 21, name: 'Address line 2 (Optional)', instruction: '' },
  { number: 22, name: 'Zip Code (Optional)', instruction: '' },
  {
    number: 23,
    name: 'Date of birth (Optional)',
    instruction: 'Format Y-m-d (2025-06-22)',
  },
  { number: 24, name: 'Custom Field 1 (Optional)', instruction: '' },
  { number: 25, name: 'Custom Field 2 (Optional)', instruction: '' },
  { number: 26, name: 'Custom Field 3 (Optional)', instruction: '' },
  { number: 27, name: 'Custom Field 4 (Optional)', instruction: '' },
];


export default function ImportContactsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold">Import Contacts</h1>

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csv-file">File To Import:</Label>
              <Input id="csv-file" type="file" className="max-w-xs" />
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
            Carefully follow the instructions before importing the file.
            The columns of the CSV file should be in the following order.
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
      <AppFooter />
    </div>
  );
}
