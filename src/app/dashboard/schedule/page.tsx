import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SchedulePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Master Schedule</CardTitle>
        <CardDescription>The command center for viewing, scheduling, and logging all tutoring sessions for the organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Master schedule component coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
