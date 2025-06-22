'use client';
import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';

type SellingPriceGroup = {
  id: string;
  name: string;
  description: string;
};

const initialSellingPriceGroups: SellingPriceGroup[] = [
  { id: 'spg-1', name: 'Default Selling Price', description: 'Default selling price for all customers' },
  { id: 'spg-2', name: 'Wholesale', description: 'Special pricing for wholesale customers' },
];

export default function SellingPriceGroupPage() {
  const [groups, setGroups] = useState(initialSellingPriceGroups);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SellingPriceGroup | null>(null);
  const [editedGroupName, setEditedGroupName] = useState('');
  const [editedGroupDescription, setEditedGroupDescription] = useState('');


  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: SellingPriceGroup = {
        id: `spg-${Date.now()}`,
        name: newGroupName,
        description: newGroupDescription,
      };
      setGroups([...groups, newGroup]);
      setIsAddDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
    }
  };
  
  const handleEditClick = (group: SellingPriceGroup) => {
    setEditingGroup(group);
    setEditedGroupName(group.name);
    setEditedGroupDescription(group.description);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateGroup = () => {
    if (editingGroup && editedGroupName.trim()) {
        const updatedGroups = groups.map(g => 
            g.id === editingGroup.id 
            ? { ...g, name: editedGroupName, description: editedGroupDescription } 
            : g
        );
        setGroups(updatedGroups);
        setIsEditDialogOpen(false);
        setEditingGroup(null);
    }
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };


  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <Users className="w-8 h-8" />
        Selling Price Groups
      </h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>All Selling Price Groups</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>Add Selling Price Group</DialogTitle>
                      <DialogDescription>
                        Create a new price group to assign custom prices to products.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="group-name">Name *</Label>
                          <Input 
                            id="group-name" 
                            placeholder="Group Name" 
                            required 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="group-description">Description</Label>
                          <Textarea 
                            id="group-description" 
                            placeholder="Describe the purpose of this group."
                            value={newGroupDescription}
                            onChange={(e) => setNewGroupDescription(e.target.value)}
                          />
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleAddGroup}>Save</Button>
                      <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="pt-2">
            Manage your selling price groups. You can activate selling price groups for products from the "Add/Edit Product" screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[180px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditClick(group)}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteGroup(group.id)}>
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
                Showing <strong>1 to {groups.length}</strong> of <strong>{groups.length}</strong> entries
            </div>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Selling Price Group</DialogTitle>
                <DialogDescription>
                  Update the name and description for this price group.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-group-name">Name *</Label>
                    <Input 
                      id="edit-group-name" 
                      placeholder="Group Name" 
                      required 
                      value={editedGroupName}
                      onChange={(e) => setEditedGroupName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-group-description">Description</Label>
                    <Textarea 
                      id="edit-group-description" 
                      placeholder="Describe the purpose of this group."
                      value={editedGroupDescription}
                      onChange={(e) => setEditedGroupDescription(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleUpdateGroup}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
