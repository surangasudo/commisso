'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

export default function UpdatePricePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Tag className="w-8 h-8" />
        Update Price
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Update Product Prices</CardTitle>
          <CardDescription>
            This section is for bulk updating product prices.
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
