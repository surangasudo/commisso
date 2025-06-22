'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <FileText className="w-8 h-8" />
        Reports
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>System Reports</CardTitle>
          <CardDescription>
            This section will be used to generate various business reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Reporting features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
