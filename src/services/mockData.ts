
import { Schedule, DashboardStats } from '../types/schedule';
import { scheduleService, TaskStatusUpdateRequest } from './scheduleService';

export const getSchedules = async (): Promise<Schedule[]> => {
  try {
    console.log('Fetching all schedules...');
    const schedules = await scheduleService.getAllSchedules();
    console.log('Raw schedules response:', schedules);
    
    // Handle case where schedules might be directly in the response or nested
    const schedulesArray = Array.isArray(schedules) ? schedules : [];
    
    // Transform backend data to frontend format
    return schedulesArray.map(schedule => ({
      ...schedule,
      caregiverName: schedule.client_name || 'Unknown Client',
      caregiverId: schedule.user_id?.toString() || '',
      serviceName: 'Caregiver Service',
      date: new Date(schedule.shift_time).toLocaleDateString(),
      time: new Date(schedule.shift_time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      clientContact: {
        email: 'client@example.com',
        phone: '+1234567890'
      },
      address: schedule.location || 'Address not available',
      serviceNotes: 'Standard caregiver service',
      tasks: schedule.tasks?.map(task => ({
        ...task,
        name: task.description || 'Task',
        completed: task.status === 'completed'
      })) || [],
      // Calculate duration for completed schedules
      duration: schedule.status === 'completed' && schedule.start_time && schedule.end_time ? 
        calculateDuration(schedule.start_time, schedule.end_time) : undefined
    }));
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const getScheduleById = async (id: string): Promise<Schedule | undefined> => {
  try {
    const schedule = await scheduleService.getScheduleById(id);
    if (!schedule) return undefined;
    
    // Transform backend data to frontend format
    return {
      ...schedule,
      caregiverName: schedule.client_name || 'Unknown Client',
      caregiverId: schedule.user_id?.toString() || '',
      serviceName: 'Caregiver Service',
      date: new Date(schedule.shift_time).toLocaleDateString(),
      time: new Date(schedule.shift_time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      clientContact: {
        email: 'client@example.com',  
        phone: '+1234567890'
      },
      address: schedule.location || 'Address not available',
      serviceNotes: 'Standard caregiver service',
      tasks: schedule.tasks?.map(task => ({
        ...task,
        name: task.description || 'Task',
        completed: task.status === 'completed'
      })) || [],
      duration: schedule.status === 'completed' && schedule.start_time && schedule.end_time ? 
        calculateDuration(schedule.start_time, schedule.end_time) : undefined
    };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return undefined;
  }
};

export const getStats = async (): Promise<DashboardStats> => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Fetch data from the dedicated endpoints with individual error handling
    const [missedSchedules, upcomingSchedules, completedSchedules] = await Promise.allSettled([
      scheduleService.getMissedSchedules(),
      scheduleService.getUpcomingSchedules(), 
      scheduleService.getTodayCompletedSchedules()
    ]);
    
    // Extract successful results or use empty arrays for failed requests
    const missedData = missedSchedules.status === 'fulfilled' ? 
      (Array.isArray(missedSchedules.value) ? missedSchedules.value : []) : [];
    const upcomingData = upcomingSchedules.status === 'fulfilled' ? 
      (Array.isArray(upcomingSchedules.value) ? upcomingSchedules.value : []) : [];
    const completedData = completedSchedules.status === 'fulfilled' ? 
      (Array.isArray(completedSchedules.value) ? completedSchedules.value : []) : [];
    
    // Log any failures for debugging
    if (missedSchedules.status === 'rejected') {
      console.error('Failed to fetch missed schedules:', missedSchedules.reason);
    }
    if (upcomingSchedules.status === 'rejected') {
      console.error('Failed to fetch upcoming schedules:', upcomingSchedules.reason);
    }
    if (completedSchedules.status === 'rejected') {
      console.error('Failed to fetch completed schedules:', completedSchedules.reason);
    }
    
    // Filter upcoming schedules for today only, excluding in_progress and completed statuses
    const today = new Date().toDateString();
    const upcomingToday = upcomingData.filter(schedule => {
      try {
        const scheduleDate = new Date(schedule.shift_time).toDateString();
        return scheduleDate === today && schedule.status === 'scheduled';
      } catch (error) {
        console.error('Error parsing schedule date:', error);
        return false;
      }
    });
    
    const stats: DashboardStats = {
      missedScheduled: missedData.length,
      upcomingToday: upcomingToday.length,
      completedToday: completedData.length,
    };
    
    console.log('Stats calculated:', stats);
    console.log('Missed data count:', missedData.length);
    console.log('Upcoming today count:', upcomingToday.length);
    console.log('Completed today count:', completedData.length);
    
    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error);
    // Return default stats if anything goes wrong
    return {
      missedScheduled: 0,
      upcomingToday: 0,
      completedToday: 0,
    };
  }
};

// Location utility functions for clock-in/out
export const startVisit = async (scheduleId: string, latitude: number, longitude: number) => {
  try {
    return await scheduleService.startVisit(scheduleId, { latitude, longitude });
  } catch (error) {
    console.error('Error starting visit:', error);
    throw error;
  }
};

export const endVisit = async (scheduleId: string, latitude: number, longitude: number) => {
  try {
    return await scheduleService.endVisit(scheduleId, { latitude, longitude });
  } catch (error) {
    console.error('Error ending visit:', error);
    throw error;
  }
};

// Task update function
export const updateTaskStatus = async (taskId: string, statusUpdate: TaskStatusUpdateRequest) => {
  try {
    return await scheduleService.updateTaskStatus(taskId, statusUpdate);
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};
