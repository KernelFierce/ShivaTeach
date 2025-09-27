import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookCopy, FileCheck2 } from "lucide-react";

export default function LessonsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Lessons & Grading</CardTitle>
              <CardDescription>Create lesson plans and view/grade student submissions.</CardDescription>
            </div>
            <Button disabled>
                <PlusCircle className="mr-2" />
                New Lesson Plan
            </Button>
          </div>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookCopy className="h-5 w-5" />
              My Lesson Plans
            </CardTitle>
            <CardDescription>
                Your library of reusable lesson plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center p-4">Lesson plan list coming soon...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck2 className="h-5 w-5" />
              Submissions to Grade
            </CardTitle>
             <CardDescription>
                Review and grade student assignment submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground text-center p-4">Grading queue coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
