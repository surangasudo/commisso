'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Ruler, Plus, Pencil, Trash2 } from "lucide-react";
import React, { useState } from 'react';

type Unit = {
  id: string;
  name: string;
  shortName: string;
  allowDecimal: boolean;
};

const initialUnits: Unit[] = [
  { id: 'unit-1', name: 'Pieces', shortName: 'Pcs', allowDecimal: false },
  { id: 'unit-2', name: 'Kilogram', shortName: 'Kg', allowDecimal: true },
  { id: 'unit-3', name: 'Box', shortName: 'Box', allowDecimal: false },
];


export default function UnitsPage() {
  const [units, setUnits] = useState(initialUnits);
  
  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitShortName, setNewUnitShortName] = useState('');
  const [newUnitAllowDecimal, setNewUnitAllowDecimal] = useState(false);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editedUnitName, setEditedUnitName] = useState('');
  const [editedUnitShortName, setEditedUnitShortName] = useState('');
  const [editedUnitAllowDecimal, setEditedUnitAllowDecimal] = useState(false);
  
  const handleAddUnit = () => {
    if (newUnitName.trim() && newUnitShortName.trim()) {
      const newUnit: Unit = {
        id: `unit-${Date.now()}`,
        name: newUnitName,
        shortName: newUnitShortName,
        allowDecimal: newUnitAllowDecimal,
      };
      setUnits([...units, newUnit]);
      setIsAddDialogOpen(false);
      setNewUnitName('');
      setNewUnitShortName('');
      setNewUnitAllowDecimal(false);
    }
  };
  
  const handleEditClick = (unit: Unit) => {
    setEditingUnit(unit);
    setEditedUnitName(unit.name);
    setEditedUnitShortName(unit.shortName);
    setEditedUnitAllowDecimal(unit.allowDecimal);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateUnit = () => {
    if (editingUnit && editedUnitName.trim() && editedUnitShortName.trim()) {
        const updatedUnits = units.map(u => 
            u.id === editingUnit.id 
            ? { ...u, name: editedUnitName, shortName: editedUnitShortName, allowDecimal: editedUnitAllowDecimal } 
            : u
        );
        setUnits(updatedUnits);
        setIsEditDialogOpen(false);
        setEditingUnit(null);
    }
  };

  const handleDeleteUnit = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
  };


  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Ruler className="w-8 h-8" />
        Units
      </h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>All Units</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>Add Unit</DialogTitle>
                      <DialogDescription>
                        Create a new unit of measurement for your products.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="unit-name">Name *</Label>
                          <Input 
                            id="unit-name" 
                            placeholder="e.g. Kilogram" 
                            required 
                            value={newUnitName}
                            onChange={(e) => setNewUnitName(e.target.value)}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="unit-short-name">Short name *</Label>
                          <Input 
                            id="unit-short-name" 
                            placeholder="e.g. Kg" 
                            required 
                            value={newUnitShortName}
                            onChange={(e) => setNewUnitShortName(e.target.value)}
                          />
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                          <Checkbox 
                            id="allow-decimal" 
                            checked={newUnitAllowDecimal} 
                            onCheckedChange={(checked) => setNewUnitAllowDecimal(!!checked)} 
                          />
                          <Label htmlFor="allow-decimal" className="font-normal">Allow decimal</Label>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleAddUnit}>Save</Button>
                      <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="pt-2">
            Manage units for your products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Short name</TableHead>
                  <TableHead>Allow decimal</TableHead>
                  <TableHead className="w-[180px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>{unit.shortName}</TableCell>
                    <TableCell>{unit.allowDecimal ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(unit)}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteUnit(unit.id)}>
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
                Showing <strong>1 to {units.length}</strong> of <strong>{units.length}</strong> entries
            </div>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Unit</DialogTitle>
                <DialogDescription>
                  Update the details for this unit of measurement.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-unit-name">Name *</Label>
                    <Input 
                      id="edit-unit-name" 
                      placeholder="e.g. Kilogram" 
                      required 
                      value={editedUnitName}
                      onChange={(e) => setEditedUnitName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-unit-short-name">Short name *</Label>
                    <Input 
                      id="edit-unit-short-name" 
                      placeholder="e.g. Kg" 
                      required 
                      value={editedUnitShortName}
                      onChange={(e) => setEditedUnitShortName(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                        id="edit-allow-decimal" 
                        checked={editedUnitAllowDecimal} 
                        onCheckedChange={(checked) => setEditedUnitAllowDecimal(!!checked)} 
                    />
                    <Label htmlFor="edit-allow-decimal" className="font-normal">Allow decimal</Label>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleUpdateUnit}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
