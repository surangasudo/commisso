'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";

type DurationType = 'Days' | 'Months' | 'Years';

type Warranty = {
  id: string;
  name: string;
  description: string;
  duration: number;
  durationType: DurationType;
};

const initialWarranties: Warranty[] = [
  { id: 'war-1', name: 'Standard Warranty', description: '1-year standard warranty for all parts.', duration: 1, durationType: 'Years' },
  { id: 'war-2', name: 'Extended Protection', description: '3-year extended warranty, includes accidental damage.', duration: 3, durationType: 'Years' },
  { id: 'war-3', name: '90-Day Limited', description: '90-day warranty for refurbished items.', duration: 90, durationType: 'Days' },
];

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState(initialWarranties);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWarrantyName, setNewWarrantyName] = useState('');
  const [newWarrantyDescription, setNewWarrantyDescription] = useState('');
  const [newWarrantyDuration, setNewWarrantyDuration] = useState<number | ''>('');
  const [newWarrantyDurationType, setNewWarrantyDurationType] = useState<DurationType>('Months');

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  const [editedWarrantyName, setEditedWarrantyName] = useState('');
  const [editedWarrantyDescription, setEditedWarrantyDescription] = useState('');
  const [editedWarrantyDuration, setEditedWarrantyDuration] = useState<number | ''>('');
  const [editedWarrantyDurationType, setEditedWarrantyDurationType] = useState<DurationType>('Months');

  const handleAddWarranty = () => {
    if (newWarrantyName.trim() && newWarrantyDuration) {
      const newWarranty: Warranty = {
        id: `war-${Date.now()}`,
        name: newWarrantyName,
        description: newWarrantyDescription,
        duration: newWarrantyDuration,
        durationType: newWarrantyDurationType,
      };
      setWarranties([...warranties, newWarranty]);
      setIsAddDialogOpen(false);
      setNewWarrantyName('');
      setNewWarrantyDescription('');
      setNewWarrantyDuration('');
      setNewWarrantyDurationType('Months');
    }
  };
  
  const handleEditClick = (warranty: Warranty) => {
    setEditingWarranty(warranty);
    setEditedWarrantyName(warranty.name);
    setEditedWarrantyDescription(warranty.description);
    setEditedWarrantyDuration(warranty.duration);
    setEditedWarrantyDurationType(warranty.durationType);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateWarranty = () => {
    if (editingWarranty && editedWarrantyName.trim() && editedWarrantyDuration) {
        const updatedWarranties = warranties.map(w => 
            w.id === editingWarranty.id 
            ? { ...w, name: editedWarrantyName, description: editedWarrantyDescription, duration: editedWarrantyDuration, durationType: editedWarrantyDurationType } 
            : w
        );
        setWarranties(updatedWarranties);
        setIsEditDialogOpen(false);
        setEditingWarranty(null);
    }
  };

  const handleDeleteWarranty = (id: string) => {
    setWarranties(warranties.filter(w => w.id !== id));
  };
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <ShieldCheck className="w-8 h-8" />
        Warranties
      </h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>All Warranties</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                      <DialogTitle>Add Warranty</DialogTitle>
                      <DialogDescription>
                        Create a new warranty policy for your products.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="warranty-name">Name *</Label>
                          <Input 
                            id="warranty-name" 
                            placeholder="Warranty Name" 
                            required 
                            value={newWarrantyName}
                            onChange={(e) => setNewWarrantyName(e.target.value)}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="warranty-description">Description</Label>
                          <Textarea
                            id="warranty-description"
                            placeholder="Describe the warranty policy"
                            value={newWarrantyDescription}
                            onChange={(e) => setNewWarrantyDescription(e.target.value)}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label>Duration</Label>
                          <div className="flex gap-2">
                            <Input
                                id="warranty-duration"
                                type="number"
                                placeholder="e.g., 12"
                                value={newWarrantyDuration}
                                onChange={(e) => setNewWarrantyDuration(parseInt(e.target.value) || '')}
                                className="w-full"
                            />
                            <Select value={newWarrantyDurationType} onValueChange={(value: DurationType) => setNewWarrantyDurationType(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Days">Days</SelectItem>
                                    <SelectItem value="Months">Months</SelectItem>
                                    <SelectItem value="Years">Years</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleAddWarranty}>Save</Button>
                      <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="pt-2">
            Manage your product warranties here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-[180px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warranties.map((warranty) => (
                  <TableRow key={warranty.id}>
                    <TableCell className="font-medium">{warranty.name}</TableCell>
                    <TableCell>{warranty.description}</TableCell>
                    <TableCell>{warranty.duration} {warranty.durationType}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(warranty)}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteWarranty(warranty.id)}>
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
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
                Showing <strong>1 to {warranties.length}</strong> of <strong>{warranties.length}</strong> entries
            </div>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Edit Warranty</DialogTitle>
                <DialogDescription>
                  Update the details for this warranty policy.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="edit-warranty-name">Name *</Label>
                    <Input 
                      id="edit-warranty-name" 
                      placeholder="Warranty Name" 
                      required 
                      value={editedWarrantyName}
                      onChange={(e) => setEditedWarrantyName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-warranty-description">Description</Label>
                    <Textarea
                      id="edit-warranty-description"
                      placeholder="Describe the warranty policy"
                      value={editedWarrantyDescription}
                      onChange={(e) => setEditedWarrantyDescription(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="flex gap-2">
                      <Input
                          id="edit-warranty-duration"
                          type="number"
                          placeholder="e.g., 12"
                          value={editedWarrantyDuration}
                          onChange={(e) => setEditedWarrantyDuration(parseInt(e.target.value) || '')}
                          className="w-full"
                      />
                      <Select value={editedWarrantyDurationType} onValueChange={(value: DurationType) => setEditedWarrantyDurationType(value)}>
                          <SelectTrigger className="w-[180px]">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Days">Days</SelectItem>
                              <SelectItem value="Months">Months</SelectItem>
                              <SelectItem value="Years">Years</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleUpdateWarranty}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
