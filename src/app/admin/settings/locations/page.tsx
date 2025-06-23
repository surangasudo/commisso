'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Pencil, Trash2, Power, Eye, Check } from "lucide-react";
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
import { businessLocations as initialLocations, type BusinessLocation } from '@/lib/data';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BusinessLocationsPage() {
  const [locations, setLocations] = useState(initialLocations.map(loc => ({ ...loc, isActive: true })));
  
  // Add/Edit dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<(BusinessLocation & { isActive: boolean }) | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessLocation>>({});

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<(BusinessLocation & { isActive: boolean }) | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value }));
  }

  const handleAddClick = () => {
    setEditingLocation(null);
    setFormData({
        name: '',
        locationId: '',
        landmark: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        mobile: '',
        email: '',
        website: '',
    });
    setIsFormDialogOpen(true);
  };
  
  const handleEditClick = (location: BusinessLocation & { isActive: boolean }) => {
    setEditingLocation(location);
    setFormData(location);
    setIsFormDialogOpen(true);
  };
  
  const handleSaveLocation = () => {
      if (!formData.name) {
          // Add validation feedback
          alert("Location Name is required.");
          return;
      }

      if (editingLocation) {
          // Update existing location
          setLocations(locations.map(loc => 
              loc.id === editingLocation.id ? { ...editingLocation, ...formData as BusinessLocation } : loc
          ));
      } else {
          // Add new location
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
    <>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <MapPin className="w-8 h-8" />
          Business Locations
        </h1>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>All business locations</CardTitle>
              <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto" onClick={handleAddClick}>
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
              </Button>
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
                    <TableHead>Mobile</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[240px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.locationId}</TableCell>
                      <TableCell>{location.landmark}</TableCell>
                      <TableCell>{location.city}</TableCell>
                      <TableCell>{location.mobile}</TableCell>
                      <TableCell>{location.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(location)}>
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(location)}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
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
                <DialogTitle>{editingLocation ? 'Edit' : 'Add'} Business Location</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="name">Location Name *</Label>
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
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Email" value={formData.email || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="Website" value={formData.website || ''} onChange={handleInputChange} />
                  </div>
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
    </>
  );
}
