
"use client"

import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, type PropsWithChildren } from "react"
import { doc } from "firebase/firestore"

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

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) return; // Wait for user and profile to load

    if (!user) {
      router.replace('/');
      return;
    }
    
    // Redirect based on role if they are on a mismatched page
    if (userProfile?.role) {
      const role = userProfile.role;
      const expectedPath = `/dashboard/${role.toLowerCase().replace('admin', '')}`.replace(/\/$/, ""); // e.g., /dashboard/teacher
      
      const isBasePath = pathname === '/dashboard';
      const isCorrectRolePath = pathname.startsWith(expectedPath);
      const isAdminOnDashboard = (role === 'OrganizationAdmin' || role === 'Admin') && isBasePath;
      
      // Allow admins on the root dashboard, otherwise redirect to their specific dashboard
      if (!isCorrectRolePath && !isAdminOnDashboard) {
        if (role === 'OrganizationAdmin' || role === 'Admin') {
          router.replace('/dashboard');
        } else {
           router.replace(expectedPath);
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
