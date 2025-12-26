'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, User as UserIcon, Loader2 } from "lucide-react";
import { type User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getUser, updateUser } from '@/services/userService';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            if (id) {
                try {
                    const fetchedUser = await getUser(id, currentUser?.businessId || undefined);
                    if (fetchedUser) {
                        setUser(fetchedUser);
                    } else {
                        toast({
                            title: "Error",
                            description: "User not found.",
                            variant: "destructive"
                        });
                        router.push('/admin/users');
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                    toast({
                        title: "Error",
                        description: "Failed to fetch user data.",
                        variant: "destructive"
                    });
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchUser();
    }, [id, router, toast]);

    const handleInputChange = (field: keyof User, value: string) => {
        if (user) {
            setUser({ ...user, [field]: value });
        }
    };

    const handleSelectChange = (field: keyof User, value: string) => {
        if (user) {
            setUser({ ...user, [field]: value as any });
        }
    };

    const handlePrivilegeChange = (field: string, value: boolean) => {
        if (user) {
            setUser({
                ...user,
                privileges: {
                    ...(user.privileges || { canManageRegister: user.role === 'Admin' }),
                    [field]: value
                }
            });
        }
    };

    const handleUpdate = async () => {
        if (user) {
            setUpdating(true);
            try {
                await updateUser(user, currentUser?.businessId || undefined);
                toast({
                    title: "User Updated",
                    description: `Details for ${user.name} have been updated.`,
                });
                router.push('/admin/users');
            } catch (error) {
                console.error("Error updating user:", error);
                toast({
                    title: "Error",
                    description: "Failed to update user.",
                    variant: "destructive"
                });
            } finally {
                setUpdating(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center text-muted-foreground">User not found</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2"><UserIcon className="w-8 h-8" /> Edit User</h1>
            <div className="flex flex-col gap-6">

                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name:*</Label>
                                <Input id="name" placeholder="Full Name" value={user.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email:*</Label>
                                <Input id="email" type="email" placeholder="Email" value={user.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center gap-8 mt-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is-active"
                                    checked={user.status === 'Active'}
                                    onCheckedChange={(checked) => handleInputChange('status', checked ? 'Active' : 'Inactive')}
                                />
                                <Label htmlFor="is-active" className="flex items-center gap-1 font-normal cursor-pointer">Is active? <Info className="w-4 h-4 text-muted-foreground" /></Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Roles and Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username:</Label>
                                <Input id="username" placeholder="Username" value={user.username} onChange={(e) => handleInputChange('username', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role:*</Label>
                                <Select value={user.role} onValueChange={(value) => handleSelectChange('role', value)}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Admin') && (
                                            <SelectItem value="Admin">Admin</SelectItem>
                                        )}
                                        {(currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                                            <SelectItem value="Manager">Manager</SelectItem>
                                        )}
                                        <SelectItem value="Cashier">Cashier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-6">
                            <Checkbox
                                id="can-manage-register"
                                checked={user.privileges?.canManageRegister || false}
                                onCheckedChange={(checked) => handlePrivilegeChange('canManageRegister', !!checked)}
                            />
                            <Label htmlFor="can-manage-register" className="font-normal flex items-center gap-1 cursor-pointer">
                                Can manage cash register
                                <Info className="w-4 h-4 text-muted-foreground" />
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => router.push('/admin/users')}>Cancel</Button>
                    <Button size="lg" onClick={handleUpdate} disabled={updating}>
                        {updating ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                        ) : 'Update'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
