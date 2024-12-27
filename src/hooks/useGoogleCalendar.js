import { useState, useCallback } from 'react';

export const useGoogleCalendar = (token) => {
  const [loading, setLoading] = useState(false);

  const fetchCalendarList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch calendars');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch calendar list:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createCalendar = useCallback(async (calendarData) => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(calendarData)
        }
      );

      if (!response.ok) throw new Error('Failed to create calendar');
      return await response.json();
    } catch (error) {
      console.error('Failed to create calendar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createEvent = useCallback(async (calendarId, eventData) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        }
      );

      if (!response.ok) throw new Error('Failed to create event');
      return await response.json();
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    loading,
    fetchCalendarList,
    createCalendar,
    createEvent
  };
}; 