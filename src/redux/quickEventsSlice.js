import { createSlice } from '@reduxjs/toolkit';
import { defaultQuickEvents } from '../utils/iconMapping';

const quickEventsSlice = createSlice({
  name: 'quickEvents',
  initialState: {
    events: defaultQuickEvents,
    customOrder: []
  },
  reducers: {
    updateEventOrder: (state, action) => {
      state.customOrder = action.payload;
    },
    addCustomEvent: (state, action) => {
      state.events.push(action.payload);
    },
    removeEvent: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload);
      state.customOrder = state.customOrder.filter(id => id !== action.payload);
    }
  }
});

export const { updateEventOrder, addCustomEvent, removeEvent } = quickEventsSlice.actions;
export default quickEventsSlice.reducer; 