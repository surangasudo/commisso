'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
    const [role, setRole] = useState<'Admin' | 'Cashier' | ''>('');
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = () => {
        if (role) {
            login(role);
            router.push('/admin/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
             <div className="absolute top-6 left-6 flex items-center gap-2 text-foreground">
                <Logo className="h-6 w-6" />
                <span className="font-headline text-lg">Ultimate ERP</span>
            </div>
             <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
                    <CardDescription>Select a role to log in and continue.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="role-select">Select Role</Label>
                        <Select onValueChange={(value: 'Admin' | 'Cashier') => setRole(value)} value={role}>
                            <SelectTrigger id="role-select">
                                <SelectValue placeholder="Choose a role to simulate login" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Cashier">Cashier</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" onClick={handleLogin} disabled={!role}>
                        Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
