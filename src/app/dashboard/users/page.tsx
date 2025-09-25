
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
import { MoreHorizontal, PlusCircle, Loader2, Users as UsersIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format } from "date-fns";
import { useRouter } from 'next/navigation';


interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

export default function UsersPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();


  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    const tenantId = 'acme-tutoring'; 
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore]);

  const { data: users, isLoading, error } = useCollection<User>(usersCollectionRef);

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
        <div className="text-center text-destructive py-16">
          <p>Error loading users:</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }
    
    if (users && users.length > 0) {
      return (
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Joined Date</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground md:hidden">{user.role}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">{user.email}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{user.role}</TableCell>
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
    
    // Fallback if there are no users and not loading
    return (
       <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
        <UsersIcon className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">No Users Found</h3>
        <p className="mt-2 text-sm">Once the initial admin user is created, users for this organization will appear here.</p>
         <Button onClick={() => router.push('/dashboard/create-user')} className="mt-4">
            Create Initial Admin
          </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">User Management</CardTitle>
            <CardDescription>View, add, and manage all users in your organization.</CardDescription>
          </div>
          <Button disabled={!users || users.length === 0}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

