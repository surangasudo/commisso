import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function ListExpensesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Wallet className="w-8 h-8" />
        List Expenses
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Expenses</CardTitle>
          <CardDescription>
            This section will allow you to track and categorize business expenses.
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
