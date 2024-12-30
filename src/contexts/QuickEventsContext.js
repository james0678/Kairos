import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultQuickEvents } from '../utils/iconMapping';

const QuickEventsContext = createContext();

export const QuickEventsProvider = ({ children }) => {
  const [events, setEvents] = useState(() => {
    // Try to load saved events first
    const savedEvents = localStorage.getItem('customQuickEvents');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      // Start with default events
      const combinedEvents = [...defaultQuickEvents];
      
      parsedEvents.forEach(savedEvent => {
        const index = combinedEvents.findIndex(e => e.id === savedEvent.id);
        if (index !== -1) {
          // Update existing default event
          combinedEvents[index] = savedEvent;
        } else {
          // Add new custom event
          combinedEvents.push(savedEvent);
        }
      });
      return combinedEvents;
    }
    return defaultQuickEvents;
  });

  const [customOrder, setCustomOrder] = useState(() => {
    // Try to load saved order first
    const savedOrder = localStorage.getItem('quickEventsOrder');
    if (savedOrder) {
      return JSON.parse(savedOrder);
    }
    // Initialize with default event IDs except Quick 활동 시작하기
    return defaultQuickEvents
      .filter(event => event.title !== "Quick 활동 시작하기")
      .map(event => event.id);
  });

  // Save events whenever they change
  useEffect(() => {
    const customEvents = events.filter(
      event => !defaultQuickEvents.find(d => d.id === event.id)
    );
    localStorage.setItem('customQuickEvents', JSON.stringify(customEvents));
  }, [events]);

  // Save order whenever it changes
  useEffect(() => {
    localStorage.setItem('quickEventsOrder', JSON.stringify(customOrder));
  }, [customOrder]);

  const updateOrder = (newOrder) => {
    console.log('Updating order:', newOrder);
    setCustomOrder(newOrder);
    localStorage.setItem('quickEventsOrder', JSON.stringify(newOrder));
  };

  const getOrderedEvents = () => {
    // Always keep Quick 활동 시작하기 at the top
    const quickStart = events.find(e => e.title === "Quick 활동 시작하기");
    const otherEvents = events.filter(e => e.title !== "Quick 활동 시작하기");
    
    // Sort other events according to custom order
    const sortedOtherEvents = [...otherEvents].sort((a, b) => {
      const indexA = customOrder.indexOf(a.id);
      const indexB = customOrder.indexOf(b.id);
      
      // If neither is in the order, maintain their original position
      if (indexA === -1 && indexB === -1) {
        return otherEvents.indexOf(a) - otherEvents.indexOf(b);
      }
      
      // Put items not in the order at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });

    return [quickStart, ...sortedOtherEvents].filter(Boolean);
  };

  const updateEvent = (updatedEvent) => {
    setEvents(prev => {
      const newEvents = prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
      
      // Save all modified events to localStorage
      const customEvents = newEvents.map(event => {
        // If it's a default event that has been modified
        const defaultEvent = defaultQuickEvents.find(d => d.id === event.id);
        if (defaultEvent) {
          // Only save if it's different from the default
          if (
            event.title !== defaultEvent.title ||
            event.color !== defaultEvent.color ||
            event.iconName !== defaultEvent.iconName
          ) {
            return event;
          }
          return null;
        }
        // If it's a custom event, save it
        return event;
      }).filter(Boolean); // Remove null values

      localStorage.setItem('customQuickEvents', JSON.stringify(customEvents));
      
      return newEvents;
    });
  };

  return (
    <QuickEventsContext.Provider value={{
      events,
      setEvents,
      customOrder,
      updateOrder,
      getOrderedEvents,
      updateEvent
    }}>
      {children}
    </QuickEventsContext.Provider>
  );
};

export const useQuickEvents = () => useContext(QuickEventsContext); 