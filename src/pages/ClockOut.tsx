import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import DurationDisplay from '../components/clockout/DurationDisplay';
import TasksSection from '../components/clockout/TasksSection';
import LocationDisplay from '../components/clockout/LocationDisplay';
import ServiceNotes from '../components/clockout/ServiceNotes';
import CompletionModal from '../components/clockout/CompletionModal';
import { Schedule, Task } from '../types/schedule';
import { getScheduleById, endVisit, updateTaskStatus } from '../services/mockData';
import { useToast } from '../hooks/use-toast';
import { useGeolocation } from '../hooks/useGeolocation';

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
        const scheduleData = await getScheduleById(id);
        if (scheduleData) {
          setSchedule(scheduleData);
          setTasks(scheduleData.tasks.map(task => ({ ...task })));
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
      
      // Update task statuses first
      const taskUpdatePromises = tasks.map(async (task) => {
        try {
          console.log('Updating task:', task.id, task.completed ? 'completed' : 'not_completed');
          await updateTaskStatus(task.id, {
            status: task.completed ? 'completed' : 'not_completed',
            reason: task.reason || undefined,
          });
          return { success: true, taskId: task.id };
        } catch (error) {
          console.error('Failed to update task:', task.id, error);
          return { success: false, taskId: task.id, error };
        }
      });

      const taskResults = await Promise.all(taskUpdatePromises);
      const failedTasks = taskResults.filter(result => !result.success);
      
      if (failedTasks.length > 0) {
        console.warn('Some tasks failed to update:', failedTasks);
        // Continue with clock-out even if some tasks failed
      }

      // End the visit with location if available, otherwise use default coordinates
      const clockOutLat = latitude || 0;
      const clockOutLng = longitude || 0;
      
      console.log('Ending visit with location:', { latitude: clockOutLat, longitude: clockOutLng });
      
      await endVisit(id, clockOutLat, clockOutLng);
      console.log('Visit ended successfully');
      
      // Show success message
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
