'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SuperadminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, loginWithGoogle, loading } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            router.push('/superadmin/dashboard');
        } catch (err: any) {
            console.error("Superadmin login failed", err);
            setError(err.message || "Invalid credentials or access denied.");
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        try {
            await loginWithGoogle(true); // true = grant SuperAdmin role
            router.push('/superadmin/dashboard');
        } catch (err: any) {
            console.error("Google login failed", err);
            setError(err.message || "Google sign-in failed.");
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/30">
            <div className="absolute top-6 left-6 flex items-center gap-2 text-foreground">
                <Logo className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg font-bold">Crimson POS <span className="text-destructive ml-1">SaaS</span></span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <Link href="/login">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Business Login
                    </Button>
                </Link>
                <ThemeToggle />
            </div>

            <Card className="w-full max-w-sm border-2 border-destructive/20 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                        <ShieldAlert className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Superadmin Portal</CardTitle>
                    <CardDescription>Authentication required for system management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google Sign-In Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2 h-11"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {loading ? "Signing in..." : "Continue with Google"}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md text-center">
                                {error}
                            </div>
                        )}

                        <Button className="w-full bg-destructive hover:bg-destructive/90 text-white" type="submit" disabled={loading}>
                            {loading ? "Authenticating..." : "Login with Email"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-8 text-sm text-muted-foreground text-center max-w-xs">
                Restricted access only. All activities are logged and monitored for security purposes.
            </p>
        </div>
    );
}
