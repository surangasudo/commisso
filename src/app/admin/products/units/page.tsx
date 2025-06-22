'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler } from "lucide-react";

export default function UnitsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Ruler className="w-8 h-8" />
        Units
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Product Units</CardTitle>
          <CardDescription>
            This section is for managing product units (e.g., Kg, Pcs, Box).
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
