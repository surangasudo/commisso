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
                <Tabs defaultValue="product" className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
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
                        {settingsTabs.filter(t => !['business', 'tax', 'product'].includes(t.value)).map(tab => (
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
