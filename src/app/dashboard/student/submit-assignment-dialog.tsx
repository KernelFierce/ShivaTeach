
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Paperclip } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Assignment } from './page';

const submitAssignmentSchema = z.object({
  file: z.instanceof(FileList).refine((files) => files?.length === 1, 'File is required.'),
  comments: z.string().optional(),
});

type SubmitAssignmentFormValues = z.infer<typeof submitAssignmentSchema>;

interface SubmitAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  assignment: Assignment;
  tenantId: string;
  studentId: string;
}

export function SubmitAssignmentDialog({
  isOpen,
  onOpenChange,
  assignment,
  tenantId,
  studentId,
}: SubmitAssignmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubmitAssignmentFormValues>({
    resolver: zodResolver(submitAssignmentSchema),
  });

  const onSubmit = async (values: SubmitAssignmentFormValues) => {
    setIsSubmitting(true);
    const file = values.file[0];
    if (!file) return;

    const storage = getStorage();
    const firestore = getFirestore();

    try {
      // 1. Upload file to Firebase Storage
      const storagePath = `tenants/${tenantId}/assignments/${studentId}/${assignment.id}/${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 2. Update Firestore document with the URL
      const assignmentDocRef = doc(
        firestore,
        `tenants/${tenantId}/users/${studentId}/assignments`,
        assignment.id
      );
      await updateDoc(assignmentDocRef, {
        submissionFileUrl: downloadURL,
        submissionComments: values.comments || '',
        submittedAt: new Date(),
      });

      toast({
        title: 'Submission Received!',
        description: `Your work for "${assignment.title}" has been submitted.`,
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description:
          'There was a problem uploading your file. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileRef = form.register("file");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit: {assignment.title}</DialogTitle>
          <DialogDescription>
            Upload your file for the course: <b>{assignment.courseName}</b>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment File</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="file"
                        className="pl-8"
                        {...fileRef}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes for your teacher..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
