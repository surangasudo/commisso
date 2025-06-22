'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Undo } from "lucide-react";

export default function AddPurchaseReturnPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Undo className="w-8 h-8" />
        Add Purchase Return
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Create New Purchase Return</CardTitle>
          <CardDescription>
            This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Add Purchase Return form coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
