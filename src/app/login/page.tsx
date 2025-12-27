'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { getUsers } from '@/services/userService';
import { type User } from '@/lib/data';
import { ShieldCheck, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, loginAsUser, loading } = useAuth();
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

    const handleSimulatedLogin = async () => {
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
            } catch (err: any) {
                console.error("Login failed", err);
                setError(err.message || "Simulated login failed.");
            }
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            router.push('/admin/dashboard');
        } catch (err: any) {
            console.error("Email login failed", err);
            setError(err.message || "Invalid email or password.");
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/10">
            <div className="absolute top-6 left-6 flex items-center gap-2 text-foreground">
                <Logo className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg font-bold">Crimson POS</span>
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

            <Card className="w-full max-w-sm shadow-xl border-primary/10">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl font-bold">Welcome!</CardTitle>
                    <CardDescription>Authentication required to access the POS</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="business" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="business">Business Login</TabsTrigger>
                            <TabsTrigger value="demo">Demo Login</TabsTrigger>
                        </TabsList>

                        <TabsContent value="business" className="space-y-4">
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            className="pl-9"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md text-center">
                                        {error}
                                    </div>
                                )}
                                <Button className="w-full h-11" type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {loading ? "Authenticating..." : "Login to Workspace"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="demo" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-select">Select Test User</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 z-10 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                                        <SelectTrigger id="user-select" className="pl-9">
                                            <SelectValue placeholder={users.length > 0 ? "Choose a user" : "Loading users..."} />
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
                            </div>
                            <Button className="w-full h-11" variant="secondary" onClick={handleSimulatedLogin} disabled={!selectedUserId || loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Simulate Login
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground italic">
                                Use this tab for quick testing. In production, use your credentials.
                            </p>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <p className="mt-8 text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Crimson POS SaaS. All rights reserved.
            </p>
        </div>
    );
}
