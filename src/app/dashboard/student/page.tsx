import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BookCheck,
  CalendarDays,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { studentUser, studentUpcomingSessions, studentAssignments } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function StudentDashboardPage() {
  const avatar = PlaceHolderImages.find(p => p.id === 'student-avatar');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
            {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />}
            <AvatarFallback>{studentUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {studentUser.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Here's your academic snapshot.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Your next scheduled tutoring classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentUpcomingSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.date}</TableCell>
                    <TableCell>{session.time}</TableCell>
                    <TableCell>{session.subject}</TableCell>
                    <TableCell className="text-right">{session.teacher}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <BookCheck className="h-5 w-5" />
                Assignments
            </CardTitle>
            <CardDescription>
              Keep track of your homework and submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentAssignments.map(assignment => (
                    <TableRow key={assignment.id}>
                        <TableCell>
                            <div className="font-medium">{assignment.title}</div>
                            <div className="text-sm text-muted-foreground">{assignment.subject}</div>
                        </TableCell>
                        <TableCell>{assignment.due}</TableCell>
                        <TableCell className="text-right">
                           <Badge variant={assignment.status === 'Completed' ? 'default' : 'secondary'}>{assignment.status}</Badge>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
