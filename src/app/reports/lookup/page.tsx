'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import Link from 'next/link';

export default function LookupPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="absolute top-6 left-6">
                <Link href="/" className="flex items-center gap-2 text-foreground">
                    <Logo className="h-6 w-6" />
                    <span className="font-headline text-lg">Crimson POS</span>
                </Link>
            </div>
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Lookup</CardTitle>
                    <CardDescription>This feature is currently under development.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Coming Soon...</p>
                  </div>
                </CardContent>
            </Card>
        </div>
    );
}
