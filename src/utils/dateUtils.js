import { format } from 'date-fns';

export const formatEventTime = (dateTimeString) => {
  try {
    if (!dateTimeString) return '';
    return format(new Date(dateTimeString), 'HH:mm');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
};

export const calculateDuration = (start, end) => {
  return Math.round((end - start) / (1000 * 60));
}; 