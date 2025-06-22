'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Pencil } from "lucide-react";
import { useParams } from 'next/navigation';

export default function EditPurchasePage() {
  const params = useParams();
  const { id } = params;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Pencil className="w-8 h-8" />
        Edit Purchase
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Editing Purchase Details</CardTitle>
          <CardDescription>
            Editing purchase with ID: {id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Purchase editing form coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
