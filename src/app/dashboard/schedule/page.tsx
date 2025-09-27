
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  startTime: Timestamp;
  endTime: Timestamp;
  studentId: string;
  teacherId: string;
  courseId: string;
}

interface TenantUser {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring';

  const sessionsCollectionRef = useMemoFirebase(
    () => collection(firestore, `tenants/${tenantId}/sessions`),
    [firestore, tenantId]
  );
  const usersCollectionRef = useMemoFirebase(
    () => collection(firestore, `tenants/${tenantId}/users`),
    [firestore, tenantId]
  );
  const coursesCollectionRef = useMemoFirebase(
    () => collection(firestore, `tenants/${tenantId}/courses`),
    [firestore, tenantId]
  );

  const { data: sessions, isLoading: sessionsLoading } =
    useCollection<Session>(sessionsCollectionRef);
  const { data: users, isLoading: usersLoading } =
    useCollection<TenantUser>(usersCollectionRef);
  const { data: courses, isLoading: coursesLoading } =
    useCollection<Course>(coursesCollectionRef);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const isLoading = sessionsLoading || usersLoading || coursesLoading;

  const getUserName = (userId: string) => users?.find((u) => u.id === userId)?.name || 'Unknown';
  const getCourseName = (courseId: string) => courses?.find((c) => c.id === courseId)?.name || 'Unknown';

  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handlePreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const timeSlots = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`); // 8am to 6pm

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle className="font-headline">Master Schedule</CardTitle>
                <CardDescription>
                An overview of all scheduled sessions for the week of{' '}
                {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] border-r">Time</TableHead>
                  {days.map((day) => (
                    <TableHead
                      key={day.toString()}
                      className={cn(
                        "text-center border-r",
                        isSameDay(day, new Date()) && 'bg-accent text-accent-foreground'
                      )}
                    >
                      {format(day, 'EEE d')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map((time) => (
                  <TableRow key={time}>
                    <TableCell className="font-medium border-r text-center">
                      {time}
                    </TableCell>
                    {days.map((day) => {
                      const hour = parseInt(time.split(':')[0]);
                      const sessionsInSlot =
                        sessions?.filter((session) => {
                          const sessionDate = session.startTime.toDate();
                          return (
                            isSameDay(sessionDate, day) &&
                            sessionDate.getHours() === hour
                          );
                        }) || [];

                      return (
                        <TableCell key={day.toString()} className="p-1 border-r align-top h-24">
                          <div className="space-y-1">
                            {sessionsInSlot.map((session) => (
                              <div
                                key={session.id}
                                className="bg-primary/10 border-l-4 border-primary text-primary-foreground p-2 rounded-md"
                              >
                                <p className="text-xs font-bold text-primary">
                                  {getCourseName(session.courseId)}
                                </p>
                                <p className="text-[11px] text-primary/80">
                                  {getUserName(session.studentId)} w/{' '}
                                  {getUserName(session.teacherId)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
