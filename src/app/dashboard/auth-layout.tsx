
"use client"

import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, type PropsWithChildren } from "react"
import { doc } from "firebase/firestore"
import type { UserProfile, UserRole } from "@/types/user-profile"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"

// Defines the "base" path for each role's dashboard.
// '' represents the root dashboard.
const roleDashboardMap: { [key in UserRole]: string } = {
  'SuperAdmin': 'superadmin',
  'OrganizationAdmin': '',
  'Admin': '',
  'Teacher': 'teacher',
  'Student': 'student',
  'Parent': 'parent',
};

// Defines which roles are allowed on which base paths.
// This allows for users with multiple roles.
const allowedRolesForPath: { [key: string]: UserRole[] } = {
  '': ['OrganizationAdmin', 'Admin'], // Root dashboard
  'superadmin': ['SuperAdmin'],
  'teacher': ['Teacher'],
  'student': ['Student'],
  'parent': ['Parent'],
   // Pages accessible by admins
  'users': ['OrganizationAdmin', 'Admin'],
  'leads': ['OrganizationAdmin', 'Admin'],
  'courses': ['OrganizationAdmin', 'Admin'],
  'financials': ['OrganizationAdmin', 'Admin'],
  'analytics': ['OrganizationAdmin', 'Admin'],
  'settings': ['OrganizationAdmin', 'Admin'],
  'schedule': ['OrganizationAdmin', 'Admin'],
};


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
    
    // Redirect logic for users with roles
    if (userProfile?.roles && userProfile.roles.length > 0) {
      const activeRole = userProfile.activeRole;
      const pathSegments = pathname.split('/').filter(Boolean);
      const currentBase = pathSegments[1] || '';
      
      const isTryingToAccessRootDashboard = currentBase === 'dashboard' && pathSegments.length === 2;

      // If on the root dashboard, find the highest priority role and redirect.
      if (isTryingToAccessRootDashboard) {
        const expectedBase = roleDashboardMap[activeRole];
        const targetPath = expectedBase ? `/dashboard/${expectedBase}` : '/dashboard';
        if (pathname !== targetPath) {
          router.replace(targetPath);
          return;
        }
      }

      // Check if the current path is allowed for any of the user's roles
      // For now, we allow access if ANY of their roles grant it, but navigation is based on activeRole.
      // This is a more permissive approach while the activeRole concept is settled.
      const userRoles = userProfile.roles;
      const accessibleBases = Object.keys(allowedRolesForPath).filter(base => 
        allowedRolesForPath[base].some(allowedRole => userRoles.includes(allowedRole))
      );
      
      const currentSubPage = pathSegments.length > 2 ? pathSegments[2] : (currentBase !== 'dashboard' ? currentBase : '');


      if (!accessibleBases.includes(currentSubPage)) {
         // If no access, redirect to their active role's dashboard
         const expectedBase = roleDashboardMap[activeRole];
         const targetPath = expectedBase ? `/dashboard/${expectedBase}` : '/dashboard';
         router.replace(targetPath);
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
