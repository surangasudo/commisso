'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { AppFooter } from '@/components/app-footer';


const initialRoles = [
  { id: 'role-1', name: 'Admin' },
  { id: 'role-2', name: 'Cashier' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<(typeof initialRoles[0]) | null>(null);

  const handleDeleteClick = (role: typeof initialRoles[0]) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (roleToDelete) {
      setRoles(roles.filter(r => r.id !== roleToDelete.id));
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <h1 className="font-headline text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Manage roles</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All roles</CardTitle>
            <Link href="/admin/roles/add">
              <Button size="sm" className="h-9 gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Select defaultValue="25">
                  <SelectTrigger className="w-[100px] h-9">
                    <SelectValue placeholder="25" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground hidden sm:inline">entries</span>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" />
              </div>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roles</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                          <ArrowUpDown className="h-4 w-4" /> Action
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/roles/edit/${role.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                              <Pencil className="mr-1 h-3 w-3" /> Edit
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(role)}>
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
          <CardFooter className="flex items-center justify-between py-4">
            <div className="text-xs text-muted-foreground">
              Showing <strong>1 to {roles.length}</strong> of <strong>{roles.length}</strong> entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="default" size="sm" className="h-9 w-9 p-0">1</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </CardFooter>
        </Card>
        <AppFooter />
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              "{roleToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
