'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/icons';
import {
    LayoutDashboard,
    Briefcase,
    ShieldCheck,
    LogOut,
    Menu,
    X,
    Settings,
    Bell
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export default function SuperadminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check if user is a superadmin based on new Role system
    const isSuperadmin = user && user.role === 'SuperAdmin';

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/superadmin-login');
        } else if (!loading && user && !isSuperadmin) {
            router.push('/admin/dashboard');
        }
    }, [user, loading, router, isSuperadmin]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Logo className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Initializing Admin Portal...</p>
                </div>
            </div>
        );
    }

    if (!isSuperadmin) {
        return null; // Redirect handled by useEffect
    }

    const navigation = [
        { name: 'Dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard },
        { name: 'Businesses', href: '/superadmin/businesses', icon: Briefcase },
        { name: 'Activity Logs', href: '/superadmin/activity-logs', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen bg-muted/20">
            {/* Sidebar for Desktop */}
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-background lg:block">
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center gap-3 px-6 border-b">
                        <Logo className="h-8 w-8 text-primary font-bold" />
                        <span className="font-headline text-lg font-bold">Crimson <span className="text-destructive">SaaS</span></span>
                    </div>

                    <nav className="flex-1 space-y-1 p-4 mt-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <span className={cn(
                                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                                    )}>
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t space-y-2">
                        <div className="px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20 mb-4">
                            <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">Authenticated as</p>
                            <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                        </div>
                        <Button variant="outline" className="w-full justify-start gap-3 h-9" onClick={logout}>
                            <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6 lg:hidden">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-headline text-lg font-bold">Crimson SaaS</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </header>

            {/* Content Area */}
            <main className="lg:pl-64">
                <div className="flex h-16 items-center justify-between px-8 bg-background border-b hidden lg:flex">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Platform Management System</span>
                        <span className="text-muted-foreground/30">|</span>
                        <span>v2.1.0-SaaS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>
                        </Button>
                    </div>
                </div>
                <div className="p-0 lg:p-4">
                    {children}
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <nav className="fixed inset-y-0 right-0 w-full max-w-xs bg-background p-6 shadow-xl border-l">
                        <div className="flex items-center justify-between mb-8">
                            <span className="font-headline text-xl font-bold">Admin Menu</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {navigation.map((item) => (
                                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className={cn(
                                        "flex items-center gap-4 px-4 py-3 text-lg font-medium rounded-lg",
                                        pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground active:bg-muted"
                                    )}>
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>
            )}
        </div>
    );
}
