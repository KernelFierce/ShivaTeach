'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// --- Component Props ---
interface SessionDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  session: any; // Replace with a proper session type
  tenantId: string;
  getUserName: (id: string) => string;
  getCourseName: (id: string) => string;
}

// --- Main Component ---
export function SessionDetailsDialog({ 
    isOpen, 
    onOpenChange, 
    session,
    tenantId,
    getUserName,
    getCourseName,
}: SessionDetailsDialogProps) {
  const firestore = useFirestore();
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  if (!session) return null;

  const handleCancelSession = async () => {
    setIsCancelling(true);
    try {
      const sessionRef = doc(firestore, `tenants/${tenantId}/sessions`, session.id);
      await updateDoc(sessionRef, { status: 'Cancelled' });
      toast({
        title: "Session Cancelled",
        description: "The session has been marked as cancelled.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>
            {session.startTime.toDate().toLocaleString()} - {session.endTime.toDate().toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right font-semibold">Student:</p>
                <p className="col-span-3">{getUserName(session.studentId)}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right font-semibold">Teacher:</p>
                <p className="col-span-3">{getUserName(session.teacherId)}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right font-semibold">Course:</p>
                <p className="col-span-3">{getCourseName(session.courseId)}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right font-semibold">Status:</p>
                <p className="col-span-3">{session.status || 'Scheduled'}</p>
            </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleCancelSession} disabled={isCancelling || session.status === 'Cancelled'}>
            {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {session.status === 'Cancelled' ? 'Already Cancelled' : 'Cancel Session'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
