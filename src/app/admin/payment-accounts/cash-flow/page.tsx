import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";

export default function CashFlowPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Droplets className="w-8 h-8" />
        Cash Flow
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Report</CardTitle>
          <CardDescription>
            This report will show the movement of cash in and out of the business.
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
