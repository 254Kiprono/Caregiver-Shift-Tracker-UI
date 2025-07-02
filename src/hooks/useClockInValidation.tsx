
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
    return now > missedThreshold;
  };

  const validateClockIn = (schedule: Schedule): boolean => {
    setIsValidating(true);
    
    try {
      // Check if schedule is missed first
      if (isScheduleMissed(schedule)) {
        toast({
          title: "Clock-In Not Allowed",
          description: "This schedule time has passed the grace period and is now marked as missed.",
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
        toast({
          title: "Clock-In Not Allowed", 
          description: "This schedule is not available for clock-in.",
          variant: "destructive",
        });
        return false;
      }

      // Remove location validation - just allow clock-in
      return true;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateClockIn, isValidating };
};
