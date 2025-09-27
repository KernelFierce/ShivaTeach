
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
  BookOpen,
  Loader2,
} from "lucide-react"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlaceHolderImages } from "@/lib/placeholder-images"

interface Session {
    id: string;
    startTime: Timestamp;
    courseId: string;
    studentId: string;
}

interface TenantUser {
    id: string;
    name: string;
    role: string;
    subject?: string; // This might not be on the user object directly
    lastSession?: string; // This would likely come from session data
}

interface Course {
    id: string;
    name: string;
}


export default function TeacherDashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const tenantId = 'acme-tutoring';
    const avatar = PlaceHolderImages.find(p => p.id === 'avatar-2');

    const sessionsQueryRef = useMemoFirebase(() => {
        if (!firestore || !tenantId || !user) return null;
        return query(
            collection(firestore, 'tenants', tenantId, 'sessions'),
            where('teacherId', '==', user.uid),
            where('startTime', '>=', new Date()),
            orderBy('startTime'),
            limit(5)
        );
    }, [firestore, tenantId, user]);

    const usersCollectionRef = useMemoFirebase(() => {
        if (!firestore || !tenantId) return null;
        return collection(firestore, 'tenants', tenantId, 'users');
    }, [firestore, tenantId]);

    const coursesCollectionRef = useMemoFirebase(() => {
        if (!firestore || !tenantId) return null;
        return collection(firestore, 'tenants', tenantId, 'courses');
    }, [firestore, tenantId]);

    const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQueryRef);
    const { data: allUsers, isLoading: usersLoading } = useCollection<TenantUser>(usersCollectionRef);
    const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesCollectionRef);

    const teacherStudents = useMemoFirebase(() => {
        if (!sessions || !allUsers) return [];
        const studentIds = new Set(sessions.map(s => s.studentId));
        return allUsers.filter(u => studentIds.has(u.id));
    }, [sessions, allUsers]);

    const getStudentName = (studentId: string) => allUsers?.find(u => u.id === studentId)?.name || '...';
    const getCourseName = (courseId: string) => courses?.find(c => c.id === courseId)?.name || '...';

    const isLoading = sessionsLoading || usersLoading || coursesLoading;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's what's on your agenda for today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{sessions?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">
              in the near future
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{teacherStudents.length}</div>}
            <p className="text-xs text-muted-foreground">
              in your upcoming sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              awaiting your review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Today's Agenda</CardTitle>
            <CardDescription>
              Here are your scheduled sessions for today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Subject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions?.filter(s => format(s.startTime.toDate(), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{format(session.startTime.toDate(), 'p')}</TableCell>
                    <TableCell>{getStudentName(session.studentId)}</TableCell>
                    <TableCell className="text-right">{getCourseName(session.courseId)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">My Students</CardTitle>
            <CardDescription>
              A quick overview of your assigned students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
            ) : (
            <div className="space-y-4">
                {teacherStudents.map(student => (
                    <div key={student.id} className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                           {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />}
                           <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{/* Course info could be added here */}</p>
                        </div>
                    </div>
                ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
