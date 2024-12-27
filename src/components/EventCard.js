import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { formatEventTime } from '../utils/dateUtils';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export const EventCard = ({
  event,
  activeTask,
  onStartTask,
  onEndTask,
  onCancelTask,
  onDeleteEvent,
  calendarColor,
  dragHandleProps,
  isDraggable
}) => {
  const getDisplayMessage = (description) => {
    if (!description) return null;
    
    const actualDuration = description.match(/실제 소요 시간: (.*?)\n/)?.[1];
    const feedbackMatch = description.split('피드백:\n')[1];
    const feedback = feedbackMatch?.trim();
    
    return [
      actualDuration && `소요 시간: ${actualDuration}`,
      feedback && feedback
    ].filter(Boolean).join('\n\n');
  };

  return (
    <Card 
      sx={{ 
        borderLeft: `5px solid ${calendarColor || '#1976d2'}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        mb: 2,
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        },
        backgroundColor: '#fff',
        borderRadius: '8px',
        position: 'relative',
      }}
    >
      <div 
        {...(isDraggable ? dragHandleProps : {})} 
        style={{ 
          cursor: isDraggable ? 'grab' : 'default',
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />

      <CardContent sx={{ p: 3 }}>
        <div>
          <Typography variant="h6">
            {event.summary}
          </Typography>
          
          <Typography variant="body2" color="textSecondary">
            계획된 시간: {formatEventTime(event.start.dateTime)} - {formatEventTime(event.end.dateTime)}
          </Typography>

          {event.description && (
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ whiteSpace: 'pre-line', mt: 1 }}
            >
              {getDisplayMessage(event.description)}
            </Typography>
          )}
        </div>
      </CardContent>

      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1,
          p: 2,
          pt: 0,
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Button
          variant="outlined"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteEvent(event.id);
          }}
        >
          삭제하기
        </Button>
        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            onStartTask(event.id);
          }}
          disabled={!!activeTask}
        >
          시작하기
        </Button>
      </Box>
    </Card>
  );
}; 