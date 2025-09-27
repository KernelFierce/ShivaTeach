
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
import { MoreHorizontal, PlusCircle, Loader2, Building } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, CollectionReference, DocumentData } from 'firebase/firestore';

interface Tenant {
    id: string;
    name: string;
    status: 'active' | 'suspended' | 'inactive';
    // In a real app, user count might be a denormalized field
}

export default function TenantManagementPage() {
  const firestore = useFirestore();
  
  const tenantsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tenants');
  }, [firestore]);

  const { data: tenants, isLoading, error } = useCollection<Tenant>(tenantsCollectionRef as CollectionReference<DocumentData> | null);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'destructive';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-4">Loading organizations...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-destructive-foreground bg-destructive/80 p-4 rounded-md">
          <p className="font-bold">Error loading tenants:</p>
          <p className="text-sm mt-2 font-mono">{error.message}</p>
        </div>
      );
    }

    if (!tenants || tenants.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
          <Building className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No Organizations Found</h3>
          <p className="mt-2 text-sm">There are no tenant organizations on the platform yet.</p>
          <Button className="mt-4" disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Organization
          </Button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell className="font-medium">{tenant.name}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(tenant.status)}>{tenant.status}</Badge>
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
                    <DropdownMenuItem disabled>Edit Tenant</DropdownMenuItem>
                    <DropdownMenuItem disabled>Suspend</DropdownMenuItem>
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
              <CardTitle className="font-headline">Tenant Management</CardTitle>
              <CardDescription>Onboard, suspend, or manage organizations on the platform.</CardDescription>
            </div>
            <Button disabled={isLoading || !!error}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Organization
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
