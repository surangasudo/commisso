

'use client';
import React, { useState, useEffect } from 'react';
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
  PlusCircle,
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { initialTaxRates } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSettings, type AllSettings } from '@/hooks/use-settings';

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

const BusinessSettingsForm = ({ settings: initialBusinessSettings, updateSettings }: { settings: AllSettings['business'], updateSettings: (newValues: AllSettings['business']) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialBusinessSettings);

    useEffect(() => {
        setSettings(initialBusinessSettings);
    }, [initialBusinessSettings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleSelectChange = (id: keyof AllSettings['business'], value: string) => {
        setSettings(s => ({...s, [id]: value as any}));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(s => ({...s, logo: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
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
                                <Label className="px-2 text-xs">Oceania</Label>
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
                        <Input id="logo" type="file" className="flex-1" onChange={handleFileChange} accept="image/*" />
                         {settings.logo && (
                            <img src={settings.logo} alt="Logo Preview" className="h-10 w-10 rounded-md object-contain border" />
                        )}
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
            <Button onClick={handleUpdateSettings}>Update Settings</Button>
        </CardFooter>
    </Card>
    )
};

const TaxSettingsForm = ({ settings: initialTaxSettings, updateSettings }: { settings: AllSettings['tax'], updateSettings: (newValues: Partial<AllSettings['tax']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialTaxSettings);

    useEffect(() => {
        setSettings(initialTaxSettings);
    }, [initialTaxSettings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleSelectChange = (id: keyof AllSettings['tax'], value: string) => {
        setSettings(s => ({...s, [id]: value as any }));
    };
    
    const handleCheckboxChange = (id: keyof AllSettings['tax'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
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
                        <Checkbox id="enableInlineTax" checked={settings.enableInlineTax} onCheckedChange={(checked) => handleCheckboxChange('enableInlineTax', checked)} />
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
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const PurchaseSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['purchase'], updateSettings: (newValues: Partial<AllSettings['purchase']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleCheckboxChange = (id: keyof AllSettings['purchase'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true}));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'Purchase Settings Updated',
            description: 'Your purchase settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Purchase Settings</CardTitle>
                <CardDescription>Configure your purchasing workflow and options.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox id="enableEditingProductPrice" checked={settings.enableEditingProductPrice} onCheckedChange={(checked) => handleCheckboxChange('enableEditingProductPrice', checked)} />
                    <Label htmlFor="enableEditingProductPrice" className="font-normal">Enable editing product price from purchase screen</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="enablePurchaseStatus" checked={settings.enablePurchaseStatus} onCheckedChange={(checked) => handleCheckboxChange('enablePurchaseStatus', checked)} />
                    <Label htmlFor="enablePurchaseStatus" className="font-normal">Enable Purchase Status</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="enableLotNumber" checked={settings.enableLotNumber} onCheckedChange={(checked) => handleCheckboxChange('enableLotNumber', checked)} />
                    <Label htmlFor="enableLotNumber" className="font-normal">Enable Lot Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="enablePurchaseOrder" checked={settings.enablePurchaseOrder} onCheckedChange={(checked) => handleCheckboxChange('enablePurchaseOrder', checked)} />
                    <Label htmlFor="enablePurchaseOrder" className="font-normal">Enable Purchase Order</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="enablePurchaseRequisition" checked={settings.enablePurchaseRequisition} onCheckedChange={(checked) => handleCheckboxChange('enablePurchaseRequisition', checked)} />
                    <Label htmlFor="enablePurchaseRequisition" className="font-normal">Enable Purchase Requisition</Label>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    );
};


const ProductSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['product'], updateSettings: (newValues: Partial<AllSettings['product']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };
    
    const handleCheckboxChange = (id: keyof AllSettings['product'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true}));
    };

    const handleSelectChange = (id: keyof AllSettings['product'], value: string) => {
        setSettings(s => ({...s, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
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
                        <Checkbox id="enableBrands" checked={settings.enableBrands} onCheckedChange={(checked) => handleCheckboxChange('enableBrands', checked)} />
                        <Label htmlFor="enableBrands" className="font-normal">Enable Brands</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enablePriceAndTax" checked={settings.enablePriceAndTax} onCheckedChange={(checked) => handleCheckboxChange('enablePriceAndTax', checked)} />
                        <Label htmlFor="enablePriceAndTax" className="font-normal">Enable Price & Tax info</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableRacks" checked={settings.enableRacks} onCheckedChange={(checked) => handleCheckboxChange('enableRacks', checked)} />
                        <Label htmlFor="enableRacks" className="font-normal flex items-center gap-1">Enable Racks
                            <Tooltip>
                                <TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground"/></TooltipTrigger>
                                <TooltipContent><p>Manage racks, rows, and positions of products.</p></TooltipContent>
                            </Tooltip>
                        </Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="enableWarranty" checked={settings.enableWarranty} onCheckedChange={(checked) => handleCheckboxChange('enableWarranty', checked)} />
                        <Label htmlFor="enableWarranty" className="font-normal">Enable Warranty</Label>
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="enableProductExpiryCheckbox" className="flex items-center gap-1">Enable Product Expiry: <Info className="w-3 h-3 text-muted-foreground"/></Label>
                        <div className="flex items-center gap-2">
                             <Checkbox id="enableProductExpiryCheckbox" checked={settings.enableProductExpiry} onCheckedChange={(checked) => handleCheckboxChange('enableProductExpiry', checked)} />
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
                        <Checkbox id="enableCategories" checked={settings.enableCategories} onCheckedChange={(checked) => handleCheckboxChange('enableCategories', checked)} />
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
                        <Checkbox id="enableRow" checked={settings.enableRow} onCheckedChange={(checked) => handleCheckboxChange('enableRow', checked)} />
                        <Label htmlFor="enableRow" className="font-normal">Enable Row</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isProductImageRequired" checked={settings.isProductImageRequired} onCheckedChange={(checked) => handleCheckboxChange('isProductImageRequired', checked)} />
                        <Label htmlFor="isProductImageRequired" className="font-normal">Is product image required?</Label>
                    </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableSubCategories" checked={settings.enableSubCategories} onCheckedChange={(checked) => handleCheckboxChange('enableSubCategories', checked)} />
                        <Label htmlFor="enableSubCategories" className="font-normal">Enable Sub-Categories</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enableSubUnits" checked={settings.enableSubUnits} onCheckedChange={(checked) => handleCheckboxChange('enableSubUnits', checked)} />
                        <Label htmlFor="enableSubUnits" className="font-normal flex items-center gap-1">Enable Sub Units <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="enablePosition" checked={settings.enablePosition} onCheckedChange={(checked) => handleCheckboxChange('enablePosition', checked)} />
                        <Label htmlFor="enablePosition" className="font-normal">Enable Position</Label>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleUpdateSettings}>Update Settings</Button>
        </CardFooter>
    </Card>
    )
};

const SaleSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['sale'], updateSettings: (newValues: Partial<AllSettings['sale']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);
    
    const handleCheckboxChange = (id: keyof AllSettings['sale'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true}));
    };
    
    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'Sale Settings Updated',
            description: 'Your sale settings have been saved successfully.',
        });
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sale Settings</CardTitle>
                <CardDescription>Manage your sales process and commission rules.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="defaultSaleDiscount">Default Sale Discount %:</Label>
                        <Input id="defaultSaleDiscount" type="number" value={settings.defaultSaleDiscount} onChange={(e) => setSettings(s => ({...s, defaultSaleDiscount: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="defaultSellingPriceGroup">Default Selling Price Group:</Label>
                        <Select value={settings.defaultSellingPriceGroup} onValueChange={(value) => setSettings(s => ({...s, defaultSellingPriceGroup: value}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="itemAdditionMethod">Item Addition Method:</Label>
                        <Select value={settings.itemAdditionMethod} onValueChange={(value) => setSettings(s => ({...s, itemAdditionMethod: value as any}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="increase_quantity">Increase item quantity if it already exists</SelectItem>
                                <SelectItem value="add_new_line">Add item in new line</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="amountRoundingMethod">Amount rounding method:</Label>
                        <Select value={settings.amountRoundingMethod} onValueChange={(value) => setSettings(s => ({...s, amountRoundingMethod: value as any}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="round_to_nearest_whole">Round to nearest whole number</SelectItem>
                                <SelectItem value="round_to_nearest_decimal">Round to nearest decimal (multiple of 0.05)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="allowOverselling" checked={settings.allowOverselling} onCheckedChange={(checked) => handleCheckboxChange('allowOverselling', checked)} />
                        <Label htmlFor="allowOverselling" className="font-normal">Allow Overselling</Label>
                    </div>
                 </div>
                 <Separator className="my-6" />
                 <div className="space-y-4">
                     <h4 className="font-semibold text-base">Commission Agent</h4>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="enableCommissionAgent" checked={settings.enableCommissionAgent} onCheckedChange={(checked) => handleCheckboxChange('enableCommissionAgent', checked)} />
                        <Label htmlFor="enableCommissionAgent" className="font-normal">Enable Commission Agent</Label>
                    </div>
                    {settings.enableCommissionAgent && (
                         <div className="pl-6 space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="commissionAgent">Commission Agent:</Label>
                                    <Select value={settings.commissionAgent} onValueChange={(value) => setSettings(s => ({...s, commissionAgent: value}))}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="logged_in_user">Logged in user</SelectItem>
                                            <SelectItem value="select_from_users_list">Select from user's list</SelectItem>
                                            <SelectItem value="select_from_commission_agent_list">Select from commission agent's list</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="commissionCalculationType">Commission Calculation Type:</Label>
                                     <Select value={settings.commissionCalculationType} onValueChange={(value) => setSettings(s => ({...s, commissionCalculationType: value as any}))}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="invoice_value">On Invoice Value</SelectItem>
                                            <SelectItem value="payment_received">On Payment Received</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isCommissionAgentPhoneCompulsory" checked={settings.isCommissionAgentPhoneCompulsory} onCheckedChange={(checked) => handleCheckboxChange('isCommissionAgentPhoneCompulsory', checked)} />
                                <Label htmlFor="isCommissionAgentPhoneCompulsory" className="font-normal">Make it compulsory to enter commission agent phone number to make sale in default pricing group</Label>
                            </div>
                         </div>
                    )}
                 </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    )
};

const PosSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['pos'], updateSettings: (newValues: Partial<AllSettings['pos']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleCheckboxChange = (id: keyof AllSettings['pos'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true}));
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'POS Settings Updated',
            description: 'Your Point of Sale settings have been saved successfully.',
        });
    };

    const shortcutFields = [
        { id: 'expressCheckout', label: 'Express Checkout' },
        { id: 'payAndCheckout', label: 'Pay & Checkout' },
        { id: 'draftShortcut', label: 'Draft' },
        { id: 'cancelShortcut', label: 'Cancel Transaction' },
        { id: 'goToQuantity', label: 'Go to quantity field' },
        { id: 'weighingScaleShortcut', label: 'Weighing Scale' },
        { id: 'editDiscount', label: 'Edit Discount' },
        { id: 'editOrderTax', label: 'Edit Order Tax' },
        { id: 'addPaymentRow', label: 'Add Payment Row' },
        { id: 'finalizePayment', label: 'Finalize Payment' },
        { id: 'addNewProduct', label: 'Add new product' },
    ];
    
    const generalToggles = [
        { id: 'disableMultiplePay', label: 'Disable Multiple Pay' },
        { id: 'disableDraft', label: 'Disable Draft' },
        { id: 'disableExpressCheckout', label: 'Disable Express Checkout' },
        { id: 'disableDiscount', label: 'Disable Discount' },
        { id: 'disableSuspendSale', label: 'Disable Suspend Sale' },
        { id: 'disableCreditSaleButton', label: 'Disable Credit Sale button' },
        { id: 'dontShowProductSuggestion', label: 'Don\'t show product suggestion' },
        { id: 'dontShowRecentTransactions', label: 'Don\'t show recent transactions' },
        { id: 'enableTransactionDate', label: 'Enable transaction date in POS screen' },
        { id: 'isServiceStaffRequired', label: 'Is service staff required' },
        { id: 'subtotalEditable', label: 'Make Subtotal Editable' },
        { id: 'enableServiceStaffInProductLine', label: 'Enable service staff in product line' },
        { id: 'showInvoiceScheme', label: 'Show Invoice Scheme' },
        { id: 'showInvoiceLayoutDropdown', label: 'Show Invoice Layout Dropdown' },
        { id: 'showPricingTooltip', label: 'Show pricing tooltip' },
        { id: 'printInvoiceOnSuspend', label: 'Print invoice on suspend' }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Point of Sale Settings</CardTitle>
                <CardDescription>Customize the behavior and layout of your POS screen.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={['general', 'shortcuts']} className="w-full">
                    <AccordionItem value="general">
                        <AccordionTrigger className="text-base font-semibold">General Settings</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                {generalToggles.map(toggle => (
                                     <div key={toggle.id} className="flex items-center space-x-2">
                                        <Checkbox id={toggle.id} checked={settings[toggle.id as keyof typeof settings]} onCheckedChange={(checked) => handleCheckboxChange(toggle.id as keyof AllSettings['pos'], checked)} />
                                        <Label htmlFor={toggle.id} className="font-normal">{toggle.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="shortcuts">
                        <AccordionTrigger className="text-base font-semibold">Keyboard Shortcuts</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm text-muted-foreground pt-2 pb-4">Define keyboard shortcuts for common POS actions. Use formats like `shift+e`.</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 pt-4">
                                 {shortcutFields.map(field => (
                                    <div key={field.id} className="space-y-2">
                                        <Label htmlFor={field.id}>{field.label}:</Label>
                                        <Input id={field.id} value={settings[field.id as keyof typeof settings] as string} onChange={handleInputChange} />
                                    </div>
                                 ))}
                             </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const PaymentSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['payment'], updateSettings: (newValues: Partial<AllSettings['payment']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleCheckboxChange = (id: keyof AllSettings['payment'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true}));
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleSelectChange = (id: keyof AllSettings['payment'], value: string) => {
        setSettings(s => ({...s, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'Payment Settings Updated',
            description: 'Your payment settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure payment gateways and cash denominations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="cashDenominations">Cash Denominations</Label>
                        <Textarea id="cashDenominations" placeholder="10, 20, 50, 100, 200, 500, 2000" value={settings.cashDenominations} onChange={handleInputChange} />
                        <p className="text-xs text-muted-foreground">Comma separated values.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="enableOn">Enable Cash Denomination screen on</Label>
                        <Select value={settings.enableOn} onValueChange={(value) => handleSelectChange('enableOn', value)}>
                            <SelectTrigger id="enableOn"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all_screens">All Screens</SelectItem>
                                <SelectItem value="pos_screen">POS screen only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="enableForMethods">Enable cash denomination for following payment methods</Label>
                        <Textarea id="enableForMethods" placeholder="cash, card,..." value={settings.enableForMethods} onChange={handleInputChange} />
                    </div>
                     <div className="flex items-center space-x-2 pt-6">
                        <Checkbox id="strictCheck" checked={settings.strictCheck} onCheckedChange={(checked) => handleCheckboxChange('strictCheck', checked)} />
                        <Label htmlFor="strictCheck" className="font-normal flex items-center gap-1">Strict Check 
                            <Tooltip>
                                <TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground"/></TooltipTrigger>
                                <TooltipContent><p>If checked, user must enter the exact cash received from customer.</p></TooltipContent>
                            </Tooltip>
                        </Label>
                    </div>
                </div>
                <Separator/>
                 <Accordion type="multiple" className="w-full">
                    <AccordionItem value="stripe">
                        <AccordionTrigger className="text-base font-semibold">Stripe</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="enableStripe" checked={settings.enableStripe} onCheckedChange={(checked) => handleCheckboxChange('enableStripe', checked)} />
                                <Label htmlFor="enableStripe" className="font-normal">Enable Stripe</Label>
                            </div>
                            {settings.enableStripe && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                                        <Input id="stripePublicKey" value={settings.stripePublicKey} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                                        <Input id="stripeSecretKey" type="password" value={settings.stripeSecretKey} onChange={handleInputChange} />
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="paypal">
                        <AccordionTrigger className="text-base font-semibold">PayPal</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                             <div className="flex items-center space-x-2">
                                <Checkbox id="enablePaypal" checked={settings.enablePaypal} onCheckedChange={(checked) => handleCheckboxChange('enablePaypal', checked)} />
                                <Label htmlFor="enablePaypal" className="font-normal">Enable PayPal</Label>
                            </div>
                            {settings.enablePaypal && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                     <div className="space-y-2">
                                        <Label htmlFor="paypalMode">PayPal Mode</Label>
                                        <Select value={settings.paypalMode} onValueChange={(value) => handleSelectChange('paypalMode', value)}>
                                            <SelectTrigger id="paypalMode"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sandbox">Sandbox</SelectItem>
                                                <SelectItem value="live">Live</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div />
                                    <div className="space-y-2">
                                        <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                                        <Input id="paypalClientId" value={settings.paypalClientId} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paypalClientSecret">PayPal Client Secret</Label>
                                        <Input id="paypalClientSecret" type="password" value={settings.paypalClientSecret} onChange={handleInputChange} />
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                 </Accordion>

            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    )
};

const DashboardSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['dashboard'], updateSettings: (newValues: Partial<AllSettings['dashboard']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleCheckboxChange = (id: keyof AllSettings['dashboard'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true}));
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'Dashboard Settings Updated',
            description: 'Your dashboard settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>Customize what appears on your main dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="enableStockExpiryAlert" checked={settings.enableStockExpiryAlert} onCheckedChange={(checked) => handleCheckboxChange('enableStockExpiryAlert', checked)} />
                    <Label htmlFor="enableStockExpiryAlert" className="font-normal">Enable Stock Expiry Alert</Label>
                </div>
                 <div className="space-y-2 max-w-sm">
                    <Label htmlFor="viewStockExpiryAlert" className="flex items-center gap-1">View Stock Expiry Alert For: <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Input id="viewStockExpiryAlert" type="number" value={settings.viewStockExpiryAlert} onChange={handleInputChange} />
                    <p className="text-xs text-muted-foreground">Show alert for products expiring in the next 'n' days.</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const SystemSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['system'], updateSettings: (newValues: Partial<AllSettings['system']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };
    
    const handleCheckboxChange = (id: keyof AllSettings['system'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true}));
    };

    const handleSelectChange = (id: keyof AllSettings['system'], value: string) => {
        setSettings(s => ({...s, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'System Settings Updated',
            description: 'Your system settings have been saved successfully.',
        });
    };

    const themeColors = [
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green' },
        { value: 'red', label: 'Red' },
        { value: 'purple', label: 'Purple' },
        { value: 'yellow', label: 'Yellow' },
        { value: 'black', label: 'Black' },
        { value: 'blue-light', label: 'Light Blue' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Manage general system settings, theme, and external integrations.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="appName">App Name *</Label>
                        <Input id="appName" value={settings.appName} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="helpLink">Help Link:</Label>
                        <Input id="helpLink" value={settings.helpLink} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="themeColor">Theme Color:</Label>
                        <Select value={settings.themeColor} onValueChange={(value) => handleSelectChange('themeColor', value)}>
                            <SelectTrigger id="themeColor"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {themeColors.map(theme => (
                                    <SelectItem key={theme.value} value={theme.value}>{theme.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="defaultDatatableEntries">Default datatable entries per page:</Label>
                        <Select value={settings.defaultDatatableEntries} onValueChange={(value) => handleSelectChange('defaultDatatableEntries', value)}>
                            <SelectTrigger id="defaultDatatableEntries"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <Separator className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="flex items-center space-x-2">
                        <Checkbox id="enableRepairModule" checked={settings.enableRepairModule} onCheckedChange={(checked) => handleCheckboxChange('enableRepairModule', checked)} />
                        <Label htmlFor="enableRepairModule" className="font-normal">Enable Repair Module</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="showHelpText" checked={settings.showHelpText} onCheckedChange={(checked) => handleCheckboxChange('showHelpText', checked)} />
                        <Label htmlFor="showHelpText" className="font-normal">Show help text</Label>
                    </div>
                </div>
                 <Separator className="my-6" />
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="google-api">
                        <AccordionTrigger className="text-base font-semibold">Google API Settings</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="googleApiKey">Google API Key:</Label>
                                <Input id="googleApiKey" value={settings.googleApiKey} onChange={handleInputChange} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isGoogleDriveEnabled" checked={settings.isGoogleDriveEnabled} onCheckedChange={(checked) => handleCheckboxChange('isGoogleDriveEnabled', checked)} />
                                <Label htmlFor="isGoogleDriveEnabled" className="font-normal">Enable Google Drive</Label>
                            </div>
                             {settings.isGoogleDriveEnabled && (
                                <div className="space-y-2 pl-6">
                                    <Label htmlFor="googleDriveAppId">Google Drive App ID:</Label>
                                    <Input id="googleDriveAppId" value={settings.googleDriveAppId} onChange={handleInputChange} />
                                </div>
                             )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const PrefixesSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['prefixes'], updateSettings: (newValues: Partial<AllSettings['prefixes']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'Prefixes Updated',
            description: 'Your transaction prefixes have been saved successfully.',
        });
    };

    const prefixFields = [
        { id: 'purchase', label: 'Purchase Prefix' },
        { id: 'purchaseReturn', label: 'Purchase Return Prefix' },
        { id: 'purchaseRequisition', label: 'Purchase Requisition Prefix' },
        { id: 'purchaseOrder', label: 'Purchase Order Prefix' },
        { id: 'stockTransfer', label: 'Stock Transfer Prefix' },
        { id: 'stockAdjustment', label: 'Stock Adjustment Prefix' },
        { id: 'sellReturn', label: 'Sell Return Prefix' },
        { id: 'expenses', label: 'Expenses Prefix' },
        { id: 'contacts', label: 'Contacts Prefix' },
        { id: 'purchasePayment', label: 'Purchase Payment Prefix' },
        { id: 'sellPayment', label: 'Sell Payment Prefix' },
        { id: 'expensePayment', label: 'Expense Payment Prefix' },
        { id: 'businessLocation', label: 'Business Location Prefix' },
        { id: 'username', label: 'Username Prefix' },
        { id: 'subscriptionNo', label: 'Subscription No. Prefix' },
        { id: 'draft', label: 'Draft Prefix' },
        { id: 'salesOrder', label: 'Sales Order Prefix' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Prefixes</CardTitle>
                <CardDescription>Set prefixes for invoice numbers and other transaction references.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prefixFields.map(field => (
                        <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>{field.label}:</Label>
                            <Input 
                                id={field.id}
                                value={settings[field.id as keyof typeof settings] || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Prefix"
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    );
};

const EmailSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['email'], updateSettings: (newValues: Partial<AllSettings['email']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleSelectChange = (id: keyof AllSettings['email'], value: string) => {
        setSettings(s => ({...s, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'Email Settings Updated',
            description: 'Your email settings have been saved successfully.',
        });
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Configure your email service for sending notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 max-w-sm">
                    <Label htmlFor="mailDriver">Mail Driver</Label>
                    <Select value={settings.mailDriver} onValueChange={(value) => handleSelectChange('mailDriver', value)}>
                        <SelectTrigger id="mailDriver"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="smtp">SMTP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="host">Host</Label>
                        <Input id="host" value={settings.host} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" value={settings.port} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={settings.username} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={settings.password} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="encryption">Encryption</Label>
                        <Select value={settings.encryption} onValueChange={(value) => handleSelectChange('encryption', value)}>
                            <SelectTrigger id="encryption"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tls">TLS</SelectItem>
                                <SelectItem value="ssl">SSL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fromAddress">From Address</Label>
                        <Input id="fromAddress" type="email" value={settings.fromAddress} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fromName">From Name</Label>
                        <Input id="fromName" value={settings.fromName} onChange={handleInputChange} />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </>
    );
};

const SmsSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['sms'], updateSettings: (newValues: Partial<AllSettings['sms']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleSelectChange = (id: keyof AllSettings['sms'], value: string) => {
        setSettings(s => ({...s, [id]: value as any }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'SMS Settings Updated',
            description: 'Your SMS settings have been saved successfully.',
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>SMS Settings</CardTitle>
                    <CardDescription>Configure your preferred SMS gateway.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        <div className="pt-6 border-t space-y-4">
                            <h4 className="font-semibold">Twilio Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="twilioSid">Twilio SID</Label>
                                    <Input id="twilioSid" value={settings.twilioSid} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="twilioToken">Twilio Token</Label>
                                    <Input id="twilioToken" type="password" value={settings.twilioToken} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="twilioFrom">From Number</Label>
                                    <Input id="twilioFrom" value={settings.twilioFrom} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {settings.smsService === 'nexmo' && (
                        <div className="pt-6 border-t space-y-4">
                            <h4 className="font-semibold">Nexmo/Vonage Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nexmoKey">API Key</Label>
                                    <Input id="nexmoKey" value={settings.nexmoKey} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nexmoSecret">API Secret</Label>
                                    <Input id="nexmoSecret" type="password" value={settings.nexmoSecret} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nexmoFrom">From</Label>
                                    <Input id="nexmoFrom" value={settings.nexmoFrom} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {settings.smsService === 'textlk' && (
                        <div className="pt-6 border-t space-y-4">
                            <h4 className="font-semibold">Text.lk Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="textlkApiKey">API Key</Label>
                                    <Input id="textlkApiKey" value={settings.textlkApiKey} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="textlkSenderId">Sender ID</Label>
                                    <Input id="textlkSenderId" value={settings.textlkSenderId} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {settings.smsService === 'other' && (
                        <div className="pt-6 border-t space-y-4">
                            <h4 className="font-semibold">Other Service Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2 lg:col-span-3">
                                    <Label htmlFor="otherUrl">URL</Label>
                                    <Input id="otherUrl" value={settings.otherUrl} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sendToParam">Send to parameter name</Label>
                                    <Input id="sendToParam" value={settings.sendToParam} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="msgParam">Message parameter name</Label>
                                    <Input id="msgParam" value={settings.msgParam} onChange={handleInputChange} />
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
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleUpdateSettings}>Update Settings</Button>
                </CardFooter>
            </Card>
             <div className="lg:col-span-1">
                <Card>
                    <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>Configure your SMS service to send notifications directly from the application.</p>
                        <p><span className="font-semibold text-foreground">Text.lk:</span> The only implemented service currently. Find your API Key and Sender ID on your Text.lk dashboard.</p>
                        <p>Fill in the required credentials for your chosen service and click "Update Settings" to save.</p>
                        <p>You can find your Text.lk credentials at <a href="https://app.text.lk/developers" target="_blank" rel="noopener noreferrer" className="text-primary underline">app.text.lk/developers</a>.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const RewardPointSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['rewardPoint'], updateSettings: (newValues: Partial<AllSettings['rewardPoint']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(s => ({...s, [id]: value }));
    };

    const handleSelectChange = (id: keyof AllSettings['rewardPoint'], value: string) => {
        setSettings(s => ({...s, [id]: value as any }));
    };
    
    const handleCheckboxChange = (id: keyof AllSettings['rewardPoint'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true }));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'Reward Point Settings Updated',
            description: 'Your reward point settings have been saved successfully.',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reward Point Settings</CardTitle>
                <CardDescription>Manage your customer loyalty program.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Checkbox id="enableRewardPoint" checked={settings.enableRewardPoint} onCheckedChange={(checked) => handleCheckboxChange('enableRewardPoint', checked)} />
                    <Label htmlFor="enableRewardPoint" className="font-normal">Enable Reward Point System</Label>
                </div>
                {settings.enableRewardPoint && (
                    <div className="space-y-6 pl-6 border-l">
                         <div className="space-y-2">
                            <Label htmlFor="rewardPointDisplayName">Reward Point Display Name</Label>
                            <Input id="rewardPointDisplayName" value={settings.rewardPointDisplayName} onChange={handleInputChange} />
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-medium mb-4">Earning Settings</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amountForOnePoint" className="flex items-center gap-1">Amount for 1 point <Info className="w-3 h-3 text-muted-foreground"/></Label>
                                    <Input id="amountForOnePoint" type="number" value={settings.amountForOnePoint} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minOrderTotalToEarn">Min. order total to earn reward <Info className="w-3 h-3 text-muted-foreground"/></Label>
                                    <Input id="minOrderTotalToEarn" type="number" value={settings.minOrderTotalToEarn} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxPointsPerOrder">Max. points per order</Label>
                                    <Input id="maxPointsPerOrder" type="number" value={settings.maxPointsPerOrder} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                         <Separator />
                        <div>
                            <h4 className="font-medium mb-4">Redemption Settings</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="redeemAmountPerPoint" className="flex items-center gap-1">Redeem amount per point <Info className="w-3 h-3 text-muted-foreground"/></Label>
                                    <Input id="redeemAmountPerPoint" type="number" value={settings.redeemAmountPerPoint} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minOrderTotalToRedeem">Min. order total to redeem</Label>
                                    <Input id="minOrderTotalToRedeem" type="number" value={settings.minOrderTotalToRedeem} onChange={handleInputChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="minRedeemPointPerOrder">Min. redeem point per order</Label>
                                    <Input id="minRedeemPointPerOrder" type="number" value={settings.minRedeemPointPerOrder} onChange={handleInputChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="maxRedeemPointPerOrder">Max. redeem point per order</Label>
                                    <Input id="maxRedeemPointPerOrder" type="number" value={settings.maxRedeemPointPerOrder} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                         <Separator />
                        <div>
                            <h4 className="font-medium mb-4">Expiry Settings</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiryPeriod">Reward Point Expiry Period</Label>
                                    <Input id="expiryPeriod" type="number" value={settings.expiryPeriod} onChange={handleInputChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="expiryPeriodType">Period Type</Label>
                                    <Select value={settings.expiryPeriodType} onValueChange={(value) => handleSelectChange('expiryPeriodType', value)}>
                                        <SelectTrigger id="expiryPeriodType"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="days">Days</SelectItem>
                                            <SelectItem value="months">Months</SelectItem>
                                            <SelectItem value="years">Years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    )
};


const ModulesSettingsForm = ({ settings: initialSettingsData, updateSettings }: { settings: AllSettings['modules'], updateSettings: (newValues: Partial<AllSettings['modules']>) => void }) => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(initialSettingsData);

    useEffect(() => {
        setSettings(initialSettingsData);
    }, [initialSettingsData]);

    const handleCheckboxChange = (id: keyof AllSettings['modules'], checked: boolean | 'indeterminate') => {
        setSettings(s => ({...s, [id]: checked === true}));
    };

    const handleUpdateSettings = () => {
        updateSettings(settings);
        toast({
            title: 'Modules Updated',
            description: 'Module settings have been saved successfully.',
        });
    };

    const moduleToggles = [
        { id: 'serviceStaff', label: 'Service Staff' },
        { id: 'bookings', label: 'Bookings' },
        { id: 'kitchen', label: 'Kitchen' },
        { id: 'subscription', label: 'Subscription' },
        { id: 'typesOfService', label: 'Types of Service' },
        { id: 'tables', label: 'Tables' },
        { id: 'modifiers', label: 'Modifiers' },
        { id: 'account', label: 'Account' },
        { id: 'advancedCommission', label: 'Advanced Commission' },
    ] as const;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Modules</CardTitle>
                <CardDescription>Enable or disable different modules for your business.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {moduleToggles.map(toggle => (
                        <div key={toggle.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                            <Checkbox 
                                id={toggle.id} 
                                checked={settings[toggle.id]} 
                                onCheckedChange={(checked) => handleCheckboxChange(toggle.id, checked)} 
                            />
                            <Label htmlFor={toggle.id} className="font-normal text-base">{toggle.label}</Label>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpdateSettings}>Update Settings</Button>
            </CardFooter>
        </Card>
    );
};


const UnimplementedForm = ({ title }: { title: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">{title} settings are under development.</p>
            </div>
        </CardContent>
        <CardFooter>
             <Button disabled>Update Settings</Button>
        </CardFooter>
    </Card>
);

export default function BusinessSettingsPage() {
    const { settings, updateSection } = useSettings();

    if (!settings) {
        return <div>Loading Settings...</div>; // Or a skeleton loader
    }
    
    const handleBusinessUpdate = (newBusinessSettings: AllSettings['business']) => {
        // Only update fromName if it hasn't been manually changed from the business name
        if (settings.email.fromName === settings.business.businessName) {
            updateSection('email', { fromName: newBusinessSettings.businessName });
        }
        updateSection('business', newBusinessSettings);
    };
    
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
                            <BusinessSettingsForm settings={settings.business} updateSettings={handleBusinessUpdate} />
                        </TabsContent>
                         <TabsContent value="tax">
                            <TaxSettingsForm settings={settings.tax} updateSettings={(newValues) => updateSection('tax', newValues)} />
                        </TabsContent>
                        <TabsContent value="product">
                            <ProductSettingsForm settings={settings.product} updateSettings={(newValues) => updateSection('product', newValues)} />
                        </TabsContent>
                        <TabsContent value="contact"><UnimplementedForm title="Contact Settings" /></TabsContent>
                        <TabsContent value="sale">
                            <SaleSettingsForm settings={settings.sale} updateSettings={(newValues) => updateSection('sale', newValues)} />
                        </TabsContent>
                        <TabsContent value="pos">
                            <PosSettingsForm settings={settings.pos} updateSettings={(newValues) => updateSection('pos', newValues)} />
                        </TabsContent>
                        <TabsContent value="purchases">
                             <PurchaseSettingsForm settings={settings.purchase} updateSettings={(newValues) => updateSection('purchase', newValues)} />
                        </TabsContent>
                        <TabsContent value="payment">
                            <PaymentSettingsForm settings={settings.payment} updateSettings={(newValues) => updateSection('payment', newValues)} />
                        </TabsContent>
                        <TabsContent value="dashboard">
                            <DashboardSettingsForm settings={settings.dashboard} updateSettings={(newValues) => updateSection('dashboard', newValues)} />
                        </TabsContent>
                        <TabsContent value="system">
                            <SystemSettingsForm settings={settings.system} updateSettings={(newValues) => updateSection('system', newValues)} />
                        </TabsContent>
                        <TabsContent value="prefixes">
                            <PrefixesSettingsForm settings={settings.prefixes} updateSettings={(newValues) => updateSection('prefixes', newValues)} />
                        </TabsContent>
                        <TabsContent value="email_settings">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                     <EmailSettingsForm settings={settings.email} updateSettings={(newValues) => updateSection('email', newValues)} />
                                </Card>
                                <div className="lg:col-span-1">
                                    <Card>
                                        <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
                                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                                            <p>To send emails, you need to configure an SMTP service. The settings on this page allow the application to connect to your email provider.</p>
                                            <p><span className="font-semibold text-foreground">Host:</span> Your mail server address (e.g., smtp.gmail.com).</p>
                                            <p><span className="font-semibold text-foreground">Port:</span> The port number for your mail server (e.g., 587 for TLS, 465 for SSL).</p>
                                            <p><span className="font-semibold text-foreground">Username/Password:</span> Your credentials for the email account you're sending from.</p>
                                            <p>These settings are crucial for features like sending invoices and password resets to your users.</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="sms_settings">
                             <SmsSettingsForm settings={settings.sms} updateSettings={(newValues) => updateSection('sms', newValues)} />
                        </TabsContent>
                        <TabsContent value="reward_point_settings">
                            <RewardPointSettingsForm settings={settings.rewardPoint} updateSettings={(newValues) => updateSection('rewardPoint', newValues)} />
                        </TabsContent>
                         <TabsContent value="modules">
                            <ModulesSettingsForm settings={settings.modules} updateSettings={(newValues) => updateSection('modules', newValues)} />
                        </TabsContent>
                        <TabsContent value="custom_labels"><UnimplementedForm title="Custom Labels Settings" /></TabsContent>
                    </div>
                </Tabs>
                <div className="text-center text-xs text-slate-400 p-1">
                    Ultimate POS - V6.7 | Copyright © 2025 All rights reserved.
                </div>
            </div>
        </TooltipProvider>
    );
}
