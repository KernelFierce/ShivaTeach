
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  BookMarked,
  Briefcase,
  Calendar,
  Home,
  LineChart,
  LogOut,
  Settings,
  Users,
  Wallet,
  Building,
  GraduationCap,
  HeartHandshake,
  BookUser,
  ShieldCheck,
  CalendarCheck,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { signOut } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"

import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import type { UserProfile, UserRole } from "@/types/user-profile"

const navConfig: { role: UserRole, href: string, icon: React.ElementType, label: string }[] = [
    // Admin & Org Admin
    { role: 'OrganizationAdmin', href: "/dashboard", icon: Home, label: "Dashboard" },
    { role: 'OrganizationAdmin', href: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { role: 'OrganizationAdmin', href: "/dashboard/users", icon: Users, label: "Users" },
    { role: 'OrganizationAdmin', href: "/dashboard/leads", icon: Briefcase, label: "Leads" },
    { role: 'OrganizationAdmin', href: "/dashboard/courses", icon: BookMarked, label: "Courses" },
    { role: 'OrganizationAdmin', href: "/dashboard/financials", icon: Wallet, label: "Financials" },
    { role: 'OrganizationAdmin', href: "/dashboard/analytics", icon: LineChart, label: "Analytics" },
    
    // Admin role inherits OrgAdmin links
    { role: 'Admin', href: "/dashboard", icon: Home, label: "Dashboard" },
    { role: 'Admin', href: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { role: 'Admin', href: "/dashboard/users", icon: Users, label: "Users" },
    { role: 'Admin', href: "/dashboard/leads", icon: Briefcase, label: "Leads" },
    { role: 'Admin', href: "/dashboard/courses", icon: BookMarked, label: "Courses" },
    { role: 'Admin', href: "/dashboard/financials", icon: Wallet, label: "Financials" },
    { role: 'Admin', href: "/dashboard/analytics", icon: LineChart, label: "Analytics" },

    // Teacher
    { role: 'Teacher', href: "/dashboard/teacher", icon: Home, label: "Dashboard" },
    { role: 'Teacher', href: "/dashboard/teacher/availability", icon: CalendarCheck, label: "Availability" },
    { role: 'Teacher', href: "/dashboard/teacher/lessons", icon: BookUser, label: "Lessons" },
    { role: 'Teacher', href: "/dashboard/teacher/communication", icon: Users, label: "Communication" },

    // Student
    { role: 'Student', href: "/dashboard/student", icon: GraduationCap, label: "Dashboard" },

    // Parent
    { role: 'Parent', href: "/dashboard/parent", icon: HeartHandshake, label: "Parent Portal" },
    
    // SuperAdmin
    { role: 'SuperAdmin', href: "/dashboard/superadmin", icon: ShieldCheck, label: "Platform" },
    { role: 'SuperAdmin', href: "/dashboard/superadmin/tenants", icon: Building, label: "Tenants" },
];


export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const firestore = useFirestore()
  const { user } = useUser()
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  }

  const handleRoleSwitch = async (newRole: UserRole) => {
    if (userDocRef && userProfile && userProfile.activeRole !== newRole) {
      await updateDoc(userDocRef, { activeRole: newRole });
      // A full page reload is the most reliable way to ensure all components
      // re-evaluate their data and permissions based on the new active role.
      window.location.reload();
    }
  };

  const activeRole = userProfile?.activeRole;
  
  // Filter nav links based on the user's active role.
  const visibleNavLinks = navConfig.filter(link => link.role === activeRole);

  const userName = user?.displayName || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "";
  const userFallback = userName.charAt(0).toUpperCase();

  const renderNav = () => {
    if (isProfileLoading) {
      return (
        <>
          <SidebarMenuSkeleton showIcon />
          <SidebarMenuSkeleton showIcon />
          <SidebarMenuSkeleton showIcon />
          <SidebarMenuSkeleton showIcon />
        </>
      )
    }

    return visibleNavLinks.map((item) => (
      <SidebarMenuItem key={item.label}>
        <Link href={item.href}>
          <SidebarMenuButton
            isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard' && item.href !== '/dashboard/teacher' && item.href !== '/dashboard/student')}
            icon={item.icon ? <item.icon /> : null}
            tooltip={item.label}
          >
            {item.label}
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    ))
  }

  const userHasMultipleRoles = userProfile && userProfile.roles.length > 1;

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {renderNav()}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2">
            { (activeRole === 'OrganizationAdmin' || activeRole === 'Admin') && (
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/dashboard/settings">
                        <SidebarMenuButton
                            isActive={pathname === "/dashboard/settings"}
                            icon={<Settings />}
                            tooltip="Settings"
                        >
                            Settings
                        </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                 </SidebarMenu>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <div className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer">
                    <Avatar className="h-8 w-8">
                      {user?.photoURL ? <AvatarImage src={user.photoURL} alt={userName} /> : userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={userName} data-ai-hint={userAvatar.imageHint} />}
                      <AvatarFallback>{userFallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userHasMultipleRoles && userProfile && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ChevronsUpDown className="mr-2 h-4 w-4" />
                      <span>Switch Role</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuLabel>Viewing as {activeRole}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {userProfile.roles.map(role => (
                           <DropdownMenuItem key={role} onClick={() => handleRoleSwitch(role)}>
                            <Check className={`mr-2 h-4 w-4 ${activeRole === role ? 'opacity-100' : 'opacity-0'}`} />
                            {role}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
