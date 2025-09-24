'use client';

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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

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

  // IMPORTANT: We must memoize the collection reference to prevent infinite re-renders.
  // We assume a simple structure where the current user belongs to one tenant.
  // In a real multi-tenant app, you'd get the active tenantId from the user's profile.
  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    // This is a simplification. A real app would fetch `activeTenantId` from the user's profile.
    // For now, we'll assume a static tenantId or derive it if possible.
    // Let's create a placeholder tenantId for now.
    const tenantId = 'acme-tutoring'; // Replace with dynamic tenant ID later
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, currentUser]);

  const { data: users, isLoading } = useCollection<User>(usersCollectionRef);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Inactive':
        return 'secondary';
      case 'Lead':
        return 'outline';
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
        ) : (
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
              {users && users.map((user) => (
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
        )}
         {users && users.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-16">
              No users found in this organization yet.
            </div>
         )}
      </CardContent>
    </Card>
  );
}
