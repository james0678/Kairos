import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PaletteIcon from '@mui/icons-material/Palette';
import { useNavigate, Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useQuickEvents } from '../contexts/QuickEventsContext';
import { CSS } from '@dnd-kit/utilities';
import { defaultQuickEvents } from '../utils/iconMapping';
import { 
  red, pink, purple, deepPurple, indigo, blue, 
  lightBlue, cyan, teal, green, lightGreen, lime,
  yellow, amber, orange, deepOrange, brown, grey
} from '@mui/material/colors';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import BookIcon from '@mui/icons-material/Book';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import BrushIcon from '@mui/icons-material/Brush';
import MovieIcon from '@mui/icons-material/Movie';
import CodeIcon from '@mui/icons-material/Code';
import PhoneIcon from '@mui/icons-material/Phone';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import PetsIcon from '@mui/icons-material/Pets';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import WatchIcon from '@mui/icons-material/Watch';
import { TrashBin } from './TrashBin';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const colorOptions = [
  { name: 'Red', value: red[500] },
  { name: 'Pink', value: pink[500] },
  { name: 'Purple', value: purple[500] },
  { name: 'Deep Purple', value: deepPurple[500] },
  { name: 'Indigo', value: indigo[500] },
  { name: 'Blue', value: blue[500] },
  { name: 'Light Blue', value: lightBlue[500] },
  { name: 'Cyan', value: cyan[500] },
  { name: 'Teal', value: teal[500] },
  { name: 'Green', value: green[500] },
  { name: 'Light Green', value: lightGreen[500] },
  { name: 'Lime', value: lime[500] },
  { name: 'Yellow', value: yellow[700] },
  { name: 'Amber', value: amber[500] },
  { name: 'Orange', value: orange[500] },
  { name: 'Deep Orange', value: deepOrange[500] },
  { name: 'Brown', value: brown[500] },
  { name: 'Grey', value: grey[500] },
];

const iconOptions = [
  { name: 'list', icon: FormatListBulletedIcon, label: '기본' },
  { name: 'walk', icon: DirectionsWalkIcon, label: '산책' },
  { name: 'game', icon: SportsEsportsIcon, label: '게임' },
  { name: 'food', icon: RestaurantIcon, label: '식사' },
  { name: 'study', icon: SchoolIcon, label: '공부' },
  { name: 'work', icon: WorkIcon, label: '업무' },
  { name: 'fitness', icon: FitnessCenterIcon, label: '운동' },
  { name: 'cafe', icon: LocalCafeIcon, label: '카페' },
  { name: 'book', icon: BookIcon, label: '독서' },
  { name: 'music', icon: MusicNoteIcon, label: '음악' },
  { name: 'sports', icon: SportsBasketballIcon, label: '스포츠' },
  { name: 'art', icon: BrushIcon, label: '예술' },
  { name: 'movie', icon: MovieIcon, label: '영화' },
  { name: 'code', icon: CodeIcon, label: '코딩' },
  { name: 'phone', icon: PhoneIcon, label: '통화' },
  { name: 'shopping', icon: ShoppingCartIcon, label: '쇼핑' },
  { name: 'home', icon: HomeIcon, label: '집' },
  { name: 'pet', icon: PetsIcon, label: '반려동물' },
  { name: 'car', icon: DirectionsCarIcon, label: '운전' },
  { name: 'flight', icon: FlightIcon, label: '여행' },
  { name: 'favorite', icon: FavoriteIcon, label: '좋아하는 것' },
  { name: 'star', icon: StarIcon, label: '중요' },
  { name: 'time', icon: WatchIcon, label: '시간' },
];

const SortableItem = ({ event, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const IconComponent = iconOptions.find(opt => opt.name === event.iconName)?.icon || FormatListBulletedIcon;

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        sx={{
          mb: 2,
          borderLeft: `5px solid ${event.color}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
          opacity: isDragging ? 0.5 : 1,
          position: 'relative',
        }}
      >
        <CardContent sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          py: '12px !important',
        }}>
          {/* Draggable area */}
          <div 
            {...attributes} 
            {...listeners}
            style={{ 
              flex: 1, 
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconComponent sx={{ mr: 1, color: event.color }} />
            <Typography variant="subtitle1">
              {event.title}
            </Typography>
          </div>

          {/* Buttons area - separated from drag handlers */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <IconButton
              onClick={() => {
                console.log('Edit clicked for:', event.title);
                onEdit(event);
              }}
              size="small"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                console.log('Delete clicked for:', event.title);
                onDelete(event.id);
              }}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomizePage = () => {
  const navigate = useNavigate();
  const { events, setEvents, customOrder, updateOrder, getOrderedEvents, updateEvent } = useQuickEvents();
  const [editingEvent, setEditingEvent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [editedIcon, setEditedIcon] = useState('');
  const containerRef = useRef(null);
  const [showTrashBin, setShowTrashBin] = useState(false);
  const [deletedEvents, setDeletedEvents] = useState(() => {
    const saved = localStorage.getItem('deletedQuickEvents');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('deletedQuickEvents', JSON.stringify(deletedEvents));
  }, [deletedEvents]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 10,
        tolerance: 5,
        distance: 1,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) return;
    
    const oldIndex = getOrderedEvents().findIndex(e => e.id === active.id);
    const newIndex = getOrderedEvents().findIndex(e => e.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrderedEvents = arrayMove(getOrderedEvents(), oldIndex, newIndex);
      const newOrder = newOrderedEvents
        .filter(e => e.title !== "Quick 활동 시작하기")
        .map(e => e.id);
      updateOrder(newOrder);
    }
  };

  const handleRestoreEvent = async (event) => {
    setDeletedEvents(prev => prev.filter(e => e.id !== event.id));
    
    setEvents(prev => [...prev, event]);
    
    updateOrder(prev => [...prev, event.id]);
  };

  const handlePermanentDelete = (eventId) => {
    setDeletedEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleEmptyTrash = () => {
    setDeletedEvents([]);
  };

  const handleDeleteEvent = (eventId) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    setDeletedEvents(prev => [...prev, eventToDelete]);

    setEvents(prev => prev.filter(event => event.id !== eventId));
    updateOrder(prev => prev.filter(id => id !== eventId));
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setEditedTitle(event.title);
    setEditedColor(event.color);
    setEditedIcon(event.iconName);

    if (event.openColorPicker || event.openIconPicker) {
      setEditDialogOpen(true);
      setTimeout(() => {
        const section = document.getElementById(event.openColorPicker ? 'color-section' : 'icon-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editingEvent) return;

    const updatedEvent = {
      ...editingEvent,
      title: editedTitle.trim() || editingEvent.title,
      color: editedColor || editingEvent.color,
      iconName: editedIcon || editingEvent.iconName
    };

    updateEvent(updatedEvent);

    setEditDialogOpen(false);
    setEditingEvent(null);
    setEditedTitle('');
    setEditedColor('');
    setEditedIcon('');
  };

  console.log('Events:', events);
  console.log('Custom Order:', customOrder);
  console.log('Ordered Events:', getOrderedEvents());

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh',
      overflow: 'auto',  // Single scroll for entire page
      p: 3
    }}>
      {/* Header with trash bin button */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/', { replace: true })}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Quick Event 설정
          </Typography>
        </Box>
        <Button
          startIcon={<DeleteOutlineIcon />}
          variant="outlined"
          onClick={() => setShowTrashBin(true)}
        >
          휴지통
        </Button>
      </Box>

      {showTrashBin ? (
        <TrashBin
          deletedEvents={deletedEvents}
          onRestoreEvent={handleRestoreEvent}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
          onGoBack={() => setShowTrashBin(false)}
          calendarColors={Object.fromEntries(
            events.map(event => [event.id, event.color])
          )}
        />
      ) : (
        // Events Container */}
        <Box ref={containerRef}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={getOrderedEvents().map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <Box>
                {getOrderedEvents().map((event) => (
                  <SortableItem
                    key={event.id}
                    event={event}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        </Box>
      )}

      {/* Add Button */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <Button
          component={Link}
          to="/customize/new"
          variant="contained"
          fullWidth
        >
          새 Quick Event 추가
        </Button>
      </Box>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingEvent?.openColorPicker ? '색상 변경' : 
           editingEvent?.openIconPicker ? '아이콘 변경' : 
           'Quick Event 수정'}
        </DialogTitle>
        <DialogContent>
          {!editingEvent?.openColorPicker && !editingEvent?.openIconPicker && (
            <TextField
              autoFocus
              margin="dense"
              label="이벤트 이름"
              fullWidth
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              sx={{ mb: 3 }}
            />
          )}
          
          {/* Icon Selection */}
          {(editingEvent?.openIconPicker || !editingEvent?.openColorPicker) && (
            <>
              <Typography variant="subtitle1" gutterBottom id="icon-section">
                아이콘 선택
              </Typography>
              <RadioGroup
                value={editedIcon}
                onChange={(e) => setEditedIcon(e.target.value)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 1,
                  mt: 1,
                  mb: 3
                }}
              >
                {iconOptions.map((iconOpt) => {
                  const IconComponent = iconOpt.icon;
                  return (
                    <FormControlLabel
                      key={iconOpt.name}
                      value={iconOpt.name}
                      control={
                        <Radio
                          icon={<IconComponent sx={{ fontSize: 28 }} />}
                          checkedIcon={<IconComponent sx={{ fontSize: 28, color: editedColor || 'primary.main' }} />}
                          sx={{ padding: 1 }}
                        />
                      }
                      label=""
                      sx={{
                        margin: 0,
                        justifyContent: 'center',
                      }}
                    />
                  );
                })}
              </RadioGroup>
            </>
          )}

          {/* Color Selection */}
          {(editingEvent?.openColorPicker || !editingEvent?.openIconPicker) && (
            <>
              <Typography variant="subtitle1" gutterBottom id="color-section">
                색상 선택
              </Typography>
              <RadioGroup
                value={editedColor}
                onChange={(e) => setEditedColor(e.target.value)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 1,
                  mt: 1
                }}
              >
                {colorOptions.map((color) => (
                  <FormControlLabel
                    key={color.value}
                    value={color.value}
                    control={
                      <Radio
                        sx={{
                          color: color.value,
                          '&.Mui-checked': {
                            color: color.value,
                          },
                          padding: 0.5,
                        }}
                      />
                    }
                    label=""
                    sx={{
                      margin: 0,
                      justifyContent: 'center',
                    }}
                  />
                ))}
              </RadioGroup>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button 
            onClick={handleSaveEdit} 
            disabled={!editedTitle.trim() && !editingEvent?.openColorPicker && !editingEvent?.openIconPicker}
            variant="contained"
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomizePage; 