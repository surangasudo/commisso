'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { addUser } from '@/services/userService';
import { useToast } from "@/hooks/use-toast";

export default function AddUserPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        prefix: '',
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: '' as 'Admin' | 'Cashier' | '',
        canManageRegister: false,
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.firstName || !formData.email || !formData.role) {
            toast({
                title: "Validation Error",
                description: "First Name, Email, and Role are required.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            await addUser({
                username: formData.username || formData.email.split('@')[0],
                name: `${formData.prefix ? formData.prefix + ' ' : ''}${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                role: formData.role as 'Admin' | 'Cashier',
                status: 'Active',
                privileges: {
                    canManageRegister: formData.canManageRegister
                }
            });
            toast({
                title: "Success",
                description: "User added successfully.",
            });
            router.push('/admin/users');
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to add user.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Add user</h1>
            <div className="flex flex-col gap-6">

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="prefix">Prefix:</Label>
                                <Input id="prefix" placeholder="Mr / Mrs / Miss" value={formData.prefix} onChange={(e) => handleChange('prefix', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First Name:*</Label>
                                <Input id="first-name" placeholder="First Name" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last Name:</Label>
                                <Input id="last-name" placeholder="Last Name" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email:*</Label>
                                <Input id="email" type="email" placeholder="Email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
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
                                <Input id="username" placeholder="Username" value={formData.username} onChange={(e) => handleChange('username', e.target.value)} />
                                <p className="text-xs text-muted-foreground">Leave blank to auto generate username</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password:*</Label>
                                <Input id="password" type="password" placeholder="Password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password:*</Label>
                                <Input id="confirm-password" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role:*</Label>
                                <Select onValueChange={(val) => handleChange('role', val)} value={formData.role}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Cashier">Cashier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-6">
                            <Checkbox
                                id="can-manage-register"
                                checked={formData.canManageRegister}
                                onCheckedChange={(checked) => handleChange('canManageRegister', !!checked)}
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
                    <Button size="lg" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
