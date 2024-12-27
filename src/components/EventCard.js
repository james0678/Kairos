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
  const isActive = activeTask && activeTask.eventId === event.id;

  // 설명에서 필요한 부분만 추출
  const getDisplayMessage = (description) => {
    if (!description) return null;
    
    // Get the actual duration and feedback
    const actualDuration = description.match(/실제 소요 시간: (.*?)\n/)?.[1];
    const feedbackMatch = description.split('피드백:\n')[1];
    const feedback = feedbackMatch?.trim();
    
    return [
      actualDuration && `소요 시간: ${actualDuration}`,
      feedback && feedback  // Only show feedback if it exists
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
      }}
    >
      <div 
        {...(isDraggable ? dragHandleProps : {})} 
        style={{ 
          height: '100%',
          cursor: isDraggable ? 'grab' : 'default'
        }}
      >
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
                sx={{ 
                  whiteSpace: 'pre-line',
                  mt: 1
                }}
              >
                {getDisplayMessage(event.description)}
              </Typography>
            )}
          </div>

          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              mt: 2,
              position: 'relative',
              zIndex: 10,
              '& .MuiButton-root': {
                cursor: 'pointer !important',
                '&:hover': {
                  cursor: 'pointer !important'
                }
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              console.log('Button container clicked');
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onMouseDown={(e) => {
                e.stopPropagation();
                console.log('Delete button mousedown:', event.id);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Delete button clicked for event:', event.id);
                onDeleteEvent(event.id);
              }}
            >
              삭제하기
            </Button>
            <Button
              variant="contained"
              onMouseDown={(e) => {
                e.stopPropagation();
                console.log('Start button mousedown:', event.id);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start button clicked for event:', event.id);
                onStartTask(event.id);
              }}
              disabled={!!activeTask}
            >
              시작하기
            </Button>
          </Box>
        </CardContent>
      </div>
    </Card>
  );
}; 