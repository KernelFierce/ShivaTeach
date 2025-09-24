import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LessonsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Lesson & Grading</CardTitle>
        <CardDescription>Create lesson plans and view/grade student submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Lesson planning and grading component coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
