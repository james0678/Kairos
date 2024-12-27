import { Box, Typography, Slider, Button } from '@mui/material';
import { useState } from 'react';

export const CustomTimeRangePicker = ({ onSelect }) => {
  const [range, setRange] = useState([0, 24]); // 시간 단위 (0-48시간)

  const formatTime = (value) => {
    const totalHours = Math.floor(value);
    const day = totalHours >= 24 ? '다음날' : '오늘';
    const hours = totalHours % 24;
    return `${day} ${hours.toString().padStart(2, '0')}:00`;
  };

  return (
    <Box sx={{ p: 3, width: 300 }}>
      <Typography gutterBottom>
        시간 범위 설정
      </Typography>
      <Slider
        value={range}
        onChange={(_, newValue) => setRange(newValue)}
        min={0}
        max={48}
        step={1}
        marks={[
          { value: 0, label: '오늘 00:00' },
          { value: 24, label: '내일 00:00' },
          { value: 48, label: '모레 00:00' }
        ]}
        valueLabelFormat={formatTime}
        valueLabelDisplay="auto"
      />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography color="textSecondary" gutterBottom>
          {formatTime(range[0])} ~ {formatTime(range[1])}
        </Typography>
        <Button 
          variant="contained"
          onClick={() => onSelect({
            start: new Date().setHours(range[0] % 24, 0, 0, 0),
            end: new Date(new Date().getTime() + Math.floor(range[1] / 24) * 24 * 60 * 60 * 1000).setHours(range[1] % 24, 0, 0, 0)
          })}
        >
          적용
        </Button>
      </Box>
    </Box>
  );
}; 