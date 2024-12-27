import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, FormControlLabel, Checkbox, CircularProgress, Button, Skeleton, Snackbar, Alert } from '@mui/material';
import { format } from 'date-fns';
import { EventCard } from './EventCard';
import { TrashBin } from './TrashBin';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCalendar } from '../contexts/CalendarContext';
import { RetryModal } from './RetryModal';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ActiveTaskModal } from './ActiveTaskModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableEventCard } from './SortableEventCard';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

const CalendarCheckbox = ({ calendar, checked, loading, onChange }) => {
  return (
    <FormControlLabel
      control={
        loading ? (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            width={32} 
            height={32}
          >
            <CircularProgress 
              size={20} 
              sx={{ color: calendar.backgroundColor || 'primary.main' }} 
            />
          </Box>
        ) : (
          <Checkbox
            checked={checked}
            onChange={onChange}
            style={{ color: calendar.backgroundColor }}
          />
        )
      }
      label={calendar.summary}
    />
  );
};

const EventCardSkeleton = () => (
  <Box mb={2}>
    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
  </Box>
);

const TimeTracker = ({ token, onLogout }) => {
  const { 
    setFailedEvent, 
    setIsRetryModalOpen,
    failedEvent,
  } = useCalendar();
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [kairosCalendarId, setKairosCalendarId] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState({});
  const [showTrashBin, setShowTrashBin] = useState(false);
  const [deletedEvents, setDeletedEvents] = useState(() => {
    const saved = localStorage.getItem('deletedEvents');
    return saved ? JSON.parse(saved) : [];
  });
  const [timeRange, setTimeRange] = useState({
    start: new Date().setHours(0, 0, 0, 0),
    end: new Date().setHours(23, 59, 59, 999)
  });
  const lastTimeRange = useRef(null);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 10,
        tolerance: 5,
        distance: 1,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!active || !over) return;
    
    if (active.id !== over.id) {
      setEvents((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // deletedEvents가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('deletedEvents', JSON.stringify(deletedEvents));
  }, [deletedEvents]);

  // 1. 초기화 상태 추적
  const isInitialized = useRef(false);

  // 2. 함수들을 먼저 선언
  const handleError = useCallback((message) => {
    setError(message);
    if (message.includes('token')) {
      handleRefresh().catch(() => {});
    }
  }, []);

  const fetchCalendarList = useCallback(async () => {
    if (!token) return;
    try {
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
      
      const data = await response.json();
      const allCalendars = data.items || [];
      setCalendars(allCalendars);
      
      const savedSelections = JSON.parse(localStorage.getItem('selectedCalendars') || '[]');
      const selectedIds = savedSelections.length > 0 
        ? savedSelections 
        : allCalendars.map(cal => cal.id);
      
      setSelectedCalendars(selectedIds);
      localStorage.setItem('selectedCalendars', JSON.stringify(selectedIds));

    } catch (error) {
      handleError('캘린더 목록을 가져오는데 실패했습니다.');
    }
  }, [token, handleError]);

  const fetchTodayEvents = useCallback(async (showLoading = true) => {
    if (!token || selectedCalendars.length === 0) return;
    
    if (showLoading) setLoading(true);
    
    const initialLoadingState = {};
    selectedCalendars.forEach(id => {
      initialLoadingState[id] = true;
    });
    setCalendarLoading(initialLoadingState);

    try {
      const promises = selectedCalendars.map(async (calendarId) => {
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

        setCalendarLoading(prev => ({
          ...prev,
          [calendarId]: false
        }));
        
        return response.ok ? response.json() : null;
      });

      const results = await Promise.all(promises);
      const allEvents = results
        .filter(Boolean)
        .flatMap((data, index) => 
          (data.items || []).map(item => ({
            ...item,
            calendar: { id: selectedCalendars[index] }
          }))
        )
        .sort((a, b) => {
          const aTime = a.start?.dateTime || a.start?.date;
          const bTime = b.start?.dateTime || b.start?.date;
          return new Date(aTime) - new Date(bTime);
        });

      setEvents(allEvents);
    } catch (error) {
      handleError('이벤트를 가져오는데 실패했습니다.');
    } finally {
      if (showLoading) setLoading(false);
      setCalendarLoading({});
    }
  }, [token, selectedCalendars, timeRange, handleError]);

  // 3. 초기화 useEffect
  useEffect(() => {
    if (!token || isInitialized.current) return;
    
    const initialize = async () => {
      setLoading(true);
      try {
        await fetchCalendarList();
        isInitialized.current = true;
      } catch (error) {
        handleError('초기화에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [token, fetchCalendarList]);

  // 4. selectedCalendars 변경 감지
  useEffect(() => {
    if (!isInitialized.current) return;
    fetchTodayEvents(false);
  }, [selectedCalendars, fetchTodayEvents]);

  // 5. timeRange 변경 감지
  useEffect(() => {
    if (!isInitialized.current) return;
    const timeRangeChanged = !lastTimeRange.current || 
      lastTimeRange.current.start !== timeRange.start || 
      lastTimeRange.current.end !== timeRange.end;

    if (timeRangeChanged) {
      fetchTodayEvents();
      lastTimeRange.current = timeRange;
    }
  }, [timeRange, fetchTodayEvents]);

  // 캘린더 선택 핸들러
  const handleCalendarToggle = async (calendarId) => {
    // 1. 즉시 UI 업데이트
    setSelectedCalendars(prev => {
      const isRemoving = prev.includes(calendarId);
      const newSelection = isRemoving
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId];
      
      // localStorage 업데이트
      localStorage.setItem('selectedCalendars', JSON.stringify(newSelection));

      // 체크 해제 시 즉시 이벤트 제거
      if (isRemoving) {
        setEvents(prevEvents => 
          prevEvents.filter(event => event.calendar?.id !== calendarId)
        );
      }

      return newSelection;
    });

    // 체크 해제의 경우 여기서  (API 호출 불필요)
    if (selectedCalendars.includes(calendarId)) {
      return;
    }

    // 2. 체크 해당 캘린더 로딩 표시
    setCalendarLoading(prev => ({
      ...prev,
      [calendarId]: true
    }));

    try {
      // 3. 선택된 캘린더의 이벤트만 가져오기
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

      if (response.ok) {
        const data = await response.json();
        
        // 4. 새 이벤트 추가 (기존 이벤트는 지지)
        setEvents(prevEvents => {
          const newEvents = [
            ...prevEvents,
            ...(data.items || []).map(item => ({
              ...item,
              calendar: { id: calendarId }
            }))
          ].sort((a, b) => {
            const aTime = a.start?.dateTime || a.start?.date;
            const bTime = b.start?.dateTime || b.start?.date;
            return new Date(aTime) - new Date(bTime);
          });

          return newEvents;
        });
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    } finally {
      // 5. 로딩 상태 해제
      setCalendarLoading(prev => ({
        ...prev,
        [calendarId]: false
      }));
    }
  };

  const handleStartTask = useCallback((eventId) => {
    console.log('TimeTracker - handleStartTask called with:', eventId);
    const event = events.find(e => e.id === eventId);
    console.log('Found event:', event);
    if (!event) {
      console.log('Event not found:', eventId);
      return;
    }

    console.log('Setting active task for event:', event.summary);
    setActiveTask({
      eventId,
      startTime: new Date(),
      calendarId: event.calendar?.id || event.id.split('@')[0]
    });
  }, [events]);

  // Kairos 캘린더 확인/생성
  const ensureKairosCalendar = useCallback(async () => {
    try {
      // 1. 캘린더 목록 확인
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      const kairosCalendar = data.items?.find(cal => cal.summary === 'Kairos');
      
      if (kairosCalendar) {
        setKairosCalendarId(kairosCalendar.id);
        return kairosCalendar.id;
      }

      // 2. Kairos 캘린더 생성
      const createResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: 'Kairos',
            description: '실제 일정 소요 시간 기록용 캘린더'
          })
        }
      );

      const newCalendar = await createResponse.json();
      setKairosCalendarId(newCalendar.id);
      return newCalendar.id;
    } catch (error) {
      console.error('Failed to ensure Kairos calendar:', error);
      return null;
    }
  }, [token]);

  // 컴포넌트 운트 시 Kairos 캘린더 확인
  useEffect(() => {
    ensureKairosCalendar();
  }, [ensureKairosCalendar]);

  const handleEndTask = async (eventId, messageObj) => {
    try {
      const currentEvent = events.find(e => e.id === eventId);
      if (!currentEvent) {
        throw new Error('Event not found');
      }

      // Get or create Kairos calendar first
      const kairosId = await ensureKairosCalendar();
      if (!kairosId) {
        console.error('Failed to get Kairos calendar ID');
        throw new Error('Failed to create or get Kairos calendar');
      }

      console.log('Using Kairos calendar ID:', kairosId);
      console.log('Message Object:', messageObj); // Debug log to see messageObj structure

      // Format the description with clear structure
      const description = [
        `계획된 시간: ${formatEventTime(currentEvent.start.dateTime)} - ${formatEventTime(currentEvent.end.dateTime)} (총 ${messageObj.description.match(/총 (.*?)\n/)?.[1] || '0분'})`,
        '',
        '쉬는 시간:',
        ...(messageObj?.breaks || []).map((breakTime, index) => 
          `${index + 1}번째 쉬는 시간: ${breakTime}`
        ),
        `쉬는 시간 총 소요시간: ${messageObj?.totalBreakTime || '0분'}`,
        '',
        `실제 소요 시간: ${messageObj.description.match(/실제 소요 시간: (.*?)\n/)?.[1] || '0분'}`,
        messageObj.uiMessage.split('\n\n')[0],  // Add the "일찍 끝내셨요" message
        '',
        '피드백:',
        messageObj.uiMessage.split('피드백:\n')[1] || ''  // Get the feedback from uiMessage
      ].join('\n');

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 1000);

      const newEvent = {
        summary: `[Kairos] ${currentEvent.summary}`,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Asia/Seoul'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Seoul'
        }
      };

      console.log('Attempting to create Kairos event:', newEvent); // Debug log

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(kairosId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newEvent)
        }
      );

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Failed to create Kairos event. Response:', responseData); // Debug log
        throw new Error(`Failed to create Kairos event: ${responseData.error?.message || 'Unknown error'}`);
      }

      console.log('Successfully created Kairos event:', responseData); // Debug log

      // Add to UI if calendar is selected
      if (selectedCalendars.includes(kairosId)) {
        setEvents(prev => [
          ...prev,
          {
            ...responseData,
            calendar: { id: kairosId }
          }
        ].sort((a, b) => {
          const aTime = a.start?.dateTime || a.start?.date;
          const bTime = b.start?.dateTime || b.start?.date;
          return new Date(aTime) - new Date(bTime);
        }));
      }

      // Clear states
      setActiveTask(null);
      setFailedEvent(null);  // Clear failed event state
      setIsRetryModalOpen(false);  // Close retry modal

    } catch (error) {
      console.error('Error in handleEndTask:', error);
      setFailedEvent({ eventId, messageObj });
      setIsRetryModalOpen(true);
      handleError(error.message || '작업 완료 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancelTask = () => {
    setActiveTask(null);
  };

  // 날/시간 형식을 안전하게 처리하는 헬퍼 함수 추가
  const formatEventTime = (dateTimeString) => {
    try {
      if (!dateTimeString) return '';
      return format(new Date(dateTimeString), 'HH:mm');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // 타지통 관련 핸들러 추가
  const handleRestoreEvent = async (event) => {
    try {
      // 먼저 휴지통에서 제거
      setDeletedEvents(prev => prev.filter(e => e.id !== event.id));

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${event.calendarId}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: event.summary,
            description: event.description,
            start: event.start,
            end: event.end
          })
        }
      );

      if (!response.ok) {
        // 실패 시 휴지통에 추가
        setDeletedEvents(prev => [...prev, event]);
        throw new Error('Failed to restore event');
      }

      // 캘린더가 선택되어 있다면 이벤트 목록 새로고침
      if (selectedCalendars.includes(event.calendarId)) {
        fetchTodayEvents(false);
      }
    } catch (error) {
      console.error('Failed to restore event:', error);
      alert('일정 복구에 실패했습니다.');
    }
  };

  const handlePermanentDelete = (eventId) => {
    setDeletedEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleEmptyTrash = () => {
    setDeletedEvents([]);
  };

  // 이벤트 삭제 핸들러 수정
  const handleDeleteEvent = useCallback(async (eventId) => {
    console.log('TimeTracker - handleDeleteEvent called with:', eventId);
    try {
      const event = events.find(e => e.id === eventId);
      console.log('Found event to delete:', event);
      if (!event) {
        console.log('Event not found:', eventId);
        return;
      }

      console.log('Deleting event:', event.summary);
      // Add to trash
      setDeletedEvents(prev => [...prev, {
        ...event,
        calendarId: event.calendar?.id || event.id.split('@')[0]
      }]);

      // Remove from UI first
      setEvents(prev => prev.filter(e => e.id !== eventId));

      const calendarId = event.calendar?.id || event.id.split('@')[0];
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('일정 삭제에 실패했습니다.');
    }
  }, [events, token]);

  const handleRefresh = async () => {
    // 새로고침 로직
    try {
      await Promise.all([
        fetchCalendarList(),
        fetchTodayEvents(true)
      ]);
      return Promise.resolve();
    } catch (error) {
      console.error('Refresh failed:', error);
      return Promise.reject(error);
    }
  };

  return (
    <>
      <Box p={3}>
        <TimeRangeSelector 
          onRangeChange={(newRange) => {
            setTimeRange(newRange);
          }}
        />
        <Box 
          display="flex" 
          justifyContent="flex-end" 
          alignItems="center" 
          mb={2}
          gap={2}
        >
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            onClick={handleRefresh}
          >
            새로고침
          </Button>
          <Button
            startIcon={<DeleteOutlineIcon />}
            variant="outlined"
            onClick={() => setShowTrashBin(true)}
          >
            휴지통
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={onLogout}
          >
            로그아웃
          </Button>
        </Box>

        {loading ? (
          <>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                캘린더 선택
              </Typography>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={40} sx={{ my: 1 }} />
              ))}
            </Box>
            <Typography variant="h5" gutterBottom>
              오늘의 일정
            </Typography>
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            {showTrashBin ? (
              <TrashBin
                deletedEvents={deletedEvents}
                onRestoreEvent={handleRestoreEvent}
                onPermanentDelete={handlePermanentDelete}
                onEmptyTrash={handleEmptyTrash}
                onGoBack={() => setShowTrashBin(false)}
                calendarColors={Object.fromEntries(
                  calendars.map(cal => [cal.id, cal.backgroundColor])
                )}
              />
            ) : (
              <>
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    캘린더 선택
                  </Typography>
                  {calendars.map(calendar => (
                    <CalendarCheckbox
                      key={calendar.id}
                      calendar={calendar}
                      checked={selectedCalendars.includes(calendar.id)}
                      loading={calendarLoading[calendar.id]}
                      onChange={() => handleCalendarToggle(calendar.id)}
                    />
                  ))}
                </Box>
                <Typography variant="h5" gutterBottom>
                  오늘의 일정
                </Typography>
                {events.length === 0 ? (
                  <Typography color="textSecondary">
                    오늘 예정된 일정이 없습니다.
                  </Typography>
                ) : (
                  <Box ref={containerRef} sx={{ position: 'relative', minHeight: '100vh' }}>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                    >
                      <SortableContext
                        items={events.map(e => e.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Box>
                          {events.map((event) => (
                            <SortableEventCard
                              key={event.id}
                              event={event}
                              activeTask={activeTask}
                              onStartTask={handleStartTask}
                              onEndTask={handleEndTask}
                              onCancelTask={handleCancelTask}
                              onDeleteEvent={handleDeleteEvent}
                              calendarColor={calendars.find(cal => 
                                cal.id === (event.calendar?.id || event.id.split('@')[0])
                              )?.backgroundColor}
                            />
                          ))}
                        </Box>
                      </SortableContext>
                    </DndContext>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>
      
      {activeTask && (
        <ActiveTaskModal
          open={!!activeTask}
          event={events.find(e => e.id === activeTask.eventId)}
          activeTask={activeTask}
          onClose={() => setActiveTask(null)}
          onEndTask={handleEndTask}
          onCancelTask={handleCancelTask}
          calendarColor={calendars.find(cal => 
            cal.id === activeTask.calendarId
          )?.backgroundColor}
        />
      )}

      <RetryModal 
        onRetry={() => {
          if (failedEvent) {
            const { eventId, messageObj } = failedEvent;
            handleEndTask(eventId, messageObj);
          }
        }}
      />
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TimeTracker;