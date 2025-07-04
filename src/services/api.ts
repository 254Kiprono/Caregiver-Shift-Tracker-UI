
import axios from 'axios';

const API_BASE_URL = 'https://care-giver.devsinkenya.com/api';

export const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/user/register',
  ALL_SCHEDULES: '/user/schedules',
  TODAY_SCHEDULES: '/user/schedules/today',
  UPCOMING_SCHEDULES: '/user/schedules/upcoming',
  MISSED_SCHEDULES: '/user/schedules/missed',
  TODAY_COMPLETED_SCHEDULES: '/user/schedules/completed/today',
  SCHEDULE_DETAILS: '/user/schedules',
  START_VISIT: '/user/schedules',
  END_VISIT: '/user/schedules',
  UPDATE_TASK_STATUS: '/tasks',
  SCHEDULE_STATUS: '/api/user/schedules', // Base endpoint for status updates
} as const;

export const apiRequest = async (url: string, options: any = {}) => {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    const response = await axios({
      method: options.method || 'GET',
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      data: options.body ? options.body : null,
    });

    return response.data;
  } catch (error: any) {
    console.error('API request failed:', error);
    
    // If unauthorized and we have a token, it might be expired
    if (error.response?.status === 401) {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        console.warn('Token might be expired, clearing auth data');
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
};
