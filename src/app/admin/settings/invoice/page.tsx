
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Pencil, Trash2, Badge } from "lucide-react";
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessSettings } from "@/hooks/use-business-settings";
import { useSettings } from "@/hooks/use-settings";

// Data types
type InvoiceScheme = {
    id: string;
    name: string;
    schemeType: 'blank' | 'year';
    prefix: string;
    startFrom: number;
    totalDigits: number;
    isDefault?: boolean;
};

type InvoiceLayout = {
    id: string;
    name: string;
    headerText: string;
    invoiceHeading: string;
    subHeadingLine1: string;
    subHeadingLine2: string;
    footerText: string;
    showLogo: boolean;
    showBusinessName: boolean;
    showLocationName: boolean;
    showLandmark: boolean;
    showCity: boolean;
    showZipCode: boolean;
    showState: boolean;
    showCountry: boolean;
    showMobileNumber: boolean;
    showAlternateNumber: boolean;
    showEmail: boolean;
    showTax1: boolean;
    showTax2: boolean;
    showQrCode: boolean;
};

// Initial data
const initialSchemes: InvoiceScheme[] = [
    { id: 'scheme-1', name: 'Default', schemeType: 'blank', prefix: 'INV', startFrom: 1, totalDigits: 4, isDefault: true },
    { id: 'scheme-2', name: 'Yearly', schemeType: 'year', prefix: 'INV-YYYY-', startFrom: 1, totalDigits: 5 },
];

const initialLayouts: InvoiceLayout[] = [
    {
        id: 'layout-1',
        name: 'Default',
        headerText: 'Thank you for your business!',
        invoiceHeading: 'Invoice',
        subHeadingLine1: 'Your Company Name',
        subHeadingLine2: 'Your Company Address',
        footerText: 'Please pay within 30 days.',
        showLogo: true,
        showBusinessName: true,
        showLocationName: true,
        showLandmark: true,
        showCity: true,
        showZipCode: true,
        showState: true,
        showCountry: true,
        showMobileNumber: true,
        showAlternateNumber: false,
        showEmail: true,
        showTax1: true,
        showTax2: false,
        showQrCode: true,
    },
];

const initialSchemeState: Omit<InvoiceScheme, 'id' | 'isDefault'> = {
    name: '',
    schemeType: 'blank',
    prefix: '',
    startFrom: 1,
    totalDigits: 4,
};

const initialLayoutState: Omit<InvoiceLayout, 'id'> = {
    name: '',
    headerText: '',
    invoiceHeading: 'Invoice',
    subHeadingLine1: '',
    subHeadingLine2: '',
    footerText: '',
    showLogo: true,
    showBusinessName: true,
    showLocationName: false,
    showLandmark: false,
    showCity: true,
    showZipCode: true,
    showState: true,
    showCountry: true,
    showMobileNumber: true,
    showAlternateNumber: false,
    showEmail: true,
    showTax1: true,
    showTax2: false,
    showQrCode: false,
};

export default function InvoiceSettingsPage() {
    const { toast } = useToast();
    const { settings, updateSection } = useSettings();
    const [schemes, setSchemes] = useState<InvoiceScheme[]>(initialSchemes);
    const [layouts, setLayouts] = useState<InvoiceLayout[]>(initialLayouts);

    const handleDesignChange = (value: 'classic' | 'modern') => {
        updateSection('invoice', { design: value });
        toast({ title: 'Design Updated', description: `Invoice design set to ${value === 'classic' ? 'Thermal (Classic)' : 'A4 (Modern)'}.` });
    };

    // Scheme Dialog State
    const [isSchemeDialogOpen, setIsSchemeDialogOpen] = useState(false);
    const [editingScheme, setEditingScheme] = useState<InvoiceScheme | null>(null);
    const [schemeData, setSchemeData] = useState<Partial<InvoiceScheme>>(initialSchemeState);

    // Layout Dialog State
    const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false);
    const [editingLayout, setEditingLayout] = useState<InvoiceLayout | null>(null);
    const [layoutData, setLayoutData] = useState<Partial<InvoiceLayout>>(initialLayoutState);

    const infoCheckboxes = [
        { id: 'showLogo', label: 'Show logo' },
        { id: 'showBusinessName', label: 'Show business name' },
        { id: 'showLocationName', label: 'Show location name' },
        { id: 'showLandmark', label: 'Show landmark' },
        { id: 'showCity', label: 'Show city' },
        { id: 'showZipCode', label: 'Show zip code' },
        { id: 'showState', label: 'Show state' },
        { id: 'showCountry', label: 'Show country' },
        { id: 'showMobileNumber', label: 'Show mobile number' },
        { id: 'showAlternateNumber', label: 'Show alternate number' },
        { id: 'showEmail', label: 'Show email' },
        { id: 'showTax1', label: 'Show tax 1 details' },
        { id: 'showTax2', label: 'Show tax 2 details' },
        { id: 'showQrCode', label: 'Show QR code on invoice' },
    ] as const;

    // Scheme Handlers
    const handleAddSchemeClick = () => {
        setEditingScheme(null);
        setSchemeData(initialSchemeState);
        setIsSchemeDialogOpen(true);
    };

    const handleEditSchemeClick = (scheme: InvoiceScheme) => {
        setEditingScheme(scheme);
        setSchemeData(scheme);
        setIsSchemeDialogOpen(true);
    };

    const handleSaveScheme = () => {
        if (!schemeData.name || !schemeData.prefix) {
            toast({ title: "Error", description: "Name and Prefix are required.", variant: "destructive" });
            return;
        }

        if (editingScheme) {
            setSchemes(schemes.map(s => s.id === editingScheme.id ? { ...s, ...schemeData as InvoiceScheme } : s));
            toast({ title: "Success", description: "Invoice scheme updated." });
        } else {
            const newScheme: InvoiceScheme = { id: `scheme-${Date.now()}`, ...schemeData as InvoiceScheme };
            setSchemes([...schemes, newScheme]);
            toast({ title: "Success", description: "Invoice scheme added." });
        }
        setIsSchemeDialogOpen(false);
    };

    const handleDeleteScheme = (id: string) => {
        setSchemes(schemes.filter(s => s.id !== id));
        toast({ title: "Success", description: "Invoice scheme deleted." });
    };

    // Layout Handlers
    const handleAddLayoutClick = () => {
        setEditingLayout(null);
        setLayoutData(initialLayoutState);
        setIsLayoutDialogOpen(true);
    };

    const handleEditLayoutClick = (layout: InvoiceLayout) => {
        setEditingLayout(layout);
        setLayoutData(layout);
        setIsLayoutDialogOpen(true);
    };

    const handleSaveLayout = () => {
        if (!layoutData.name) {
            toast({ title: "Error", description: "Layout name is required.", variant: "destructive" });
            return;
        }

        if (editingLayout) {
            setLayouts(layouts.map(l => l.id === editingLayout.id ? { ...l, ...layoutData as InvoiceLayout } : l));
            toast({ title: "Success", description: "Invoice layout updated." });
        } else {
            const newLayout: InvoiceLayout = { id: `layout-${Date.now()}`, ...layoutData as InvoiceLayout };
            setLayouts([...layouts, newLayout]);
            toast({ title: "Success", description: "Invoice layout added." });
        }
        setIsLayoutDialogOpen(false);
    };

    const handleDeleteLayout = (id: string) => {
        setLayouts(layouts.filter(l => l.id !== id));
        toast({ title: "Success", description: "Invoice layout deleted." });
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Invoice Settings
            </h1>

            <Card className="border-l-4 border-l-primary/50">
                <CardHeader>
                    <CardTitle>Invoice Design</CardTitle>
                    <CardDescription>Choose the visual style for your invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className={`cursor-pointer border-2 rounded-lg p-4 w-40 text-center hover:bg-accent/50 transition-colors ${settings.invoice.design === 'classic' ? 'border-primary bg-accent/20' : 'border-dashed'}`} onClick={() => handleDesignChange('classic')}>
                            <div className="bg-gray-200 h-32 w-full mb-2 mx-auto rounded flex items-center justify-center text-xs text-gray-500">Thermal Receipt</div>
                            <h3 className="font-semibold">Classic (80mm)</h3>
                        </div>
                        <div className={`cursor-pointer border-2 rounded-lg p-4 w-40 text-center hover:bg-accent/50 transition-colors ${settings.invoice.design === 'modern' ? 'border-primary bg-accent/20' : 'border-dashed'}`} onClick={() => handleDesignChange('modern')}>
                            <div className="bg-white border border-gray-200 h-32 w-24 mb-2 mx-auto shadow-sm flex items-center justify-center text-xs text-gray-400">A4 Document</div>
                            <h3 className="font-semibold">Modern (A4)</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Invoice Schemes</CardTitle>
                        <Button size="sm" onClick={handleAddSchemeClick}><Plus className="mr-2 h-4 w-4" /> Add Scheme</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Prefix</TableHead><TableHead>Start From</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {schemes.map(scheme => (
                                <TableRow key={scheme.id}>
                                    <TableCell className="font-medium">{scheme.name} {scheme.isDefault && <Badge>Default</Badge>}</TableCell>
                                    <TableCell>{scheme.prefix}</TableCell>
                                    <TableCell>{scheme.startFrom}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditSchemeClick(scheme)}><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                                            <Button variant="outline" size="sm" className="h-8 text-red-600 hover:text-red-700" onClick={() => handleDeleteScheme(scheme.id)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice Customization</CardTitle>
                    <CardDescription>Customize the content and appearance of your invoices.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2"><Label>Invoice Heading</Label><Input value={settings.invoice.invoiceHeading} onChange={(e) => updateSection('invoice', { invoiceHeading: e.target.value })} /></div>
                        {/* Subheading lines can be added to global settings later if needed */}
                        <div className="space-y-2"><Label>Footer Text</Label><Textarea value={settings.invoice.footerText} onChange={(e) => updateSection('invoice', { footerText: e.target.value })} /></div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-medium mb-4">Invoice Info to Show</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {infoCheckboxes.map(info => (
                                <div key={info.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={info.id}
                                        checked={settings.invoice[info.id as keyof typeof settings.invoice] as boolean}
                                        onCheckedChange={(checked) => updateSection('invoice', { [info.id]: !!checked })}
                                    />
                                    <Label htmlFor={info.id} className="font-normal cursor-pointer">{info.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isSchemeDialogOpen} onOpenChange={setIsSchemeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingScheme ? 'Edit' : 'Add'} Invoice Scheme</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" value={schemeData.name} onChange={(e) => setSchemeData(s => ({ ...s, name: e.target.value }))} /></div>
                        <div className="space-y-2"><Label htmlFor="schemeType">Scheme type</Label>
                            <Select value={schemeData.schemeType} onValueChange={(val: 'blank' | 'year') => setSchemeData(s => ({ ...s, schemeType: val }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="blank">Blank</SelectItem><SelectItem value="year">Year</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-2"><Label htmlFor="prefix">Prefix *</Label><Input id="prefix" value={schemeData.prefix} onChange={(e) => setSchemeData(s => ({ ...s, prefix: e.target.value }))} /></div>
                        <div className="space-y-2"><Label htmlFor="startFrom">Start from</Label><Input id="startFrom" type="number" value={schemeData.startFrom} onChange={(e) => setSchemeData(s => ({ ...s, startFrom: parseInt(e.target.value) || 0 }))} /></div>
                        <div className="space-y-2"><Label htmlFor="totalDigits">Number of digits</Label>
                            <Select value={String(schemeData.totalDigits)} onValueChange={(val) => setSchemeData(s => ({ ...s, totalDigits: parseInt(val) }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: 7 }, (_, i) => i + 4).map(n => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}</SelectContent></Select>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveScheme}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
