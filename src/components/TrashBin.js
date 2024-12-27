import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { formatEventTime } from '../utils/dateUtils';

export const TrashBin = ({ 
  deletedEvents, 
  onRestoreEvent, 
  onPermanentDelete, 
  onEmptyTrash,
  onGoBack,
  calendarColors 
}) => {
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">휴지통</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onGoBack}
            sx={{ mr: 1 }}
          >
            메인 화면으로 돌아가기
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={onEmptyTrash}
          >
            휴지통 비우기
          </Button>
        </Box>
      </Box>

      {deletedEvents.length === 0 ? (
        <Typography color="textSecondary">
          휴지통이 비어있습니다.
        </Typography>
      ) : (
        deletedEvents.map((event) => (
          <Card 
            key={event.id} 
            sx={{ 
              mb: 2,
              borderLeft: `4px solid ${calendarColors[event.calendarId] || '#757575'}`
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6">{event.summary}</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => onRestoreEvent(event)}
                    sx={{ mr: 1 }}
                  >
                    복구하기
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => onPermanentDelete(event.id)}
                  >
                    영구 삭제
                  </Button>
                </Box>
              </Box>
              {event.start?.dateTime && event.end?.dateTime && (
                <Typography color="textSecondary">
                  일정 시간: {formatEventTime(event.start.dateTime)} - 
                  {formatEventTime(event.end.dateTime)}
                </Typography>
              )}
              {event.description && (
                <Typography color="textSecondary" sx={{ mt: 1 }}>
                  {event.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}; 