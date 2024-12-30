import { QUICK_EVENT_CONSTANTS } from '../constants/quickEvent';

export const QuickEventStorage = {
  getCustomEvents() {
    const saved = localStorage.getItem(QUICK_EVENT_CONSTANTS.STORAGE_KEYS.CUSTOM_EVENTS);
    return saved ? JSON.parse(saved) : null;
  },

  saveCustomEvents(events) {
    localStorage.setItem(
      QUICK_EVENT_CONSTANTS.STORAGE_KEYS.CUSTOM_EVENTS, 
      JSON.stringify(events)
    );
  },

  getEventsOrder() {
    const saved = localStorage.getItem(QUICK_EVENT_CONSTANTS.STORAGE_KEYS.EVENTS_ORDER);
    return saved ? JSON.parse(saved) : null;
  },

  saveEventsOrder(order) {
    localStorage.setItem(
      QUICK_EVENT_CONSTANTS.STORAGE_KEYS.EVENTS_ORDER, 
      JSON.stringify(order)
    );
  },

  // ... similar methods for deleted events and pending events
}; 