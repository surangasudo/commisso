'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Info,
  Building,
  Landmark,
  Package,
  Contact,
  Upload,
  Printer,
  Monitor,
  Download,
  CreditCard,
  LayoutDashboard,
  Cog,
  CaseSensitive,
  Mail,
  MessageSquare,
  Award,
  Book,
  Tags,
  Calendar,
  Clock,
  Calculator
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const settingsTabs = [
  { value: "business", label: "Business", icon: Building },
  { value: "tax", label: "Tax", icon: Landmark },
  { value: "product", label: "Product", icon: Package },
  { value: "contact", label: "Contact", icon: Contact },
  { value: "sale", label: "Sale", icon: Upload },
  { value: "pos", label: "POS", icon: Printer },
  { value: "display_screen", label: "Display Screen", icon: Monitor },
  { value: "purchases", label: "Purchases", icon: Download },
  { value: "payment", label: "Payment", icon: CreditCard },
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "system", label: "System", icon: Cog },
  { value: "prefixes", label: "Prefixes", icon: CaseSensitive },
  { value: "email_settings", label: "Email Settings", icon: Mail },
  { value: "sms_settings", label: "SMS Settings", icon: MessageSquare },
  { value: "reward_point_settings", label: "Reward Point Settings", icon: Award },
  { value: "modules", label: "Modules", icon: Book },
  { value: "custom_labels", label: "Custom Labels", icon: Tags },
];

const BusinessSettingsForm = () => (
    <Card>
        <CardContent className="pt-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name:*</Label>
                    <Input id="business-name" defaultValue="Awesome Shop" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date:</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input id="start-date" type="date" defaultValue="2018-01-01" className="pl-10" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="profit-percent" className="flex items-center gap-1">Default profit percent:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Input id="profit-percent" type="number" defaultValue="25.00" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency:*</Label>
                     <Select defaultValue="usd">
                        <SelectTrigger id="currency">
                             <div className="flex items-center gap-2">
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                                <SelectValue/>
                            </div>
                        </SelectTrigger>
                        <SelectContent><SelectItem value="usd">America - Dollars(USD)</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency-placement">Currency Symbol Placement:</Label>
                     <Select defaultValue="before">
                        <SelectTrigger id="currency-placement"><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="before">Before amount</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time-zone">Time zone:</Label>
                     <Select defaultValue="phoenix">
                        <SelectTrigger id="time-zone">
                             <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent><SelectItem value="phoenix">America/Phoenix</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="upload-logo">Upload Logo:</Label>
                    <div className="flex items-center gap-2">
                        <Input id="upload-logo" type="file" className="flex-1"/>
                    </div>
                    <p className="text-xs text-muted-foreground">Previous logo (if exists) will be replaced</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fy-start" className="flex items-center gap-1">Financial year start month: <Info className="w-3 h-3 text-muted-foreground"/></Label>
                     <Select defaultValue="january">
                        <SelectTrigger id="fy-start">
                             <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent><SelectItem value="january">January</SelectItem></SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="stock-method" className="flex items-center gap-1">Stock Accounting Method:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                     <Select defaultValue="fifo">
                        <SelectTrigger id="stock-method">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent><SelectItem value="fifo">FIFO (First In First Out)</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="transaction-edit-days" className="flex items-center gap-1">Transaction Edit Days:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Input id="transaction-edit-days" type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format:*</Label>
                    <Select defaultValue="mmddyyyy">
                        <SelectTrigger id="date-format"><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="mmddyyyy">mm/dd/yyyy</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time-format">Time Format:*</Label>
                    <Select defaultValue="24-hour">
                        <SelectTrigger id="time-format">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent><SelectItem value="24-hour">24 Hour</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency-precision" className="flex items-center gap-1">Currency precision:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Select defaultValue="2">
                        <SelectTrigger id="currency-precision"><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="2">2</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quantity-precision" className="flex items-center gap-1">Quantity precision:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                     <Select defaultValue="2">
                        <SelectTrigger id="quantity-precision"><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="2">2</SelectItem></SelectContent>
                    </Select>
                </div>
             </div>
        </CardContent>
        <CardFooter>
            <Button className="bg-red-500 hover:bg-red-600">Update Settings</Button>
        </CardFooter>
    </Card>
);

const PlaceholderContent = ({ title }: { title: string }) => (
    <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">{title} settings coming soon...</p>
            </div>
        </CardContent>
    </Card>
);


export default function BusinessSettingsPage() {

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-6">
                <h1 className="font-headline text-3xl font-bold">Business Settings</h1>
                <Tabs defaultValue="business" className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    <TabsList className="flex flex-col h-auto p-2 gap-1 items-stretch bg-card border rounded-lg lg:col-span-1">
                        {settingsTabs.map(tab => (
                            <TabsTrigger 
                                key={tab.value} 
                                value={tab.value} 
                                className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="lg:col-span-3">
                        <TabsContent value="business">
                            <BusinessSettingsForm />
                        </TabsContent>
                        {settingsTabs.filter(t => t.value !== 'business').map(tab => (
                             <TabsContent key={tab.value} value={tab.value}>
                                <PlaceholderContent title={tab.label} />
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
                <div className="text-center text-xs text-slate-400 p-1">
                    Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
                </div>
            </div>
        </TooltipProvider>
    );
}