
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
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Save } from 'lucide-react';

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

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const initialAvailability: Availability = daysOfWeek.reduce((acc, day) => {
  acc[day] = { isEnabled: false, slots: [] };
  return acc;
}, {} as Availability);

export default function AvailabilityPage() {
  const [availability, setAvailability] =
    useState<Availability>(initialAvailability);
  const [isSaving, setIsSaving] = useState(false);

  const handleDayToggle = (day: string, isEnabled: boolean) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isEnabled,
        // Add a default slot if enabling for the first time
        slots: isEnabled && prev[day].slots.length === 0 ? [{ id: '1', start: '09:00', end: '17:00' }] : prev[day].slots,
      },
    }));
  };

  const handleAddSlot = (day: string) => {
    setAvailability(prev => ({
        ...prev,
        [day]: {
            ...prev[day],
            slots: [...prev[day].slots, { id: Date.now().toString(), start: '', end: '' }]
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

  const handleSave = () => {
    setIsSaving(true);
    // In a future step, this will save to Firestore
    console.log('Saving availability:', availability);
    setTimeout(() => setIsSaving(false), 1500);
  };

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
              <Save className="mr-2" />
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
                        <Input type="time" defaultValue={slot.start} className="w-full" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="time" defaultValue={slot.end} className="w-full" />
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
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-center">Date override functionality coming soon...</p>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
