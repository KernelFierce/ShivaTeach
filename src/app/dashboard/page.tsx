

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  CalendarCheck,
  Briefcase,
  DollarSign,
  LineChart,
  Loader2
} from "lucide-react"
import { collection } from "firebase/firestore";

import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { FinancialChart } from "./financial-chart"
import { financialData, upcomingSessions } from "@/lib/mock-data" // Keep some mock data for now

interface TenantUser {
  id: string;
  status: string;
  role: string;
}

interface Lead {
    id: string;
    status: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring'; // This should be dynamic in a real multi-tenant app

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, tenantId]);

  const leadsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'leads');
  }, [firestore, tenantId]);

  const { data: users, isLoading: usersLoading, error: usersError } = useCollection<TenantUser>(usersCollectionRef);
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useCollection<Lead>(leadsCollectionRef);

  const totalStudents = users ? users.filter(u => u.role === 'Student').length : 0;
  const activeStudents = users ? users.filter(u => u.role === 'Student' && u.status === 'Active').length : 0;
  const totalLeads = leads ? leads.length : 0;

  const isLoading = usersLoading || leadsLoading;
  const isError = usersError || leadsError;

  const renderStat = (value: number) => {
    if (isLoading) return <Loader2 className="h-6 w-6 animate-spin"/>;
    if (isError) return <span className="text-destructive text-sm">Error</span>;
    return <div className="text-2xl font-bold">{value}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user?.displayName || user?.email?.split('@')[0]}!</h1>
        <p className="text-muted-foreground">Here's a summary of your organization's activity.</p>
      </div>

      {isError && (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Permissions Error</CardTitle>
                <CardDescription className="text-destructive-foreground">
                    There was an error fetching dashboard data. Please ensure your Firestore security rules allow logged-in users to read the required collections.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStat(totalStudents)}
            <p className="text-xs text-muted-foreground">
              Across all programs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStat(activeStudents)}
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {renderStat(totalLeads)}
            <p className="text-xs text-muted-foreground">
              Potential new students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData[financialData.length - 1].revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              For the current month (mock)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <LineChart className="h-5 w-5"/>
              Financial Overview
            </CardTitle>
            <CardDescription>
              Monthly revenue and expenses overview (mock data).
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <FinancialChart data={financialData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Sessions</CardTitle>
            <CardDescription>
              Here are the next few sessions on the schedule (mock data).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium">{session.student}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        with {session.teacher}
                      </div>
                    </TableCell>
                    <TableCell>{session.subject}</TableCell>
                    <TableCell className="text-right">{session.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
