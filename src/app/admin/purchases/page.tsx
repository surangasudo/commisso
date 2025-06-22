import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function PurchasesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <CreditCard className="w-8 h-8" />
        Purchase Management
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Purchases & Suppliers</CardTitle>
          <CardDescription>
            This section will be used to manage purchase orders, returns, and supplier information.
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
