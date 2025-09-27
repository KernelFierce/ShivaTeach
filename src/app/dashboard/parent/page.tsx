
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Wallet, Calendar, CreditCard } from "lucide-react";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";

// Mock data - to be replaced with Firestore data
const mockInvoices = [
  { id: 'inv-001', dueDate: 'July 31, 2024', amount: 240.00, status: 'Paid' },
  { id: 'inv-002', dueDate: 'August 31, 2024', amount: 240.00, status: 'Due' },
];

const mockPayments = [
  { id: 'pay-001', date: 'July 15, 2024', amount: 240.00, method: 'Credit Card' },
  { id: 'pay-002', date: 'June 14, 2024', amount: 220.00, method: 'Credit Card' },
];

const currentBalance = 240.00;

export default function ParentDashboardPage() {
  const { user } = useUser();

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
                        Upcoming Payments
                    </CardTitle>
                    <CardDescription>A summary of your upcoming and recent invoices.</CardDescription>
                </CardHeader>
                <CardContent>
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
                            {mockInvoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-mono">{invoice.id}</TableCell>
                                    <TableCell>{invoice.dueDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">${invoice.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPayments.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.date}</TableCell>
                                    <TableCell>{payment.method}</TableCell>
                                    <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                    <p className="text-4xl font-bold">${currentBalance.toFixed(2)}</p>
                    <p className="text-sm text-primary-foreground/80">Due by August 31, 2024</p>
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" className="w-full">
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
