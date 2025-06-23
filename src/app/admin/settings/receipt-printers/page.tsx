'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "lucide-react";

export default function ReceiptPrintersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Printer className="w-8 h-8" />
        Receipt Printers
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Receipt Printers</CardTitle>
          <CardDescription>
            Manage your receipt printers here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Coming Soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
