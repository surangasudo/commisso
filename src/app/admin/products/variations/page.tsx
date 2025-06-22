'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {GitCommitHorizontal} from "lucide-react";

export default function VariationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <GitCommitHorizontal className="w-8 h-8" />
        Variations
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Product Variations</CardTitle>
          <CardDescription>
            This section is for managing product variations.
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
