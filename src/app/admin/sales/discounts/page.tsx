import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent } from "lucide-react";

export default function DiscountsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <BadgePercent className="w-8 h-8" />
        Discounts
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Discounts</CardTitle>
          <CardDescription>
            This feature is under development.
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
