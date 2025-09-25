
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page now acts as a temporary redirect to bypass the login flow
// and go directly to the manual user creation page.
export default function TempRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the page where we can manually create a user.
    router.replace('/dashboard/create-user');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Redirecting to Manual User Creator...</p>
      </div>
    </div>
  );
}
