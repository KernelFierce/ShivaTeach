
"use client"

import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect, type PropsWithChildren } from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"

export function AuthLayout({ children }: PropsWithChildren) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   // TEMPORARILY DISABLED to allow for initial data seeding without login.
  //   if (!isUserLoading && !user) {
  //     router.replace('/');
  //   }
  // }, [user, isUserLoading, router]);

  // TEMPORARILY DISABLED: We will not show a loader or block rendering.
  // if (isUserLoading || !user) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //     </div>
  //   );
  // }

  // Render the layout without checking for authentication.
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
