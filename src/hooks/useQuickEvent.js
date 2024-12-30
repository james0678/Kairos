import { useQuickEvents } from '../contexts/QuickEventsContext';
import { QuickEventStorage } from '../services/quickEventStorage';
import { quickEventUtils } from '../utils/quickEventUtils';

export const useQuickEvent = () => {
  const context = useQuickEvents();
  
  const createEvent = (title, color, iconName) => {
    const newEvent = {
      id: quickEventUtils.generateEventId(),
      title: title.trim(),
      color,
      iconName,
      type: 'quick'
    };
    
    context.setEvents(prev => [...prev, newEvent]);
    context.updateOrder(prev => [...prev, newEvent.id]);
    return newEvent;
  };

  const deleteEvent = (eventId) => {
    const eventToDelete = context.events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    context.setEvents(prev => prev.filter(event => event.id !== eventId));
    context.updateOrder(prev => prev.filter(id => id !== eventId));
    return eventToDelete;
  };

  const updateEvent = (updatedEvent) => {
    context.updateEvent(updatedEvent);
  };

  return {
    ...context,
    createEvent,
    deleteEvent,
    updateEvent,
  };
}; 