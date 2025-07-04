
import { apiRequest, API_ENDPOINTS } from './api';
import { Schedule } from '../types/schedule';

export interface ScheduleStatusUpdate {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
}

export const scheduleStatusService = {
  async updateScheduleStatus(scheduleId: string, status: ScheduleStatusUpdate['status']): Promise<{ message: string }> {
    try {
      console.log('Updating schedule status:', { scheduleId, status });
      const response = await apiRequest(`${API_ENDPOINTS.SCHEDULE_DETAILS}/${scheduleId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      console.log('Schedule status update response:', response);
      return response;
    } catch (error) {
      console.error('Error updating schedule status:', error);
      throw error;
    }
  },

  async forceCompleteSchedule(scheduleId: string, location: { latitude: number; longitude: number }): Promise<{ message: string }> {
    try {
      console.log('Force completing schedule:', scheduleId);
      
      // First try to end the visit normally
      try {
        const endVisitResponse = await apiRequest(`${API_ENDPOINTS.END_VISIT}/${scheduleId}/end`, {
          method: 'POST',
          body: JSON.stringify(location),
        });
        console.log('End visit successful:', endVisitResponse);
      } catch (endVisitError) {
        console.warn('End visit failed, continuing with status update:', endVisitError);
      }

      // Always update status to completed
      const statusResponse = await this.updateScheduleStatus(scheduleId, 'completed');
      console.log('Force complete successful:', statusResponse);
      return statusResponse;
    } catch (error) {
      console.error('Error force completing schedule:', error);
      throw error;
    }
  },

  async checkAndUpdateExpiredSchedules(): Promise<void> {
    try {
      console.log('Checking for expired schedules...');
      // This would be handled by the backend automatically
      // But we can trigger a refresh of data to get updated statuses
    } catch (error) {
      console.error('Error checking expired schedules:', error);
    }
  }
};
