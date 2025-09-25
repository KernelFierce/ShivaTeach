
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
import { collection, writeBatch, doc, type Firestore } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

const MOCK_USERS_DATA = [
  { id: 'org-admin-01', name: 'Maria Garcia', email: 'maria.garcia@example.com', role: 'OrganizationAdmin', status: 'Active', joined: new Date().toISOString().split('T')[0] },
  { id: 'teacher-01', name: 'David Chen', email: 'david.chen@example.com', role: 'Teacher', status: 'Active', joined: new Date().toISOString().split('T')[0] },
  { id: 'student-01', name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Student', status: 'Active', joined: new Date().toISOString().split('T')[0] },
  { id: 'parent-01', name: 'Brenda Johnson', email: 'brenda.j@example.com', role: 'Parent', status: 'Active', joined: new Date().toISOString().split('T')[0] },
  { id: 'inactive-teacher-01', name: 'Charles Davis', email: 'charles.d@example.com', role: 'Teacher', status: 'Inactive', joined: new Date().toISOString().split('T')[0] },
];

async function saveInitialData(firestore: Firestore, tenantId: string) {
  const batch = writeBatch(firestore);

  MOCK_USERS_DATA.forEach(user => {
    const { id, ...userData } = user;
    // Public user profile
    const tenantUserRef = doc(firestore, 'tenants', tenantId, 'users', id);
    batch.set(tenantUserRef, userData);

    // Private user profile
    const privateUserRef = doc(firestore, 'users', id);
    batch.set(privateUserRef, {
      displayName: user.name,
      email: user.email,
      role: user.role,
      activeTenantId: tenantId,
    });
  });

  await batch.commit();
}


export default function UsersPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const tenantId = currentUser?.photoURL || 'acme-tutoring';

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, tenantId]);

  const { data: users, isLoading, error } = useCollection<User>(usersCollectionRef);

  const handleSaveToFirestore = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      return;
    }
    setIsSaving(true);
    try {
      await saveInitialData(firestore, tenantId);
      toast({ title: 'Success!', description: 'Initial user data has been saved to Firestore.' });
      // The useCollection hook will automatically refresh the data
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to save data', description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

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
    
    // If the database is empty, show the mock data and a button to save it.
    if (!users || users.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
          <UsersIcon className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">Database is Empty</h3>
          <p className="mt-2 text-sm">The `users` collection in Firestore has no documents. The table below shows the initial data that can be saved.</p>
          <Button onClick={handleSaveToFirestore} className="mt-6" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Initial Data to Firestore'}
          </Button>
          <div className='mt-6'>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {MOCK_USERS_DATA.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium text-left">{user.name}</TableCell>
                        <TableCell className="text-left">{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                        <Badge variant={getBadgeVariant(user.status)}>{user.status}</Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
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
    
    // If we have users, display them in the table.
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
