

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
} from "lucide-react"
import { signOut } from "firebase/auth"
import { doc } from "firebase/firestore"

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
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const adminNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
  { href: "/dashboard/users", icon: Users, label: "Users" },
  { href: "/dashboard/leads", icon: Briefcase, label: "Leads" },
  { href: "/dashboard/courses", icon: BookMarked, label: "Courses" },
  { href: "/dashboard/financials", icon: Wallet, label: "Financials" },
  { href: "/dashboard/analytics", icon: LineChart, label: "Analytics" },
]

const teacherNavItems = [
  { href: "/dashboard/teacher", icon: Home, label: "Dashboard" },
  { href: "/dashboard/teacher/availability", icon: Calendar, label: "Availability" },
  { href: "/dashboard/teacher/lessons", icon: BookUser, label: "Lessons" },
];

const studentNavItems = [
    { href: "/dashboard/student", icon: GraduationCap, label: "Dashboard" },
];

const parentNavItems = [
    { href: "/dashboard/parent", icon: HeartHandshake, label: "Parent Portal" },
];

const superAdminNavItems = [
    { href: "/dashboard/superadmin", icon: ShieldCheck, label: "Platform" },
    { href: "/dashboard/superadmin/tenants", icon: Building, label: "Tenants" },
]

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

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  }

  const role = userProfile?.role;
  let navItems = adminNavItems; // Default to admin
  if (role === 'Teacher') navItems = teacherNavItems;
  if (role === 'Student') navItems = studentNavItems;
  if (role === 'Parent') navItems = parentNavItems;
  if (role === 'SuperAdmin') navItems = superAdminNavItems;


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

    return navItems.map((item) => (
      <SidebarMenuItem key={item.label}>
        <Link href={item.href} legacyBehavior passHref>
          <SidebarMenuButton
            isActive={pathname.startsWith(item.href) && (item.href === '/dashboard' ? pathname === item.href : true) }
            icon={<item.icon />}
            tooltip={item.label}
          >
            {item.label}
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    ))
  }

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
           <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard/settings" legacyBehavior passHref>
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
