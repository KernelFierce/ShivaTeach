
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  file: z
    .any()
    .refine((files) => files?.length === 1, 'File is required.'),
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
  studentId
}: SubmitAssignmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubmitAssignmentFormValues>({
    resolver: zodResolver(submitAssignmentSchema),
  });
  
  // This is a placeholder. In a real implementation, this would
  // upload the file to Firebase Storage and then update the Firestore document.
  const onSubmit = async (values: SubmitAssignmentFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Form Values:', values);
    console.log('Uploading file for assignment:', assignment.id);
    
    toast({
      title: 'Submission Received!',
      description: `Your work for "${assignment.title}" has been submitted.`,
    });

    setIsSubmitting(false);
    onOpenChange(false);
    form.reset();
  };

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
                            onChange={(e) => field.onChange(e.target.files)}
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
