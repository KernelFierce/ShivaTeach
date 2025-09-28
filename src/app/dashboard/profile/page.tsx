
'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Globe } from 'lucide-react';

// A list of representative timezones
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

export default function ProfilePage() {
  const { user: authUser } = useUser();
  const { user: userProfile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState(userProfile?.preferredTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleSaveChanges = async () => {
    if (!authUser || !firestore || !userProfile) return;

    setIsSaving(true);
    const userRef = doc(firestore, 'users', authUser.uid);
    const tenantUserRef = doc(firestore, `tenants/${userProfile.activeTenantId}/users`, authUser.uid);

    try {
      await updateDoc(userRef, { preferredTimezone: selectedTimeZone });
      if (userProfile.activeTenantId) {
          await updateDoc(tenantUserRef, { preferredTimezone: selectedTimeZone });
      }
      toast({
        title: 'Settings Saved',
        description: 'Your preferred timezone has been updated.',
      });
    } catch (error) {
      console.error("Error updating timezone:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your preferences. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6" />
        <h1 className="text-2xl font-bold font-headline">My Profile</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="timezone-select" className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Preferred Timezone
            </label>
            <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
              <SelectTrigger id="timezone-select" className="w-full max-w-sm">
                <SelectValue placeholder="Select a timezone..." />
              </SelectTrigger>
              <SelectContent>
                {timeZones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
                All dates and times in the application will be displayed in this timezone.
            </p>
          </div>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
