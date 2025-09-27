

'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import LoginPage from './login/page';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading user session...</p>
      </div>
    );
  }

  // If loading is finished and there's no user, show the login page.
  if (!user) {
    return <LoginPage />;
  }

  // Fallback for the brief moment before redirect happens
  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
    </div>
  );
}
