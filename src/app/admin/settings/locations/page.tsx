'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Pencil, Power, Eye, Check, Info, Search } from "lucide-react";
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { businessLocations as initialLocations, type BusinessLocation, type PaymentOption } from '@/lib/data';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const defaultPaymentOptions: PaymentOption[] = [
    { method: 'Cash', enabled: true },
    { method: 'Card', enabled: true },
    { method: 'Cheque', enabled: true },
    { method: 'Bank Transfer', enabled: true },
    { method: 'Other', enabled: true },
    { method: 'Custom Payment 1', enabled: false },
    { method: 'Custom Payment 2', enabled: false },
    { method: 'Custom Payment 3', enabled: false },
    { method: 'Custom Payment 4', enabled: false },
    { method: 'Custom Payment 5', enabled: false },
    { method: 'Custom Payment 6', enabled: false },
    { method: 'Custom Payment 7', enabled: false },
];

const initialFormData: Partial<BusinessLocation> = {
    name: '',
    locationId: '',
    landmark: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    mobile: '',
    alternateContactNumber: '',
    email: '',
    website: '',
    invoiceSchemeForPos: '',
    invoiceSchemeForSale: '',
    invoiceLayoutForPos: '',
    invoiceLayoutForSale: '',
    defaultSellingPriceGroup: '',
    customField1: '',
    customField2: '',
    customField3: '',
    customField4: '',
    posFeaturedProducts: '',
    paymentOptions: defaultPaymentOptions,
};


export default function BusinessLocationsPage() {
  const [locations, setLocations] = useState(initialLocations.map(loc => ({ ...loc, isActive: true })));
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<(BusinessLocation & { isActive: boolean }) | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessLocation>>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<(BusinessLocation & { isActive: boolean }) | null>(null);
  
  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.locationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value }));
  }

   const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };
  
  const handlePaymentOptionChange = (method: string, field: 'enabled' | 'defaultAccount', value: boolean | string) => {
      setFormData(prev => ({
          ...prev,
          paymentOptions: prev.paymentOptions?.map(opt => 
              opt.method === method ? { ...opt, [field]: value } : opt
          )
      }));
  }

  const handleAddClick = () => {
    setEditingLocation(null);
    setFormData(initialFormData);
    setIsFormDialogOpen(true);
  };
  
  const handleEditClick = (location: BusinessLocation & { isActive: boolean }) => {
    setEditingLocation(location);
    setFormData({
        ...location,
        paymentOptions: location.paymentOptions || defaultPaymentOptions,
    });
    setIsFormDialogOpen(true);
  };
  
  const handleSaveLocation = () => {
      if (!formData.name) {
          alert("Location Name is required.");
          return;
      }

      if (editingLocation) {
          setLocations(locations.map(loc => 
              loc.id === editingLocation.id ? { ...editingLocation, ...formData as BusinessLocation } : loc
          ));
      } else {
          const newLocation = {
              id: `loc-${Date.now()}`,
              isActive: true,
              ...formData
          } as BusinessLocation & { isActive: boolean };
          setLocations([...locations, newLocation]);
      }
      setIsFormDialogOpen(false);
      setEditingLocation(null);
  };

  const handleDeleteClick = (location: BusinessLocation & { isActive: boolean }) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (locationToDelete) {
      setLocations(locations.filter(loc => loc.id !== locationToDelete.id));
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    }
  };

  const toggleActivation = (id: string) => {
    setLocations(locations.map(loc => 
        loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
    ));
  };
  
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <MapPin className="w-8 h-8" />
          Business Locations
        </h1>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>All business locations</CardTitle>
               <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto" onClick={handleAddClick}>
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </Button>
              </div>
            </div>
            <CardDescription className="pt-2">
              Manage your business locations, warehouses, or shops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location ID</TableHead>
                    <TableHead>Landmark</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Invoice layout for sale</TableHead>
                    <TableHead className="w-[300px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.locationId}</TableCell>
                      <TableCell>{location.landmark}</TableCell>
                      <TableCell>{location.city}</TableCell>
                      <TableCell>{location.invoiceLayoutForSale || 'Default'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(location)}>
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-cyan-600 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700" onClick={() => alert('Settings page for this location is not yet implemented.')}>
                             <Eye className="mr-1 h-3 w-3" /> Settings
                          </Button>
                           <Button variant="outline" size="sm" className={`h-8 ${location.isActive ? 'text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700' : 'text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700'}`} onClick={() => toggleActivation(location.id)}>
                            {location.isActive ? <Power className="mr-1 h-3 w-3" /> : <Check className="mr-1 h-3 w-3" />}
                            {location.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
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
                  Showing <strong>1 to {locations.length}</strong> of <strong>{locations.length}</strong> entries
              </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>{editingLocation ? 'Edit' : 'Add'} a new business location</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" placeholder="Name" value={formData.name || ''} onChange={handleInputChange} />
                  </div>
                   <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="locationId">Location ID</Label>
                    <Input id="locationId" placeholder="Location ID" value={formData.locationId || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input id="landmark" placeholder="Landmark" value={formData.landmark || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="City" value={formData.city || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input id="zipCode" placeholder="Zip Code" value={formData.zipCode || ''} onChange={handleInputChange} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" placeholder="State" value={formData.state || ''} onChange={handleInputChange} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" placeholder="Country" value={formData.country || ''} onChange={handleInputChange} />
                  </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input id="mobile" placeholder="Mobile" value={formData.mobile || ''} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="alternateContactNumber">Alternate contact number</Label>
                        <Input id="alternateContactNumber" placeholder="Alternate contact number" value={formData.alternateContactNumber || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Email" value={formData.email || ''} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" placeholder="Website" value={formData.website || ''} onChange={handleInputChange} />
                    </div>
                </div>
                 <Separator />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="invoiceSchemeForPos">Invoice scheme for POS *</Label>
                        <Select value={formData.invoiceSchemeForPos} onValueChange={(value) => handleSelectChange('invoiceSchemeForPos', value)}><SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="invoiceSchemeForSale">Invoice scheme for sale *</Label>
                        <Select value={formData.invoiceSchemeForSale} onValueChange={(value) => handleSelectChange('invoiceSchemeForSale', value)}><SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="invoiceLayoutForPos" className="flex items-center gap-1">Invoice layout for POS * <Info className="w-3 h-3 text-muted-foreground"/></Label>
                        <Select value={formData.invoiceLayoutForPos} onValueChange={(value) => handleSelectChange('invoiceLayoutForPos', value)}><SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="invoiceLayoutForSale" className="flex items-center gap-1">Invoice layout for sale * <Info className="w-3 h-3 text-muted-foreground"/></Label>
                        <Select value={formData.invoiceLayoutForSale} onValueChange={(value) => handleSelectChange('invoiceLayoutForSale', value)}><SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem></SelectContent></Select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="defaultSellingPriceGroup" className="flex items-center gap-1">Default Selling Price Group <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Select value={formData.defaultSellingPriceGroup} onValueChange={(value) => handleSelectChange('defaultSellingPriceGroup', value)}><SelectTrigger><SelectValue placeholder="Please Select"/></SelectTrigger><SelectContent><SelectItem value="default">Default Selling Price</SelectItem></SelectContent></Select>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2"><Label htmlFor="customField1">Custom field 1</Label><Input id="customField1" value={formData.customField1 || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="customField2">Custom field 2</Label><Input id="customField2" value={formData.customField2 || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="customField3">Custom field 3</Label><Input id="customField3" value={formData.customField3 || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="customField4">Custom field 4</Label><Input id="customField4" value={formData.customField4 || ''} onChange={handleInputChange} /></div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="posFeaturedProducts" className="flex items-center gap-1">POS screen Featured Products <Info className="w-3 h-3 text-muted-foreground"/></Label>
                    <Input id="posFeaturedProducts" placeholder="Search for products" value={formData.posFeaturedProducts || ''} onChange={handleInputChange}/>
                </div>
                <Separator/>
                <div>
                     <h3 className="font-semibold flex items-center gap-1">Payment Options: <Info className="w-3 h-3 text-muted-foreground"/></h3>
                     <Table className="mt-2">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Enable</TableHead>
                                <TableHead>Default Account <Info className="w-3 h-3 text-muted-foreground inline-block"/></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.paymentOptions?.map(opt => (
                                <TableRow key={opt.method}>
                                    <TableCell>{opt.method}</TableCell>
                                    <TableCell><Checkbox checked={opt.enabled} onCheckedChange={(checked) => handlePaymentOptionChange(opt.method, 'enabled', !!checked)} /></TableCell>
                                    <TableCell>
                                        <Select disabled={!opt.enabled} value={opt.defaultAccount} onValueChange={(value) => handlePaymentOptionChange(opt.method, 'defaultAccount', value)}>
                                            <SelectTrigger><SelectValue placeholder="None"/></SelectTrigger>
                                            <SelectContent><SelectItem value="none">None</SelectItem></SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
                <Button onClick={handleSaveLocation}>Save</Button>
                <Button variant="secondary" onClick={() => setIsFormDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the location
              "{locationToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLocationToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
