
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2, BookCopy } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Subject {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  subjectId: string;
  hourlyRate: number;
}

export default function CoursesPage() {
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring'; // Hardcoded for now

  const subjectsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'subjects');
  }, [firestore, tenantId]);

  const coursesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, 'tenants', tenantId, 'courses');
  }, [firestore, tenantId]);

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useCollection<Subject>(subjectsCollectionRef);
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCollection<Course>(coursesCollectionRef);

  const groupedCourses = useMemo(() => {
    if (!subjects || !courses) return [];
    return subjects.map(subject => ({
      ...subject,
      courses: courses.filter(course => course.subjectId === subject.id),
    }));
  }, [subjects, courses]);
  
  const isLoading = subjectsLoading || coursesLoading;
  const error = subjectsError || coursesError;

  const renderLoadingState = () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center text-destructive-foreground bg-destructive/80 p-4 rounded-md">
      <p className="font-bold">Error loading course data:</p>
      <p className="text-sm mt-2 font-mono">{error?.message}</p>
    </div>
  );

  const renderEmptyState = () => (
     <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
        <BookCopy className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">No Subjects Found</h3>
        <p className="mt-2 text-sm">Your organization doesn't have any subjects or courses defined yet.</p>
        <Button className="mt-4" disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
        </Button>
    </div>
  );


  const renderContent = () => {
    if (isLoading) return renderLoadingState();
    if (error) return renderErrorState();
    if (!groupedCourses || groupedCourses.length === 0) return renderEmptyState();

    return (
      <Accordion type="single" collapsible className="w-full">
        {groupedCourses.map(subject => (
          <AccordionItem value={subject.id} key={subject.id}>
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
                <div className="flex items-center gap-4">
                    {subject.name}
                    <Badge variant="outline">{subject.courses.length} {subject.courses.length === 1 ? 'Course' : 'Courses'}</Badge>
                </div>
            </AccordionTrigger>
            <AccordionContent>
              {subject.courses.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course Name</TableHead>
                            <TableHead className="text-right">Hourly Rate</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subject.courses.map(course => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.name}</TableCell>
                                <TableCell className="text-right">${course.hourlyRate.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-md">
                    <p>No courses found for this subject.</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Course Management</CardTitle>
                <CardDescription>Define the subjects and courses your organization offers.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button disabled={isLoading || !!error}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                </Button>
                 <Button variant="outline" disabled={isLoading || !!error}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
