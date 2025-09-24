import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TenantManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Tenant Management</CardTitle>
        <CardDescription>Onboard, suspend, or manage organizations on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Tenant management component coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
