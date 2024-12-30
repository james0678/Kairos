import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Button,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useQuickEvents } from '../contexts/QuickEventsContext';

const NewQuickEventPage = () => {
  const navigate = useNavigate();
  const { setEvents, updateOrder } = useQuickEvents();
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newEvent = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      color: '#757575',
      iconName: 'custom',
      type: 'quick'
    };

    setEvents(prev => [...prev, newEvent]);
    updateOrder(prev => [...prev, newEvent.id]);

    navigate('/customize', { replace: true });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center',
        gap: 2
      }}>
        <IconButton onClick={() => navigate('/customize')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          새 Quick Event 추가
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <TextField
          autoFocus
          fullWidth
          label="이벤트 이름"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={!title.trim()}
        >
          추가하기
        </Button>
      </Box>
    </Box>
  );
};

export default NewQuickEventPage; 