import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AvailabilityPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">My Availability</CardTitle>
        <CardDescription>Set your weekly availability and add any one-off overrides.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Availability planner component coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
