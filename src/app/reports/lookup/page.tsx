'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { commissions, type Commission } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';

const statusStyles = {
    Paid: 'bg-green-100 text-green-800 border-green-200',
    Approved: 'bg-blue-100 text-blue-800 border-blue-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Reversed: 'bg-red-100 text-red-800 border-red-200',
}

export default function LookupPage() {
    const [mobileNumber, setMobileNumber] = useState('');
    const [results, setResults] = useState<Commission[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobileNumber) return;
        setIsLoading(true);
        setResults(null);
        setTimeout(() => {
            // This is a mock search. In a real app, you'd fetch from an API.
            // We'll just return a random subset of commissions for demonstration.
            const randomResults = [...commissions].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);
            setResults(randomResults);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="absolute top-6 left-6">
                <Link href="/" className="flex items-center gap-2 text-foreground">
                    <Logo className="h-6 w-6" />
                    <span className="font-headline text-lg">Commisso</span>
                </Link>
            </div>
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Commission Status</CardTitle>
                    <CardDescription>Enter your mobile number to view your recent commission records.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSearch}>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="tel" 
                                placeholder="Enter mobile number..." 
                                className="pl-8"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/80" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {results && (
                <Card className="mt-6 w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Your Commissions</CardTitle>
                        <CardDescription>Showing results for mobile number {mobileNumber}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {results.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Commission</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((commission) => (
                                        <TableRow key={commission.id}>
                                            <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">${commission.commissionAmount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={statusStyles[commission.status]}>
                                                    {commission.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No commission records found for this mobile number.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
