'use client';

import React, { useState, useEffect } from 'react';
import {
    getBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness
} from '@/services/businessService';
import { addUser } from '@/services/userService';
import { type Business, AVAILABLE_MODULES } from '@/lib/data';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Pencil,
    Trash2,
    Shield,
    CheckCircle2,
    XCircle,
    Loader2,
    Briefcase
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/hooks/use-auth';

export default function BusinessManagementPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [newBusiness, setNewBusiness] = useState({
        name: '',
        email: '',
        adminEmail: '',
        adminPassword: '',
        modules: [] as string[]
    });
    const { register } = useAuth();

    useEffect(() => {
        loadBusinesses();
    }, []);

    async function loadBusinesses() {
        setLoading(true);
        const data = await getBusinesses();
        setBusinesses(data);
        setLoading(false);
    }

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Create Business
            const businessId = await createBusiness({
                name: newBusiness.name,
                email: newBusiness.email,
                status: 'Active',
                modules: newBusiness.modules
            });

            // 2. Register Admin User
            await register(newBusiness.adminEmail, newBusiness.adminPassword, {
                username: newBusiness.adminEmail.split('@')[0],
                name: "Business Admin",
                role: 'Admin',
                email: newBusiness.adminEmail,
                status: 'Active',
                businessId: businessId,
                privileges: {
                    canManageRegister: true,
                    modules: newBusiness.modules
                }
            });

            setIsAddDialogOpen(false);
            setNewBusiness({ name: '', email: '', adminEmail: '', adminPassword: '', modules: [] });
            loadBusinesses();
        } catch (err) {
            console.error("Onboarding failed", err);
        }
    };

    const handleEdit = (business: Business) => {
        setEditingBusiness(business);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBusiness) return;

        try {
            await updateBusiness(editingBusiness.id, {
                name: editingBusiness.name,
                email: editingBusiness.email,
                status: editingBusiness.status,
                modules: editingBusiness.modules
            });
            setIsEditDialogOpen(false);
            loadBusinesses();
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this business? All associated data will be lost.")) {
            try {
                await deleteBusiness(id);
                loadBusinesses();
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    const toggleModule = (module: string, isEdit: boolean = false) => {
        if (isEdit && editingBusiness) {
            setEditingBusiness(prev => {
                if (!prev) return null;
                const currentModules = prev.modules || [];
                return {
                    ...prev,
                    modules: currentModules.includes(module)
                        ? currentModules.filter(m => m !== module)
                        : [...currentModules, module]
                };
            });
        } else {
            setNewBusiness(prev => ({
                ...prev,
                modules: prev.modules.includes(module)
                    ? prev.modules.filter(m => m !== module)
                    : [...prev.modules, module]
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Business Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Onboard and manage SaaS tenants.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Onboard Business
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Onboard New Business</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleOnboard} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Business Name</Label>
                                        <Input required value={newBusiness.name} onChange={e => setNewBusiness({ ...newBusiness, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Business Email</Label>
                                        <Input type="email" required value={newBusiness.email} onChange={e => setNewBusiness({ ...newBusiness, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="p-4 border rounded-md bg-muted/30 space-y-4">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" /> Admin Account Credentials
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Admin Email</Label>
                                            <Input type="email" required value={newBusiness.adminEmail} onChange={e => setNewBusiness({ ...newBusiness, adminEmail: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Admin Password</Label>
                                            <Input type="password" required value={newBusiness.adminPassword} onChange={e => setNewBusiness({ ...newBusiness, adminPassword: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Enable Modules</Label>
                                    <div className="grid grid-cols-3 gap-3 p-3 border rounded-md">
                                        {AVAILABLE_MODULES.map(module => (
                                            <div key={module} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={module}
                                                    checked={newBusiness.modules.includes(module)}
                                                    onCheckedChange={() => toggleModule(module)}
                                                />
                                                <Label htmlFor={module} className="capitalize text-xs cursor-pointer">{module.replace('-', ' ')}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit">Create Tenant</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Edit Business: {editingBusiness?.name}</DialogTitle>
                            </DialogHeader>
                            {editingBusiness && (
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Business Name</Label>
                                            <Input required value={editingBusiness.name} onChange={e => setEditingBusiness({ ...editingBusiness, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Business Email</Label>
                                            <Input type="email" required value={editingBusiness.email} onChange={e => setEditingBusiness({ ...editingBusiness, email: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Status</Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant={editingBusiness.status === 'Active' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setEditingBusiness({ ...editingBusiness, status: 'Active' })}
                                                    className={editingBusiness.status === 'Active' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Active
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={editingBusiness.status === 'Inactive' ? 'destructive' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setEditingBusiness({ ...editingBusiness, status: 'Inactive' })}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" /> Inactive
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Enabled Modules</Label>
                                        <div className="grid grid-cols-3 gap-3 p-3 border rounded-md">
                                            {AVAILABLE_MODULES.map(module => (
                                                <div key={`edit-${module}`} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`edit-${module}`}
                                                        checked={editingBusiness.modules?.includes(module)}
                                                        onCheckedChange={() => toggleModule(module, true)}
                                                    />
                                                    <Label htmlFor={`edit-${module}`} className="capitalize text-xs cursor-pointer">{module.replace('-', ' ')}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Modules</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {businesses.map(business => (
                                <TableRow key={business.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <Briefcase className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{business.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{business.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${business.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {business.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {business.modules?.map(m => (
                                                <span key={m} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] uppercase border border-blue-100">
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(business.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(business)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(business.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
