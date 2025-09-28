'use server';
/**
 * @fileOverview A smart scheduling AI agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createCalendarEvent, CalendarEvent } from '@/lib/google';
import { getFirebaseAdmin } from '@/firebase/server';
import { add } from 'date-fns';
import { Timestamp } from 'firebase-admin/firestore';

// --- Input and Output Schemas for AI Flow ---

const SmartScheduleInputSchema = z.object({
  teacherId: z.string().describe('The ID of the teacher to schedule with.'),
  studentId: z.string().describe('The ID of the student requesting the session.'),
  courseId: z.string().describe('The ID of the course for this session.'),
  studentRequest: z
    .string()
    .describe('The student`s scheduling request in natural language.'),
});
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

const SuggestedTimeSchema = z.object({
    humanReadable: z.string().describe('A human-friendly representation of the time (e.g., "Tuesday at 3:00 PM").'),
    isoTime: z.string().describe('The full start time in ISO 8601 format.'),
});

const SmartScheduleOutputSchema = z.object({
  suggestedTimes: z
    .array(SuggestedTimeSchema)
    .describe('A list of suggested session times, including both human-readable and ISO formats.'),
  responseMessage: z
    .string()
    .describe(
      'A friendly message to the user confirming the suggestions.'
    ),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;


// --- AI Tool for Getting Teacher Availability ---

const AvailabilitySchema = z.object({
    dayOfWeek: z.number().describe('Day of the week (0=Sun, 1=Mon, etc.)'),
    startTime: z.string().describe('Start time in HH:mm format'),
    endTime: z.string().describe('End time in HH:mm format'),
});

const getTeacherAvailability = ai.defineTool(
    {
        name: 'getTeacherAvailability',
        description: "Retrieves a teacher's recurring weekly availability.",
        inputSchema: z.object({
            teacherId: z.string().describe("The ID of the teacher whose availability is being requested."),
        }),
        outputSchema: z.array(AvailabilitySchema),
    },
    async (input) => {
        console.log(`Tool: Fetching availability for teacherId: ${input.teacherId}`);
        const db = getFirebaseAdmin().firestore;
        const tenantId = 'acme-tutoring'; // This should be dynamic in a real app
        
        const availabilitiesRef = db.collection(`tenants/${tenantId}/availabilities`);
        const q = availabilitiesRef.where('teacherId', '==', input.teacherId);

        const snapshot = await q.get();
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => doc.data() as z.infer<typeof AvailabilitySchema>);
    }
);


// --- Main AI Prompt and Flow ---

const smartSchedulePrompt = ai.definePrompt({
  name: 'smartSchedulePrompt',
  input: { schema: SmartScheduleInputSchema },
  output: { schema: SmartScheduleOutputSchema },
  tools: [getTeacherAvailability],
  prompt: `You are a friendly and intelligent scheduling assistant for a tutoring platform.

Your task is to suggest a few specific, bookable time slots based on a student's request and the teacher's availability. Assume all sessions are 1 hour long.

1.  **Analyze the student's request** to understand their preferences (e.g., "next week," "in the afternoon," "Tuesday or Wednesday").
2.  **You MUST use the getTeacherAvailability tool** to find the teacher's recurring weekly schedule. Do not guess or make up times.
3.  **Compare the student's request with the teacher's available slots** to find suitable matches. Assume the current date is ${new Date().toUTCString()}.
4.  **Provide 3-5 specific time slots** as suggestions.
5.  **For each suggestion, you MUST provide BOTH a human-readable string AND a full ISO 8601 timestamp.** The ISO time is for the computer and the human-readable string is for the user.
6.  **Generate a friendly response message** to the student, presenting the suggestions clearly.

Student Request:
"{{{studentRequest}}}"
`,
});

const suggestSessionTimesFlow = ai.defineFlow(
  {
    name: 'suggestSessionTimesFlow',
    inputSchema: SmartScheduleInputSchema,
    outputSchema: SmartScheduleOutputSchema,
  },
  async (input) => {
    console.log('Running suggestSessionTimesFlow with input:', input);
    const { output } = await smartSchedulePrompt(input);
    if (!output) {
      throw new Error('The model did not return any output.');
    }
    return output;
  }
);


// --- Exported Functions (Callable from Client) ---

/**
 * Suggests session times based on a student's natural language request.
 * This is the entry point for the AI scheduling feature.
 */
export async function suggestSessionTimes(
  input: SmartScheduleInput
): Promise<SmartScheduleOutput> {
  return await suggestSessionTimesFlow(input);
}


const BookSessionInputSchema = z.object({
    startTime: z.string().datetime(),
    teacherId: z.string(),
    studentId: z.string(),
    courseId: z.string(),
    courseName: z.string(),
    studentName: z.string(),
    teacherName: z.string(),
});
export type BookSessionInput = z.infer<typeof BookSessionInputSchema>;

/**
 * Books a new session in the database and creates a corresponding Google Calendar event.
 * This function is called when a student confirms a suggested time slot.
 */
export async function bookSession(input: BookSessionInput): Promise<{ success: boolean; sessionId: string }> {
    const { startTime, teacherId, studentId, courseId, courseName, studentName, teacherName } = BookSessionInputSchema.parse(input);
    
    const admin = getFirebaseAdmin();
    const db = admin.firestore;
    const tenantId = 'acme-tutoring'; // This should be dynamic
    
    const start = new Date(startTime);
    const end = add(start, { hours: 1 });

    const batch = db.batch();

    // 1. Create the main session document
    const sessionRef = db.collection(`tenants/${tenantId}/sessions`).doc();
    batch.set(sessionRef, {
        teacherId,
        studentId,
        courseId,
        startTime: Timestamp.fromDate(start),
        endTime: Timestamp.fromDate(end),
        createdAt: Timestamp.now(),
    });

    // 2. Create a reference for the student
    const studentSessionRef = db.collection(`tenants/${tenantId}/users/${studentId}/sessionsAsStudent`).doc();
    batch.set(studentSessionRef, { sessionId: sessionRef.id, startTime: Timestamp.fromDate(start) });

    // 3. Create a reference for the teacher
    const teacherSessionRef = db.collection(`tenants/${tenantId}/users/${teacherId}/sessionsAsTeacher`).doc();
    batch.set(teacherSessionRef, { sessionId: sessionRef.id, startTime: Timestamp.fromDate(start) });

    // Commit the batch
    await batch.commit();

    // 4. Create the Google Calendar event
    try {
        const teacherEmail = (await admin.auth.getUser(teacherId)).email;
        const studentEmail = (await admin.auth.getUser(studentId)).email;

        if (!teacherEmail || !studentEmail) {
            throw new Error('Could not find email for teacher or student.');
        }

        const eventDetails: CalendarEvent = {
            summary: `Tutoring: ${courseName}`,
            description: `A one-on-one tutoring session for ${studentName} with ${teacherName}.`,
            startDateTime: start.toISOString(),
            endDateTime: end.toISOString(),
            timeZone: 'America/New_York', // This should be dynamic based on user settings
            attendees: [
                { email: teacherEmail },
                { email: studentEmail },
            ],
        };

        console.log('Creating calendar event for teacher:', teacherId);
        await createCalendarEvent(teacherId, eventDetails);
        console.log('Successfully created calendar event.');

    } catch (error) {
        console.error("Could not create Google Calendar event:", error);
        // We don't throw here because the session is already booked.
        // In a real app, we'd add this to a retry queue.
    }

    return { success: true, sessionId: sessionRef.id };
}