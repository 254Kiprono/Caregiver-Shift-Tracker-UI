import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui-setupconfig/button';
import DurationDisplay from '../components/clockout/DurationDisplay';
import TasksSection from '../components/clockout/TasksSection';
import LocationDisplay from '../components/clockout/LocationDisplay';
import ServiceNotes from '../components/clockout/ServiceNotes';
import CompletionModal from '../components/clockout/CompletionModal';
import { Schedule, Task } from '../types/schedule';
import { scheduleService } from '../services/scheduleService';
import { useToast } from '../hooks/use-toast';
import { useGeolocation } from '../hooks/useGeolocation';

// Helper function to calculate duration
const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
};

const ClockOut: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCurrentLocation, latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!id) return;
      
      try {
        const scheduleData = await scheduleService.getScheduleById(id);
        if (scheduleData) {
          // Map API data to frontend interface
          const mappedSchedule = {
            ...scheduleData,
            caregiverName: scheduleData.client_name || 'Unknown Client',
            serviceName: `Service for ${scheduleData.client_name || 'Client'}`,
            duration: scheduleData.start_time && scheduleData.end_time 
              ? calculateDuration(scheduleData.start_time, scheduleData.end_time)
              : undefined
          };
          setSchedule(mappedSchedule);
          setTasks(scheduleData.tasks.map(task => ({ 
            ...task, 
            name: task.description,
            completed: task.status === 'completed'
          })));
        }
      } catch (error) {
        console.error('Failed to load schedule:', error);
        toast({
          title: "Error",
          description: "Failed to load schedule details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, [id, toast]);

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      )
    );
  };

  const handleTaskReason = (taskId: string, reason: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, reason } : task
      )
    );
  };

  const handleClockOut = async () => {
    if (!schedule || !id) return;

    setIsClockingOut(true);
    
    try {
      console.log('Starting clock-out process for schedule:', id);
      
      // Get current location first
      if (!latitude || !longitude) {
        await getCurrentLocation();
      }

      // Update task statuses first
      for (const task of tasks) {
        try {
          console.log('Updating task:', task.id, task.completed ? 'completed' : 'not_completed');
          await scheduleService.updateTaskStatus(task.id, {
            status: task.completed ? 'completed' : 'not_completed',
            reason: task.reason || undefined,
          });
        } catch (error) {
          console.error('Failed to update task:', task.id, error);
          // Continue with other tasks even if one fails
        }
      }

      // End the visit with location - only proceed if we have valid coordinates
      if (latitude && longitude && latitude !== 0 && longitude !== 0) {
        console.log('Ending visit with location:', { latitude, longitude });
        
        try {
          await scheduleService.endVisit(id, { latitude, longitude });
          console.log('Visit ended successfully');
        } catch (endVisitError) {
          console.error('EndVisit failed:', endVisitError);
          throw endVisitError; // Re-throw to handle properly
        }
      } else {
        console.warn('No valid location available for clock-out');
        toast({
          title: "Location Required",
          description: "Please enable location services to complete clock-out.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Schedule Completed",
        description: "You have successfully completed this schedule.",
      });
      
      // Show completion modal
      setShowCompletionModal(true);
    } catch (error) {
      console.error('Clock out failed:', error);
      toast({
        title: "Clock Out Failed",
        description: error instanceof Error ? error.message : "Failed to complete clock-out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClockingOut(false);
    }
  };

  const handleConfirmCompletion = () => {
    setShowCompletionModal(false);
    // Navigate back to dashboard which will refresh and show updated data
    navigate('/', { replace: true });
  };

  const handleCancelClockIn = () => {
    toast({
      title: "Clock-in Cancelled",
      description: "Your clock-in has been cancelled.",
    });
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-careviah-green"></div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Schedule Not Found</h1>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 p-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Clock-Out</span>
          </Button>
        </div>

        <DurationDisplay
          duration={schedule?.duration}
          serviceName={schedule?.serviceName}
          caregiverName={schedule?.caregiverName}
        />

        <TasksSection
          tasks={tasks}
          onTaskComplete={handleTaskComplete}
          onTaskReason={handleTaskReason}
        />

        <LocationDisplay />

        <ServiceNotes serviceNotes={schedule?.serviceNotes} />

        <div className="flex flex-col space-y-3 sm:space-y-4">
          <Button
            onClick={handleClockOut}
            disabled={isClockingOut || locationLoading}
            className="w-full bg-careviah-green hover:bg-careviah-green/90 text-white h-12 sm:h-14 text-base font-medium rounded-full"
          >
            {isClockingOut ? 'Clocking Out...' : 'Clock-Out'}
          </Button>
          <Button
            onClick={handleCancelClockIn}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 h-12 sm:h-14 text-base font-medium rounded-full"
          >
            Cancel Clock-In
          </Button>
        </div>
      </main>

      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onConfirm={handleConfirmCompletion}
      />
    </div>
  );
};

export default ClockOut;
