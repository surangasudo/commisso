import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";

export default function ExpenseCategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Folder className="w-8 h-8" />
        Expense Categories
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Expense Categories</CardTitle>
          <CardDescription>
            This section will allow you to manage expense categories.
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
