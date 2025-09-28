import { UserProfile } from "@/types/user-profile";
import {
    Home,
    Calendar,
    Users,
    Briefcase,
    BookMarked,
    Wallet,
    LineChart,
    CalendarCheck,
    BookUser,
    GraduationCap,
    HeartHandshake,
    ShieldCheck,
    Building
} from "lucide-react";

export const navConfig: { 
    permission: keyof UserProfile['permissions'] | null, 
    href: string, 
    icon: React.ElementType, 
    label: string 
}[] = [
    // Organization Admin
    { permission: null, href: "/dashboard", icon: Home, label: "Dashboard" },
    { permission: 'canManageSchedules', href: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { permission: 'canManageUsers', href: "/dashboard/users", icon: Users, label: "Users" },
    { permission: null, href: "/dashboard/leads", icon: Briefcase, label: "Leads" },
    { permission: null, href: "/dashboard/courses", icon: BookMarked, label: "Courses" },
    { permission: 'canViewFinancials', href: "/dashboard/financials", icon: Wallet, label: "Financials" },
    { permission: null, href: "/dashboard/analytics", icon: LineChart, label: "Analytics" },

    // Admin (Employee of a Tenant)
    { permission: null, href: "/dashboard/admin", icon: Home, label: "Dashboard" },
    { permission: 'canManageSchedules', href: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { permission: 'canManageUsers', href: "/dashboard/users", icon: Users, label: "Users" },
    { permission: null, href: "/dashboard/analytics", icon: LineChart, label: "Analytics" },

    // Teacher
    { permission: null, href: "/dashboard/teacher", icon: Home, label: "Dashboard" },
    { permission: null, href: "/dashboard/teacher/availability", icon: CalendarCheck, label: "Availability" },
    { permission: null, href: "/dashboard/teacher/lessons", icon: BookUser, label: "Lessons" },
    { permission: null, href: "/dashboard/teacher/communication", icon: Users, label: "Communication" },

    // Student
    { permission: null, href: "/dashboard/student", icon: GraduationCap, label: "Dashboard" },

    // Parent
    { permission: null, href: "/dashboard/parent", icon: HeartHandshake, label: "Parent Portal" },

    // SuperAdmin
    { permission: null, href: "/dashboard/superadmin", icon: ShieldCheck, label: "Platform" },
    { permission: null, href: "/dashboard/superadmin/tenants", icon: Building, label: "Tenants" },
];
