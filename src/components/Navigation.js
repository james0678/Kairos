import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HomeIcon from '@mui/icons-material/Home';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: '8px 16px',
        display: 'flex',
        gap: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Tooltip title="홈">
        <IconButton onClick={() => navigate('/')} color="primary">
          <HomeIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="캘린더">
        <IconButton onClick={() => navigate('/calendar')} color="primary">
          <CalendarMonthIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Navigation; 