import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Notebook } from "lucide-react";

export default function PaymentAccountReportPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Notebook className="w-8 h-8" />
        Payment Account Report
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Payment Account Report</CardTitle>
          <CardDescription>
            This report will provide a detailed summary of transactions for each payment account.
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
