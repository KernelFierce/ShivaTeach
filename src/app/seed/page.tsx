
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { seedAllData } from '@/lib/seed';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

// You would fetch the actual current user's ID and email in a real scenario
// For this isolated seeding page, we'll use a placeholder
const ADMIN_UID = 'initial-admin-user';
const ADMIN_EMAIL = 'admin@tutorhub.com';
const TENANT_ID = 'acme-tutoring';

export default function SeedPage() {
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      if (!firestore) {
          throw new Error("Firestore is not initialized.");
      }
      await seedAllData(firestore, TENANT_ID, ADMIN_UID, ADMIN_EMAIL);
      setIsSuccess(true);
    } catch (e: any) {
      console.error("Seeding failed:", e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-headline">Database Seeding</CardTitle>
          <CardDescription>
            Populate your Firestore database with a complete set of sample data. This is a one-time setup action.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {isSuccess && (
            <Alert variant="default" className="border-green-500 text-green-700">
                <CheckCircle className="h-4 w-4 !text-green-700" />
                <AlertDescription>
                    Database seeded successfully! You can now proceed to the login page.
                </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
          )}

          {!isSuccess && !error && (
             <p className="text-sm text-center text-muted-foreground">Click the button below to create all necessary collections and sample documents for Tenants, Users, Subjects, Courses, Sessions, and Leads.</p>
          )}

        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleSeedData} 
            disabled={isLoading || isSuccess}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Seeding...' : isSuccess ? 'Done!' : 'Seed Database'}
          </Button>
          {isSuccess && (
              <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Proceed to Login</Link>
              </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
