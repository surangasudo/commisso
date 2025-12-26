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
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const { loginAsUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        getUsers()
            .then(data => {
                if (data && data.length > 0) {
                    setUsers(data);
                } else {
                    // Force fallback if service returns empty
                    setUsers([
                        { id: 'force-admin', name: 'System Admin', email: 'admin@crimson.pos', role: 'Admin', status: 'Active', username: 'admin', businessId: 'default' },
                        { id: 'force-cashier', name: 'Test Cashier', email: 'cashier@crimson.pos', role: 'Cashier', status: 'Active', username: 'cashier', businessId: 'default' }
                    ]);
                }
            })
            .catch(err => {
                console.error("Login page failed load", err);
                setUsers([
                    { id: 'error-admin', name: 'System Admin (Error)', email: 'admin@crimson.pos', role: 'Admin', status: 'Active', username: 'admin', businessId: 'default' },
                    { id: 'error-cashier', name: 'Test Cashier (Error)', email: 'cashier@crimson.pos', role: 'Cashier', status: 'Active', username: 'cashier', businessId: 'default' }
                ]);
            });
    }, []);

    const handleLogin = async () => {
        const user = users.find(u => u.id === selectedUserId);
        if (user) {
            try {
                await loginAsUser({
                    id: user.id,
                    name: user.name || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    role: user.role || 'Cashier',
                    businessId: user.businessId || undefined
                });
                router.push('/admin/dashboard');
            } catch (err) {
                console.error("Login failed", err);
            }
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="absolute top-6 left-6 flex items-center gap-2 text-foreground">
                <Logo className="h-6 w-6" />
                <span className="font-headline text-lg">Crimson POS</span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <Link href="/superadmin-login">
                    <Button variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
                        <ShieldCheck className="h-4 w-4" />
                        Superadmin
                    </Button>
                </Link>
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
                                {users.map(user => {
                                    const displayName = user.name || user.email?.split('@')[0] || 'Unknown User';
                                    const displayRole = user.role || 'User';
                                    return (
                                        <SelectItem key={user.id} value={user.id}>
                                            {displayName} ({displayRole})
                                        </SelectItem>
                                    );
                                })}
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
