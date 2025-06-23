'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function BusinessLocationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <MapPin className="w-8 h-8" />
        Business Locations
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Business Locations</CardTitle>
          <CardDescription>
            Manage your business locations here.
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
