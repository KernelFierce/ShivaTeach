
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Wallet, Calendar, CreditCard, Loader2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, Timestamp } from "firebase/firestore";
import { format } from "date-fns";

interface Invoice {
  id: string;
  dueDate: Timestamp;
  amount: number;
  status: 'Paid' | 'Due' | 'Overdue';
}

interface Payment {
  id: string;
  paymentDate: Timestamp;
  amount: number;
  method: string;
}

export default function ParentDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring'; // This would be dynamic for a real multi-tenant app

  // This is a simplification. In a real app, you'd likely link the parent user to the student user.
  // For now, we assume the logged-in parent is associated with the student 'Alex Johnson' (student@tutorhub.com)
  const studentId = 'Fj5dd2F9g9Qc0v2Gv3A1wXyZ5kC3'; // Hardcoded student ID for Alex Johnson

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId || !studentId) return null;
    return query(
      collection(firestore, `tenants/${tenantId}/invoices`),
      where('studentId', '==', studentId)
    );
  }, [firestore, tenantId, studentId]);

  const paymentsQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId || !studentId) return null;
    return query(
      collection(firestore, `tenants/${tenantId}/payments`),
      where('studentId', '==', studentId)
    );
  }, [firestore, tenantId, studentId]);

  const { data: invoices, isLoading: invoicesLoading } = useCollection<Invoice>(invoicesQuery);
  const { data: payments, isLoading: paymentsLoading } = useCollection<Payment>(paymentsQuery);
  
  const isLoading = invoicesLoading || paymentsLoading;

  const currentBalance = invoices?.filter(inv => inv.status === 'Due' || inv.status === 'Overdue').reduce((acc, inv) => acc + inv.amount, 0) || 0;
  const nextDueDate = invoices?.find(inv => inv.status === 'Due' || inv.status === 'Overdue')?.dueDate;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'secondary';
      case 'Due':
        return 'default';
      case 'Overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Parent Portal</h1>
        <p className="text-muted-foreground">Welcome, {user?.displayName}. Here is your financial summary.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Payments */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Invoice History
                    </CardTitle>
                    <CardDescription>A summary of your student's invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                   {isLoading ? (
                     <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
                   ) : invoices && invoices.length > 0 ? (
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-mono">{invoice.id.substring(0, 7)}...</TableCell>
                                    <TableCell>{format(invoice.dueDate.toDate(), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">${invoice.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    ) : (
                      <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No invoices found.</p>
                      </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Payment History
                    </CardTitle>
                    <CardDescription>A log of all payments made.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
                    ) : payments && payments.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell>{format(payment.paymentDate.toDate(), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{payment.method}</TableCell>
                                    <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    ) : (
                        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No payment history found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
             <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Current Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                     <div className="h-20 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>
                  ) : (
                    <>
                      <p className="text-4xl font-bold">${currentBalance.toFixed(2)}</p>
                      <p className="text-sm text-primary-foreground/80">
                        {nextDueDate ? `Due by ${format(nextDueDate.toDate(), 'MMM d, yyyy')}` : 'No outstanding balance'}
                      </p>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" className="w-full" disabled={isLoading || currentBalance === 0}>
                        <CreditCard className="mr-2" />
                        Make a Payment
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
