import { Box, Typography } from '@mui/material';
import { CalendarCheckbox } from './CalendarCheckbox';

export const CalendarSelector = ({ 
  calendars, 
  selectedCalendars, 
  calendarLoading, 
  onCalendarToggle 
}) => {
  return (
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
          onChange={() => onCalendarToggle(calendar.id)}
        />
      ))}
    </Box>
  );
}; 