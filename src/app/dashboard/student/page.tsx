
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
  BookCheck,
  CalendarDays,
  Loader2
} from "lucide-react"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { format } from 'date-fns';
import { useEffect, useState } from "react";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitAssignmentDialog } from "./submit-assignment-dialog";

interface SessionRef {
    id: string;
    sessionId: string;
    startTime: Timestamp;
}

interface Session {
    id:string;
    startTime: Timestamp;
    courseId: string;
    teacherId: string;
}

interface Course {
    id: string;
    name: string;
}

interface TenantUser {
    id: string;
    name: string;
}

export interface Assignment {
    id: string;
    title: string;
    courseId: string;
    dueDate: Timestamp;
    grade?: number;
    submissionFileUrl?: string;
    courseName?: string;
}

export default function StudentDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring';
  const avatar = PlaceHolderImages.find(p => p.id === 'student-avatar');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const sessionRefsQueryRef = useMemoFirebase(() => {
    if (!firestore || !tenantId || !user) return null;
    return query(
      collection(firestore, `tenants/${tenantId}/users/${user.uid}/sessionsAsStudent`),
      where('startTime', '>=', new Date()),
      orderBy('startTime'),
      limit(5)
    );
  }, [firestore, tenantId, user]);

  const { data: sessionRefs, isLoading: sessionRefsLoading, manualRefresh: refreshSessionRefs } = useCollection<SessionRef>(sessionRefsQueryRef);

  useEffect(() => {
    async function fetchSessions() {
        if (!sessionRefs || !firestore || !tenantId) {
          setSessionsLoading(false);
          setSessions([]);
          return;
        };

        setSessionsLoading(true);
        const sessionPromises = sessionRefs.map(ref => 
            getDoc(doc(firestore, `tenants/${tenantId}/sessions`, ref.sessionId))
        );
        const sessionDocs = await Promise.all(sessionPromises);
        const fetchedSessions = sessionDocs
            .filter(docSnap => docSnap.exists())
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Session));
        
        setSessions(fetchedSessions);
        setSessionsLoading(false);
    }
    fetchSessions();
  }, [sessionRefs, firestore, tenantId])

  const coursesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'courses');
  }, [firestore, tenantId]);

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'users');
  }, [firestore, tenantId]);

  const assignmentsQueryRef = useMemoFirebase(() => {
    if (!firestore || !tenantId || !user) return null;
    // Secure query: Fetches assignments only from the current user's subcollection.
    return query(
      collection(firestore, `tenants/${tenantId}/users/${user.uid}/assignments`),
      orderBy('dueDate')
    );
  }, [firestore, tenantId, user]);
  
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesCollectionRef);
  const { data: users, isLoading: usersLoading } = useCollection<TenantUser>(usersCollectionRef);
  const { data: assignments, isLoading: assignmentsLoading, manualRefresh: refreshAssignments } = useCollection<Assignment>(assignmentsQueryRef);

  const handleDialogChange = (isOpen: boolean) => {
    setIsSubmitDialogOpen(isOpen);
    if (!isOpen) {
      // When the dialog closes, refresh the assignments list to show the new status
      refreshAssignments();
    }
  }

  const getCourseName = (courseId: string) => courses?.find(c => c.id === courseId)?.name || '...';
  const getUserName = (userId: string) => users?.find(u => u.id === userId)?.name || '...';

  const getAssignmentStatus = (assignment: Assignment) => {
    if (assignment.grade) return 'Graded';
    if (assignment.submissionFileUrl) return 'Submitted';
    if (assignment.dueDate.toDate() < new Date()) return 'Overdue';
    return 'Pending';
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Graded':
        return 'default';
      case 'Submitted':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  const handleSubmitClick = (assignment: Assignment) => {
    setSelectedAssignment({
      ...assignment,
      courseName: getCourseName(assignment.courseId),
    });
    setIsSubmitDialogOpen(true);
  };

  const isLoading = sessionsLoading || coursesLoading || usersLoading || sessionRefsLoading || assignmentsLoading;

  return (
    <>
      {selectedAssignment && (
          <SubmitAssignmentDialog 
              isOpen={isSubmitDialogOpen}
              onOpenChange={handleDialogChange}
              assignment={selectedAssignment}
              tenantId={tenantId}
              studentId={user?.uid || ''}
          />
      )}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
              {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />}
              <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
              <h1 className="text-3xl font-bold font-headline">Welcome, {user?.displayName?.split(' ')[0]}!</h1>
              <p className="text-muted-foreground">Here's your academic snapshot.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Upcoming Sessions
              </CardTitle>
              <CardDescription>
                Your next scheduled tutoring classes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
              ) : sessions && sessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Teacher</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{format(session.startTime.toDate(), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(session.startTime.toDate(), 'p')}</TableCell>
                      <TableCell>{getCourseName(session.courseId)}</TableCell>
                      <TableCell className="text-right">{getUserName(session.teacherId)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              ) : (
                <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-center">No upcoming sessions scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                  <BookCheck className="h-5 w-5" />
                  Assignments
              </CardTitle>
              <CardDescription>
                Keep track of your homework and submissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
              ) : assignments && assignments.length > 0 ? (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {assignments.map(assignment => {
                          const status = getAssignmentStatus(assignment);
                          return (
                              <TableRow key={assignment.id}>
                                  <TableCell className="font-medium">{assignment.title}</TableCell>
                                  <TableCell>{format(assignment.dueDate.toDate(), 'MMM d')}</TableCell>
                                  <TableCell>
                                      <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={status !== 'Pending' && status !== 'Overdue'}
                                        onClick={() => handleSubmitClick(assignment)}
                                      >
                                          Submit
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          )
                      })}
                  </TableBody>
              </Table>
              ) : (
                <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-center">No assignments found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
