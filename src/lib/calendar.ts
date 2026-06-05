import { supabase } from './supabase';

export const createMeetingEvent = async (title: string, description: string, startTime: string, durationMinutes: number) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.provider_token;
  if (!token) throw new Error("No Google Calendar token found. Please sign in with Google to enable automatic Meet link generation.");

  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const event = {
    summary: title,
    description: description,
    start: {
      dateTime: start.toISOString(),
    },
    end: {
      dateTime: end.toISOString(),
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet"
        }
      }
    }
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create calendar event: ${errorText}`);
  }

  return await response.json();
};
