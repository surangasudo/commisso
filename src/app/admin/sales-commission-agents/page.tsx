import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function SalesCommissionAgentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Users className="w-8 h-8" />
        Sales Commission Agents
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Commission Agents</CardTitle>
          <CardDescription>
            This section will be used to manage sales commission agents.
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
