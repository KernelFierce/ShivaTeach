
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
  Loader2,
  Sparkles,
  Lightbulb,
  CheckCircle,
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
import { useEffect, useState, useTransition, useMemo } from "react";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitAssignmentDialog } from "./submit-assignment-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { suggestSessionTimes, bookSession } from "@/ai/flows/smart-schedule-flow";
import type { SmartScheduleOutput, BookSessionInput } from "@/ai/flows/smart-schedule-flow";
import { useToast } from "@/hooks/use-toast";


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
    roles: string[];
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
  const { toast } = useToast();
  const tenantId = 'acme-tutoring';
  const avatar = PlaceHolderImages.find(p => p.id === 'student-avatar');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // State for Smart Scheduler
  const [isFindingTimes, startFindingTimes] = useTransition();
  const [isBooking, startBooking] = useTransition();
  const [scheduleRequest, setScheduleRequest] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [scheduleSuggestion, setScheduleSuggestion] = useState<SmartScheduleOutput | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);


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
    return query(
      collection(firestore, `tenants/${tenantId}/users/${user.uid}/assignments`),
      orderBy('dueDate')
    );
  }, [firestore, tenantId, user]);
  
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesCollectionRef);
  const { data: users, isLoading: usersLoading } = useCollection<TenantUser>(usersCollectionRef);
  const { data: assignments, isLoading: assignmentsLoading, manualRefresh: refreshAssignments } = useCollection<Assignment>(assignmentsQueryRef);

  const studentTeachers = useMemo(() => {
    if (!users) return [];
    // This is a simplification. In a real app, you'd likely find teachers based on student's enrollments.
    return users.filter(u => u.roles.includes('Teacher'));
  }, [users]);

  const handleDialogChange = (isOpen: boolean) => {
    setIsSubmitDialogOpen(isOpen);
    if (!isOpen) {
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
  
  const handleFindTimes = () => {
    if (!scheduleRequest || !selectedTeacher || !user || !selectedCourse) return;
    setScheduleSuggestion(null);
    setScheduleError(null);
    setBookingSuccess(false);
    startFindingTimes(async () => {
      try {
        const result = await suggestSessionTimes({
          teacherId: selectedTeacher,
          studentId: user.uid,
          courseId: selectedCourse,
          studentRequest: scheduleRequest,
        });
        setScheduleSuggestion(result);
      } catch (error) {
        console.error("Error suggesting times:", error);
        setScheduleError("Sorry, I couldn't find any available times. Please try rephrasing your request.");
      }
    });
  };

  const handleBookSession = (isoTime: string) => {
    if (!selectedTeacher || !user || !selectedCourse) return;
    
    startBooking(async () => {
      try {
        const input: BookSessionInput = {
            startTime: isoTime,
            teacherId: selectedTeacher,
            studentId: user.uid,
            courseId: selectedCourse,
            courseName: getCourseName(selectedCourse) || 'Unknown Course',
            teacherName: getUserName(selectedTeacher) || 'Unknown Teacher',
            studentName: user.displayName || 'Unknown Student',
        };
        await bookSession(input);
        setBookingSuccess(true);
        setScheduleSuggestion(null);
        refreshSessionRefs(); // Refresh the upcoming sessions list
        toast({ title: "Session Booked!", description: "The new session has been added to your calendar." });
      } catch (error) {
        console.error("Error booking session:", error);
        toast({ variant: 'destructive', title: "Booking Failed", description: "Could not book the session. Please try again." });
      }
    });
  };

  const isLoading = sessionsLoading || coursesLoading || usersLoading || sessionRefsLoading || assignmentsLoading;
  const isScheduling = isFindingTimes || isBooking;

  return (
    <>
      {selectedAssignment && user && (
          <SubmitAssignmentDialog 
              isOpen={isSubmitDialogOpen}
              onOpenChange={handleDialogChange}
              assignment={selectedAssignment}
              tenantId={tenantId}
              studentId={user.uid}
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

        <div className="grid gap-6 md:grid-cols-1">
            <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Smart Scheduler
                </CardTitle>
                <CardDescription>
                    Need to schedule a session? Ask our AI assistant to find a time.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-3 lg:col-span-1 space-y-2">
                        <label className="text-sm font-medium">Course</label>
                        <Select
                          value={selectedCourse}
                          onValueChange={setSelectedCourse}
                          disabled={isScheduling || coursesLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses?.map(course => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-3 lg:col-span-1 space-y-2">
                        <label className="text-sm font-medium">Teacher</label>
                        <Select
                          value={selectedTeacher}
                          onValueChange={setSelectedTeacher}
                          disabled={isScheduling || studentTeachers.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a teacher..." />
                            </SelectTrigger>
                            <SelectContent>
                                {studentTeachers.map(teacher => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-3 lg:col-span-1 space-y-2">
                        <label className="text-sm font-medium">Your Request</label>
                        <Textarea
                            placeholder="e.g., 'Next Tuesday afternoon'"
                            value={scheduleRequest}
                            onChange={(e) => setScheduleRequest(e.target.value)}
                            disabled={isScheduling}
                        />
                    </div>
                </div>

                <Button onClick={handleFindTimes} disabled={isScheduling || !scheduleRequest || !selectedTeacher || !selectedCourse}>
                    {isFindingTimes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isFindingTimes ? "Finding Times..." : "Find Available Times"}
                </Button>

                {scheduleSuggestion && (
                    <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          {scheduleSuggestion.responseMessage}
                        </CardTitle>
                         <CardDescription>Click a time below to book it instantly.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {scheduleSuggestion.suggestedTimes.map((time, index) => (
                            <Button 
                                key={index} 
                                variant="outline"
                                onClick={() => handleBookSession(time.isoTime)}
                                disabled={isBooking}
                            >
                                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {time.humanReadable}
                            </Button>
                        ))}
                    </CardContent>
                    </Card>
                )}
                 {bookingSuccess && (
                    <Card className="bg-green-100/50 border-green-500/50">
                        <CardContent className="p-4 flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-800">Session Booked!</p>
                                <p className="text-sm text-green-700">Your new session is confirmed and has been added to your calendar.</p>
                            </div>
                        </CardContent>
                    </Card>
                 )}
                 {scheduleError && (
                    <Card className="bg-destructive/10 border-destructive">
                        <CardContent className="p-4">
                            <p className="text-sm text-destructive-foreground">{scheduleError}</p>
                        </CardContent>
                    </Card>
                 )}
            </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
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
