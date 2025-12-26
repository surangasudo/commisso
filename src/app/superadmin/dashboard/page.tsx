'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Briefcase,
    ShieldCheck,
    TrendingUp,
    Plus,
    ArrowRight,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { getBusinesses } from '@/services/businessService';
import { getUsers } from '@/services/userService';
import { type Business, type User } from '@/lib/data';

export default function SuperadminDashboard() {
    const [stats, setStats] = useState({
        totalBusinesses: 0,
        activeBusinesses: 0,
        totalUsers: 0,
        recentBusinesses: [] as Business[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [businesses, users] = await Promise.all([
                    getBusinesses(),
                    getUsers()
                ]);

                setStats({
                    totalBusinesses: businesses.length,
                    activeBusinesses: businesses.filter(b => b.status === 'Active').length,
                    totalUsers: users.length,
                    recentBusinesses: businesses.slice(0, 5)
                });
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Superadmin Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage your SaaS platform and monitor business activities.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
                        <p className="text-xs text-muted-foreground">Across all regions</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-500/20 bg-green-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{stats.activeBusinesses}</div>
                        <p className="text-xs text-green-600">Currently operational</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">All roles included</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">99.9%</div>
                        <p className="text-xs text-blue-600">Optimal performance</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Businesses</CardTitle>
                            <CardDescription>Latest tenants onboarded to the platform</CardDescription>
                        </div>
                        <Link href="/superadmin/businesses">
                            <Button variant="ghost" size="sm" className="gap-2">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentBusinesses.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-8">No businesses found yet.</p>
                            ) : (
                                stats.recentBusinesses.map(business => (
                                    <div key={business.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {business.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{business.name}</p>
                                                <p className="text-xs text-muted-foreground">{business.email}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${business.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {business.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-primary font-headline">Quick Actions</CardTitle>
                        <CardDescription>Perform administrative tasks quickly</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3">
                        <Link href="/superadmin/businesses">
                            <Button className="w-full justify-start gap-3 h-12 text-md" variant="default">
                                <Plus className="h-5 w-5" /> Onboard New Business
                            </Button>
                        </Link>
                        <Link href="/superadmin/activity-logs">
                            <Button className="w-full justify-start gap-3 h-12 text-md" variant="outline">
                                <ShieldCheck className="h-5 w-5" /> Security Audit Logs
                            </Button>
                        </Link>
                        <Button className="w-full justify-start gap-3 h-12 text-md" variant="outline" disabled>
                            <Loader2 className="h-5 w-5" /> Global Settings (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
