import DashboardLayout from '@/components/layout/dashboard-layout';
import { adminNav } from '@/config/nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout navConfig={adminNav}>{children}</DashboardLayout>;
}
