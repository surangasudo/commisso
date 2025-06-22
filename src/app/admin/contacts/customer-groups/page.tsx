import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function CustomerGroupsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <UserCog className="w-8 h-8" />
        Customer Groups
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Customer Groups</CardTitle>
          <CardDescription>
            This section will be used to group customers for pricing and reporting.
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
