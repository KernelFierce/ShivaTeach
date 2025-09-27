
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { AddUserDialog } from './add-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import type { TenantUser } from '@/types/tenant-user';


export default function UsersPage() {
  const firestore = useFirestore();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);

  const tenantId = 'acme-tutoring'; // This should be dynamic in a real multi-tenant app

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, tenantId]);

  const { data: users, isLoading, error } = useCollection<TenantUser>(usersCollectionRef);

  const handleEditClick = (user: TenantUser) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  }

  const getBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-4">Loading user data from Firestore...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-destructive-foreground bg-destructive/80 p-4 rounded-md">
          <p className="font-bold">Error loading users:</p>
          <p className="text-sm mt-2 font-mono">{error.message}</p>
        </div>
      );
    }

    if (!users || users.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold">No Users Found</h3>
          <p className="mt-2 text-sm">Your organization doesn't have any users yet.</p>
           <p className="mt-2 text-sm">
            If this is a new setup, you may need to seed the database.
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Joined Date</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground md:hidden">{user.roles.join(', ')}</div>
                <div className="hidden text-sm text-muted-foreground md:inline">{user.email}</div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{user.roles.join(', ')}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={getBadgeVariant(user.status)}>{user.status}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEditClick(user)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <AddUserDialog
        isOpen={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        tenantId={tenantId}
      />
      {selectedUser && (
        <EditUserDialog
          isOpen={isEditUserOpen}
          onOpenChange={setIsEditUserOpen}
          tenantId={tenantId}
          user={selectedUser}
        />
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">User Management</CardTitle>
              <CardDescription>View, add, and manage all users in your organization.</CardDescription>
            </div>
            <Button
              disabled={isLoading || !!error}
              onClick={() => setIsAddUserOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </>
  );
}
