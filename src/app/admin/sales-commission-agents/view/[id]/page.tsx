'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Phone, Mail, Banknote, Percent, Tag } from "lucide-react";
import { type CommissionProfile } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCommissionProfile } from '@/services/commissionService';
import { Skeleton } from '@/components/ui/skeleton';

const DetailItem = ({ icon, label, value, children }: { icon: React.ElementType, label: string, value?: string | undefined, children?: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="bg-muted p-2 rounded-full">
            {React.createElement(icon, { className: "w-5 h-5 text-muted-foreground" })}
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {value && <p className="font-semibold">{value}</p>}
            {children}
        </div>
    </div>
);

export default function ViewCommissionProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { toast } = useToast();
    const [profile, setProfile] = useState<CommissionProfile | null>(null);

    useEffect(() => {
        if (typeof id !== 'string') return;
        const fetchProfile = async () => {
            try {
                const profileToView = await getCommissionProfile(id);
                 if (profileToView) {
                    setProfile(profileToView);
                } else {
                     toast({
                        title: "Error",
                        description: "Commission profile not found.",
                        variant: "destructive"
                    });
                    router.push('/admin/sales-commission-agents');
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                 toast({
                    title: "Error",
                    description: "Failed to load profile data.",
                    variant: "destructive"
                });
            }
        };
        fetchProfile();
    }, [id, router, toast]);

    if (!profile) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                        <UserIcon className="w-8 h-8" />
                        <Skeleton className="h-9 w-72" />
                    </h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                        <CardDescription><Skeleton className="h-6 w-20" /></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <UserIcon className="w-8 h-8" />
                    View Commission Profile
                </h1>
                <Button variant="outline" onClick={() => router.push('/admin/sales-commission-agents')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile List
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>
                        <Badge variant="outline">{profile.entityType}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DetailItem icon={Phone} label="Phone Number" value={profile.phone} />
                        <DetailItem icon={Mail} label="Email" value={profile.email || 'N/A'} />
                        <DetailItem icon={Banknote} label="Bank Details" value={profile.bankDetails || 'N/A'} />
                    </div>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold mb-4">Commission Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DetailItem icon={Percent} label="Overall Commission Rate" value={`${profile.commission.overall}%`} />
                        {profile.commission.categories && profile.commission.categories.length > 0 && (
                             <DetailItem icon={Tag} label="Category-Specific Rates">
                                <div className="flex flex-col gap-1 mt-1">
                                    {profile.commission.categories.map(c => (
                                        <div key={c.category} className="flex justify-between gap-4">
                                            <span className="text-sm">{c.category}:</span>
                                            <span className="font-semibold">{c.rate}%</span>
                                        </div>
                                    ))}
                                </div>
                            </DetailItem>
                        )}
                    </div>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">This is a summary of the commission profile.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
