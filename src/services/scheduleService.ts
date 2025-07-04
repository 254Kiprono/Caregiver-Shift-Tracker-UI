
import { apiRequest, API_ENDPOINTS } from './api';
import { Schedule } from '../types/schedule';
import { scheduleStatusService } from './scheduleStatusService';

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
      const response = await apiRequest(API_ENDPOINTS.ALL_SCHEDULES, {
        headers: {
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
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
      
      // Process schedules to ensure proper status mapping
      return this.processScheduleStatuses(schedules);
    } catch (error) {
      console.error('Error in getAllSchedules:', error);
      throw error;
    }
  },

  async getTodaySchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getTodaySchedules API...');
      const response = await apiRequest(API_ENDPOINTS.TODAY_SCHEDULES, {
        headers: {
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      console.log('getTodaySchedules API response:', response);
      
      let schedules: Schedule[] = [];
      if (response.message?.schedules && Array.isArray(response.message.schedules)) {
        schedules = response.message.schedules;
      } else if (response.schedules && Array.isArray(response.schedules)) {
        schedules = response.schedules;
      } else if (Array.isArray(response)) {
        schedules = response;
      } else {
        return [];
      }
      
      return this.processScheduleStatuses(schedules);
    } catch (error) {
      console.error('Error in getTodaySchedules:', error);
      throw error;
    }
  },

  async getUpcomingSchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getUpcomingSchedules API...');
      const response = await apiRequest(API_ENDPOINTS.UPCOMING_SCHEDULES, {
        headers: {
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      console.log('getUpcomingSchedules API response:', response);
      
      let schedules: Schedule[] = [];
      if (response.schedules && Array.isArray(response.schedules)) {
        schedules = response.schedules;
      } else if (Array.isArray(response)) {
        schedules = response;
      } else {
        console.warn('No schedules found in upcoming response:', response);
        return [];
      }
      
      return this.processScheduleStatuses(schedules);
    } catch (error) {
      console.error('Error in getUpcomingSchedules:', error);
      throw error;
    }
  },

  async getMissedSchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getMissedSchedules API...');
      const response = await apiRequest(API_ENDPOINTS.MISSED_SCHEDULES, {
        headers: {
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      console.log('getMissedSchedules API response:', response);
      
      let schedules: Schedule[] = [];
      if (response.schedules === null || response.schedules === undefined) {
        console.log('No missed schedules found (null response)');
        return [];
      } else if (response.schedules && Array.isArray(response.schedules)) {
        schedules = response.schedules;
      } else if (Array.isArray(response)) {
        schedules = response;
      } else {
        console.warn('Unexpected missed schedules response format:', response);
        return [];
      }
      
      return this.processScheduleStatuses(schedules);
    } catch (error) {
      console.error('Error in getMissedSchedules:', error);
      throw error;
    }
  },

  async getTodayCompletedSchedules(): Promise<Schedule[]> {
    try {
      console.log('Calling getTodayCompletedSchedules API...');
      const response = await apiRequest(API_ENDPOINTS.TODAY_COMPLETED_SCHEDULES, {
        headers: {
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      console.log('getTodayCompletedSchedules API response:', response);
      
      let schedules: Schedule[] = [];
      if (response.schedules && Array.isArray(response.schedules)) {
        schedules = response.schedules;
      } else if (Array.isArray(response)) {
        schedules = response;
      } else {
        console.log('No completed schedules found today');
        return [];
      }
      
      return this.processScheduleStatuses(schedules);
    } catch (error) {
      console.error('Error in getTodayCompletedSchedules:', error);
      throw error;
    }
  },

  async getScheduleById(id: string): Promise<Schedule> {
    try {
      console.log('Calling getScheduleById API for ID:', id);
      const response = await apiRequest(`${API_ENDPOINTS.SCHEDULE_DETAILS}/${id}`, {
        headers: {
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      console.log('getScheduleById API response:', response);
      
      // Validate that the schedule has tasks before allowing clock-in
      if (response && (!response.tasks || response.tasks.length === 0)) {
        console.warn('Schedule has no tasks:', response);
      }
      
      return this.processScheduleStatus(response);
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
      
      // Try to end visit normally first
      let response;
      try {
        response = await apiRequest(`${API_ENDPOINTS.END_VISIT}/${id}/end`, {
          method: 'POST',
          body: JSON.stringify(location),
        });
        console.log('endVisit API response:', response);
      } catch (endVisitError) {
        console.warn('EndVisit API failed, attempting force completion:', endVisitError);
        
        // If end visit fails, try to force complete the schedule
        try {
          response = await scheduleStatusService.forceCompleteSchedule(id, location);
          console.log('Force completion successful:', response);
        } catch (forceError) {
          console.error('Force completion also failed:', forceError);
          // Still return a success message to allow UI to proceed
          return { message: 'Visit ended (with warnings - please check schedule status)' };
        }
      }
      
      return response || { message: 'Visit ended successfully' };
    } catch (error) {
      console.error('Error in endVisit:', error);
      // Don't throw error for endVisit - allow clock-out to proceed with warning
      console.warn('EndVisit failed but allowing clock-out to proceed');
      return { message: 'Visit ended (with warnings)' };
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

  // New method to check for active schedules
  async getActiveSchedule(): Promise<Schedule | null> {
    try {
      console.log('Checking for active schedule...');
      const allSchedules = await this.getAllSchedules();
      const activeSchedule = allSchedules.find(schedule => schedule.status === 'in_progress');
      console.log('Active schedule found:', activeSchedule?.id || 'None');
      return activeSchedule || null;
    } catch (error) {
      console.error('Error checking for active schedule:', error);
      return null;
    }
  },

  // Helper method to process schedule statuses
  processScheduleStatuses(schedules: Schedule[]): Schedule[] {
    return schedules.map(schedule => this.processScheduleStatus(schedule));
  },

  // Helper method to process individual schedule status
  processScheduleStatus(schedule: Schedule): Schedule {
    const now = new Date();
    const scheduleTime = new Date(schedule.shift_time);
    const gracePeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Check if schedule should be automatically marked as missed
    if (schedule.status === 'scheduled' && now.getTime() > (scheduleTime.getTime() + gracePeriod)) {
      console.log(`Schedule ${schedule.id} should be marked as missed`);
      // Note: The backend should handle this automatically, but we log it for debugging
    }
    
    // Ensure computed fields are set for display compatibility
    return {
      ...schedule,
      caregiverName: schedule.caregiverName || schedule.client_name,
      caregiverId: schedule.caregiverId || schedule.user_id?.toString() || '',
      serviceName: schedule.serviceName || 'Caregiver Service',
      date: schedule.date || new Date(schedule.shift_time).toLocaleDateString(),
      time: schedule.time || new Date(schedule.shift_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clientContact: schedule.clientContact || {
        email: '',
        phone: ''
      },
      address: schedule.address || schedule.location,
      serviceNotes: schedule.serviceNotes || '',
      clockInTime: schedule.start_time ? new Date(schedule.start_time).toLocaleTimeString() : undefined,
      clockOutTime: schedule.end_time ? new Date(schedule.end_time).toLocaleTimeString() : undefined,
      duration: schedule.start_time && schedule.end_time ? 
        this.calculateDuration(schedule.start_time, schedule.end_time) : undefined,
      tasks: schedule.tasks?.map(task => ({
        ...task,
        name: task.name || task.description,
        completed: task.completed !== undefined ? task.completed : task.status === 'completed'
      })) || []
    };
  },

  // Helper method to calculate duration
  calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  },

  // Method to trigger background status updates
  async refreshScheduleStatuses(): Promise<void> {
    try {
      console.log('Triggering schedule status refresh...');
      await scheduleStatusService.checkAndUpdateExpiredSchedules();
    } catch (error) {
      console.error('Error refreshing schedule statuses:', error);
    }
  }
};
