'use client';

import { useState, useEffect } from 'react';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { collection } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react';

// --- Zod Schema for Validation ---
const sessionSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  courseId: z.string().min(1, 'Course is required'),
});

// --- Component Props ---
interface ScheduleSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  slotDate: Date | null;
  tenantId: string;
}

// --- Main Component ---
export function ScheduleSessionDialog({ 
    isOpen, 
    onOpenChange, 
    slotDate,
    tenantId,
}: ScheduleSessionDialogProps) {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { handleSubmit, control, reset } = useForm({
    resolver: zodResolver(sessionSchema),
  });

  // --- Data Fetching ---
  const usersCollectionRef = useMemoFirebase(() => collection(firestore, `tenants/${tenantId}/users`), [firestore, tenantId]);
  const coursesCollectionRef = useMemoFirebase(() => collection(firestore, `tenants/${tenantId}/courses`), [firestore, tenantId]);
  
  const { data: users, isLoading: usersLoading } = useCollection(usersCollectionRef);
  const { data: courses, isLoading: coursesLoading } = useCollection(coursesCollectionRef);

  const students = users?.filter(u => u.roles.includes('Student')) || [];
  const teachers = users?.filter(u => u.roles.includes('Teacher')) || [];

  // --- Effect to Reset Form ---
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // --- Submission Handler ---
  const onSubmit = async (data: any) => {
    if (!slotDate) return;
    setIsSubmitting(true);
    try {
        const batch = writeBatch(firestore);
        
        // 1. Create main session document
        const sessionRef = doc(collection(firestore, `tenants/${tenantId}/sessions`));
        batch.set(sessionRef, {
            ...data,
            startTime: slotDate, // The start time is the date of the clicked slot
            endTime: new Date(slotDate.getTime() + 60 * 60 * 1000), // Assume 1-hour session
            status: 'Scheduled',
            createdAt: serverTimestamp(),
        });

        // 2. Create reference for the student
        const studentSessionRef = doc(collection(firestore, `tenants/${tenantId}/users/${data.studentId}/sessionsAsStudent`));
        batch.set(studentSessionRef, { sessionId: sessionRef.id, startTime: slotDate });

        // 3. Create reference for the teacher
        const teacherSessionRef = doc(collection(firestore, `tenants/${tenantId}/users/${data.teacherId}/sessionsAsTeacher`));
        batch.set(teacherSessionRef, { sessionId: sessionRef.id, startTime: slotDate });

        await batch.commit();

        toast({
            title: "Session Scheduled",
            description: "The new session has been added to the calendar.",
        });
        onOpenChange(false);
    } catch (error) {
        console.error('Error scheduling session:', error);
        toast({
            title: "Error",
            description: "Failed to schedule the session. Please try again.",
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
          <DialogDescription>
            {slotDate ? `For ${slotDate.toLocaleString()}` : ''}
          </DialogDescription>
        </DialogHeader>
        {(usersLoading || coursesLoading) ? (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              {/* Student Selector */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentId" className="text-right">Student</Label>
                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Teacher Selector */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teacherId" className="text-right">Teacher</Label>
                <Controller
                  name="teacherId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Course Selector */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="courseId" className="text-right">Course</Label>
                <Controller
                  name="courseId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Schedule Session
                </Button>
              </DialogFooter>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
