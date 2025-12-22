'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Info,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { getCommissionProfiles } from '@/services/commissionService';
import { getUsers } from '@/services/userService';
import {
  getSellingPriceGroups,
  addSellingPriceGroup,
  updateSellingPriceGroup,
  deleteSellingPriceGroup,
  ensureDefaultSellingPriceGroups
} from '@/services/sellingPriceGroupService';
import { type SellingPriceGroup, type CommissionProfile, type User } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellingPriceGroupPage() {
  const { toast } = useToast();
  const { settings } = useSettings();
  const [groups, setGroups] = useState<SellingPriceGroup[]>([]);
  const [profiles, setProfiles] = useState<CommissionProfile[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<SellingPriceGroup>>({
    name: '',
    description: '',
    agentId: '',
    subAgentId: '',
    companyId: '',
    salespersonId: '',
    serviceStaffId: '',
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SellingPriceGroup | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      await ensureDefaultSellingPriceGroups(settings.business.businessName);
      const [groupsData, profilesData, usersData] = await Promise.all([
        getSellingPriceGroups(),
        getCommissionProfiles(),
        getUsers()
      ]);
      setGroups(groupsData);
      setProfiles(profilesData);
      setStaffUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ title: 'Error', description: 'Failed to load data.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [settings.business.businessName, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateGroup = (data: Partial<SellingPriceGroup>): boolean => {
    if (!data.name?.trim()) {
      toast({ title: 'Validation Error', description: 'Name is required.', variant: 'destructive' });
      return false;
    }

    if (settings.modules.advancedCommission) {
      if (data.isDefault && !data.agentId) {
        toast({ title: 'Validation Error', description: 'Agent is required for the Default Selling Price Group when Advanced Commission is enabled.', variant: 'destructive' });
        return false;
      }
      if (!data.serviceStaffId) {
        toast({ title: 'Validation Error', description: 'Service Staff is required when Advanced Commission is enabled.', variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const handleAddGroup = async () => {
    if (!validateGroup(formData)) return;

    try {
      await addSellingPriceGroup(formData as Omit<SellingPriceGroup, 'id'>);
      toast({ title: 'Success', description: 'Selling Price Group added.' });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        agentId: '',
        subAgentId: '',
        companyId: '',
        salespersonId: '',
        serviceStaffId: '',
      });
      fetchData();
    } catch (error) {
      console.error("Failed to add group:", error);
      toast({ title: 'Error', description: 'Failed to add group.', variant: 'destructive' });
    }
  };

  const handleEditClick = (group: SellingPriceGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      agentId: group.agentId || '',
      subAgentId: group.subAgentId || '',
      companyId: group.companyId || '',
      salespersonId: group.salespersonId || '',
      serviceStaffId: group.serviceStaffId || '',
      isDefault: group.isDefault,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !validateGroup(formData)) return;

    try {
      await updateSellingPriceGroup(editingGroup.id, formData);
      toast({ title: 'Success', description: 'Selling Price Group updated.' });
      setIsEditDialogOpen(false);
      setEditingGroup(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update group:", error);
      toast({ title: 'Error', description: 'Failed to update group.', variant: 'destructive' });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteSellingPriceGroup(id);
        toast({ title: 'Success', description: 'Selling Price Group deleted.' });
        fetchData();
      } catch (error) {
        console.error("Failed to delete group:", error);
        toast({ title: 'Error', description: 'Failed to delete group.', variant: 'destructive' });
      }
    }
  };

  const renderFormFields = (data: Partial<SellingPriceGroup>, onChange: (field: string, value: string) => void) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="group-name">Name *</Label>
        <Input
          id="group-name"
          placeholder="Group Name"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="group-description">Description</Label>
        <Textarea
          id="group-description"
          placeholder="Description"
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>

      {settings.modules.advancedCommission && (
        <>
          <Separator label="Advanced Commission Settings" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Agent {data.isDefault && '*'}</Label>
              <Select value={data.agentId} onValueChange={(val) => onChange('agentId', val)}>
                <SelectTrigger><SelectValue placeholder="Select Agent" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {profiles.filter(p => p.entityType === 'Agent').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Salesperson</Label>
              <Select value={data.salespersonId} onValueChange={(val) => onChange('salespersonId', val)}>
                <SelectTrigger><SelectValue placeholder="Select Salesperson" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {profiles.filter(p => p.entityType === 'Salesperson').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sub-Agent</Label>
              <Select value={data.subAgentId} onValueChange={(val) => onChange('subAgentId', val)}>
                <SelectTrigger><SelectValue placeholder="Select Sub-Agent" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {profiles.filter(p => p.entityType === 'Sub-Agent').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Select value={data.companyId} onValueChange={(val) => onChange('companyId', val)}>
                <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {profiles.filter(p => p.entityType === 'Company').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Service Staff {settings.modules.advancedCommission && '*'}</Label>
        <Select value={data.serviceStaffId} onValueChange={(val) => onChange('serviceStaffId', val)}>
          <SelectTrigger><SelectValue placeholder="Select Service Staff" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {staffUsers.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

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
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Selling Price Group</DialogTitle>
                  <DialogDescription>
                    Create a new price group with optional commission agents.
                  </DialogDescription>
                </DialogHeader>
                {renderFormFields(formData, (f, v) => setFormData(p => ({ ...p, [f]: v === 'none' ? '' : v })))}
                <DialogFooter>
                  <Button onClick={handleAddGroup}>Save</Button>
                  <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Service Staff</TableHead>
                    <TableHead className="w-[180px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => {
                    const agent = profiles.find(p => p.id === group.agentId);
                    const staff = staffUsers.find(u => u.id === group.serviceStaffId);
                    return (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          {group.name} {group.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                        </TableCell>
                        <TableCell>{group.description}</TableCell>
                        <TableCell>{agent?.name || '-'}</TableCell>
                        <TableCell>{staff?.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200" onClick={() => handleEditClick(group)}>
                              <Pencil className="mr-1 h-3 w-3" /> Edit
                            </Button>
                            {!group.isDefault && (
                              <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200" onClick={() => handleDeleteGroup(group.id)}>
                                <Trash2 className="mr-1 h-3 w-3" /> Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Selling Price Group</DialogTitle>
          </DialogHeader>
          {renderFormFields(formData, (f, v) => setFormData(p => ({ ...p, [f]: v === 'none' ? '' : v })))}
          <DialogFooter>
            <Button onClick={handleUpdateGroup}>Save Changes</Button>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Separator = ({ label }: { label: string }) => (
  <div className="relative py-2">
    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{label}</span></div>
  </div>
);

const Badge = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'} ${className}`}>
    {children}
  </span>
);
