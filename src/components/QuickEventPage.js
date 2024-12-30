import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Button, 
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  DialogContentText,
  Stack,
  Rating,
  Alert,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import { defaultQuickEvents } from '../utils/iconMapping';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { QuickEventCard } from './QuickEventCard';
import { useQuickEvents } from '../contexts/QuickEventsContext';

// Quick Event Card for custom activity
const QuickCustomEventCard = ({ onStart }) => {
  const [customTitle, setCustomTitle] = useState('');

  const handleStart = () => {
    if (customTitle.trim()) {
      onStart({
        id: 'custom-' + Date.now(),
        title: customTitle,
        color: '#A8A8A8',
        iconName: 'add',
        isCustom: true,
        type: 'quick'
      });
      setCustomTitle('');
    }
  };

  return (
    <Box
      sx={{
        aspectRatio: '4/3',
        backgroundColor: 'white',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        padding: 1.5,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        },
        maxWidth: '300px',
        margin: '0 auto',
      }}
    >
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        justifyContent: 'center',
      }}>
        <Typography variant="subtitle2" align="center" sx={{ fontWeight: 500 }}>
          Quick 활동 시작하기
        </Typography>
        <TextField
          fullWidth
          placeholder="활동 이름을 입력하세요"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mt: 'auto' }}
        />
      </Box>
      <Button
        variant="contained"
        startIcon={<PlayArrowIcon sx={{ fontSize: 18 }} />}
        fullWidth
        onClick={handleStart}
        disabled={!customTitle.trim()}
        size="small"
        sx={{
          mt: 1,
          backgroundColor: '#A8A8A8',
          '&:hover': {
            backgroundColor: '#A8A8A8',
            filter: 'brightness(0.9)',
          },
        }}
      >
        시작하기
      </Button>
    </Box>
  );
};

// Timer Modal Component
const TimerModal = ({ event, elapsedTime, onEnd, onCancel }) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(format(now, 'a h:mm', { locale: ko }));
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog
      open={true}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }}
    >
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" sx={{ mb: 4, color: event.color }}>
          {currentTime}
        </Typography>
        
        <Typography variant="h3" sx={{ mb: 4, color: event.color }}>
          {event.title}
        </Typography>

        <Typography variant="h1" sx={{ mb: 6, fontWeight: 'bold', color: 'white' }}>
          {elapsedTime}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={onCancel}
            sx={{ 
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={onEnd}
            sx={{ 
              backgroundColor: event.color,
              '&:hover': {
                backgroundColor: event.color,
                filter: 'brightness(0.9)',
              }
            }}
          >
            종료
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

const QuickEventPage = () => {
  const { getOrderedEvents } = useQuickEvents();
  const [displayEvents, setDisplayEvents] = useState([]);
  const navigate = useNavigate();
  // Initialize events as an empty array instead of defaultQuickEvents
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ score: 5, text: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDisplayEvents(getOrderedEvents());
  }, [getOrderedEvents]);

  // Ensure Kairos calendar exists
  const ensureKairosCalendar = useCallback(async () => {
    try {
      // 1. Check calendar list
      const response = await window.gapi.client.calendar.calendarList.list();
      const kairosCalendar = response.result.items?.find(cal => cal.summary === 'Kairos');
      
      if (kairosCalendar) {
        localStorage.setItem('selectedCalendarId', kairosCalendar.id);
        return kairosCalendar.id;
      }

      // 2. Create Kairos calendar if not found
      const createResponse = await window.gapi.client.calendar.calendars.insert({
        resource: {
          summary: 'Kairos',
          description: '실제 일정 소요 시간 기록용 캘린더'
        }
      });

      const newCalendar = createResponse.result;
      localStorage.setItem('selectedCalendarId', newCalendar.id);
      return newCalendar.id;
    } catch (error) {
      console.error('Failed to ensure Kairos calendar:', error);
      setError('Kairos 캘린더 생성에 실패했습니다.');
      return null;
    }
  }, []);

  // Initialize Google Calendar and ensure Kairos calendar exists
  useEffect(() => {
    const loadGoogleAPI = async () => {
      try {
        // Wait for gapi to be loaded
        if (!window.gapi) {
          console.error('Google API not loaded');
          setError('Google API를 불러오는데 실패했습니다.');
          return;
        }

        // Load the client library
        await new Promise((resolve) => {
          window.gapi.load('client', resolve);
        });

        // Initialize the client with basic settings
        await window.gapi.client.init({
          apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });

        // Check if we have a stored access token
        const storedToken = localStorage.getItem('gapi_access_token');
        if (storedToken) {
          try {
            window.gapi.client.setToken({ access_token: storedToken });
            // Test if the token is still valid
            await window.gapi.client.calendar.calendarList.list();
            await ensureKairosCalendar();
            setError(null);
            return;
          } catch (error) {
            // Token is invalid, remove it and proceed with new authentication
            localStorage.removeItem('gapi_access_token');
          }
        }

        // Initialize Google Identity Services
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.REACT_APP_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: async (response) => {
            if (response.error) {
              setError('Google Calendar 접근 권한이 거부되었습니다.');
              return;
            }

            // Store the access token
            localStorage.setItem('gapi_access_token', response.access_token);
            
            // Set the access token
            window.gapi.client.setToken(response);

            try {
              // Ensure Kairos calendar exists
              await ensureKairosCalendar();
              setError(null);
            } catch (error) {
              console.error('Failed to ensure Kairos calendar:', error);
              setError('Kairos 캘린더 생성에 실패했습니다.');
            }
          },
        });

        // Request the token
        tokenClient.requestAccessToken({ prompt: '' });  // Remove 'consent' to use stored credentials

      } catch (error) {
        console.error('Failed to initialize calendar:', error);
        setError('Google Calendar 권한을 확인해주세요.');
      }
    };

    loadGoogleAPI();
  }, [ensureKairosCalendar]);

  const formatEventTime = (dateTime) => {
    try {
      return format(new Date(dateTime), 'HH:mm', { locale: ko });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const handleEndEvent = async (skipFeedback = false) => {
    if (!activeEvent) return;

    const endTime = new Date();
    const duration = endTime - startTime;
    const durationMinutes = Math.round(duration / (1000 * 60));

    // Stop the timer immediately
    setStartTime(null);

    // If skipFeedback is true, it means the event was cancelled
    if (skipFeedback) {
      setActiveEvent(null);
      setElapsedTime('');
      setFeedback({ score: 5, text: '' });
      return;  // Don't save cancelled events
    }

    // Store event details for later use
    localStorage.setItem('pendingQuickEvent', JSON.stringify({
      title: activeEvent.title,
      color: activeEvent.color,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes
    }));

    // Show feedback dialog
    setShowFeedback(true);
  };

  const formatElapsedTime = useCallback((start) => {
    if (!start) return;

    const now = new Date();
    const diff = now - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      setElapsedTime(`${hours}시간 ${minutes}분`);
    } else {
      setElapsedTime(`${minutes}분 ${seconds}초`);
    }
  }, []);

  // Timer update effect
  useEffect(() => {
    let intervalId;
    
    if (startTime && activeEvent) {
      // Update immediately
      formatElapsedTime(startTime);
      
      // Then update every second
      intervalId = setInterval(() => {
        formatElapsedTime(startTime);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startTime, activeEvent, formatElapsedTime]);

  const handleStartEvent = (event, force = false) => {
    // If there's an active event and we're not forcing the start
    if (activeEvent && !force) {
      setPendingEvent(event);
      setShowWarning(true);
      return;
    }

    // Start the new event
    setActiveEvent(event);
    setStartTime(new Date());
    setPendingEvent(null);
  };

  const handleFeedbackSubmit = async () => {
    if (isSubmitting) return;  // Prevent multiple submissions
    setIsSubmitting(true);     // Start submission
    setShowFeedback(false);    // Immediately close the dialog

    try {
      const pendingEvent = JSON.parse(localStorage.getItem('pendingQuickEvent'));
      if (!pendingEvent) {
        throw new Error('No pending event found');
      }

      // Get or ensure Kairos calendar
      const kairosId = await ensureKairosCalendar();
      if (!kairosId) {
        throw new Error('Failed to get Kairos calendar');
      }

      // Format description like TimeTracker
      const description = [
        `Quick Event`,
        '',
        `시작 시간: ${formatEventTime(new Date(pendingEvent.startTime))}`,
        `종료 시간: ${formatEventTime(new Date(pendingEvent.endTime))}`,
        `총 소요 시간: ${pendingEvent.durationMinutes}분`,
        '',
        '피드백:',
        `평점: ${feedback.score}/10`,
        feedback.text || '(피드백 없음)'
      ].join('\n');

      const calendarEvent = {
        summary: `[Quick] ${pendingEvent.title}`,
        description,
        start: {
          dateTime: pendingEvent.startTime,
          timeZone: 'Asia/Seoul'
        },
        end: {
          dateTime: pendingEvent.endTime,
          timeZone: 'Asia/Seoul'
        }
      };

      // Add to Kairos calendar
      await window.gapi.client.calendar.events.insert({
        calendarId: kairosId,
        resource: calendarEvent
      });

      // Clean up
      localStorage.removeItem('pendingQuickEvent');
    } catch (error) {
      console.error('Error saving event:', error);
      setError('활동을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      // Reset all states
      setIsSubmitting(false);
      setActiveEvent(null);
      setStartTime(null);
      setElapsedTime('');
      setFeedback({ score: 5, text: '' });
    }
  };

  // Load events from localStorage and combine with default events
  useEffect(() => {
    const loadEvents = () => {
      // Get custom events and their order from localStorage
      const savedEvents = localStorage.getItem('customQuickEvents');
      if (savedEvents) {
        const customEvents = JSON.parse(savedEvents);
        
        // Create a map of all events (default + custom)
        const allEventsMap = new Map([
          ...defaultQuickEvents.map(e => [e.id, e]),
          ...customEvents.map(e => [e.id, e])
        ]);
        
        // Get the order from localStorage
        const customOrder = customEvents.map(e => e.id);
        const defaultIds = defaultQuickEvents.map(e => e.id);
        
        // Combine events in the correct order
        const orderedEvents = [];
        
        // First, add the "Quick 활동 시작하기" event (assuming this is the one you want at the top)
        const quickStartEvent = defaultQuickEvents.find(e => e.title === "Quick 활동 시작하기");
        if (quickStartEvent) {
          orderedEvents.push(quickStartEvent);
        }
        
        // Then add remaining events in the saved order
        customOrder.forEach(id => {
          if (allEventsMap.has(id) && (!quickStartEvent || id !== quickStartEvent.id)) {
            orderedEvents.push(allEventsMap.get(id));
          }
        });
        
        // Add any remaining default events that aren't in the custom order
        defaultIds.forEach(id => {
          if (!customOrder.includes(id) && (!quickStartEvent || id !== quickStartEvent.id)) {
            const event = allEventsMap.get(id);
            if (event) {
              orderedEvents.push(event);
            }
          }
        });

        setEvents(orderedEvents);
      } else {
        // If no custom order exists, use default order with Quick Start at top
        const defaultOrdered = [...defaultQuickEvents];
        const quickStartIndex = defaultOrdered.findIndex(e => e.title === "Quick 활동 시작하기");
        if (quickStartIndex > 0) {
          const [quickStart] = defaultOrdered.splice(quickStartIndex, 1);
          defaultOrdered.unshift(quickStart);
        }
        setEvents(defaultOrdered);
      }
    };

    loadEvents();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'customQuickEvents') {
        loadEvents();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update QuickCustomEventCard component to handle one-time events
  const handleCustomEventStart = (newEvent) => {
    // Start the event immediately without saving it
    handleStartEvent(newEvent);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h4">
          Quick Event
        </Typography>
        <IconButton 
          onClick={() => navigate('/customize', { replace: true })}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {displayEvents.map((event) => (
          <Grid item xs={12} sm={6} key={event.id}>
            <QuickEventCard
              event={event}
              onStart={() => handleStartEvent(event)}
              isDraggable={false}
            />
          </Grid>
        ))}
        {/* Add one-time custom event card */}
        <Grid item xs={12} sm={6}>
          <QuickCustomEventCard onStart={handleCustomEventStart} />
        </Grid>
      </Grid>

      {/* Warning Dialog */}
      <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
        <DialogTitle>진행 중인 활동이 있습니다</DialogTitle>
        <DialogContent>
          <DialogContentText>
            현재 진행 중인 활동이 있습니다. 새로운 활동을 시작하면 현재 활동이 중단됩니다.
            계속하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarning(false)}>취소</Button>
          <Button onClick={() => {
            setShowWarning(false);
            handleEndEvent(true);
            handleStartEvent(pendingEvent, true);
          }} autoFocus>
            계속하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* Timer Modal */}
      {activeEvent && startTime && (
        <Dialog
          open={true}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              bgcolor: activeEvent.color || '#1976d2',
              color: 'white',
              textAlign: 'center',
              p: 4
            }
          }}
        >
          <DialogContent>
            <Typography variant="h4" gutterBottom>
              {activeEvent.title}
            </Typography>
            <Typography variant="h2" sx={{ my: 4 }}>
              {elapsedTime}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => handleEndEvent(false)}
                sx={{
                  bgcolor: 'white',
                  color: activeEvent.color || '#1976d2',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                종료하기
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => handleEndEvent(true)}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                취소
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      )}

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onClose={() => handleFeedbackSubmit()}>
        <DialogTitle>활동 피드백</DialogTitle>
        <DialogContent>
          <DialogContentText>
            활동에 대한 피드백을 남겨주세요.
          </DialogContentText>
          <Box sx={{ my: 2 }}>
            <Typography gutterBottom>평점</Typography>
            <Rating
              value={feedback.score}
              onChange={(event, newValue) => {
                setFeedback(prev => ({ ...prev, score: newValue }));
              }}
              max={10}
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="피드백 (선택사항)"
            fullWidth
            multiline
            rows={4}
            value={feedback.text}
            onChange={(e) => setFeedback(prev => ({ ...prev, text: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleFeedbackSubmit()}>건너뛰기</Button>
          <Button onClick={() => handleFeedbackSubmit()} variant="contained">
            저장하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickEventPage; 