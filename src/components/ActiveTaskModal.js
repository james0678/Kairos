import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { formatEventTime } from '../utils/dateUtils';
import { CompletionModal } from './CompletionModal';
import { AutoEndModal } from './AutoEndModal';

const STORAGE_KEY = 'activeTaskData';

export const ActiveTaskModal = ({
  open,
  event,
  activeTask,
  onClose,
  onEndTask,
  onCancelTask,
  calendarColor
}) => {
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);
  
  const [isPaused, setIsPaused] = useState(false);
  const [breakTimes, setBreakTimes] = useState([]);
  const [currentBreak, setCurrentBreak] = useState(null);
  const [showAutoEndModal, setShowAutoEndModal] = useState(false);
  const [currentBreakSeconds, setCurrentBreakSeconds] = useState(0);

  useEffect(() => {
    if (open && activeTask) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.eventId === activeTask.eventId) {
          setBreakTimes(parsed.breakTimes || []);
          setCurrentBreak(parsed.currentBreak);
          setIsPaused(Boolean(parsed.currentBreak));
        }
      }
    }
  }, [open, activeTask]);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setElapsedSeconds(0);
      setIsTimerActive(true);
      setIsPaused(false);
      setCurrentBreak(null);
      setBreakTimes([]);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const updateProgress = () => {
      if (!activeTask || !event.start?.dateTime || !event.end?.dateTime || !isTimerActive) return;

      const now = new Date();
      const startTime = new Date(activeTask.startTime);
      const elapsedTime = now - startTime;
      
      let totalBreakTime = breakTimes.reduce((sum, breakTime) => 
        sum + (new Date(breakTime.end) - new Date(breakTime.start)), 0);
      
      if (currentBreak) {
        totalBreakTime += (now - new Date(currentBreak.start));
      }

      const actualWorkTime = elapsedTime - totalBreakTime;
      
      const plannedDuration = new Date(event.end.dateTime) - new Date(event.start.dateTime);
      
      const percentage = (actualWorkTime / plannedDuration) * 100;
      setProgress(Math.round(percentage * 100) / 100);
      setElapsedSeconds(Math.floor(actualWorkTime / 1000));

      if (actualWorkTime >= plannedDuration * 2) {
        handleAutoEnd("작업 시간 초과");
      } else if (totalBreakTime >= plannedDuration) {
        handleAutoEnd("쉬는 시간 초과");
      }
    };

    const timer = setInterval(updateProgress, 1000);
    updateProgress();

    return () => clearInterval(timer);
  }, [open, activeTask, event, isTimerActive, breakTimes, currentBreak]);

  useEffect(() => {
    if (activeTask) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        eventId: activeTask.eventId,
        breakTimes,
        currentBreak
      }));
    }
  }, [activeTask, breakTimes, currentBreak]);

  useEffect(() => {
    if (isPaused && currentBreak) {
      const timer = setInterval(() => {
        const now = new Date();
        const breakStart = new Date(currentBreak.start);
        setCurrentBreakSeconds(Math.floor((now - breakStart) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCurrentBreakSeconds(0);
    }
  }, [isPaused, currentBreak]);

  const handleBreakToggle = () => {
    const now = new Date();
    if (!isPaused) {
      setCurrentBreak({ start: now.toISOString() });
      setIsPaused(true);
    } else {
      if (currentBreak) {
        setBreakTimes(prev => [...prev, {
          ...currentBreak,
          end: now.toISOString()
        }]);
      }
      setCurrentBreak(null);
      setIsPaused(false);
    }
  };

  const handleAutoEnd = (reason) => {
    setShowAutoEndModal(true);
    setIsTimerActive(false);
  };

  const handleEndTask = () => {
    setIsTimerActive(false);
    setShowCompletionModal(true);
  };

  const handleCompletionClose = (feedback) => {
    setShowCompletionModal(false);
    if (feedback) {
      onEndTask(event.id, feedback);
      onClose();
    } else {
      setIsTimerActive(true);
    }
  };

  const getPlannedDuration = () => {
    if (!event.start?.dateTime || !event.end?.dateTime) return 0;
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    return Math.round((end - start) / (1000 * 60));
  };

  const getProgressBarValue = (rawProgress) => {
    if (rawProgress <= 100) return rawProgress;
    return (rawProgress / 500) * 100;
  };

  const displayProgress = progress.toFixed(2);
  const plannedDuration = getPlannedDuration();

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const formatBreakTimes = (breakTimes, currentBreak) => {
    return breakTimes.map((breakTime, index) => {
      if (currentBreak && new Date(currentBreak.start) >= new Date(breakTime.start) && new Date(currentBreak.start) < new Date(breakTime.end)) {
        return `쉬는 시간 ${index + 1}`;
      }
      return `쉬는 시간 ${index + 1}`;
    }).join(', ');
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
  };

  const getTotalBreakTime = () => {
    let total = breakTimes.reduce((sum, breakTime) => 
      sum + (new Date(breakTime.end) - new Date(breakTime.start)), 0
    );
    
    if (currentBreak) {
      total += (new Date() - new Date(currentBreak.start));
    }
    
    return Math.floor(total / 1000);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        keepMounted
      >
        <DialogTitle sx={{ textAlign: 'center' }}>{event.summary}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              계획된 시간: {formatEventTime(event.start.dateTime)} - {formatEventTime(event.end.dateTime)}
              {` (총 ${formatDuration(getPlannedDuration())})`}
            </Typography>
            <Typography variant="body1" gutterBottom>
              소요 시간: {formatElapsedTime(elapsedSeconds)}
            </Typography>
            {isPaused && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                현재 쉬는 시간: {formatElapsedTime(currentBreakSeconds)}
              </Typography>
            )}
            {(breakTimes.length > 0 || currentBreak) && (
              <Typography variant="body2" color="textSecondary">
                총 쉬는 시간: {formatElapsedTime(getTotalBreakTime())}
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom align="center">
                {displayProgress}%
              </Typography>
              <Box sx={{ position: 'relative', width: '100%' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressBarValue(progress)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: `${calendarColor}40`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: progress > 100 ? 'error.main' : calendarColor,
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={onCancelTask} 
            color="error" 
            variant="outlined"
            size="large"
          >
            취소하기
          </Button>
          <Button
            onClick={handleBreakToggle}
            variant="outlined"
            color="primary"
            size="large"
          >
            {isPaused ? "다시 시작하기" : "잠시 쉬기"}
          </Button>
          <Button
            onClick={handleEndTask}
            variant="contained"
            disabled={isPaused}
          >
            {`${event.summary}을(를) 끝냈어요`}
          </Button>
        </DialogActions>
      </Dialog>
      
      <CompletionModal
        open={showCompletionModal}
        event={event}
        elapsedSeconds={elapsedSeconds}
        plannedDuration={getPlannedDuration()}
        breakTimes={breakTimes}
        onClose={handleCompletionClose}
        keepMounted
      />

      <AutoEndModal
        open={showAutoEndModal}
        onClose={() => {
          setShowAutoEndModal(false);
          handleEndTask();
        }}
      />
    </>
  );
}; 