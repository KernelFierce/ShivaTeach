import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DollarSign, Building, Users } from "lucide-react";

export default function SuperAdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">SuperAdmin Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide ecosystem overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Organizations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              Currently subscribed tenants
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
           <CardContent>
            <div className="text-2xl font-bold">1,257</div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform-wide Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
           <CardContent>
            <div className="text-2xl font-bold">$95,430.50</div>
            <p className="text-xs text-muted-foreground">
                This month's total revenue
            </p>
          </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle className="font-headline">System Health</CardTitle>
            <CardDescription>View system-wide audit logs and health status.</CardDescription>
          </CardHeader>
           <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center">System health monitoring component coming soon...</p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
