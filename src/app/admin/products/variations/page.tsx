'use client';
import React, { useState } from 'react';
import {
  GitCommitHorizontal,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
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
import { Badge } from '@/components/ui/badge';
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
import { variations as initialVariations, type Variation } from '@/lib/data';

export default function VariationsPage() {
  const [variations, setVariations] = useState(initialVariations);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVariationName, setNewVariationName] = useState('');
  const [newVariationValues, setNewVariationValues] = useState('');

  const handleAddVariation = () => {
    if (newVariationName.trim() && newVariationValues.trim()) {
      const newVariation: Variation = {
        id: `var-${Date.now()}`,
        name: newVariationName,
        values: newVariationValues.split(',').map(v => v.trim()).filter(v => v),
      };
      setVariations([...variations, newVariation]);
      setIsAddDialogOpen(false);
      setNewVariationName('');
      setNewVariationValues('');
    }
  };

  const handleDeleteVariation = (id: string) => {
    setVariations(variations.filter(v => v.id !== id));
  };
  
  const handleEditVariation = (id: string) => {
    alert(`Editing variation with ID ${id} is not implemented yet.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
        <GitCommitHorizontal className="w-8 h-8" />
        Variations
      </h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>All Variations</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>Add Variation</DialogTitle>
                      <DialogDescription>
                        Add a new variation set (e.g. Size, Color) and its values.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="variation-name">Variation Name *</Label>
                          <Input 
                            id="variation-name" 
                            placeholder="e.g. Color" 
                            required 
                            value={newVariationName}
                            onChange={(e) => setNewVariationName(e.target.value)}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="variation-values">Variation Values *</Label>
                          <Input 
                            id="variation-values" 
                            placeholder="e.g. Red, Green, Blue" 
                            required 
                            value={newVariationValues}
                            onChange={(e) => setNewVariationValues(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Separate values with a comma.
                          </p>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleAddVariation}>Save</Button>
                      <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="pt-2">
            Variations are used to create products with multiple options, like different sizes or colors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variation Name</TableHead>
                  <TableHead>Values</TableHead>
                  <TableHead className="w-[180px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((variation) => (
                  <TableRow key={variation.id}>
                    <TableCell className="font-medium">{variation.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {variation.values.map(value => (
                          <Badge key={value} variant="secondary">{value}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEditVariation(variation.id)}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteVariation(variation.id)}>
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
                Showing <strong>1 to {variations.length}</strong> of <strong>{variations.length}</strong> entries
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
