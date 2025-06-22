import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>
            Manage your commission system settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-medium font-headline">Notifications</h3>
            <div className="flex items-center space-x-2">
                <Checkbox id="email-notifications" defaultChecked />
                <Label htmlFor="email-notifications">Enable Email Notifications</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="sms-notifications" />
                <Label htmlFor="sms-notifications">Enable SMS Notifications</Label>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium font-headline">API Keys</h3>
            <div className="space-y-2">
                <Label htmlFor="sms-api-key">SMS Provider API Key</Label>
                <Input id="sms-api-key" placeholder="Enter your SMS API Key" />
            </div>
            <div className="space-y-2 pt-2">
                <Label htmlFor="whatsapp-api-key">WhatsApp Provider API Key</Label>
                <Input id="whatsapp-api-key" placeholder="Enter your WhatsApp API Key" />
            </div>
          </div>
           <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
