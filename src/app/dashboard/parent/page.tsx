import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DollarSign, Eye, MessageSquare } from "lucide-react";

export default function ParentDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Parent Portal</h1>
        <p className="text-muted-foreground">Your single source of truth for financials and academic progress.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financials
            </CardTitle>
            <CardDescription>View invoices, manage payments, and check balances.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center">Financial management component coming soon...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Academic Oversight
            </CardTitle>
            <CardDescription>View your child's schedule, grades, and attendance.</CardDescription>
          </CardHeader>
           <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center">Academic oversight component coming soon...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication
            </CardTitle>
            <CardDescription>View and participate in supervised conversations.</CardDescription>
          </CardHeader>
           <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center">Communication component coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
