'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, User as UserIcon } from "lucide-react";
import { users as allUsers, type User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (id) {
            const userToEdit = allUsers.find(u => u.id === id);
            if (userToEdit) {
                setUser(userToEdit);
            } else {
                toast({
                    title: "Error",
                    description: "User not found.",
                    variant: "destructive"
                });
                router.push('/admin/users');
            }
        }
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

    const handleUpdate = () => {
        if (user) {
             toast({
                title: "User Updated",
                description: `Details for ${user.name} have been updated.`,
            });
            router.push('/admin/users');
        }
    };

    if (!user) {
        return <div>Loading...</div>;
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
                                <Checkbox id="is-active" checked={user.status === 'Active'} onCheckedChange={(checked) => handleInputChange('status', checked ? 'Active' : 'Inactive')} />
                                <Label htmlFor="is-active" className="flex items-center gap-1 font-normal">Is active? <Info className="w-4 h-4 text-muted-foreground" /></Label>
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
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Cashier">Cashier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end">
                    <Button size="lg" onClick={handleUpdate}>Update</Button>
                </div>
            </div>
        </div>
    );
}
