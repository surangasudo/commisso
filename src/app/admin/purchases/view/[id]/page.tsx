'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useParams } from 'next/navigation';

export default function ViewPurchasePage() {
  const params = useParams();
  const { id } = params;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Download className="w-8 h-8" />
        View Purchase
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Viewing Purchase Details</CardTitle>
          <CardDescription>
            Viewing details for purchase with ID: {id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Purchase details view coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
