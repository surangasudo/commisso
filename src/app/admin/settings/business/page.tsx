
'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
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
  Calculator,
  Search,
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { initialTaxRates } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const settingsTabs = [
  { value: "business", label: "Business", icon: Building },
  { value: "tax", label: "Tax", icon: Landmark },
  { value: "product", label: "Product", icon: Package },
  { value: "contact", label: "Contact", icon: Contact },
  { value: "sale", label: "Sale", icon: Upload },
  { value: "pos", label: "POS", icon: Printer },
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
                        <SelectContent className="max-h-60">
                            <SelectGroup>
                                <Label className="px-2 text-xs">North America</Label>
                                <SelectItem value="usd">United States Dollar (USD)</SelectItem>
                                <SelectItem value="cad">Canadian Dollar (CAD)</SelectItem>
                                <SelectItem value="mxn">Mexican Peso (MXN)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Europe</Label>
                                <SelectItem value="eur">Euro (EUR)</SelectItem>
                                <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                                <SelectItem value="chf">Swiss Franc (CHF)</SelectItem>
                                <SelectItem value="sek">Swedish Krona (SEK)</SelectItem>
                                <SelectItem value="nok">Norwegian Krone (NOK)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Asia</Label>
                                <SelectItem value="jpy">Japanese Yen (JPY)</SelectItem>
                                <SelectItem value="cny">Chinese Yuan (CNY)</SelectItem>
                                <SelectItem value="inr">Indian Rupee (INR)</SelectItem>
                                <SelectItem value="sgd">Singapore Dollar (SGD)</SelectItem>
                                <SelectItem value="hkd">Hong Kong Dollar (HKD)</SelectItem>
                                <SelectItem value="krw">South Korean Won (KRW)</SelectItem>
                                <SelectItem value="lkr">Sri Lankan Rupee (LKR)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Oceania</Label>
                                <SelectItem value="aud">Australian Dollar (AUD)</SelectItem>
                                <SelectItem value="nzd">New Zealand Dollar (NZD)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">South America</Label>
                                <SelectItem value="brl">Brazilian Real (BRL)</SelectItem>
                                <SelectItem value="ars">Argentine Peso (ARS)</SelectItem>
                                <SelectItem value="clp">Chilean Peso (CLP)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Africa</Label>
                                <SelectItem value="zar">South African Rand (ZAR)</SelectItem>
                                <SelectItem value="ngn">Nigerian Naira (NGN)</SelectItem>
                                <SelectItem value="kes">Kenyan Shilling (KES)</SelectItem>
                            </SelectGroup>
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
                                <SelectItem value="America/Phoenix">America/Phoenix (MST)</SelectItem>
                                <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                                <SelectItem value="America/Anchorage">America/Anchorage (AKST)</SelectItem>
                                <SelectItem value="America/Adak">America/Adak (HST)</SelectItem>
                                <SelectItem value="America/Toronto">America/Toronto</SelectItem>
                                <SelectItem value="America/Vancouver">America/Vancouver</SelectItem>
                                <SelectItem value="America/Mexico_City">America/Mexico_City</SelectItem>
                                <SelectItem value="America/Bogota">America/Bogota</SelectItem>
                                <SelectItem value="America/Lima">America/Lima</SelectItem>
                                <SelectItem value="America/Buenos_Aires">America/Buenos_Aires</SelectItem>
                                <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Europe</Label>
                                <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                                <SelectItem value="Europe/Paris">Europe/Paris (CET/CEST)</SelectItem>
                                <SelectItem value="Europe/Berlin">Europe/Berlin (CET/CEST)</SelectItem>
                                <SelectItem value="Europe/Moscow">Europe/Moscow (MSK)</SelectItem>
                                <SelectItem value="Europe/Istanbul">Europe/Istanbul (TRT)</SelectItem>
                                <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                                <SelectItem value="Europe/Rome">Europe/Rome</SelectItem>
                                <SelectItem value="Europe/Kiev">Europe/Kiev</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Asia</Label>
                                <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                                <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                <SelectItem value="Asia/Shanghai">Asia/Shanghai (CST)</SelectItem>
                                <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                                <SelectItem value="Asia/Hong_Kong">Asia/Hong_Kong</SelectItem>
                                <SelectItem value="Asia/Seoul">Asia/Seoul</SelectItem>
                                <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                                <SelectItem value="Asia/Colombo">Asia/Colombo</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Australia & Pacific</Label>
                                <SelectItem value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</SelectItem>
                                <SelectItem value="Australia/Perth">Australia/Perth (AWST)</SelectItem>
                                <SelectItem value="Australia/Adelaide">Australia/Adelaide</SelectItem>
                                <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                                <SelectItem value="Pacific/Auckland">Pacific/Auckland</SelectItem>
                                <SelectItem value="Pacific/Honolulu">Pacific/Honolulu (HST)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 text-xs">Africa</Label>
                                <SelectItem value="Africa/Cairo">Africa/Cairo (EET)</SelectItem>
                                <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                                <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                                <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
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

const TaxSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        taxNumber1: 'GSTIN12345',
        taxNumber2: '',
        enableInlineTax: true,
        defaultSalesTax: 'tax-2',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: 'defaultSalesTax', value: string) => {
        setSettings(prev => ({ ...prev, [id]: value }));
    };
    
    const handleCheckboxChange = (id: 'enableInlineTax', checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating tax settings:', settings);
        toast({
            title: 'Tax Settings Updated',
            description: 'Your tax settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Manage tax registration numbers and default tax rates.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="tax1Name">Tax 1 Name:</Label>
                        <Input id="tax1Name" defaultValue="GSTIN" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taxNumber1">Tax 1 No.:</Label>
                        <Input id="taxNumber1" value={settings.taxNumber1} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="tax2Name">Tax 2 Name:</Label>
                        <Input id="tax2Name" defaultValue="VAT" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taxNumber2">Tax 2 No.:</Label>
                        <Input id="taxNumber2" value={settings.taxNumber2} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="border-t pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Checkbox id="enableInlineTax" checked={settings.enableInlineTax} onCheckedChange={(checked) => handleCheckboxChange('enableInlineTax', !!checked)} />
                        <Label htmlFor="enableInlineTax" className="font-normal">Enable inline tax in purchase and sell</Label>
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="defaultSalesTax">Default Sales Tax:</Label>
                        <Select value={settings.defaultSalesTax} onValueChange={(value) => handleSelectChange('defaultSalesTax', value)}>
                            <SelectTrigger id="defaultSalesTax">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {initialTaxRates.map(tax => (
                                    <SelectItem key={tax.id} value={tax.id}>{tax.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const ProductSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        skuPrefix: 'AS',
        enableBrands: true,
        enablePriceAndTax: true,
        enableRacks: false,
        enableWarranty: false,
        enableProductExpiry: false,
        addItemExpiry: '',
        onExpiryAction: 'keep_selling',
        onExpiryPeriod: '0',
        enableCategories: true,
        defaultUnit: '',
        enableRow: false,
        isProductImageRequired: false,
        enableSubCategories: true,
        enableSubUnits: false,
        enablePosition: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };
    
    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating product settings:', settings);
        toast({
            title: 'Product Settings Updated',
            description: 'Your product settings have been saved successfully.',
        });
    };

    return (
    <Card>
        <CardHeader>
            <CardTitle>Product Settings</CardTitle>
            <CardDescription>Manage default product settings and features.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                {/* Column 1 */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="skuPrefix">SKU prefix:</Label>
                        <Input id="skuPrefix" value={settings.skuPrefix} onChange={handleInputChange} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableBrands" checked={settings.enableBrands} onCheckedChange={(checked) => handleCheckboxChange('enableBrands', !!checked)} />
                        <Label htmlFor="enableBrands" className="font-normal">Enable Brands</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enablePriceAndTax" checked={settings.enablePriceAndTax} onCheckedChange={(checked) => handleCheckboxChange('enablePriceAndTax', !!checked)} />
                        <Label htmlFor="enablePriceAndTax" className="font-normal">Enable Price & Tax info</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableRacks" checked={settings.enableRacks} onCheckedChange={(checked) => handleCheckboxChange('enableRacks', !!checked)} />
                        <Label htmlFor="enableRacks" className="font-normal flex items-center gap-1">Enable Racks
                            <Tooltip>
                                <TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground"/></TooltipTrigger>
                                <TooltipContent><p>Manage racks, rows, and positions of products.</p></TooltipContent>
                            </Tooltip>
                        </Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="enableWarranty" checked={settings.enableWarranty} onCheckedChange={(checked) => handleCheckboxChange('enableWarranty', !!checked)} />
                        <Label htmlFor="enableWarranty" className="font-normal">Enable Warranty</Label>
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="enableProductExpiryCheckbox" className="flex items-center gap-1">Enable Product Expiry: <Info className="w-3 h-3 text-muted-foreground"/></Label>
                        <div className="flex items-center gap-2">
                             <Checkbox id="enableProductExpiryCheckbox" checked={settings.enableProductExpiry} onCheckedChange={(checked) => handleCheckboxChange('enableProductExpiry', !!checked)} />
                            <Select disabled={!settings.enableProductExpiry} value={settings.addItemExpiry} onValueChange={(value) => handleSelectChange('addItemExpiry', value as string)}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Add item expiry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="days">Add expiry in days</SelectItem>
                                    <SelectItem value="months">Add expiry in months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {settings.enableProductExpiry && (
                        <div className="space-y-2">
                            <Label htmlFor="onExpiryAction" className="flex items-center gap-1">On Product Expiry: 
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground"/></TooltipTrigger>
                                    <TooltipContent><p>Action to take on product expiry. Products will be non-sellable 'n' days before expiry.</p></TooltipContent>
                                </Tooltip>
                            </Label>
                            <div className="flex items-center gap-2">
                                <Select id="onExpiryAction" value={settings.onExpiryAction} onValueChange={(value) => handleSelectChange('onExpiryAction', value)}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="keep_selling">Keep Selling</SelectItem>
                                        <SelectItem value="stop_selling">Stop Selling</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input 
                                    id="onExpiryPeriod"
                                    type="number" 
                                    className="w-20"
                                    value={settings.onExpiryPeriod}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Stop selling n days before expiry.
                            </p>
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableCategories" checked={settings.enableCategories} onCheckedChange={(checked) => handleCheckboxChange('enableCategories', !!checked)} />
                        <Label htmlFor="enableCategories" className="font-normal">Enable Categories</Label>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="defaultUnit">Default Unit:</Label>
                        <Select value={settings.defaultUnit} onValueChange={(value) => handleSelectChange('defaultUnit', value)}>
                            <SelectTrigger id="defaultUnit">
                                <SelectValue placeholder="Please Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pcs">Pieces</SelectItem>
                                <SelectItem value="kg">Kilogram</SelectItem>
                                <SelectItem value="box">Box</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableRow" checked={settings.enableRow} onCheckedChange={(checked) => handleCheckboxChange('enableRow', !!checked)} />
                        <Label htmlFor="enableRow" className="font-normal">Enable Row</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isProductImageRequired" checked={settings.isProductImageRequired} onCheckedChange={(checked) => handleCheckboxChange('isProductImageRequired', !!checked)} />
                        <Label htmlFor="isProductImageRequired" className="font-normal">Is product image required?</Label>
                    </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableSubCategories" checked={settings.enableSubCategories} onCheckedChange={(checked) => handleCheckboxChange('enableSubCategories', !!checked)} />
                        <Label htmlFor="enableSubCategories" className="font-normal">Enable Sub-Categories</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableSubUnits" checked={settings.enableSubUnits} onCheckedChange={(checked) => handleCheckboxChange('enableSubUnits', !!checked)} />
                        <Label htmlFor="enableSubUnits" className="font-normal flex items-center gap-1">Enable Sub Units <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enablePosition" checked={settings.enablePosition} onCheckedChange={(checked) => handleCheckboxChange('enablePosition', !!checked)} />
                        <Label htmlFor="enablePosition" className="font-normal">Enable Position</Label>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
        </CardFooter>
    </Card>
    )
};

const ContactSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        defaultCreditLimit: '1000',
        contactIdPrefix: 'CN',
        defaultPayTermValue: '30',
        defaultPayTermUnit: 'days',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating contact settings:', settings);
        toast({
            title: 'Contact Settings Updated',
            description: 'Your contact settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Settings</CardTitle>
                <CardDescription>Manage default settings for suppliers and customers.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="defaultCreditLimit">Default credit limit:</Label>
                        <Input id="defaultCreditLimit" type="number" value={settings.defaultCreditLimit} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contactIdPrefix">Contact ID Prefix:</Label>
                        <Input id="contactIdPrefix" value={settings.contactIdPrefix} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="defaultPayTermValue">Default Pay Term:</Label>
                        <div className="flex gap-2">
                             <Input id="defaultPayTermValue" type="number" value={settings.defaultPayTermValue} onChange={handleInputChange} />
                             <Select value={settings.defaultPayTermUnit} onValueChange={(value) => handleSelectChange('defaultPayTermUnit', value)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="days">Days</SelectItem>
                                    <SelectItem value="months">Months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const SaleSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        defaultSaleDiscount: '0',
        defaultSellingPriceGroup: 'default',
        enableCommissionAgent: false,
        commissionAgent: 'none',
        commissionCalculationType: 'invoice_value',
        itemAdditionMethod: 'increase_quantity',
        amountRoundingMethod: 'round_to_nearest_whole',
        enableSalesOrder: false,
        enableRecurringInvoice: false,
        isPayTermRequired: false,
        isStripeEnabled: false,
        stripePublicKey: '',
        stripeSecretKey: '',
        isRazorpayEnabled: false,
        razorpayKeyId: '',
        razorpayKeySecret: '',
        allowOverselling: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };
    
    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating sale settings:', settings);
        toast({
            title: 'Sale Settings Updated',
            description: 'Your sale settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sale Settings</CardTitle>
                <CardDescription>Configure default settings for sales and invoices.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="defaultSaleDiscount">Default Sale Discount:</Label>
                        <Input id="defaultSaleDiscount" type="number" value={settings.defaultSaleDiscount} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="defaultSellingPriceGroup">Default Selling Price Group:</Label>
                        <Select value={settings.defaultSellingPriceGroup} onValueChange={(value) => handleSelectChange('defaultSellingPriceGroup', value)}>
                            <SelectTrigger id="defaultSellingPriceGroup"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="default">Default Selling Price</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="itemAdditionMethod">Sales Item Addition Method:</Label>
                         <Select value={settings.itemAdditionMethod} onValueChange={(value) => handleSelectChange('itemAdditionMethod', value)}>
                            <SelectTrigger id="itemAdditionMethod"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="increase_quantity">Increase item quantity if it already exists</SelectItem>
                                <SelectItem value="add_new_row">Add item in new row</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 lg:col-span-3">
                        <Label htmlFor="amountRoundingMethod">Amount rounding method:</Label>
                         <Select value={settings.amountRoundingMethod} onValueChange={(value) => handleSelectChange('amountRoundingMethod', value)}>
                            <SelectTrigger id="amountRoundingMethod"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="round_to_nearest_whole">Round to nearest whole number</SelectItem>
                                <SelectItem value="round_to_nearest_decimal_2">Round to nearest decimal (multiple of 0.05)</SelectItem>
                                <SelectItem value="round_to_nearest_decimal_10">Round to nearest decimal (multiple of 0.10)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <Checkbox id="enableCommissionAgent" checked={settings.enableCommissionAgent} onCheckedChange={(checked) => handleCheckboxChange('enableCommissionAgent', !!checked)} />
                        <Label htmlFor="enableCommissionAgent" className="font-normal text-lg flex items-center gap-1">
                            Enable Commission Agent
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Enabling this activates the advanced commission module with the chosen selling group.</p>
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                    </div>
                    
                    {settings.enableCommissionAgent && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 ml-6">
                            <div className="space-y-2">
                                <Label htmlFor="commissionAgent">Commission Agent:</Label>
                                <Select value={settings.commissionAgent} onValueChange={(value) => handleSelectChange('commissionAgent', value)}>
                                    <SelectTrigger id="commissionAgent"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="select_from_users_list">Select from users list</SelectItem>
                                        <SelectItem value="logged_in_user">Logged in user</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="commissionCalculationType" className="flex items-center gap-1">
                                    Commission Calculation Type:
                                    <Tooltip><TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground"/></TooltipTrigger><TooltipContent><p>Calculate commission on invoice value or payment received.</p></TooltipContent></Tooltip>
                                </Label>
                                <Select value={settings.commissionCalculationType} onValueChange={(value) => handleSelectChange('commissionCalculationType', value)}>
                                    <SelectTrigger id="commissionCalculationType"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="invoice_value">On Invoice Value</SelectItem>
                                        <SelectItem value="payment_received">On Payment Received</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t pt-6 space-y-4">
                    <h4 className="font-semibold text-lg">Payment Link Settings</h4>
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Checkbox id="isStripeEnabled" checked={settings.isStripeEnabled} onCheckedChange={(checked) => handleCheckboxChange('isStripeEnabled', !!checked)} />
                                <Label htmlFor="isStripeEnabled" className="font-normal">Enable Stripe</Label>
                            </div>
                            {settings.isStripeEnabled && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 ml-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="stripePublicKey">Stripe Public Key:</Label>
                                        <Input id="stripePublicKey" value={settings.stripePublicKey} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stripeSecretKey">Stripe Secret Key:</Label>
                                        <Input id="stripeSecretKey" type="password" value={settings.stripeSecretKey} onChange={handleInputChange} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Checkbox id="isRazorpayEnabled" checked={settings.isRazorpayEnabled} onCheckedChange={(checked) => handleCheckboxChange('isRazorpayEnabled', !!checked)} />
                                <Label htmlFor="isRazorpayEnabled" className="font-normal">Enable Razorpay</Label>
                            </div>
                            {settings.isRazorpayEnabled && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 ml-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="razorpayKeyId">Razorpay Key ID:</Label>
                                        <Input id="razorpayKeyId" value={settings.razorpayKeyId} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="razorpayKeySecret">Razorpay Key Secret:</Label>
                                        <Input id="razorpayKeySecret" type="password" value={settings.razorpayKeySecret} onChange={handleInputChange} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                 <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableSalesOrder" checked={settings.enableSalesOrder} onCheckedChange={(checked) => handleCheckboxChange('enableSalesOrder', !!checked)} />
                        <Label htmlFor="enableSalesOrder" className="font-normal">Enable Sales Order</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableRecurringInvoice" checked={settings.enableRecurringInvoice} onCheckedChange={(checked) => handleCheckboxChange('enableRecurringInvoice', !!checked)} />
                        <Label htmlFor="enableRecurringInvoice" className="font-normal flex items-center gap-1">Enable Recurring Invoice <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="isPayTermRequired" checked={settings.isPayTermRequired} onCheckedChange={(checked) => handleCheckboxChange('isPayTermRequired', !!checked)} />
                        <Label htmlFor="isPayTermRequired" className="font-normal">Is pay term required?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="allowOverselling" checked={settings.allowOverselling} onCheckedChange={(checked) => handleCheckboxChange('allowOverselling', !!checked)} />
                        <Label htmlFor="allowOverselling" className="font-normal">Allow Overselling</Label>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const PosSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        expressCheckout: 'shift+e',
        payAndCheckout: 'shift+p',
        draftShortcut: 'shift+d',
        cancelShortcut: 'shift+c',
        goToQuantity: 'f2',
        weighingScaleShortcut: '',
        editDiscount: 'shift+i',
        editOrderTax: 'shift+t',
        addPaymentRow: 'shift+r',
        finalizePayment: 'shift+f',
        addNewProduct: 'f4',

        disableMultiplePay: false,
        dontShowProductSuggestion: false,
        disableOrderTax: false,
        enableTransactionDate: true,
        isServiceStaffRequired: true,
        showInvoiceScheme: false,
        showPricingTooltip: false,
        disableDraft: false,
        dontShowRecentTransactions: false,
        subtotalEditable: false,
        disableCreditSaleButton: false,
        enableServiceStaffInProductLine: false,
        enableWeighingScale: false,
        showInvoiceLayoutDropdown: false,
        printInvoiceOnSuspend: false,
        disableExpressCheckout: false,
        disableDiscount: false,
        disableSuspendSale: false,
        
        weighingScalePrefix: '',
        weighingScaleSkuLength: '5',
        weighingScaleQtyIntegerLength: '4',
        weighingScaleQtyFractionalLength: '3',
    });

    const handleInputChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any}));
    };

    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };
    
     const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating POS settings:', settings);
        toast({
            title: 'POS Settings Updated',
            description: 'Your POS settings have been saved successfully.',
        });
    };

    const shortcutFields1 = [
        { id: 'expressCheckout', label: 'Express Checkout:' },
        { id: 'payAndCheckout', label: 'Pay & Checkout:' },
        { id: 'draftShortcut', label: 'Draft:' },
        { id: 'cancelShortcut', label: 'Cancel:' },
        { id: 'goToQuantity', label: 'Go to product quantity:' },
        { id: 'weighingScaleShortcut', label: 'Weighing Scale:' },
    ] as const;

    const shortcutFields2 = [
        { id: 'editDiscount', label: 'Edit Discount:' },
        { id: 'editOrderTax', label: 'Edit Order Tax:' },
        { id: 'addPaymentRow', label: 'Add Payment Row:' },
        { id: 'finalizePayment', label: 'Finalize Payment:' },
        { id: 'addNewProduct', label: 'Add new product:' },
    ] as const;

    const posSettingsCheckboxes = [
        { id: 'disableMultiplePay', label: 'Disable Multiple Pay' },
        { id: 'dontShowProductSuggestion', label: "Don't show product suggestion" },
        { id: 'disableOrderTax', label: 'Disable order tax' },
        { id: 'enableTransactionDate', label: 'Enable transaction date on POS screen' },
        { id: 'isServiceStaffRequired', label: 'Is service staff required' },
        { id: 'showInvoiceScheme', label: 'Show invoice scheme' },
        { id: 'showPricingTooltip', label: 'Show pricing on product suggestion tooltip' },
        { id: 'disableDraft', label: 'Disable Draft' },
        { id: 'dontShowRecentTransactions', label: "Don't show recent transactions" },
        { id: 'subtotalEditable', label: 'Subtotal Editable', tooltip: 'Ability to edit subtotal in POS screen' },
        { id: 'disableCreditSaleButton', label: 'Disable credit sale button', tooltip: 'Disable credit sale button in POS screen' },
        { id: 'enableServiceStaffInProductLine', label: 'Enable service staff in product line', tooltip: 'Select service staff for each product in POS screen' },
        { id: 'enableWeighingScale', label: 'Enable Weighing Scale' },
        { id: 'showInvoiceLayoutDropdown', label: 'Show invoice layout dropdown' },
        { id: 'printInvoiceOnSuspend', label: 'Print invoice on suspend' },
        { id: 'disableExpressCheckout', label: 'Disable Express Checkout' },
        { id: 'disableDiscount', label: 'Disable Discount' },
        { id: 'disableSuspendSale', label: 'Disable Suspend Sale' },
    ] as const;

    return (
        <Card>
            <CardHeader>
                <CardTitle>POS Settings</CardTitle>
                <CardDescription>Configure the Point of Sale screen functionalities.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Add keyboard shortcuts:</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Shortcut should be the names of the keys separated by '+': Example: ctrl+shift+b, ctrl+h <br/>
                        Available key names are: shift, ctrl, alt, backspace, tab, enter, return, capslock, esc, escape, space, pageup, pagedown, end, home, left, up, right, down, ins, del, and plus
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                       {shortcutFields1.map(field => (
                           <div key={field.id} className="space-y-1">
                               <Label htmlFor={field.id}>{field.label}</Label>
                               <Input id={field.id} value={settings[field.id]} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                           </div>
                       ))}
                        {shortcutFields2.map(field => (
                           <div key={field.id} className="space-y-1">
                               <Label htmlFor={field.id}>{field.label}</Label>
                               <Input id={field.id} value={settings[field.id]} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                           </div>
                       ))}
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-semibold mb-4">POS settings:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                        {posSettingsCheckboxes.map(cb => (
                            <div key={cb.id} className="flex items-center space-x-2">
                                <Checkbox id={cb.id} checked={settings[cb.id]} onCheckedChange={(checked) => handleCheckboxChange(cb.id, !!checked)} />
                                <Label htmlFor={cb.id} className="font-normal flex items-center gap-1.5">{cb.label}
                                 {cb.tooltip && (
                                     <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent><p>{cb.tooltip}</p></TooltipContent>
                                    </Tooltip>
                                 )}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                 <Separator />

                 <div>
                    <h3 className="text-lg font-semibold mb-2">Weighing Scale barcode Setting:</h3>
                     <p className="text-sm text-muted-foreground mb-4">
                        Configure barcode as per your weighing scale.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="weighingScalePrefix">Prefix:</Label>
                            <Input id="weighingScalePrefix" value={settings.weighingScalePrefix} onChange={(e) => handleInputChange('weighingScalePrefix', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weighingScaleSkuLength">Product sku length:</Label>
                            <Select value={settings.weighingScaleSkuLength} onValueChange={(value) => handleSelectChange('weighingScaleSkuLength', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {[...Array(9)].map((_, i) => <SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="weighingScaleQtyIntegerLength">Quantity integer part length:</Label>
                            <Select value={settings.weighingScaleQtyIntegerLength} onValueChange={(value) => handleSelectChange('weighingScaleQtyIntegerLength', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {[...Array(6)].map((_, i) => <SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="weighingScaleQtyFractionalLength">Quantity fractional part length:</Label>
                            <Select value={settings.weighingScaleQtyFractionalLength} onValueChange={(value) => handleSelectChange('weighingScaleQtyFractionalLength', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {[...Array(6)].map((_, i) => <SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

            </CardContent>
             <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const PurchaseSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        enableEditingProductPrice: true,
        enablePurchaseStatus: true,
        enableLotNumber: false,
        enablePurchaseOrder: false,
        enablePurchaseRequisition: false,
    });

    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating purchase settings:', settings);
        toast({
            title: 'Purchase Settings Updated',
            description: 'Your purchase settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Purchase Settings</CardTitle>
                <CardDescription>Configure default settings for your purchases.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="enableEditingProductPrice" checked={settings.enableEditingProductPrice} onCheckedChange={(checked) => handleCheckboxChange('enableEditingProductPrice', !!checked)} />
                            <Label htmlFor="enableEditingProductPrice" className="font-normal flex items-center gap-1.5">
                                Enable editing product price from purchase screen
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>Allow users to change the purchase price of a product when adding a purchase.</p></TooltipContent>
                                </Tooltip>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="enableLotNumber" checked={settings.enableLotNumber} onCheckedChange={(checked) => handleCheckboxChange('enableLotNumber', !!checked)} />
                            <Label htmlFor="enableLotNumber" className="font-normal flex items-center gap-1.5">
                                Enable Lot Number
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>Enable Lot number input in purchase screen.</p></TooltipContent>
                                </Tooltip>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="enablePurchaseRequisition" checked={settings.enablePurchaseRequisition} onCheckedChange={(checked) => handleCheckboxChange('enablePurchaseRequisition', !!checked)} />
                            <Label htmlFor="enablePurchaseRequisition" className="font-normal flex items-center gap-1.5">
                                Enable Purchase Requisition
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>Allows creating purchase requisitions which can be converted to purchase orders.</p></TooltipContent>
                                </Tooltip>
                            </Label>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="enablePurchaseStatus" checked={settings.enablePurchaseStatus} onCheckedChange={(checked) => handleCheckboxChange('enablePurchaseStatus', !!checked)} />
                            <Label htmlFor="enablePurchaseStatus" className="font-normal flex items-center gap-1.5">
                                Enable Purchase Status
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>Track the status of purchases (e.g., Received, Pending, Ordered).</p></TooltipContent>
                                </Tooltip>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="enablePurchaseOrder" checked={settings.enablePurchaseOrder} onCheckedChange={(checked) => handleCheckboxChange('enablePurchaseOrder', !!checked)} />
                            <Label htmlFor="enablePurchaseOrder" className="font-normal flex items-center gap-1.5">
                                Enable Purchase Order
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>Allows creating and managing purchase orders.</p></TooltipContent>
                                </Tooltip>
                            </Label>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const PaymentSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        cashDenominations: '10, 20, 50, 100, 200, 500, 2000',
        enableOn: 'all_screens',
        enableForMethods: '',
        strictCheck: false,
        enableStripe: false,
        stripePublicKey: '',
        stripeSecretKey: '',
        enablePaypal: false,
        paypalMode: 'sandbox',
        paypalClientId: '',
        paypalClientSecret: '',
    });

    const handleInputChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating payment settings:', settings);
        toast({
            title: 'Payment Settings Updated',
            description: 'Your payment settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure cash denominations and payment gateways.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Cash Denominations</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="cashDenominations">Cash Denominations:</Label>
                            <Input id="cashDenominations" value={settings.cashDenominations} onChange={(e) => handleInputChange('cashDenominations', e.target.value)} />
                            <p className="text-xs text-muted-foreground">Comma separated values Example: 100,200,500,2000</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="enableOn">Enable cash denomination on:</Label>
                                <Select value={settings.enableOn} onValueChange={(value) => handleSelectChange('enableOn', value)}>
                                    <SelectTrigger id="enableOn"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="all_screens">All Screens</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="enableForMethods">Enable cash denomination for payment methods:</Label>
                                <Input id="enableForMethods" value={settings.enableForMethods} onChange={(e) => handleInputChange('enableForMethods', e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="strictCheck" checked={settings.strictCheck} onCheckedChange={(checked) => handleCheckboxChange('strictCheck', !!checked)} />
                            <Label htmlFor="strictCheck" className="font-normal flex items-center gap-1.5">
                                Strict check
                                <Tooltip>
                                    <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                                    <TooltipContent><p>If checked, the system will not allow payment if the provided cash is less than the total payable.</p></TooltipContent>
                                </Tooltip>
                            </Label>
                        </div>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-semibold mb-4">Payment Gateways</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Checkbox id="enableStripe" checked={settings.enableStripe} onCheckedChange={(checked) => handleCheckboxChange('enableStripe', !!checked)} />
                                <Label htmlFor="enableStripe" className="font-normal">Enable Stripe</Label>
                            </div>
                            {settings.enableStripe && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 ml-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="stripePublicKey">Stripe Public Key:</Label>
                                        <Input id="stripePublicKey" value={settings.stripePublicKey} onChange={(e) => handleInputChange('stripePublicKey', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stripeSecretKey">Stripe Secret Key:</Label>
                                        <Input id="stripeSecretKey" type="password" value={settings.stripeSecretKey} onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                         <div>
                             <div className="flex items-center space-x-2 mb-4">
                                <Checkbox id="enablePaypal" checked={settings.enablePaypal} onCheckedChange={(checked) => handleCheckboxChange('enablePaypal', !!checked)} />
                                <Label htmlFor="enablePaypal" className="font-normal">Enable PayPal</Label>
                            </div>
                            {settings.enablePaypal && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 ml-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="paypalMode">PayPal Mode:</Label>
                                        <Select value={settings.paypalMode} onValueChange={(value) => handleSelectChange('paypalMode', value)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sandbox">Sandbox</SelectItem>
                                                <SelectItem value="live">Live</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div />
                                    <div className="space-y-2">
                                        <Label htmlFor="paypalClientId">PayPal Client ID:</Label>
                                        <Input id="paypalClientId" value={settings.paypalClientId} onChange={(e) => handleInputChange('paypalClientId', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paypalClientSecret">PayPal Client Secret:</Label>
                                        <Input id="paypalClientSecret" type="password" value={settings.paypalClientSecret} onChange={(e) => handleInputChange('paypalClientSecret', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const DashboardSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        viewStockExpiryAlert: '30',
        enableStockExpiryAlert: true,
    });

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating dashboard settings:', settings);
        toast({
            title: 'Dashboard Settings Updated',
            description: 'Your dashboard settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>Configure your dashboard view and alerts.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="viewStockExpiryAlert" className="flex items-center gap-1.5">
                            View Stock Expiry Alert For
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Show an alert for products expiring within the selected number of days.</p>
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <Select value={settings.viewStockExpiryAlert} onValueChange={(value) => handleSelectChange('viewStockExpiryAlert', value)}>
                            <SelectTrigger id="viewStockExpiryAlert">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="15">15 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="60">60 Days</SelectItem>
                                <SelectItem value="90">90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2 self-end pb-2">
                        <Checkbox id="enableStockExpiryAlert" checked={settings.enableStockExpiryAlert} onCheckedChange={(checked) => handleCheckboxChange('enableStockExpiryAlert', !!checked)} />
                        <Label htmlFor="enableStockExpiryAlert" className="font-normal">
                            Enable Stock Expiry Alert
                        </Label>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const SystemSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        appName: 'Ultimate POS',
        helpLink: 'https://ultimatepos.com/docs',
        googleApiKey: '',
        isGoogleDriveEnabled: false,
        googleDriveAppId: '',
        enableRepairModule: true,
        themeColor: 'blue',
        defaultDatatableEntries: '25',
        showHelpText: true,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating system settings:', settings);
        toast({
            title: 'System Settings Updated',
            description: 'Your system settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>General system-wide configurations.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="appName">App Name:</Label>
                        <Input id="appName" value={settings.appName} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="themeColor">Theme Color:</Label>
                        <Select value={settings.themeColor} onValueChange={(value) => handleSelectChange('themeColor', value)}>
                            <SelectTrigger id="themeColor"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="blue">Blue</SelectItem>
                                <SelectItem value="black">Black</SelectItem>
                                <SelectItem value="purple">Purple</SelectItem>
                                <SelectItem value="green">Green</SelectItem>
                                <SelectItem value="red">Red</SelectItem>
                                <SelectItem value="yellow">Yellow</SelectItem>
                                <SelectItem value="blue-light">Light Blue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="defaultDatatableEntries">Default datatable page entries:</Label>
                        <Select value={settings.defaultDatatableEntries} onValueChange={(value) => handleSelectChange('defaultDatatableEntries', value)}>
                            <SelectTrigger id="defaultDatatableEntries"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="200">200</SelectItem>
                                <SelectItem value="500">500</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="googleApiKey">Google Maps API Key:</Label>
                        <Input id="googleApiKey" value={settings.googleApiKey} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="helpLink">Help Link:</Label>
                        <Input id="helpLink" value={settings.helpLink} onChange={handleInputChange} />
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isGoogleDriveEnabled" checked={settings.isGoogleDriveEnabled} onCheckedChange={(checked) => handleCheckboxChange('isGoogleDriveEnabled', !!checked)} />
                        <Label htmlFor="isGoogleDriveEnabled" className="font-normal">Enable Google Drive</Label>
                    </div>
                    {settings.isGoogleDriveEnabled && (
                        <div className="space-y-2 ml-6 max-w-sm">
                            <Label htmlFor="googleDriveAppId">Google Drive App ID:</Label>
                            <Input id="googleDriveAppId" value={settings.googleDriveAppId} onChange={handleInputChange} />
                        </div>
                    )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableRepairModule" checked={settings.enableRepairModule} onCheckedChange={(checked) => handleCheckboxChange('enableRepairModule', !!checked)} />
                        <Label htmlFor="enableRepairModule" className="font-normal flex items-center gap-1.5">
                            Enable Repair Module
                            <Tooltip>
                                <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent><p>Enables the job sheet & repair module in the application.</p></TooltipContent>
                            </Tooltip>
                        </Label>
                    </div>
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="showHelpText" checked={settings.showHelpText} onCheckedChange={(checked) => handleCheckboxChange('showHelpText', !!checked)} />
                        <Label htmlFor="showHelpText" className="font-normal">Show help text</Label>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const PrefixesSettingsForm = () => {
    const { toast } = useToast();
    const [prefixes, setPrefixes] = useState({
        purchase: 'PO',
        purchaseReturn: '',
        purchaseRequisition: '',
        purchaseOrder: '',
        stockTransfer: 'ST',
        stockAdjustment: 'SA',
        sellReturn: 'CN',
        expenses: 'EP',
        contacts: 'CO',
        purchasePayment: 'PP',
        sellPayment: 'SP',
        expensePayment: '',
        businessLocation: 'BL',
        username: '',
        subscriptionNo: '',
        draft: '',
        salesOrder: '',
    });

    const handleInputChange = (id: keyof typeof prefixes, value: string) => {
        setPrefixes(prev => ({ ...prev, [id]: value }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating prefixes:', prefixes);
        toast({
            title: 'Prefixes Updated',
            description: 'Your prefix settings have been saved successfully.',
        });
    };

    const prefixFields = [
        { id: 'purchase', label: 'Purchase:' },
        { id: 'purchaseOrder', label: 'Purchase Order:' },
        { id: 'sellReturn', label: 'Sell Return:' },
        { id: 'purchasePayment', label: 'Purchase Payment:' },
        { id: 'businessLocation', label: 'Business Location:' },
        { id: 'draft', label: 'Draft:' },
        { id: 'purchaseReturn', label: 'Purchase Return:' },
        { id: 'stockTransfer', label: 'Stock Transfer:' },
        { id: 'expenses', label: 'Expenses:' },
        { id: 'sellPayment', label: 'Sell Payment:' },
        { id: 'username', label: 'Username:' },
        { id: 'salesOrder', label: 'Sales Order:' },
        { id: 'purchaseRequisition', label: 'Purchase Requisition:' },
        { id: 'stockAdjustment', label: 'Stock Adjustment:' },
        { id: 'contacts', label: 'Contacts:' },
        { id: 'expensePayment', label: 'Expense Payment:' },
        { id: 'subscriptionNo', label: 'Subscription No.:' },
    ] as const;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Prefixes</CardTitle>
                <CardDescription>Manage prefixes for different document types and identifiers in your business.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    {prefixFields.map(field => (
                        <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>{field.label}</Label>
                            <Input
                                id={field.id}
                                value={prefixes[field.id]}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const EmailSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        mailDriver: 'smtp',
        host: 'smtp.mailgun.org',
        port: '587',
        username: 'postmaster@sandbox.mailgun.org',
        password: '',
        encryption: 'tls',
        fromAddress: 'hello@example.com',
        fromName: 'Awesome Shop',
    });

    const handleInputChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating email settings:', settings);
        toast({
            title: 'Email Settings Updated',
            description: 'Your email settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="mailDriver">Mail Driver:</Label>
                        <Select value={settings.mailDriver} onValueChange={(value) => handleSelectChange('mailDriver', value)}>
                            <SelectTrigger id="mailDriver"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="smtp">SMTP</SelectItem>
                                <SelectItem value="sendmail">Sendmail</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="host">Host:</Label>
                        <Input id="host" value={settings.host} onChange={(e) => handleInputChange('host', e.target.value)} placeholder="e.g. smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Port:</Label>
                        <Input id="port" value={settings.port} onChange={(e) => handleInputChange('port', e.target.value)} placeholder="e.g. 587" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username:</Label>
                        <Input id="username" value={settings.username} onChange={(e) => handleInputChange('username', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password:</Label>
                        <Input id="password" type="password" value={settings.password} onChange={(e) => handleInputChange('password', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="encryption">Encryption:</Label>
                        <Select value={settings.encryption} onValueChange={(value) => handleSelectChange('encryption', value)}>
                            <SelectTrigger id="encryption"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="tls">TLS</SelectItem>
                                <SelectItem value="ssl">SSL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fromAddress">From Address:</Label>
                        <Input id="fromAddress" value={settings.fromAddress} onChange={(e) => handleInputChange('fromAddress', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fromName">From Name:</Label>
                        <Input id="fromName" value={settings.fromName} onChange={(e) => handleInputChange('fromName', e.target.value)} />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const SmsSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        smsService: 'twilio',
        twilioSid: '',
        twilioToken: '',
        twilioFrom: '',
        nexmoKey: '',
        nexmoSecret: '',
        nexmoFrom: '',
        textlkApiKey: '',
        textlkSenderId: '',
        otherUrl: '',
        sendToParam: 'to',
        msgParam: 'body',
        requestMethod: 'get',
        header1Key: '', header1Val: '',
        header2Key: '', header2Val: '',
        header3Key: '', header3Val: '',
        param1Key: '', param1Val: '',
        param2Key: '', param2Val: '',
        param3Key: '', param3Val: '',
        param4Key: '', param4Val: '',
        param5Key: '', param5Val: '',
        param6Key: '', param6Val: '',
        param7Key: '', param7Val: '',
        param8Key: '', param8Val: '',
        param9Key: '', param9Val: '',
        param10Key: '', param10Val: '',
    });

    const handleInputChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating SMS settings:', settings);
        toast({
            title: 'SMS Settings Updated',
            description: 'Your SMS settings have been saved successfully.',
        });
    };
    
    const renderParameterInputs = (count: number) => {
        return Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex gap-2">
                <Input
                    placeholder={`Parameter ${i + 1} key`}
                    value={settings[`param${i + 1}Key` as keyof typeof settings]}
                    onChange={(e) => handleInputChange(`param${i + 1}Key` as keyof typeof settings, e.target.value)}
                />
                <Input
                    placeholder={`Parameter ${i + 1} value`}
                    value={settings[`param${i + 1}Val` as keyof typeof settings]}
                    onChange={(e) => handleInputChange(`param${i + 1}Val` as keyof typeof settings, e.target.value)}
                />
            </div>
        ));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>SMS Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-2 max-w-sm">
                    <Label htmlFor="smsService">SMS Service</Label>
                    <Select value={settings.smsService} onValueChange={(value) => handleSelectChange('smsService', value)}>
                        <SelectTrigger id="smsService"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="twilio">Twilio</SelectItem>
                            <SelectItem value="nexmo">Nexmo</SelectItem>
                            <SelectItem value="textlk">Text.lk</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {settings.smsService === 'twilio' && (
                    <div className="space-y-4 p-4 border rounded-md">
                        <h4 className="font-semibold">Twilio Settings</h4>
                        <div className="space-y-2">
                            <Label htmlFor="twilioSid">Twilio Account SID</Label>
                            <Input id="twilioSid" value={settings.twilioSid} onChange={(e) => handleInputChange('twilioSid', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twilioToken">Twilio Auth Token</Label>
                            <Input id="twilioToken" type="password" value={settings.twilioToken} onChange={(e) => handleInputChange('twilioToken', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twilioFrom">From (Twilio Number)</Label>
                            <Input id="twilioFrom" value={settings.twilioFrom} onChange={(e) => handleInputChange('twilioFrom', e.target.value)} />
                        </div>
                    </div>
                )}
                
                {settings.smsService === 'nexmo' && (
                    <div className="space-y-4 p-4 border rounded-md">
                         <h4 className="font-semibold">Nexmo Settings</h4>
                        <div className="space-y-2">
                            <Label htmlFor="nexmoKey">Nexmo API Key</Label>
                            <Input id="nexmoKey" value={settings.nexmoKey} onChange={(e) => handleInputChange('nexmoKey', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nexmoSecret">Nexmo API Secret</Label>
                            <Input id="nexmoSecret" type="password" value={settings.nexmoSecret} onChange={(e) => handleInputChange('nexmoSecret', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nexmoFrom">From (Nexmo Number)</Label>
                            <Input id="nexmoFrom" value={settings.nexmoFrom} onChange={(e) => handleInputChange('nexmoFrom', e.target.value)} />
                        </div>
                    </div>
                )}

                {settings.smsService === 'textlk' && (
                    <div className="space-y-4 p-4 border rounded-md">
                         <h4 className="font-semibold">Text.lk Settings</h4>
                        <div className="space-y-2">
                            <Label htmlFor="textlkApiKey">API Key</Label>
                            <Input id="textlkApiKey" value={settings.textlkApiKey} onChange={(e) => handleInputChange('textlkApiKey', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="textlkSenderId">Sender ID</Label>
                            <Input id="textlkSenderId" value={settings.textlkSenderId} onChange={(e) => handleInputChange('textlkSenderId', e.target.value)} />
                        </div>
                    </div>
                )}
                
                 {settings.smsService === 'other' && (
                    <div className="space-y-6 p-4 border rounded-md">
                        <h4 className="font-semibold">Other SMS Service Configuration</h4>
                        <div className="space-y-2">
                            <Label htmlFor="otherUrl">URL</Label>
                            <Input id="otherUrl" placeholder="https://api.sms-provider.com/send" value={settings.otherUrl} onChange={(e) => handleInputChange('otherUrl', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="sendToParam">Send to parameter name</Label>
                                <Input id="sendToParam" value={settings.sendToParam} onChange={(e) => handleInputChange('sendToParam', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="msgParam">Message parameter name</Label>
                                <Input id="msgParam" value={settings.msgParam} onChange={(e) => handleInputChange('msgParam', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="requestMethod">Request Method</Label>
                                <Select value={settings.requestMethod} onValueChange={(value) => handleSelectChange('requestMethod', value)}>
                                    <SelectTrigger id="requestMethod"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="get">GET</SelectItem>
                                        <SelectItem value="post">POST</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block">Headers</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input placeholder="Header 1 key" value={settings.header1Key} onChange={(e) => handleInputChange('header1Key', e.target.value)}/>
                                    <Input placeholder="Header 1 value" value={settings.header1Val} onChange={(e) => handleInputChange('header1Val', e.target.value)}/>
                                </div>
                                 <div className="flex gap-2">
                                    <Input placeholder="Header 2 key" value={settings.header2Key} onChange={(e) => handleInputChange('header2Key', e.target.value)}/>
                                    <Input placeholder="Header 2 value" value={settings.header2Val} onChange={(e) => handleInputChange('header2Val', e.target.value)}/>
                                </div>
                                 <div className="flex gap-2">
                                    <Input placeholder="Header 3 key" value={settings.header3Key} onChange={(e) => handleInputChange('header3Key', e.target.value)}/>
                                    <Input placeholder="Header 3 value" value={settings.header3Val} onChange={(e) => handleInputChange('header3Val', e.target.value)}/>
                                </div>
                            </div>
                        </div>
                         <div>
                            <Label className="mb-2 block">Parameters (max 10)</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {renderParameterInputs(10)}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const RewardPointSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        enableRewardPoint: true,
        rewardPointDisplayName: 'Reward Points',
        amountForOnePoint: '10',
        minOrderTotalToEarn: '100',
        maxPointsPerOrder: '500',
        redeemAmountPerPoint: '1',
        minOrderTotalToRedeem: '200',
        minRedeemPointPerOrder: '50',
        maxRedeemPointPerOrder: '1000',
        expiryPeriod: '365',
        expiryPeriodType: 'days',
    });

    const handleInputChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

     const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating reward point settings:', settings);
        toast({
            title: 'Reward Point Settings Updated',
            description: 'Your reward point settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reward Point Settings</CardTitle>
                <CardDescription>Manage how customers earn and redeem reward points.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="flex items-center space-x-2">
                    <Checkbox id="enableRewardPoint" checked={settings.enableRewardPoint} onCheckedChange={(checked) => handleCheckboxChange('enableRewardPoint', !!checked)} />
                    <Label htmlFor="enableRewardPoint" className="text-lg font-normal">Enable Reward Point</Label>
                </div>
                {settings.enableRewardPoint && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="rewardPointDisplayName">Reward Point Display Name:</Label>
                            <Input id="rewardPointDisplayName" value={settings.rewardPointDisplayName} onChange={(e) => handleInputChange('rewardPointDisplayName', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amountForOnePoint" className="flex items-center gap-1.5">
                                Amount to spend for 1 point:
                                <Tooltip><TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>The amount a customer needs to spend to earn one reward point.</p></TooltipContent></Tooltip>
                            </Label>
                            <Input id="amountForOnePoint" type="number" value={settings.amountForOnePoint} onChange={(e) => handleInputChange('amountForOnePoint', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minOrderTotalToEarn" className="flex items-center gap-1.5">
                                Minimum order total to earn reward:
                                <Tooltip><TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>The minimum order total required for a customer to earn reward points.</p></TooltipContent></Tooltip>
                            </Label>
                            <Input id="minOrderTotalToEarn" type="number" value={settings.minOrderTotalToEarn} onChange={(e) => handleInputChange('minOrderTotalToEarn', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxPointsPerOrder">Maximum reward points per order:</Label>
                            <Input id="maxPointsPerOrder" type="number" value={settings.maxPointsPerOrder} onChange={(e) => handleInputChange('maxPointsPerOrder', e.target.value)} />
                        </div>

                        <Separator className="lg:col-span-2" />

                        <div className="space-y-2">
                            <Label htmlFor="redeemAmountPerPoint">Redeem Amount per 1 point:</Label>
                            <Input id="redeemAmountPerPoint" type="number" value={settings.redeemAmountPerPoint} onChange={(e) => handleInputChange('redeemAmountPerPoint', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="minOrderTotalToRedeem" className="flex items-center gap-1.5">
                                Minimum order total to redeem reward:
                                <Tooltip><TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>The minimum order total required for a customer to redeem reward points.</p></TooltipContent></Tooltip>
                            </Label>
                            <Input id="minOrderTotalToRedeem" type="number" value={settings.minOrderTotalToRedeem} onChange={(e) => handleInputChange('minOrderTotalToRedeem', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minRedeemPointPerOrder">Minimum redeem point per order:</Label>
                            <Input id="minRedeemPointPerOrder" type="number" value={settings.minRedeemPointPerOrder} onChange={(e) => handleInputChange('minRedeemPointPerOrder', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxRedeemPointPerOrder">Maximum redeem point per order:</Label>
                            <Input id="maxRedeemPointPerOrder" type="number" value={settings.maxRedeemPointPerOrder} onChange={(e) => handleInputChange('maxRedeemPointPerOrder', e.target.value)} />
                        </div>

                        <Separator className="lg:col-span-2" />

                         <div className="space-y-2">
                            <Label htmlFor="expiryPeriod">Reward Point expiry period:</Label>
                            <div className="flex gap-2">
                                <Input id="expiryPeriod" type="number" value={settings.expiryPeriod} onChange={(e) => handleInputChange('expiryPeriod', e.target.value)} />
                                <Select value={settings.expiryPeriodType} onValueChange={(value) => handleSelectChange('expiryPeriodType', value)}>
                                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="days">Days</SelectItem>
                                        <SelectItem value="months">Months</SelectItem>
                                        <SelectItem value="years">Years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const ModulesSettingsForm = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        serviceStaff: true,
        bookings: false,
        kitchen: false,
        subscription: false,
        typesOfService: false,
        tables: false,
        modifiers: false,
        account: true,
    });

    const handleCheckboxChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleUpdateSettings = () => {
        console.log('Updating modules settings:', settings);
        toast({
            title: 'Modules Settings Updated',
            description: 'Your modules settings have been saved successfully.',
        });
    };
    
    const moduleCheckboxes = [
        { id: 'serviceStaff', label: 'Service staff' },
        { id: 'bookings', label: 'Bookings' },
        { id: 'kitchen', label: 'Kitchen' },
        { id: 'subscription', label: 'Subscription' },
        { id: 'typesOfService', label: 'Types of service', tooltip: 'Enable this to add services like dine-in, parcel, home-delivery etc.' },
        { id: 'tables', label: 'Tables' },
        { id: 'modifiers', label: 'Modifiers' },
        { id: 'account', label: 'Account' },
    ] as const;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Modules</CardTitle>
                <CardDescription>Enable or disable application modules.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {moduleCheckboxes.map(cb => (
                        <div key={cb.id} className="flex items-center space-x-2">
                            <Checkbox id={cb.id} checked={settings[cb.id]} onCheckedChange={(checked) => handleCheckboxChange(cb.id, !!checked)} />
                            <Label htmlFor={cb.id} className="font-normal flex items-center gap-1.5">
                                {cb.label}
                                {cb.tooltip && (
                                     <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent><p>{cb.tooltip}</p></TooltipContent>
                                    </Tooltip>
                                 )}
                            </Label>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings} className="bg-red-500 hover:bg-red-600">Update Settings</Button>
            </CardFooter>
        </Card>
    );
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
                 <div className="flex items-center justify-between">
                    <h1 className="font-headline text-3xl font-bold">Business Settings</h1>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search settings..." className="pl-8" />
                    </div>
                </div>
                <Tabs defaultValue="dashboard" className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
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
                         <TabsContent value="tax">
                            <TaxSettingsForm />
                        </TabsContent>
                        <TabsContent value="product">
                            <ProductSettingsForm />
                        </TabsContent>
                         <TabsContent value="contact">
                            <ContactSettingsForm />
                        </TabsContent>
                        <TabsContent value="sale">
                            <SaleSettingsForm />
                        </TabsContent>
                         <TabsContent value="pos">
                            <PosSettingsForm />
                        </TabsContent>
                         <TabsContent value="purchases">
                            <PurchaseSettingsForm />
                        </TabsContent>
                        <TabsContent value="payment">
                            <PaymentSettingsForm />
                        </TabsContent>
                         <TabsContent value="dashboard">
                            <DashboardSettingsForm />
                        </TabsContent>
                        <TabsContent value="system">
                            <SystemSettingsForm />
                        </TabsContent>
                        <TabsContent value="prefixes">
                            <PrefixesSettingsForm />
                        </TabsContent>
                        <TabsContent value="email_settings">
                            <EmailSettingsForm />
                        </TabsContent>
                         <TabsContent value="sms_settings">
                            <SmsSettingsForm />
                        </TabsContent>
                         <TabsContent value="reward_point_settings">
                            <RewardPointSettingsForm />
                        </TabsContent>
                         <TabsContent value="modules">
                            <ModulesSettingsForm />
                        </TabsContent>
                        {settingsTabs.filter(t => !['business', 'tax', 'product', 'contact', 'sale', 'pos', 'purchases', 'payment', 'dashboard', 'system', 'prefixes', 'email_settings', 'sms_settings', 'reward_point_settings', 'modules'].includes(t.value)).map(tab => (
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

