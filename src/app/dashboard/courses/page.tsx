import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CoursesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Course Management</CardTitle>
        <CardDescription>Define the subjects and courses your organization offers.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Course management component coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
