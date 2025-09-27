
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { seedAllData } from '@/lib/seed';
import { useToast } from '@/hooks/use-toast';


interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

export default function UsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const tenantId = 'acme-tutoring'; // This should be dynamic in a real multi-tenant app

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, tenantId]);

  const { data: users, isLoading, error, manualRefresh } = useCollection<TenantUser>(usersCollectionRef);

  const getBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    const result = await seedAllData();
    setIsSeeding(false);

    if (result.success) {
      toast({
        title: "Database Seeded!",
        description: "Your database has been successfully populated with fresh data.",
      });
      manualRefresh(); // Manually refresh the collection data
    } else {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: result.message || "An unknown error occurred.",
      });
    }
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
           <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                      <Database className="mr-2 h-4 w-4" />
                      Seed Initial Data
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will wipe all existing data and replace it with a clean set of sample data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSeedData} disabled={isSeeding}>
                    {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSeeding ? 'Seeding...' : 'Yes, seed the database'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
          <div className="flex items-center gap-2">
             <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isLoading}>
                      <Database className="mr-2 h-4 w-4" />
                      Seed Database
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will wipe all existing data and replace it with a clean set of sample data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSeedData} disabled={isSeeding}>
                    {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSeeding ? 'Seeding...' : 'Yes, seed the database'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button disabled={isLoading || !!error}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
