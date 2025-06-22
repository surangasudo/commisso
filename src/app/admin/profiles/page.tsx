'use client';
import React from 'react';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { profiles, type Profile } from '@/lib/data';

const profileTypes: Profile['type'][] = ['Agent', 'Sub-Agent', 'Company', 'Salesperson'];

export default function ProfilesPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [categoryRates, setCategoryRates] = React.useState<{ category: string; rate: string }[]>([]);

  const handleAddRate = () => {
    setCategoryRates([...categoryRates, { category: '', rate: '' }]);
  };

  const handleRemoveRate = (index: number) => {
    setCategoryRates(rates => rates.filter((_, i) => i !== index));
  };

  const handleRateChange = (index: number, field: 'category' | 'rate', value: string) => {
    const newRates = [...categoryRates];
    newRates[index] = { ...newRates[index], [field]: value };
    setCategoryRates(newRates);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCategoryRates([]);
  };

  return (
    <div className="flex flex-col gap-6">
       <h1 className="font-headline text-3xl font-bold">Profile Management</h1>
      <Tabs defaultValue="Agent">
        <div className="flex items-center">
          <TabsList>
            {profileTypes.map((type) => (
              <TabsTrigger key={type} value={type}>{type}s</TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setCategoryRates([]);
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Profile
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Profile</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new commission profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" placeholder="John Doe" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input id="phone" type="tel" placeholder="123-456-7890" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        {profileTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="commission" className="text-right">Default Commission (%)</Label>
                    <Input id="commission" type="number" placeholder="10" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4 pt-2">
                    <Label className="text-right pt-2">
                        Category Commissions
                    </Label>
                    <div className="col-span-3 space-y-2">
                        <div className="space-y-2 rounded-md border p-3">
                            {categoryRates.map((rate, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input 
                                        placeholder="Category Name" 
                                        value={rate.category} 
                                        onChange={(e) => handleRateChange(index, 'category', e.target.value)}
                                    />
                                    <Input 
                                        type="number" 
                                        placeholder="Rate %" 
                                        className="w-24" 
                                        value={rate.rate}
                                        onChange={(e) => handleRateChange(index, 'rate', e.target.value)} 
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRate(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={handleAddRate}>
                                <PlusCircle className="h-3.5 w-3.5" />
                                Add Rate
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Define specific rates for categories. The default rate is used if a category is not specified.
                        </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" onClick={closeDialog}>Create Profile</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {profileTypes.map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle>{type}s</CardTitle>
                <CardDescription>
                  A list of all {type.toLowerCase()}s in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.filter(p => p.type === type).map(profile => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.name}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.phone}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{profile.commissionRate}%</span>
                            {profile.categoryRates && profile.categoryRates.length > 0 && (
                              <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-sm">
                                      <p className="font-semibold">Category Rates</p>
                                      <ul className="mt-1 list-disc list-inside space-y-1">
                                        {profile.categoryRates.map((rate, i) => (
                                          <li key={i}>
                                            <span className="font-medium">{rate.category}:</span> {rate.rate}%
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={profile.status === 'Active' ? 'default' : 'secondary'} className={profile.status === 'Active' ? 'bg-green-600' : ''}>{profile.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
