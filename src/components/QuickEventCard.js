import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import { iconMapping } from '../utils/iconMapping';

const iconComponents = {
  walk: DirectionsWalkIcon,
  game: SportsEsportsIcon,
  food: RestaurantIcon,
  study: SchoolIcon,
  add: AddIcon,
};

export const QuickEventCard = ({ event, onStart, dragHandleProps, isDraggable }) => {
  const Icon = iconMapping[event.iconName] || iconMapping.list;
  
  return (
    <Box
      {...(isDraggable ? dragHandleProps : {})}
      sx={{
        aspectRatio: '4/3',
        backgroundColor: 'white',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 1.5,
        cursor: isDraggable ? 'grab' : 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        maxWidth: '300px',
        margin: '0 auto',
      }}
    >
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Icon sx={{ fontSize: 32, color: event.color, mb: 0.5 }} />
        <Typography
          variant="subtitle2"
          align="center"
          sx={{
            color: 'text.primary',
            fontWeight: 500,
          }}
        >
          {event.title}
        </Typography>
      </Box>
      
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ width: '100%', pointerEvents: 'auto' }}
      >
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon sx={{ fontSize: 18 }} />}
          fullWidth
          onClick={() => onStart(event)}
          size="small"
          sx={{
            mt: 1,
            backgroundColor: event.color,
            '&:hover': {
              backgroundColor: event.color,
              filter: 'brightness(0.9)',
            },
          }}
        >
          시작하기
        </Button>
      </Box>
    </Box>
  );
}; 