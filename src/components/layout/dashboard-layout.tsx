
import type { PropsWithChildren } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { navConfig } from "@/config/nav";

interface DashboardLayoutProps extends PropsWithChildren {
    navItems: typeof navConfig;
}

export function DashboardLayout({ children, navItems }: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <DashboardSidebar navItems={navItems} />
            <SidebarInset className="flex flex-col">
                <DashboardHeader />
                <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    );
}
