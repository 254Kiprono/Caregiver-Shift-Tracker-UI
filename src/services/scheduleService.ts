
import { apiRequest, API_ENDPOINTS } from './api';
import { Schedule } from '../types/schedule';

export interface VisitLocationRequest {
  latitude: number;
  longitude: number;
}

export interface TaskStatusUpdateRequest {
  status: 'completed' | 'not_completed';
  reason?: string;
}

export const scheduleService = {
  async getAllSchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getAllSchedules API...');
      const response = await apiRequest(API_ENDPOINTS.ALL_SCHEDULES);
      console.log('getAllSchedules API response:', response);
      
      // Handle different response formats and include cancelled schedules
      let schedules: Schedule[] = [];
      if (response.message?.schedules && Array.isArray(response.message.schedules)) {
        schedules = response.message.schedules;
      } else if (response.schedules && Array.isArray(response.schedules)) {
        schedules = response.schedules;
      } else if (Array.isArray(response)) {
        schedules = response;
      } else {
        console.warn('Unexpected response format for getAllSchedules:', response);
        return [];
      }
      
      // Include all schedule statuses including cancelled
      return schedules;
    } catch (error) {
      console.error('Error in getAllSchedules:', error);
      throw error;
    }
  },

  async getTodaySchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getTodaySchedules API...');
      const response = await apiRequest(API_ENDPOINTS.TODAY_SCHEDULES);
      console.log('getTodaySchedules API response:', response);
      
      if (response.message?.schedules && Array.isArray(response.message.schedules)) {
        return response.message.schedules;
      } else if (response.schedules && Array.isArray(response.schedules)) {
        return response.schedules;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error in getTodaySchedules:', error);
      throw error;
    }
  },

  async getUpcomingSchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getUpcomingSchedules API...');
      const response = await apiRequest(API_ENDPOINTS.UPCOMING_SCHEDULES);
      console.log('getUpcomingSchedules API response:', response);
      
      if (response.schedules && Array.isArray(response.schedules)) {
        return response.schedules;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('No schedules found in upcoming response:', response);
        return [];
      }
    } catch (error) {
      console.error('Error in getUpcomingSchedules:', error);
      throw error;
    }
  },

  async getMissedSchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getMissedSchedules API...');
      const response = await apiRequest(API_ENDPOINTS.MISSED_SCHEDULES);
      console.log('getMissedSchedules API response:', response);
      
      // Handle null/empty responses specifically for missed schedules
      if (response.schedules === null || response.schedules === undefined) {
        console.log('No missed schedules found (null response)');
        return [];
      } else if (response.schedules && Array.isArray(response.schedules)) {
        return response.schedules;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('Unexpected missed schedules response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error in getMissedSchedules:', error);
      throw error;
    }
  },

  async getTodayCompletedSchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getTodayCompletedSchedules API...');
      const response = await apiRequest(API_ENDPOINTS.TODAY_COMPLETED_SCHEDULES);
      console.log('getTodayCompletedSchedules API response:', response);
      
      if (response.schedules && Array.isArray(response.schedules)) {
        return response.schedules;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.log('No completed schedules found today');
        return [];
      }
    } catch (error) {
      console.error('Error in getTodayCompletedSchedules:', error);
      throw error;
    }
  },

  async getScheduleById(id: string): Promise<Schedule> {
    try {
      console.log('Calling getScheduleById API for ID:', id);
      const response = await apiRequest(`${API_ENDPOINTS.SCHEDULE_DETAILS}/${id}`);
      console.log('getScheduleById API response:', response);
      
      // Validate that the schedule has tasks before allowing clock-in
      if (response && (!response.tasks || response.tasks.length === 0)) {
        console.warn('Schedule has no tasks:', response);
      }
      
      return response;
    } catch (error) {
      console.error('Error in getScheduleById:', error);
      throw error;
    }
  },

  async startVisit(id: string, location: VisitLocationRequest): Promise<{ message: string }> {
    try {
      console.log('Calling startVisit API for ID:', id, 'with location:', location);
      const response = await apiRequest(`${API_ENDPOINTS.START_VISIT}/${id}/start`, {
        method: 'POST',
        body: JSON.stringify(location),
      });
      console.log('startVisit API response:', response);
      return response;
    } catch (error) {
      console.error('Error in startVisit:', error);
      throw error;
    }
  },

  async endVisit(id: string, location: VisitLocationRequest): Promise<{ message: string }> {
    try {
      console.log('Calling endVisit API for ID:', id, 'with location:', location);
      const response = await apiRequest(`${API_ENDPOINTS.END_VISIT}/${id}/end`, {
        method: 'POST',
        body: JSON.stringify(location),
      });
      console.log('endVisit API response:', response);
      return response;
    } catch (error) {
      console.error('Error in endVisit:', error);
      throw error;
    }
  },

  async updateTaskStatus(taskId: string, statusUpdate: TaskStatusUpdateRequest): Promise<{ message: string }> {
    try {
      console.log('Calling updateTaskStatus API for task ID:', taskId, 'with update:', statusUpdate);
      const response = await apiRequest(`${API_ENDPOINTS.UPDATE_TASK_STATUS}/${taskId}/update`, {
        method: 'POST',
        body: JSON.stringify(statusUpdate),
      });
      console.log('updateTaskStatus API response:', response);
      return response;
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      throw error;
    }
  },
};
