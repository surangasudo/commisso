
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Barcode, Plus, Pencil, Trash2, Info } from "lucide-react";
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type StickerSetting = {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  stickersPerRow: number;
  isDefault: boolean;
};

const initialStickerSettings: StickerSetting[] = [
  { id: 'ss-1', name: 'Default', description: 'Default sticker setting', width: 2.5, height: 1, stickersPerRow: 4, isDefault: true },
  { id: 'ss-2', name: 'Large Product Label', description: 'For larger products', width: 4, height: 2, stickersPerRow: 2, isDefault: false },
];

const initialFormState = {
    name: '',
    description: '',
    width: '',
    height: '',
    topMargin: '0',
    leftMargin: '0',
    paperWidth: '8.5',
    paperHeight: '11',
    stickersPerRow: '4',
    rowDistance: '0',
    colDistance: '0',
    stickersPerSheet: '24',
    showProductName: true,
    showBusinessName: true,
    showPrice: true,
    showBarcode: true,
};

export default function BarcodeSettingsPage() {
  const { toast } = useToast();
  const [stickerSettings, setStickerSettings] = useState(initialStickerSettings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<StickerSetting | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddClick = () => {
    setEditingSetting(null);
    setFormData(initialFormState);
    setIsDialogOpen(true);
  };
  
  const handleEditClick = (setting: StickerSetting) => {
    setEditingSetting(setting);
    // In a real app, you'd populate formData with all the detailed settings
    setFormData({
      ...initialFormState,
      name: setting.name,
      description: setting.description,
      width: String(setting.width),
      height: String(setting.height),
      stickersPerRow: String(setting.stickersPerRow),
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.width || !formData.height) {
        toast({ title: "Error", description: "Name, Width, and Height are required.", variant: "destructive" });
        return;
    }
    
    if (editingSetting) {
        setStickerSettings(stickerSettings.map(s => s.id === editingSetting.id ? {
            ...s,
            name: formData.name,
            description: formData.description,
            width: Number(formData.width),
            height: Number(formData.height),
            stickersPerRow: Number(formData.stickersPerRow)
        } : s));
        toast({ title: "Success", description: "Sticker setting updated." });
    } else {
        const newSetting: StickerSetting = {
            id: `ss-${Date.now()}`,
            name: formData.name,
            description: formData.description,
            width: Number(formData.width),
            height: Number(formData.height),
            stickersPerRow: Number(formData.stickersPerRow),
            isDefault: false
        };
        setStickerSettings([...stickerSettings, newSetting]);
        toast({ title: "Success", description: "Sticker setting added." });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setStickerSettings(stickerSettings.filter(s => s.id !== id && !s.isDefault));
    toast({ title: "Success", description: "Sticker setting deleted." });
  };
  
  const setAsDefault = (id: string) => {
      setStickerSettings(stickerSettings.map(s => ({ ...s, isDefault: s.id === id })));
      toast({ title: "Success", description: "Default sticker setting updated." });
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Barcode className="w-8 h-8" />
          Barcode Settings
        </h1>
        
        <Card>
            <CardHeader>
                <CardTitle>Barcode Type</CardTitle>
            </CardHeader>
             <CardContent>
                <div className="max-w-sm space-y-2">
                    <Label htmlFor="barcode-type">Barcode Type</Label>
                    <Select defaultValue="C128">
                        <SelectTrigger id="barcode-type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="C128">Code 128 (C128)</SelectItem>
                            <SelectItem value="C39">Code 39 (C39)</SelectItem>
                            <SelectItem value="EAN13">EAN-13</SelectItem>
                            <SelectItem value="UPCA">UPC-A</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Barcode Sticker Settings</CardTitle>
                    <Button size="sm" onClick={handleAddClick}><Plus className="mr-2 h-4 w-4" /> Add Sticker Setting</Button>
                </div>
                <CardDescription>
                    Manage your barcode sticker layouts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Stickers per Row</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stickerSettings.map(setting => (
                            <TableRow key={setting.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                  {setting.name}
                                  {setting.isDefault && <Badge>Default</Badge>}
                                </TableCell>
                                <TableCell>{setting.description}</TableCell>
                                <TableCell>{setting.stickersPerRow}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditClick(setting)}><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                                        {!setting.isDefault && <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(setting.id)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>}
                                        {!setting.isDefault && <Button variant="outline" size="sm" className="h-8" onClick={() => setAsDefault(setting.id)}>Set as Default</Button>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{editingSetting ? 'Edit' : 'Add'} Sticker Setting</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh]">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="setting-name">Setting Name *</Label>
                                    <Input id="setting-name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="setting-description">Setting Description</Label>
                                    <Input id="setting-description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                                </div>
                            </div>

                            <Separator/>
                             <h4 className="font-medium">Information to show in Labels:</h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="showProductName" checked={formData.showProductName} onCheckedChange={(c) => handleInputChange('showProductName', !!c)} />
                                    <Label htmlFor="showProductName" className="font-normal">Product Name</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="showBusinessName" checked={formData.showBusinessName} onCheckedChange={(c) => handleInputChange('showBusinessName', !!c)} />
                                    <Label htmlFor="showBusinessName" className="font-normal">Business Name</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="showPrice" checked={formData.showPrice} onCheckedChange={(c) => handleInputChange('showPrice', !!c)} />
                                    <Label htmlFor="showPrice" className="font-normal">Product Price</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="showBarcode" checked={formData.showBarcode} onCheckedChange={(c) => handleInputChange('showBarcode', !!c)} />
                                    <Label htmlFor="showBarcode" className="font-normal">Barcode</Label>
                                </div>
                             </div>

                             <Separator />
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                 <div className="space-y-2">
                                    <Label htmlFor="width">Sticker Width (in) *</Label>
                                    <Input id="width" type="number" value={formData.width} onChange={(e) => handleInputChange('width', e.target.value)} />
                                 </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="height">Sticker Height (in) *</Label>
                                    <Input id="height" type="number" value={formData.height} onChange={(e) => handleInputChange('height', e.target.value)} />
                                 </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="stickersPerSheet">Stickers per sheet *</Label>
                                    <Input id="stickersPerSheet" type="number" value={formData.stickersPerSheet} onChange={(e) => handleInputChange('stickersPerSheet', e.target.value)} />
                                 </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="stickersPerRow">Stickers per row *</Label>
                                    <Input id="stickersPerRow" type="number" value={formData.stickersPerRow} onChange={(e) => handleInputChange('stickersPerRow', e.target.value)} />
                                 </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="paperWidth">Paper Width (in)</Label>
                                    <Input id="paperWidth" type="number" value={formData.paperWidth} onChange={(e) => handleInputChange('paperWidth', e.target.value)} />
                                 </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="paperHeight">Paper Height (in)</Label>
                                    <Input id="paperHeight" type="number" value={formData.paperHeight} onChange={(e) => handleInputChange('paperHeight', e.target.value)} />
                                 </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="topMargin">Top Margin (in)</Label>
                                    <Input id="topMargin" type="number" value={formData.topMargin} onChange={(e) => handleInputChange('topMargin', e.target.value)} />
                                 </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="leftMargin">Left Margin (in)</Label>
                                    <Input id="leftMargin" type="number" value={formData.leftMargin} onChange={(e) => handleInputChange('leftMargin', e.target.value)} />
                                 </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="rowDistance">Row Distance (in)</Label>
                                    <Input id="rowDistance" type="number" value={formData.rowDistance} onChange={(e) => handleInputChange('rowDistance', e.target.value)} />
                                 </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="colDistance">Column Distance (in)</Label>
                                    <Input id="colDistance" type="number" value={formData.colDistance} onChange={(e) => handleInputChange('colDistance', e.target.value)} />
                                 </div>
                             </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

    </TooltipProvider>
  );
}
