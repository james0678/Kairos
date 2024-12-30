import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const QuickEventApi = {
  async getEvents() {
    const response = await axios.get(`${API_BASE_URL}/quick-events`);
    return response.data;
  },

  async createEvent(eventData) {
    const response = await axios.post(`${API_BASE_URL}/quick-events`, eventData);
    return response.data;
  },

  async updateEvent(eventId, eventData) {
    const response = await axios.put(`${API_BASE_URL}/quick-events/${eventId}`, eventData);
    return response.data;
  },

  async deleteEvent(eventId) {
    const response = await axios.delete(`${API_BASE_URL}/quick-events/${eventId}`);
    return response.data;
  },

  async updateOrder(order) {
    const response = await axios.put(`${API_BASE_URL}/quick-events/order`, { order });
    return response.data;
  },
}; 