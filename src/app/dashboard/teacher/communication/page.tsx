import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CommunicationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Communication</CardTitle>
        <CardDescription>Message with students and parents.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Communication interface coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}
