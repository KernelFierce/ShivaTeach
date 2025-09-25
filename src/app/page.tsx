
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page now acts as a temporary redirect to bypass the login flow
// for the purpose of initial data seeding.
export default function TempRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the page where we can seed the data.
    router.replace('/dashboard/users');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Redirecting to User Management...</p>
      </div>
    </div>
  );
}
