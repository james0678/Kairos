import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const Timer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - startTime;
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else {
      return `${minutes}분 ${seconds % 60}초`;
    }
  };

  return (
    <Typography color="textSecondary" sx={{ mt: 1 }}>
      진행 시간: {formatTime(elapsed)}
    </Typography>
  );
};

export default Timer; 