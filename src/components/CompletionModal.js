import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Typography,
  Box
} from '@mui/material';
import { formatEventTime } from '../utils/dateUtils';

export const CompletionModal = ({
  open,
  event,
  elapsedSeconds,
  plannedDuration,
  breakTimes,
  onClose,
}) => {
  const [feedback, setFeedback] = useState('');

  const formatTimeDiff = (ms) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const formatBreakTime = (breakTime) => {
    const start = new Date(breakTime.start);
    const end = new Date(breakTime.end);
    const duration = Math.floor((end - start) / 1000); // 초 단위로 변환
    return formatElapsedTime(duration);
  };

  const getTotalBreakTime = () => {
    return breakTimes.reduce((total, breakTime) => {
      const duration = new Date(breakTime.end) - new Date(breakTime.start);
      return total + duration;
    }, 0);
  };

  const handleSave = () => {
    const actualDuration = elapsedSeconds * 1000; // ms로 변환
    const plannedDurationMs = plannedDuration * 60 * 1000; // minutes to ms
    const timeDiff = Math.abs(actualDuration - plannedDurationMs);
    
    // UI에 표시할 간단한 메시지
    const timeMessage = actualDuration < plannedDurationMs
      ? `${formatTimeDiff(timeDiff)} 일찍 끝내셨네요!`
      : `${formatTimeDiff(timeDiff)} 더 걸리셨네요...`;

    const uiMessage = timeMessage + (feedback ? `\n\n피드백:\n${feedback}` : '');

    // 구글 캘린더에 저장할 상세 메시지
    const totalBreakTimeMs = getTotalBreakTime();
    const totalBreakTimeSeconds = Math.floor(totalBreakTimeMs / 1000);
    
    const detailedMessage = [
      `계획된 시간: ${formatEventTime(event.start.dateTime)} - ${formatEventTime(event.end.dateTime)} (총 ${formatDuration(plannedDuration)})`,
      `실제 소요 시간: ${formatElapsedTime(elapsedSeconds)}`,
      timeMessage
    ];

    // 쉬는 시간 정보 추가
    if (breakTimes.length > 0) {
      detailedMessage.push('\n쉬는 시간:');
      breakTimes.forEach((breakTime, index) => {
        detailedMessage.push(`${index + 1}번째 쉬는 시간: ${formatBreakTime(breakTime)}`);
      });
      
      if (breakTimes.length > 1) {
        detailedMessage.push(`총 쉬는 시간: ${formatElapsedTime(totalBreakTimeSeconds)}`);
      }
    }

    // 피드백 추가
    if (feedback) {
      detailedMessage.push('\n피드백:', feedback);
    }

    // 두 가지 메시지를 객체로 전달
    onClose({
      uiMessage,
      description: detailedMessage.join('\n')
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>작업 완료</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            계획된 시간: {formatEventTime(event.start.dateTime)} - {formatEventTime(event.end.dateTime)}
            {` (총 ${formatDuration(plannedDuration)})`}
          </Typography>
          <Typography variant="body1" gutterBottom>
            실제 소요 시간: {formatElapsedTime(elapsedSeconds)}
          </Typography>
          
          {breakTimes.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" gutterBottom>
                쉬는 시간:
              </Typography>
              {breakTimes.map((breakTime, index) => (
                <Typography key={index} variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                  {`${index + 1}번째 쉬는 시간: ${formatBreakTime(breakTime)}`}
                </Typography>
              ))}
              {breakTimes.length > 1 && (
                <Typography variant="body2" color="textSecondary" sx={{ ml: 2, mt: 1 }}>
                  총 쉬는 시간: {formatElapsedTime(Math.floor(getTotalBreakTime() / 1000))}
                </Typography>
              )}
            </Box>
          )}
        </Box>
        
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          label="피드백 작성하기"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)}>
          취소
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          저장하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompletionModal; 