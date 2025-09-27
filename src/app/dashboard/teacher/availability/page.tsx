
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Save, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, writeBatch, getDocs } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

type TimeSlot = {
  id: string;
  start: string;
  end: string;
};

type Availability = {
  [key: string]: {
    isEnabled: boolean;
    slots: TimeSlot[];
  };
};

type AvailabilityDoc = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const initialAvailability: Availability = daysOfWeek.reduce((acc, day) => {
  acc[day] = { isEnabled: false, slots: [] };
  return acc;
}, {} as Availability);

export default function AvailabilityPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring';

  const [availability, setAvailability] = useState<Availability>(initialAvailability);
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const availabilityCollectionRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return collection(firestore, `tenants/${tenantId}/availabilities`);
  }, [firestore, tenantId]);
  
  const teacherAvailabilityQuery = useMemoFirebase(() => {
    if (!availabilityCollectionRef || !user?.uid) return null;
    return query(availabilityCollectionRef, where('teacherId', '==', user.uid));
  }, [availabilityCollectionRef, user?.uid]);

  const { data: availabilityDocs, isLoading: docsLoading } = useCollection<AvailabilityDoc>(teacherAvailabilityQuery);

  useEffect(() => {
    if (!docsLoading) {
      if (availabilityDocs) {
        const newAvailability: Availability = { ...initialAvailability };
        daysOfWeek.forEach(day => {
            newAvailability[day] = { isEnabled: false, slots: [] };
        });

        availabilityDocs.forEach(doc => {
          const dayName = daysOfWeek[doc.dayOfWeek];
          if (dayName) {
            newAvailability[dayName].isEnabled = true;
            newAvailability[dayName].slots.push({
              id: doc.id,
              start: doc.startTime,
              end: doc.endTime,
            });
          }
        });
        setAvailability(newAvailability);
      }
      setInitialLoading(false);
    }
  }, [availabilityDocs, docsLoading]);

  const handleDayToggle = (day: string, isEnabled: boolean) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isEnabled,
        slots: isEnabled && prev[day].slots.length === 0 ? [{ id: Date.now().toString(), start: '09:00', end: '17:00' }] : (isEnabled ? prev[day].slots : []),
      },
    }));
  };

  const handleSlotChange = (day: string, slotId: string, part: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map(slot => 
          slot.id === slotId ? { ...slot, [part]: value } : slot
        ),
      },
    }));
  };

  const handleAddSlot = (day: string) => {
    setAvailability(prev => ({
        ...prev,
        [day]: {
            ...prev[day],
            slots: [...prev[day].slots, { id: Date.now().toString(), start: '09:00', end: '10:00' }]
        }
    }))
  }

  const handleRemoveSlot = (day: string, slotId: string) => {
     setAvailability(prev => ({
        ...prev,
        [day]: {
            ...prev[day],
            slots: prev[day].slots.filter(slot => slot.id !== slotId)
        }
    }))
  }

  const handleSave = async () => {
    if (!firestore || !user || !availabilityCollectionRef) return;
    setIsSaving(true);
    
    const batch = writeBatch(firestore);

    try {
        // 1. Get all existing availability docs for the current teacher
        const q = query(availabilityCollectionRef, where("teacherId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        // 2. Delete all existing docs in the batch
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 3. Add new docs based on the current state
        Object.entries(availability).forEach(([day, { isEnabled, slots }]) => {
            if (isEnabled) {
                const dayOfWeek = daysOfWeek.indexOf(day);
                slots.forEach(slot => {
                    const newDocRef = doc(availabilityCollectionRef);
                    batch.set(newDocRef, {
                        teacherId: user.uid,
                        tenantId: tenantId,
                        dayOfWeek: dayOfWeek,
                        startTime: slot.start,
                        endTime: slot.end,
                    });
                });
            }
        });

        // 4. Commit the batch
        await batch.commit();

        toast({
            title: "Availability Saved",
            description: "Your weekly schedule has been updated.",
        });

    } catch (error) {
        console.error("Error saving availability:", error);
        toast({
            variant: "destructive",
            title: "Error Saving",
            description: "Could not save your availability. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (initialLoading) {
      return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">My Weekly Availability</CardTitle>
              <CardDescription>
                Set your recurring weekly schedule. Students will only be able to book you during these times.
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {daysOfWeek.map((day) => (
            <Card key={day}>
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <p className="font-medium">{day}</p>
                <Switch
                  checked={availability[day].isEnabled}
                  onCheckedChange={(checked) => handleDayToggle(day, checked)}
                />
              </CardHeader>
              {availability[day].isEnabled && (
                <CardContent className="p-4 pt-0 space-y-4">
                  {availability[day].slots.map((slot, index) => (
                    <div key={slot.id} className="flex items-center gap-2">
                        <Input type="time" value={slot.start} onChange={(e) => handleSlotChange(day, slot.id, 'start', e.target.value)} className="w-full" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="time" value={slot.end} onChange={(e) => handleSlotChange(day, slot.id, 'end', e.target.value)} className="w-full" />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveSlot(day, slot.id)}>
                            <Trash2 className="text-destructive" />
                        </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => handleAddSlot(day)}>
                    <PlusCircle className="mr-2" />
                    Add Time Slot
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
            <CardTitle className="font-headline">Date Overrides</CardTitle>
            <CardDescription>
                Add specific dates when you are unavailable or have a different schedule than your weekly default.
            </CardDescription>
        </Header>
        <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-center">Date override functionality coming soon...</p>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
