
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Plus, Pencil, Trash2, Info } from "lucide-react";
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type ConnectionType = 'Network' | 'Bluetooth' | 'USB' | 'Printer';

type ReceiptPrinter = {
  id: string;
  name: string;
  connectionType: ConnectionType;
  capabilityProfile: 'Default' | 'Simple';
  charPerLine: number;
  ipAddress?: string;
  port?: number;
  path?: string;
};

const initialPrinters: ReceiptPrinter[] = [
  { id: 'p-1', name: 'Cashier Printer (Epson TM-T88V)', connectionType: 'Network', capabilityProfile: 'Default', charPerLine: 42, ipAddress: '192.168.1.100', port: 9100 },
  { id: 'p-2', name: 'Kitchen Printer (Generic)', connectionType: 'Network', capabilityProfile: 'Simple', charPerLine: 32, ipAddress: '192.168.1.101', port: 9100 },
  { id: 'p-3', name: 'Browser-based printing', connectionType: 'Printer', capabilityProfile: 'Default', charPerLine: 42 },
];

const initialFormData: Omit<ReceiptPrinter, 'id'> = {
    name: 'Cashier Printer',
    connectionType: 'Network',
    capabilityProfile: 'Default',
    charPerLine: 42,
    ipAddress: '192.168.0.100',
    port: 9100,
    path: ''
};

export default function ReceiptPrintersPage() {
  const { toast } = useToast();
  const [printers, setPrinters] = useState(initialPrinters);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [editingPrinter, setEditingPrinter] = useState<ReceiptPrinter | null>(null);
  const [formData, setFormData] = useState<Omit<ReceiptPrinter, 'id'>>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseInt(value) || 0 : value }));
  };

  const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({...prev, [field]: value as any}));
  };

  const handleAddClick = () => {
    setEditingPrinter(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };
  
  const handleEditClick = (printer: ReceiptPrinter) => {
    setEditingPrinter(printer);
    setFormData(printer);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.connectionType || !formData.charPerLine) {
        toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
        return;
    }
    
    if (editingPrinter) {
        setPrinters(printers.map(p => p.id === editingPrinter.id ? { ...p, ...formData } : p));
        toast({ title: "Success", description: "Printer updated successfully." });
    } else {
        const newPrinter: ReceiptPrinter = {
            id: `p-${Date.now()}`,
            ...formData
        };
        setPrinters([...printers, newPrinter]);
        toast({ title: "Success", description: "Printer added successfully." });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPrinters(printers.filter(p => p.id !== id));
    toast({ title: "Success", description: "Printer deleted." });
  };
  
  return (
      <TooltipProvider>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Printer className="w-8 h-8" />
          Receipt Printers
        </h1>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>All Receipt Printers</CardTitle>
                    <Button size="sm" onClick={handleAddClick}><Plus className="mr-2 h-4 w-4" /> Add new printer</Button>
                </div>
                <CardDescription>
                    Manage all your receipt printers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Printer Name</TableHead>
                                <TableHead>Connection Type</TableHead>
                                <TableHead>Character Per Line</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Port</TableHead>
                                <TableHead>Path</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {printers.map(printer => (
                                <TableRow key={printer.id}>
                                    <TableCell className="font-medium">{printer.name}</TableCell>
                                    <TableCell>{printer.connectionType}</TableCell>
                                    <TableCell>{printer.charPerLine}</TableCell>
                                    <TableCell>{printer.ipAddress || 'N/A'}</TableCell>
                                    <TableCell>{printer.port || 'N/A'}</TableCell>
                                    <TableCell>{printer.path || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-8" onClick={() => handleEditClick(printer)}><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                                            <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(printer.id)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
             <CardFooter>
              <div className="text-xs text-muted-foreground">
                  Showing <strong>1 to {printers.length}</strong> of <strong>{printers.length}</strong> entries
              </div>
          </CardFooter>
        </Card>
      

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingPrinter ? 'Edit' : 'Add'} Printer</DialogTitle>
                         <DialogDescription>
                            Configure the details of the receipt printer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Printer Name *</Label>
                                <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Cashier Printer"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="connectionType">Connection Type *</Label>
                                <Select value={formData.connectionType} onValueChange={(value: ConnectionType) => handleSelectChange('connectionType', value)}>
                                    <SelectTrigger id="connectionType"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Network">Network</SelectItem>
                                        <SelectItem value="Bluetooth">Bluetooth</SelectItem>
                                        <SelectItem value="USB">USB</SelectItem>
                                        <SelectItem value="Printer">Printer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capabilityProfile">Capability Profile *</Label>
                                <Select value={formData.capabilityProfile} onValueChange={(value: 'Default' | 'Simple') => handleSelectChange('capabilityProfile', value)}>
                                    <SelectTrigger id="capabilityProfile"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Default">Default</SelectItem>
                                        <SelectItem value="Simple">Simple</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="charPerLine">Characters Per Line *</Label>
                                <Input id="charPerLine" type="number" value={formData.charPerLine} onChange={handleInputChange} placeholder="e.g., 42"/>
                            </div>
                        </div>
                        
                        {(formData.connectionType === 'Network') && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="ipAddress">IP Address *</Label>
                                    <Input id="ipAddress" value={formData.ipAddress || ''} onChange={handleInputChange} placeholder="e.g., 192.168.1.123"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="port">Port *</Label>
                                    <Input id="port" type="number" value={formData.port || 9100} onChange={handleInputChange}/>
                                </div>
                             </div>
                        )}
                        
                        {(formData.connectionType === 'Printer' || formData.connectionType === 'USB') && (
                            <div className="pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="path">Path *</Label>
                                    <Input id="path" value={formData.path || ''} onChange={handleInputChange} placeholder={formData.connectionType === 'USB' ? 'e.g., /dev/usb/lp0' : 'e.g., /dev/lp0'}/>
                                    <p className="text-xs text-muted-foreground">
                                        For parallel port on Linux, the path is typically <code>/dev/lp0</code>. For USB, it could be <code>/dev/usb/lp0</code>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
      </div>
      </TooltipProvider>
  );
}
