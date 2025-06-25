'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Mail, Briefcase, UserCheck } from "lucide-react";
import { users as allUsers, type User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const DetailItem = ({ icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => (
    <div className="flex items-start gap-4">
        <div className="bg-muted p-2 rounded-full">
            {React.createElement(icon, { className: "w-5 h-5 text-muted-foreground" })}
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value || 'N/A'}</p>
        </div>
    </div>
);


export default function ViewUserPage() {
    const router = useRouter();
    const { id } = useParams();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (id) {
            const userToView = allUsers.find(u => u.id === id);
            if (userToView) {
                setUser(userToView);
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

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <UserIcon className="w-8 h-8" />
                    View User
                </h1>
                <Button variant="outline" onClick={() => router.push('/admin/users')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to User List
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DetailItem icon={Mail} label="Email" value={user.email} />
                        <DetailItem icon={Briefcase} label="Role" value={user.role} />
                        <DetailItem icon={UserCheck} label="Status" value={user.status} />
                    </div>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">This is a summary of the user's profile.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
