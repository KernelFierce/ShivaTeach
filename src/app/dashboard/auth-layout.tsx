
"use client"

import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, type PropsWithChildren } from "react"
import { doc } from "firebase/firestore"
import type { UserProfile } from "@/types/user-profile"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"

export function AuthLayout({ children }: PropsWithChildren) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) return; // Wait for user and profile to load

    if (!user) {
      router.replace('/');
      return;
    }
    
    // Redirect based on role if they are on a mismatched page
    if (userProfile?.role) {
      const role = userProfile.role;
      const currentBase = pathname.split('/')[2] || '';
      
      const roleDashboardMap: { [key: string]: string } = {
        'Teacher': 'teacher',
        'Student': 'student',
        'Parent': 'parent',
        'SuperAdmin': 'superadmin',
        'OrganizationAdmin': '',
        'Admin': ''
      };
      
      const expectedBase = roleDashboardMap[role];

      // If user is on a page not meant for their role, redirect.
      // Admins are allowed on the root dashboard (''), so we handle that.
      if (expectedBase !== undefined && currentBase !== expectedBase) {
         if (expectedBase === '') {
            router.replace('/dashboard');
         } else {
            router.replace(`/dashboard/${expectedBase}`);
         }
      }
    }

  }, [user, isUserLoading, userProfile, isProfileLoading, router, pathname]);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user data...</span>
      </div>
    );
  }

  // If there's no user object, redirect logic will handle it, but we can show a message.
  if (!user) {
     return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // If the user is logged in, but we can't find their profile document
  if (!userProfile && !isLoading) {
    return (
       <div className="flex items-center justify-center h-screen">
         <div className="text-center p-4 rounded-md bg-destructive/10 border border-destructive max-w-md">
            <h2 className="text-xl font-bold text-destructive-foreground">Profile Error</h2>
            <p className="mt-2 text-destructive-foreground/80">
              Could not load your user profile from the database. This might be a permissions issue or the profile document doesn't exist.
            </p>
            {profileError && <p className="mt-2 font-mono text-xs text-destructive-foreground/60">{profileError.message}</p>}
         </div>
       </div>
    )
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  )
}
