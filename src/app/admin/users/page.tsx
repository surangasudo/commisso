'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  Printer,
  FileText,
  Search,
  Pencil,
  Trash2,
  Eye,
  Columns3,
  PlusCircle,
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
import { users as initialUsers, type User } from '@/lib/data';
import { getUsers, deleteUser } from '@/services/userService';
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
import { exportToCsv, exportToXlsx, exportToPdf } from '@/lib/export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [visibleColumns, setVisibleColumns] = useState({
    username: true,
    name: true,
    role: true,
    email: true,
    action: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/edit/${userId}`);
  };

  const handleView = (userId: string) => {
    router.push(`/admin/users/view/${userId}`);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  const getExportData = () => users.map(u => ({
    username: u.username,
    name: u.name,
    role: u.role,
    email: u.email,
  }));

  const handleExportCsv = () => exportToCsv(getExportData(), 'users');
  const handleExportXlsx = () => exportToXlsx(getExportData(), 'users');
  const handlePrint = () => window.print();
  const handleExportPdf = () => {
    const headers = ["Username", "Name", "Role", "Email"];
    const data = users.map(u => [
      u.username, u.name, u.role, u.email
    ]);
    exportToPdf(headers, data, 'users');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle>All users</CardTitle>
            <Link href="/admin/users/add">
              <Button size="sm" className="h-9 gap-1.5 w-full sm:w-auto">
                <PlusCircle className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Select defaultValue="25">
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground hidden lg:inline">entries</span>
            </div>
            <div className="flex-1 flex flex-wrap items-center justify-start sm:justify-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-1" onClick={handleExportCsv}><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span></Button>
              <Button variant="outline" size="sm" className="h-9 gap-1" onClick={handleExportXlsx}><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export Excel</span></Button>
              <Button onClick={handlePrint} variant="outline" size="sm" className="h-9 gap-1"><Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print</span></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1"><Columns3 className="h-4 w-4" /> <span className="hidden sm:inline">Column visibility</span></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.keys(visibleColumns).map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      className="capitalize"
                      checked={visibleColumns[column as keyof typeof visibleColumns]}
                      onCheckedChange={() => toggleColumn(column as keyof typeof visibleColumns)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {column.replace(/([A-Z])/g, ' $1')}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="h-9 gap-1" onClick={handleExportPdf}><FileText className="h-4 w-4" /> <span className="hidden sm:inline">Export PDF</span></Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-full sm:w-auto h-9" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.username && <TableHead>Username</TableHead>}
                  {visibleColumns.name && <TableHead>Name</TableHead>}
                  {visibleColumns.role && <TableHead>Role</TableHead>}
                  {visibleColumns.email && <TableHead>Email</TableHead>}
                  {visibleColumns.action && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    {visibleColumns.username && <TableCell className="font-medium">{user.username}</TableCell>}
                    {visibleColumns.name && <TableCell>{user.name}</TableCell>}
                    {visibleColumns.role && <TableCell>{user.role}</TableCell>}
                    {visibleColumns.email && <TableCell>{user.email}</TableCell>}
                    {visibleColumns.action && <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEdit(user.id)}>
                          <Pencil className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-cyan-600 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700" onClick={() => handleView(user.id)}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteClick(user)}>
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="py-4">
          <div className="text-xs text-muted-foreground">
            Showing <strong>1 to {users.length}</strong> of <strong>{users.length}</strong> entries
          </div>
        </CardFooter>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              "{userToDelete?.name}" and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
