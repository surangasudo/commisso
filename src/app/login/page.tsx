'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { getUsers } from '@/services/userService';
import { type User } from '@/lib/data';

export default function LoginPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const { login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        getUsers()
            .then(data => {
                if (data && data.length > 0) {
                    setUsers(data);
                } else {
                    // Force fallback if service returns empty
                    setUsers([
                        { id: 'force-admin', name: 'System Admin', email: 'admin@crimson.pos', role: 'Admin', status: 'Active', username: 'admin' },
                        { id: 'force-cashier', name: 'Test Cashier', email: 'cashier@crimson.pos', role: 'Cashier', status: 'Active', username: 'cashier' }
                    ]);
                }
            })
            .catch(err => {
                console.error("Login page failed load", err);
                setUsers([
                    { id: 'error-admin', name: 'System Admin (Error)', email: 'admin@crimson.pos', role: 'Admin', status: 'Active', username: 'admin' },
                    { id: 'error-cashier', name: 'Test Cashier (Error)', email: 'cashier@crimson.pos', role: 'Cashier', status: 'Active', username: 'cashier' }
                ]);
            });
    }, []);

    const handleLogin = () => {
        const user = users.find(u => u.id === selectedUserId);
        if (user) {
            login({
                name: user.name,
                email: user.email,
                role: user.role
            });
            router.push('/admin/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="absolute top-6 left-6 flex items-center gap-2 text-foreground">
                <Logo className="h-6 w-6" />
                <span className="font-headline text-lg">Crimson POS</span>
            </div>
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
                    <CardDescription>Select a user to log in and continue.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="user-select">Select User ({users.length} loaded)</Label>
                        <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                            <SelectTrigger id="user-select">
                                <SelectValue placeholder={users.length > 0 ? "Choose a user to simulate login" : "Loading users..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" onClick={handleLogin} disabled={!selectedUserId}>
                        Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
