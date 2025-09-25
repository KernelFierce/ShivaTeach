
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
import { MoreHorizontal, PlusCircle, Loader2, Database } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { seedInitialUserData } from '@/lib/seed';
import { useToast } from '@/hooks/use-toast';

// Define the type for a user object based on your data structure
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string; // Assuming 'joined' is a string date
}

export default function UsersPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  // IMPORTANT: We must memoize the collection reference to prevent infinite re-renders.
  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    // For now, we'll use a static tenantId. This will be dynamic later.
    const tenantId = 'acme-tutoring'; 
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, currentUser]);

  const { data: users, isLoading, error } = useCollection<User>(usersCollectionRef);

  const handleSeedData = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.'});
        return;
    }
    setIsSeeding(true);
    try {
        await seedInitialUserData(firestore, 'acme-tutoring');
        toast({ title: 'Success!', description: 'Initial user data has been seeded.' });
        // The useCollection hook will automatically refresh the data.
    } catch (e: any) {
        console.error("Seeding failed:", e);
        toast({ variant: 'destructive', title: 'Seeding Failed', description: e.message || 'Could not seed database.' });
    } finally {
        setIsSeeding(false);
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">User Management</CardTitle>
            <CardDescription>
              View, add, and manage all users in your organization.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
            <div className="text-center text-destructive py-16">
              <p>Error loading users:</p>
              <p className="text-sm">{error.message}</p>
            </div>
        ) : users && users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Joined Date
                </TableHead>
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
                    <div className="text-sm text-muted-foreground md:hidden">
                      {user.role}
                    </div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.role}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={getBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.joined}
                  </TableCell>
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
        ) : (
             <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                <Database className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No Users Found</h3>
                <p className="mt-2 text-sm">Your organization doesn't have any users yet.</p>
                <Button onClick={handleSeedData} className="mt-6" disabled={isSeeding}>
                    {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                    {isSeeding ? 'Seeding...' : 'Seed Initial Data'}
                </Button>
             </div>
        )}
      </CardContent>
    </Card>
  );
}
