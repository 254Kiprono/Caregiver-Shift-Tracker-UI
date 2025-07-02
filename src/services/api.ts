
const API_BASE_URL = 'https://care-giver.devsinkenya.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/api/user/register',
  LOGIN: '/api/login',
  REFRESH: '/api/refresh',
  
  // Schedule endpoints
  ALL_SCHEDULES: '/api/user/schedules',
  TODAY_SCHEDULES: '/api/user/schedules/today',
  UPCOMING_SCHEDULES: '/api/user/schedules/upcoming',
  MISSED_SCHEDULES: '/api/user/schedules/missed',
  TODAY_COMPLETED_SCHEDULES: '/api/user/schedules/completed/today',
  SCHEDULE_DETAILS: '/api/user/schedules',
  START_VISIT: '/api/user/schedules',
  END_VISIT: '/api/user/schedules',
  
  // Task endpoints
  UPDATE_TASK_STATUS: '/tasks',
  
  // Health check
  STATUS: '/status'
};

// Token refresh function
const refreshToken = async (): Promise<string> => {
  const refresh_token = localStorage.getItem('refresh_token');
  if (!refresh_token) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REFRESH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token }),
  });

  if (!response.ok) {
    // If refresh fails, clear all tokens and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token);
  }
  
  return data.access_token;
};

// API utility functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if token exists
  let token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  let response = await fetch(url, config);
  
  // If we get a 401 and we have a refresh token, try to refresh
  if (response.status === 401 && localStorage.getItem('refresh_token')) {
    console.log('Token expired, attempting refresh...');
    try {
      token = await refreshToken();
      
      // Retry the original request with new token
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
      
      response = await fetch(url, config);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      throw new Error('Authentication failed. Please log in again.');
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
