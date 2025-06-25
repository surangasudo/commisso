'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useParams } from 'next/navigation';
import React from "react";

export default function ViewProductPage() {
  const { id } = React.use(useParams());

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Package className="w-8 h-8" />
        View Product
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Viewing Product Details</CardTitle>
          <CardDescription>
            Viewing details for product with ID: {id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Product details view coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
