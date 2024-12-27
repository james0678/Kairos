import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EventCard } from './EventCard';

export function SortableEventCard(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EventCard 
        {...props}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
        isDraggable={true}
      />
    </div>
  );
}

export default SortableEventCard; 