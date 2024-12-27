import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EventCard } from './EventCard';
import { memo } from 'react';

export const SortableEventCard = memo(({ 
  event,
  activeTask,
  onStartTask,
  onEndTask,
  onCancelTask,
  onDeleteEvent,
  calendarColor
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EventCard 
        event={event}
        activeTask={activeTask}
        onStartTask={onStartTask}
        onEndTask={onEndTask}
        onCancelTask={onCancelTask}
        onDeleteEvent={onDeleteEvent}
        calendarColor={calendarColor}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
        isDraggable={true}
      />
    </div>
  );
});

SortableEventCard.displayName = 'SortableEventCard'; 