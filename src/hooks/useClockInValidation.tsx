
import { useState } from 'react';
import { Schedule } from '../types/schedule';
import { toast } from '../components/ui-setupconfig/use-toast';

export const useClockInValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const isScheduleMissed = (schedule: Schedule): boolean => {
    if (schedule.status !== 'scheduled') return false;
    
    const scheduleTime = new Date(schedule.shift_time);
    const now = new Date();
    
    // Consider schedule missed if current time is past schedule time + 5 minutes grace period
    const missedThreshold = new Date(scheduleTime.getTime() + 5 * 60 * 1000);
    const isMissed = now > missedThreshold;
    
    console.log('Schedule missed check:', {
      scheduleId: schedule.id,
      scheduleTime: scheduleTime.toISOString(),
      now: now.toISOString(),
      missedThreshold: missedThreshold.toISOString(),
      isMissed
    });
    
    return isMissed;
  };

  const validateClockIn = (schedule: Schedule): boolean => {
    setIsValidating(true);
    
    try {
      // Check if schedule status indicates it's already missed
      if (schedule.status === 'missed') {
        toast({
          title: "Clock-In Not Allowed",
          description: "This schedule has been marked as missed and cannot be started.",
          variant: "destructive",
        });
        return false;
      }

      // Check if schedule is missed based on time
      if (isScheduleMissed(schedule)) {
        toast({
          title: "Clock-In Not Allowed",
          description: "This schedule time has passed the grace period. It should be automatically marked as missed.",
          variant: "destructive",
        });
        return false;
      }

      // Check if schedule has tasks
      if (!schedule.tasks || schedule.tasks.length === 0) {
        toast({
          title: "Clock-In Not Allowed",
          description: "No tasks available for this schedule. Cannot clock in.",
          variant: "destructive",
        });
        return false;
      }

      // Check if schedule is in correct status for clock-in
      if (schedule.status !== 'scheduled') {
        let message = "This schedule is not available for clock-in.";
        if (schedule.status === 'completed') {
          message = "This schedule has already been completed.";
        } else if (schedule.status === 'in_progress') {
          message = "This schedule is already in progress.";
        } else if (schedule.status === 'cancelled') {
          message = "This schedule has been cancelled.";
        }
        
        toast({
          title: "Clock-In Not Allowed", 
          description: message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateClockIn, isValidating };
};
