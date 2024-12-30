import { Box, Typography, Button, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RestoreIcon from '@mui/icons-material/Restore';
import { iconMapping } from '../utils/iconMapping';
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
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onGoBack}
        >
          돌아가기
        </Button>
        <Button
          startIcon={<DeleteForeverIcon />}
          color="error"
          onClick={onEmptyTrash}
          disabled={deletedEvents.length === 0}
        >
          휴지통 비우기
        </Button>
      </Box>

      {deletedEvents.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          휴지통이 비어있습니다
        </Typography>
      ) : (
        <List>
          {deletedEvents.map((event) => {
            const Icon = iconMapping[event.iconName] || iconMapping.list;
            
            return (
              <ListItem
                key={event.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      onClick={() => onRestoreEvent(event)}
                      sx={{ mr: 1 }}
                    >
                      <RestoreIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => onPermanentDelete(event.id)}
                      color="error"
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Box>
                }
                sx={{
                  mb: 1,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  borderLeft: `5px solid ${event.color}`,
                }}
              >
                <ListItemIcon>
                  <Icon sx={{ color: event.color }} />
                </ListItemIcon>
                <ListItemText 
                  primary={event.title}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}; 