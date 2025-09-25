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
import { MoreHorizontal, PlusCircle, Loader2, Database, Save } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";


// --- New Approach: Define the initial data directly in the component ---
const INITIAL_MOCK_USERS = [
  { uid: 'org-admin-01', name: 'Maria Garcia', email: 'maria.garcia@example.com', role: 'OrganizationAdmin', status: 'Active' },
  { uid: 'teacher-01', name: 'David Chen', email: 'david.chen@example.com', role: 'Teacher', status: 'Active' },
  { uid: 'student-01', name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Student', status: 'Active' },
  { uid: 'parent-01', name: 'Brenda Johnson', email: 'brenda.j@example.com', role: 'Parent', status: 'Active' },
  { uid: 'inactive-teacher-01', name: 'Charles Davis', email: 'charles.d@example.com', role: 'Teacher', status: 'Inactive' },
];

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
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    const tenantId = 'acme-tutoring'; 
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, currentUser]);

  const { data: users, isLoading, error } = useCollection<User>(usersCollectionRef);

  const handleSaveToFirestore = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.'});
        return;
    }
    setIsSaving(true);
    const tenantId = 'acme-tutoring';
    
    try {
        const batch = writeBatch(firestore);
        const joinedDate = format(new Date(), 'yyyy-MM-dd');

        INITIAL_MOCK_USERS.forEach(user => {
            const tenantUserData = { name: user.name, email: user.email, role: user.role, status: user.status, joined: joinedDate };
            const privateUserData = { displayName: user.name, email: user.email, role: user.role, activeTenantId: tenantId };

            const tenantUserRef = doc(firestore, 'tenants', tenantId, 'users', user.uid);
            batch.set(tenantUserRef, tenantUserData);

            const privateUserRef = doc(firestore, 'users', user.uid);
            batch.set(privateUserRef, privateUserData);
        });

        await batch.commit();
        toast({ title: 'Success!', description: 'Initial user data has been saved to Firestore.' });
        // The useCollection hook will automatically refresh the data, so no manual refresh is needed.
    } catch (e: any) {
        console.error("Saving to Firestore failed:", e);
        toast({ variant: 'destructive', title: 'Save Failed', description: e.message || 'Could not save initial data.' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const getBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const renderUserTable = (userList: Omit<User, 'id' | 'joined'>[] & {id?: string, joined?: string}[]) => (
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
        {userList.map((user, index) => (
          <TableRow key={user.id || `mock-${index}`}>
            <TableCell>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground md:hidden">{user.role}</div>
              <div className="hidden text-sm text-muted-foreground md:inline">{user.email}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{user.role}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge variant={getBadgeVariant(user.status)}>{user.status}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{user.joined || format(new Date(), 'yyyy-MM-dd')}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!users}>
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
    
    // If firestore has users, display them
    if (users && users.length > 0) {
      return renderUserTable(users);
    }
    
    // Otherwise, show the mock data and the button to save it
    return (
      <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
        <Database className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">Database is Empty</h3>
        <p className="mt-2 text-sm">Click the button below to save the initial user data to Firestore.</p>
        <Button onClick={handleSaveToFirestore} className="mt-6" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? 'Saving...' : 'Save to Firestore'}
        </Button>
        <div className="mt-8 text-left">
            <h4 className="font-semibold text-foreground text-center mb-4">Data to be saved:</h4>
            {renderUserTable(INITIAL_MOCK_USERS.map(u => ({...u, id: u.uid})))}
        </div>
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
