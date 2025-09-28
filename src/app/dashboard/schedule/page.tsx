
'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { doc, writeBatch } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/firebase/user-profile-provider';
import { collection, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Loader2, Globe, PlusCircle } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { toZonedTime, format as formatInTimeZone } from 'date-fns-tz';
import { ScheduleSessionDialog } from '@/components/schedule/schedule-session-dialog';
import { SessionDetailsDialog } from '@/components/schedule/session-details-dialog';
import { SessionCard, ItemTypes } from '@/components/schedule/session-card';

// --- Interfaces ---
interface Session {
  id: string;
  startTime: Timestamp;
  endTime: Timestamp;
  studentId: string;
  teacherId: string;
  courseId: string;
  status?: string;
}

interface TenantUser {
  id: string;
  name: string;
  roles: string[];
}

interface Course {
  id: string;
  name: string;
}

// --- Constants ---
const timeZones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
];
const TENANT_ID = 'acme-tutoring';

// --- Helper Functions ---
const setDateHour = (date: Date, hour: number) => {
  const newDate = new Date(date);
  newDate.setHours(hour, 0, 0, 0);
  return newDate;
};

// --- Main Component ---
function SchedulePage() {
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTimeZone, setSelectedTimeZone] = useState<string | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // --- Hooks ---
  const { userProfile, isProfileLoading } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  // --- Effects ---
  useEffect(() => {
    if (userProfile && !selectedTimeZone) {
      setSelectedTimeZone(
        userProfile.preferredTimezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    }
  }, [userProfile, selectedTimeZone]);

  // --- Data Fetching ---
  const sessionsCollectionRef = useMemoFirebase(
    () => collection(firestore, `tenants/${TENANT_ID}/sessions`),
    [firestore]
  );
  const usersCollectionRef = useMemoFirebase(
    () => collection(firestore, `tenants/${TENANT_ID}/users`),
    [firestore]
  );
  const coursesCollectionRef = useMemoFirebase(
    () => collection(firestore, `tenants/${TENANT_ID}/courses`),
    [firestore]
  );

  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(
    sessionsCollectionRef
  );
  const { data: users, isLoading: usersLoading } = useCollection<TenantUser>(
    usersCollectionRef
  );
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(
    coursesCollectionRef
  );

  // --- Computed Properties ---
  const timeZone = selectedTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isAdmin = userProfile?.roles.includes('OrganizationAdmin') || false;

  const zonedCurrentDate = toZonedTime(currentDate, timeZone);
  const weekStart = startOfWeek(zonedCurrentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(zonedCurrentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const isLoading = sessionsLoading || usersLoading || coursesLoading || isProfileLoading;
  const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8); // 8am to 6pm

  // --- Event Handlers ---
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handlePreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  
  const handleEmptySlotClick = (day: Date, hour: number) => {
    if (!isAdmin) return;
    const slotDate = setDateHour(day, hour);
    setSelectedSlot(slotDate);
    setIsScheduleDialogOpen(true);
  };

  const handleSessionClick = (session: Session, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isAdmin) return;
    setSelectedSession(session);
    setIsDetailsDialogOpen(true);
  };

  const handleDrop = async (item: { id: string }, day: Date, hour: number) => {
    if (!isAdmin) return;

    const newStartTime = setDateHour(day, hour);
    const sessionToMove = sessions?.find(s => s.id === item.id);

    if (!sessionToMove) return;

    const originalDuration = sessionToMove.endTime.toMillis() - sessionToMove.startTime.toMillis();
    const newEndTime = new Date(newStartTime.getTime() + originalDuration);

    const batch = writeBatch(firestore);
    const sessionRef = doc(firestore, `tenants/${TENANT_ID}/sessions`, item.id);
    batch.update(sessionRef, { startTime: newStartTime, endTime: newEndTime });

    // This is a simplification. A real app would need a more robust way to find these refs.
    const studentSessionRef = doc(firestore, `tenants/${TENANT_ID}/users/${sessionToMove.studentId}/sessionsAsStudent`, item.id);
    batch.update(studentSessionRef, { startTime: newStartTime });

    const teacherSessionRef = doc(firestore, `tenants/${TENANT_ID}/users/${sessionToMove.teacherId}/sessionsAsTeacher`, item.id);
    batch.update(teacherSessionRef, { startTime: newStartTime });

    try {
      await batch.commit();
      toast({
        title: 'Session Rescheduled',
        description: 'The session has been moved to the new time slot.',
      });
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule the session. Please try again.',
        variant: 'destructive',
      });
    }
  };


  // --- Render Helpers ---
  const getUserName = (userId: string) => users?.find(u => u.id === userId)?.name || 'Unknown';
  const getCourseName = (courseId: string) => courses?.find(c => c.id === courseId)?.name || 'Unknown';

  return (
    <>
      <Card>
        <CardHeader>
           {/* ... Header content ... */}
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
                  {/* ... Table Header ... */}
                </TableHeader>
                <TableBody>
                  {timeSlots.map(hour => (
                    <TableRow key={hour}>
                      <TableCell className="font-medium border-r text-center">
                        {format(setDateHour(new Date(), hour), 'p')}
                      </TableCell>
                      {days.map(day => {
                        const sessionsInSlot = sessions?.filter(session => {
                            if (session.status === 'Cancelled') return false; // Don't show cancelled sessions
                            const sessionDateInZone = toZonedTime(session.startTime.toDate(), timeZone);
                            return isSameDay(sessionDateInZone, day) && sessionDateInZone.getHours() === hour;
                        }) || [];

                        const [, drop] = useDrop({
                          accept: ItemTypes.SESSION,
                          drop: (item: { id: string }) => handleDrop(item, day, hour),
                        });

                        return (
                          <TableCell
                            ref={drop}
                            key={day.toString()}
                            className={cn(
                                'p-1 border-r align-top h-24',
                                isAdmin && 'hover:bg-accent transition-colors',
                                sessionsInSlot.length === 0 && isAdmin && 'cursor-pointer'
                            )}
                            onClick={() => sessionsInSlot.length === 0 && handleEmptySlotClick(day, hour)}
                          >
                            {sessionsInSlot.length > 0 ? (
                                <div className="space-y-1">
                                {sessionsInSlot.map(session => (
                                    <SessionCard 
                                      key={session.id}
                                      session={session} 
                                      getUserName={getUserName} 
                                      getCourseName={getCourseName} 
                                      timeZone={timeZone} 
                                      formatInTimeZone={formatInTimeZone}
                                      onClick={(e) => handleSessionClick(session, e)}
                                    />
                                ))}
                                </div>
                            ) : (
                                isAdmin && (
                                    <div className="flex items-center justify-center h-full text-muted-foreground/50">
                                        <PlusCircle className="h-5 w-5" />
                                    </div>
                                )
                            )}
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

      {/* --- Dialogs --- */}
      {isAdmin && (
          <ScheduleSessionDialog
            isOpen={isScheduleDialogOpen}
            onOpenChange={setIsScheduleDialogOpen}
            slotDate={selectedSlot}
            tenantId={TENANT_ID}
          />
      )}
      {isAdmin && (
          <SessionDetailsDialog
            isOpen={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            session={selectedSession}
            tenantId={TENANT_ID}
            getUserName={getUserName}
            getCourseName={getCourseName}
          />
      )}
    </>
  );
}

export default function SchedulePageWrapper() {
  return (
    <DndProvider backend={HTML5Backend}>
      <SchedulePage />
    </DndProvider>
  );
}
