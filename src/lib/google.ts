
// src/lib/google.ts
// This file will contain all the logic for interacting with Google APIs.

import { google } from 'googleapis';
import { getFirebaseAdmin } from '../firebase/server';

// Initialize the Firebase Admin SDK to access Firestore.
const db = getFirebaseAdmin().firestore;

/**
 * Interface for the details of a calendar event.
 */
export interface CalendarEvent {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendees: Array<{ email: string }>;
}

/**
 * Creates a new Google OAuth2 client.
 */
const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

/**
 * Generates a Google authentication URL.
 */
export const generateAuthUrl = (userId: string) => {
  const oauth2Client = createOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: userId,
  });
  return url;
};

/**
 * Handles the OAuth2 callback from Google.
 */
export const handleOAuth2Callback = async (code: string) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Stores the user's Google tokens securely in their Firestore document.
 */
export const storeUserTokens = async (userId: string, tokens: any) => {
  const userProfileRef = db.doc(`user-profiles/${userId}`);
  // Use setDoc with merge: true to avoid overwriting the whole document
  await userProfileRef.set({ 
    googleTokens: tokens,
    isGoogleConnected: true
  }, { merge: true });
};

/**
 * Retrieves a user's tokens from Firestore.
 */
export const getUserTokens = async (userId: string) => {
  const userProfileRef = db.doc(`user-profiles/${userId}`);
  const userDoc = await userProfileRef.get();
  if (userDoc.exists && userDoc.data()?.googleTokens) {
    return userDoc.data()?.googleTokens;
  }
  return null;
};

/**
 * Creates a Google Calendar event with a Google Meet link.
 */
export const createCalendarEvent = async (userId: string, eventDetails: CalendarEvent) => {
  const tokens = await getUserTokens(userId);
  if (!tokens) {
    throw new Error('User is not authenticated with Google.');
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startDateTime,
      timeZone: eventDetails.timeZone,
    },
    end: {
      dateTime: eventDetails.endDateTime,
      timeZone: eventDetails.timeZone,
    },
    attendees: eventDetails.attendees,
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1, // Required to include conference data
  });

  return res.data;
};
