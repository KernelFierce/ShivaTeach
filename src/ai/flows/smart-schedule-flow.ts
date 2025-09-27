'use server';
/**
 * @fileOverview A smart scheduling AI agent.
 *
 * - suggestSessionTimes - A function that suggests session times based on a request.
 * - SmartScheduleInput - The input type for the suggestSessionTimes function.
 * - SmartScheduleOutput - The return type for the suggestSessionTimes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Define the input schema for the main flow
const SmartScheduleInputSchema = z.object({
  teacherId: z.string().describe('The ID of the teacher to schedule with.'),
  studentRequest: z
    .string()
    .describe('The student`s scheduling request in natural language.'),
});
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

// Define the output schema for the main flow
const SmartScheduleOutputSchema = z.object({
  suggestedTimes: z
    .array(z.string())
    .describe('A list of suggested session times in a human-readable format.'),
  responseMessage: z
    .string()
    .describe(
      'A friendly message to the user confirming the suggestions.'
    ),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;

// --- Firestore Tool ---
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
        const db = getFirestore();
        const tenantId = 'acme-tutoring'; // This should be dynamic in a real app
        
        const availabilitiesRef = collection(db, `tenants/${tenantId}/availabilities`);
        const q = query(availabilitiesRef, where('teacherId', '==', input.teacherId));

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }

        const availabilities = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
            };
        });
        
        return availabilities;
    }
);


// --- Main Prompt and Flow ---

const prompt = ai.definePrompt({
  name: 'smartSchedulePrompt',
  input: { schema: SmartScheduleInputSchema },
  output: { schema: SmartScheduleOutputSchema },
  tools: [getTeacherAvailability],
  prompt: `You are a friendly and intelligent scheduling assistant for a tutoring platform.

A student wants to schedule a session with a teacher. Your task is to suggest a few specific, bookable time slots based on the student's request and the teacher's availability.

1.  **Analyze the student's request** to understand their preferences (e.g., "next week," "in the afternoon," "Tuesday or Wednesday").
2.  **You MUST use the getTeacherAvailability tool** to find the teacher's recurring weekly schedule. Do not guess or make up times.
3.  **Compare the student's request with the teacher's available slots** to find suitable matches. Assume the current date is ${new Date().toDateString()}.
4.  **Provide 3-5 specific time slots** as suggestions. Be precise (e.g., "Tuesday at 3:00 PM", "Wednesday at 10:00 AM").
5.  **Generate a friendly response message** to the student, presenting the suggestions clearly.

Student Request:
"{{{studentRequest}}}"
`,
});

const smartScheduleFlow = ai.defineFlow(
  {
    name: 'smartScheduleFlow',
    inputSchema: SmartScheduleInputSchema,
    outputSchema: SmartScheduleOutputSchema,
  },
  async (input) => {
    console.log('Running smartScheduleFlow with input:', input);
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The model did not return any output.');
    }
    return output;
  }
);

// --- Exported wrapper function ---

export async function suggestSessionTimes(
  input: SmartScheduleInput
): Promise<SmartScheduleOutput> {
  return await smartScheduleFlow(input);
}
