'use client';
import React, { useState } from 'react';
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
  SelectGroup,
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
  Calendar as CalendarIcon,
  Clock,
  Calculator
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

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

const BusinessSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        businessName: 'Awesome Shop',
        startDate: '2018-01-01',
        profitPercent: '25.00',
        currency: 'usd',
        currencyPlacement: 'before',
        timeZone: 'America/Phoenix',
        logo: null as File | null,
        fyStartMonth: 'january',
        stockAccountingMethod: 'fifo',
        transactionEditDays: '30',
        dateFormat: 'mmddyyyy',
        timeFormat: '24-hour',
        currencyPrecision: '2',
        quantityPrecision: '2',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSettings(prev => ({ ...prev, logo: e.target.files![0] }));
        }
    };

    const handleUpdateSettings = () => {
        console.log('Updating settings:', settings);
        toast({
            title: 'Settings Updated',
            description: 'Your business settings have been saved successfully.',
        });
    };

    return (
    <Card>
        <CardContent className="pt-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name:*</Label>
                    <Input id="businessName" value={settings.businessName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date:</Label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input id="startDate" type="date" value={settings.startDate} onChange={handleInputChange} className="pl-10" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="profitPercent" className="flex items-center gap-1">Default profit percent:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Input id="profitPercent" type="number" value={settings.profitPercent} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency:*</Label>
                     <Select value={settings.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
                        <SelectTrigger id="currency">
                             <div className="flex items-center gap-2">
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                                <SelectValue/>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="usd">America - Dollars (USD)</SelectItem>
                            <SelectItem value="eur">Europe - Euro (EUR)</SelectItem>
                            <SelectItem value="gbp">United Kingdom - Pounds (GBP)</SelectItem>
                            <SelectItem value="jpy">Japan - Yen (JPY)</SelectItem>
                            <SelectItem value="inr">India - Rupees (INR)</SelectItem>
                            <SelectItem value="cad">Canada - Dollar (CAD)</SelectItem>
                            <SelectItem value="aud">Australia - Dollar (AUD)</SelectItem>
                            <SelectItem value="chf">Switzerland - Franc (CHF)</SelectItem>
                            <SelectItem value="cny">China - Yuan (CNY)</SelectItem>
                            <SelectItem value="brl">Brazil - Real (BRL)</SelectItem>
                            <SelectItem value="zar">South Africa - Rand (ZAR)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currencyPlacement">Currency Symbol Placement:</Label>
                     <Select value={settings.currencyPlacement} onValueChange={(value) => handleSelectChange('currencyPlacement', value)}>
                        <SelectTrigger id="currencyPlacement"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="before">Before amount</SelectItem>
                            <SelectItem value="after">After amount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="timeZone">Time zone:</Label>
                     <Select value={settings.timeZone} onValueChange={(value) => handleSelectChange('timeZone', value)}>
                        <SelectTrigger id="timeZone">
                             <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            <SelectGroup>
                                <Label className="px-2 text-xs">America</Label>
                                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                                <SelectItem value="America/Chicago">America/Chicago (CST)</SelectItem>
                                <SelectItem value="America/Denver">America/Denver (MST)</SelectItem>
                                <SelectItem value="America/Phoenix">America/Phoenix</SelectItem>
                                <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                                <SelectItem value="America/Anchorage">America/Anchorage (AKST)</SelectItem>
                                <SelectItem value="Pacific/Honolulu">Pacific/Honolulu (HST)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Europe</Label>
                                <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                                <SelectItem value="Europe/Paris">Europe/Paris (CET/CEST)</SelectItem>
                                <SelectItem value="Europe/Berlin">Europe/Berlin (CET/CEST)</SelectItem>
                                <SelectItem value="Europe/Moscow">Europe/Moscow (MSK)</SelectItem>
                                <SelectItem value="Europe/Istanbul">Europe/Istanbul (TRT)</SelectItem>
                            </SelectGroup>
                             <SelectGroup>
                                <Label className="px-2 text-xs">Asia</Label>
                                <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                                <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                <SelectItem value="Asia/Shanghai">Asia/Shanghai (CST)</SelectItem>
                                <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                            </SelectGroup>
                             <SelectGroup>
                                <Label className="px-2 text-xs">Australia</Label>
                                <SelectItem value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</SelectItem>
                                <SelectItem value="Australia/Perth">Australia/Perth (AWST)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Africa</Label>
                                <SelectItem value="Africa/Cairo">Africa/Cairo (EET)</SelectItem>
                                <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="logo">Upload Logo:</Label>
                    <div className="flex items-center gap-2">
                        <Input id="logo" type="file" className="flex-1" onChange={handleFileChange} />
                    </div>
                    <p className="text-xs text-muted-foreground">Previous logo (if exists) will be replaced</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fyStartMonth" className="flex items-center gap-1">Financial year start month: <Info className="w-3 h-3 text-muted-foreground"/></Label>
                     <Select value={settings.fyStartMonth} onValueChange={(value) => handleSelectChange('fyStartMonth', value)}>
                        <SelectTrigger id="fyStartMonth">
                             <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                             {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                                <SelectItem key={month} value={month.toLowerCase()}>{month}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="stockAccountingMethod" className="flex items-center gap-1">Stock Accounting Method:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                     <Select value={settings.stockAccountingMethod} onValueChange={(value) => handleSelectChange('stockAccountingMethod', value)}>
                        <SelectTrigger id="stockAccountingMethod">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fifo">FIFO (First In First Out)</SelectItem>
                            <SelectItem value="lifo">LIFO (Last In First Out)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="transactionEditDays" className="flex items-center gap-1">Transaction Edit Days:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Input id="transactionEditDays" type="number" value={settings.transactionEditDays} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format:*</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => handleSelectChange('dateFormat', value)}>
                        <SelectTrigger id="dateFormat"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mmddyyyy">mm/dd/yyyy</SelectItem>
                            <SelectItem value="ddmmyyyy">dd-mm-yyyy</SelectItem>
                            <SelectItem value="yyyymmdd">yyyy-mm-dd</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format:*</Label>
                    <Select value={settings.timeFormat} onValueChange={(value) => handleSelectChange('timeFormat', value)}>
                        <SelectTrigger id="timeFormat">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12-hour">12 Hour</SelectItem>
                            <SelectItem value="24-hour">24 Hour</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currencyPrecision" className="flex items-center gap-1">Currency precision:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Select value={settings.currencyPrecision} onValueChange={(value) => handleSelectChange('currencyPrecision', value)}>
                        <SelectTrigger id="currencyPrecision"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quantityPrecision" className="flex items-center gap-1">Quantity precision:* <Info className="w-3 h-3 text-muted-foreground"/></Label>
                     <Select value={settings.quantityPrecision} onValueChange={(value) => handleSelectChange('quantityPrecision', value)}>
                        <SelectTrigger id="quantityPrecision"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
        </CardFooter>
    </Card>
    )
};

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
