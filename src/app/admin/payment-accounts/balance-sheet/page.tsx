import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function BalanceSheetPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Scale className="w-8 h-8" />
        Balance Sheet
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet Report</CardTitle>
          <CardDescription>
            This report will show assets, liabilities, and equity at a specific point in time.
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
