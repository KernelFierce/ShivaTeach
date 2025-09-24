import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LeadsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Lead Management</CardTitle>
        <CardDescription>Manage prospects and convert them into active students.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Lead management component coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
