
'use client';

import { useState, useTransition } from "react";
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
  Loader2,
  Sparkles,
} from "lucide-react"
import { collection, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';

import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { summarizeText } from "@/ai/flows/summarize-text-flow";
import { FinancialChart } from "./financial-chart";

interface TenantUser {
  id: string;
  name: string;
  status: string;
  roles: string[];
}

interface Lead {
    id: string;
    status: string;
}

interface Session {
    id: string;
    startTime: Timestamp;
    courseId: string;
    studentId: string;
    teacherId: string;
}

interface Course {
    id: string;
    name: string;
}

const financialData = [
  { month: "January", revenue: 1860, expenses: 800 },
  { month: "February", revenue: 3050, expenses: 1200 },
  { month: "March", revenue: 2370, expenses: 1000 },
  { month: "April", revenue: 730, expenses: 500 },
  { month: "May", revenue: 2090, expenses: 950 },
  { month: "June", revenue: 2140, expenses: 1100 },
]

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring'; // This should be dynamic in a real multi-tenant app

  const [textToSummarize, setTextToSummarize] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, startSummarizing] = useTransition();

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, tenantId]);

  const leadsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'leads');
  }, [firestore, tenantId]);

  const sessionsQueryRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(
      collection(firestore, 'tenants', tenantId, 'sessions'),
      where('startTime', '>=', new Date()),
      orderBy('startTime'),
      limit(5)
    );
  }, [firestore, tenantId]);

  const coursesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'courses');
  }, [firestore, tenantId]);

  const { data: users, isLoading: usersLoading, error: usersError } = useCollection<TenantUser>(usersCollectionRef);
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useCollection<Lead>(leadsCollectionRef);
  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useCollection<Session>(sessionsQueryRef);
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCollection<Course>(coursesCollectionRef);
  const { data: allUsers, isLoading: allUsersLoading, error: allUsersError } = useCollection<TenantUser>(usersCollectionRef);

  const totalStudents = users ? users.filter(u => u.roles.includes('Student')).length : 0;
  const activeStudents = users ? users.filter(u => u.roles.includes('Student') && u.status === 'Active').length : 0;
  const totalLeads = leads ? leads.length : 0;

  const isLoading = usersLoading || leadsLoading || sessionsLoading || coursesLoading || allUsersLoading;
  const isError = usersError || leadsError || sessionsError || coursesError || allUsersError;

  const handleSummarize = () => {
    if (!textToSummarize) return;
    startSummarizing(async () => {
      const result = await summarizeText({ textToSummarize });
      setSummary(result.summary);
    });
  };

  const renderStat = (value: number) => {
    if (isLoading) return <Loader2 className="h-6 w-6 animate-spin"/>;
    if (isError) return <span className="text-destructive text-sm">Error</span>;
    return <div className="text-2xl font-bold">{value}</div>;
  }

  const getUserName = (userId: string) => {
    return allUsers?.find(u => u.id === userId)?.name || '...';
  }

  const getCourseName = (courseId: string) => {
    return courses?.find(c => c.id === courseId)?.name || '...';
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
            <div className="text-2xl font-bold text-muted-foreground">N/A</div>
            <p className="text-xs text-muted-foreground">
              Connect invoicing to see data
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
              A sample of monthly revenue and expenses.
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
              Here are the next few sessions on the schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
                 <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
            ) : sessions && sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium">{getUserName(session.studentId)}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        with {getUserName(session.teacherId)}
                      </div>
                    </TableCell>
                    <TableCell>{getCourseName(session.courseId)}</TableCell>
                    <TableCell className="text-right">{format(session.startTime.toDate(), 'p')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground text-center">No upcoming sessions found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Text Summarizer
          </CardTitle>
          <CardDescription>
            Paste any text below to generate a concise summary using AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your session notes, a long email, or any other text here..."
            className="h-32"
            value={textToSummarize}
            onChange={(e) => setTextToSummarize(e.target.value)}
            disabled={isSummarizing}
          />
          <Button onClick={handleSummarize} disabled={isSummarizing || !textToSummarize}>
            {isSummarizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSummarizing ? "Summarizing..." : "Generate Summary"}
          </Button>
          {summary && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{summary}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
