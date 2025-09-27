
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export default function LeadsPage() {
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring'; // Hardcoded for now

  const leadsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'leads');
  }, [firestore, tenantId]);

  const { data: leads, isLoading, error } = useCollection<Lead>(leadsCollectionRef);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'New':
        return 'default';
      case 'Contacted':
        return 'secondary';
      case 'Converted':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-4">Loading leads...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-destructive-foreground bg-destructive/80 p-4 rounded-md">
          <p className="font-bold">Error loading leads:</p>
          <p className="text-sm mt-2 font-mono">{error.message}</p>
        </div>
      );
    }

    if (!leads || leads.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold">No Leads Found</h3>
          <p className="mt-2 text-sm">Your leads pipeline is empty.</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <div className="font-medium">{lead.firstName} {lead.lastName}</div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{lead.email}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(lead.status)}>{lead.status}</Badge>
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
                    <DropdownMenuItem>Mark as Contacted</DropdownMenuItem>
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
                <CardTitle className="font-headline">Lead Management</CardTitle>
                <CardDescription>Manage prospects and convert them into active students.</CardDescription>
            </div>
            <Button disabled={isLoading || !!error}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Lead
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
