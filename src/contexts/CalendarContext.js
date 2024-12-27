import { createContext, useContext, useState, useReducer, useRef, useCallback } from 'react';

// 초기 상태 정의
const initialState = {
  selectedCalendars: [],
  events: [],
  kairosCalendarId: null,
  failedEvent: null,
  isRetryModalOpen: false
};

// 리듀서 정의
const calendarReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CALENDARS':
      return { ...state, selectedCalendars: action.payload };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'SET_KAIROS_ID':
      return { ...state, kairosCalendarId: action.payload };
    case 'SET_FAILED_EVENT':
      return { ...state, failedEvent: action.payload };
    case 'SET_RETRY_MODAL':
      return { ...state, isRetryModalOpen: action.payload };
    default:
      return state;
  }
};

// API 호출 함수 정의
const fetchCalendarEvents = async (calendarId, timeRange, token) => {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` + 
    new URLSearchParams({
      timeMin: new Date(timeRange.start).toISOString(),
      timeMax: new Date(timeRange.end).toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime'
    }), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(calendarReducer, initialState);
  const eventCache = useRef(new Map());

  const fetchEvents = useCallback(async (calendarId, timeRange) => {
    const cacheKey = `${calendarId}-${timeRange.start}-${timeRange.end}`;
    
    if (eventCache.current.has(cacheKey)) {
      return eventCache.current.get(cacheKey);
    }

    const data = await fetchCalendarEvents(calendarId, timeRange);
    eventCache.current.set(cacheKey, data);
    return data;
  }, []);

  // useState 대신 dispatch 사용
  const value = {
    selectedCalendars: state.selectedCalendars,
    setSelectedCalendars: (calendars) => dispatch({ type: 'SET_CALENDARS', payload: calendars }),
    events: state.events,
    setEvents: (events) => dispatch({ type: 'SET_EVENTS', payload: events }),
    kairosCalendarId: state.kairosCalendarId,
    setKairosCalendarId: (id) => dispatch({ type: 'SET_KAIROS_ID', payload: id }),
    failedEvent: state.failedEvent,
    setFailedEvent: (event) => dispatch({ type: 'SET_FAILED_EVENT', payload: event }),
    isRetryModalOpen: state.isRetryModalOpen,
    setIsRetryModalOpen: (open) => dispatch({ type: 'SET_RETRY_MODAL', payload: open }),
    fetchEvents
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}; 