
// src/app/dashboard/settings/integrations/page.tsx

import { getFirebaseAdmin } from '@/firebase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Initialize Firebase Admin for server-side access
const { firestore: db } = getFirebaseAdmin();

/**
 * Fetches the user's profile from Firestore to check their Google connection status.
 */
async function getGoogleConnectionStatus() {
  // TODO: Replace with actual user detection
  const user = { uid: '1234' };
  if (!user) {
    return { isConnected: false };
  }

  const userProfileRef = db.doc(`user-profiles/${user.uid}`);
  const userDoc = await userProfileRef.get();

  if (userDoc.exists && userDoc.data()?.isGoogleConnected) {
    return { isConnected: true };
  }

  return { isConnected: false };
}

/**
 * The Integrations page component.
 * It displays the status of the user's Google Calendar integration and provides
 * a button to connect or disconnect.
 */
export default async function IntegrationsPage() {
  const { isConnected } = await getGoogleConnectionStatus();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect your account with third-party services.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
          <CardDescription>
            Sync your scheduled classes with your Google Calendar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-muted-foreground'}`}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </p>
            </div>
            {!isConnected && (
              <Button asChild>
                <Link href="/api/auth/google/redirect">Connect with Google</Link>
              </Button>
            )}
            {/* TODO: Add a button to disconnect from Google */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
