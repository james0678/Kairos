export const quickEventUtils = {
  generateEventId: (prefix = 'custom') => `${prefix}-${Date.now()}`,

  isDefaultEvent: (event, defaultEvents) => 
    defaultEvents.some(d => d.id === event.id),

  getModifiedDefaultEvents: (events, defaultEvents) => 
    events.filter(event => {
      const defaultEvent = defaultEvents.find(d => d.id === event.id);
      if (!defaultEvent) return false;
      
      return (
        event.title !== defaultEvent.title ||
        event.color !== defaultEvent.color ||
        event.iconName !== defaultEvent.iconName
      );
    }),

  combineEvents: (customEvents, defaultEvents) => {
    const allEventsMap = new Map([
      ...defaultEvents.map(e => [e.id, e]),
      ...customEvents.map(e => [e.id, e])
    ]);
    return Array.from(allEventsMap.values());
  },
}; 