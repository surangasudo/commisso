'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  Printer,
  Search,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type CommissionProfile } from '@/lib/data';
import { exportToCsv } from '@/lib/export';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCommissionProfiles, deleteCommissionProfile } from '@/services/commissionService';
import { Skeleton } from '@/components/ui/skeleton';

export default function SalesCommissionAgentsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<CommissionProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<CommissionProfile | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getCommissionProfiles();
        setProfiles(data);
      } catch (error) {
        console.error("Failed to fetch commission profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);
  
  const handleEdit = (profileId: string) => {
    router.push(`/admin/sales-commission-agents/edit/${profileId}`);
  };

  const handleView = (profileId: string) => {
    router.push(`/admin/sales-commission-agents/view/${profileId}`);
  };

  const handleDeleteClick = (profile: CommissionProfile) => {
    setProfileToDelete(profile);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (profileToDelete) {
      try {
        await deleteCommissionProfile(profileToDelete.id);
        setProfiles(profiles.filter(p => p.id !== profileToDelete.id));
      } catch (error) {
        console.error("Failed to delete profile:", error);
      } finally {
        setIsDeleteDialogOpen(false);
        setProfileToDelete(null);
      }
    }
  };

  const getExportData = () => profiles.map(p => ({
    name: p.name,
    entityType: p.entityType,
    phone: p.phone,
    bankDetails: p.bankDetails || 'N/A',
    overallCommission: `${p.commission.overall}%`,
    categoryCommissions: p.commission.categories?.map(c => `${c.category}: ${c.rate}%`).join('; ') || 'N/A'
  }));
  
  const handleExport = () => exportToCsv(getExportData(), 'commission-profiles');
  const handlePrint = () => window.print();

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <CardTitle>Commission Profiles</CardTitle>
          <div className="flex flex-col items-end gap-2">
            <Link href="/admin/sales-commission-agents/add">
              <Button>Add Profile</Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export</Button>
              <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search profiles..." className="pl-8 w-full h-9" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                    </TableRow>
                  ))
                ) : profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell><Badge variant="outline">{profile.entityType}</Badge></TableCell>
                    <TableCell>{profile.phone}</TableCell>
                    <TableCell>{profile.bankDetails || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 items-center">
                          <Badge variant="secondary">Overall: {profile.commission.overall}%</Badge>
                          {profile.commission.categories?.map(c => (
                              <Badge key={c.category} variant="outline">{c.category}: {c.rate}%</Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEdit(profile.id)}>
                                <Pencil className="mr-1 h-3 w-3" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-cyan-600 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700" onClick={() => handleView(profile.id)}>
                                <Eye className="mr-1 h-3 w-3" /> View
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(profile)}>
                                <Trash2 className="mr-1 h-3 w-3" /> Delete
                            </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="py-4">
          <div className="text-xs text-muted-foreground">
            Showing <strong>1 to {profiles.length}</strong> of <strong>{profiles.length}</strong> entries
          </div>
        </CardFooter>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the commission profile for "{profileToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProfileToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
