import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui-setupconfig/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui-setupconfig/card';
import ScheduleCard from '../components/ScheduleCard';
import MobileBottomNav from '../components/MobileBottomNav';
import { Schedule, DashboardStats } from '../types/schedule';
import { scheduleService } from '../services/scheduleService';
import { useIsMobile } from '../hooks/use-mobile';
import { toast } from '../components/ui-setupconfig/use-toast';
import ActiveSessionCard from '../components/ActiveSessionCard';

const Dashboard: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    missedScheduled: 0,
    upcomingToday: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading dashboard data...');
      
      // Load all schedules for today (00:00 to 23:59)
      const allSchedules = await scheduleService.getAllSchedules();
      
      console.log('All schedules for today:', allSchedules);
      
      console.log('Combined schedules:', allSchedules);
      
      // Calculate stats with corrected logic
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      const now = new Date();
      
      console.log('Time boundaries:', { startOfToday, endOfToday, now });
      
      // Calculate missed schedules from last 24 hours (00:00 to 23:59)
      const missedCount = allSchedules.filter(schedule => {
        const scheduleTime = new Date(schedule.shift_time);
        const isWithinLast24Hours = scheduleTime >= startOfToday && scheduleTime <= endOfToday;
        const isMissed = isScheduleMissed(schedule);
        const isCancelled = schedule.status === 'cancelled';
        
        console.log(`Schedule ${schedule.id}:`, {
          scheduleTime,
          isWithinLast24Hours,
          isMissed,
          isCancelled,
          status: schedule.status
        });
        
        return isWithinLast24Hours && (isMissed || isCancelled);
      }).length;
      
      // Calculate upcoming today schedules (future schedules for today only)
      const upcomingTodayCount = allSchedules.filter(schedule => {
        const scheduleTime = new Date(schedule.shift_time);
        const scheduleDate = scheduleTime.toDateString();
        const todayDate = today.toDateString();
        const isFutureTime = scheduleTime > now;
        const isScheduledOrInProgress = schedule.status === 'scheduled' || schedule.status === 'in_progress';
        const isNotMissed = !isScheduleMissed(schedule);
        
        console.log(`Upcoming check for schedule ${schedule.id}:`, {
          scheduleTime,
          scheduleDate,
          todayDate,
          isFutureTime,
          isScheduledOrInProgress,
          isNotMissed,
          status: schedule.status
        });
        
        return scheduleDate === todayDate && 
               isFutureTime && 
               isScheduledOrInProgress && 
               isNotMissed;
      }).length;
      
      const todayCompletedCount = allSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.shift_time).toDateString();
        const todayDate = today.toDateString();
        return scheduleDate === todayDate && schedule.status === 'completed';
      }).length;
      
      const calculatedStats = {
        missedScheduled: missedCount,
        upcomingToday: upcomingTodayCount,
        completedToday: todayCompletedCount,
      };
      
      console.log('Calculated stats:', calculatedStats);
      
      setSchedules(allSchedules);
      setStats(calculatedStats);
      
      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isScheduleMissed = (schedule: Schedule): boolean => {
    if (schedule.status !== 'scheduled') return false;
    
    const scheduleTime = new Date(schedule.shift_time);
    const now = new Date();
    
    // Consider schedule missed if current time is past schedule time + 5 minutes grace period
    const missedThreshold = new Date(scheduleTime.getTime() + 5 * 60 * 1000);
    const isMissed = now > missedThreshold;
    
    console.log(`Miss check for schedule ${schedule.id}:`, {
      scheduleTime,
      now,
      missedThreshold,
      isMissed
    });
    
    return isMissed;
  };

  const getSchedulesByCategory = () => {
    const today = new Date();
    const todayDateString = today.toDateString();
    const now = new Date();
    
    // Get active/in-progress schedule
    const activeSchedule = schedules.find(schedule => 
      schedule.status === 'in_progress'
    );
    
    // Get missed schedules from today (00:00 to 23:59) that are cancelled or missed
    const missedSchedules = schedules.filter(schedule => {
      const scheduleTime = new Date(schedule.shift_time);
      const scheduleDate = scheduleTime.toDateString();
      const isToday = scheduleDate === todayDateString;
      const isMissed = isScheduleMissed(schedule);
      const isCancelled = schedule.status === 'cancelled';
      
      return isToday && (isMissed || isCancelled);
    });
    
    // Upcoming today: future schedules for today that are scheduled and not missed
    const upcomingToday = schedules.filter(schedule => {
      const scheduleTime = new Date(schedule.shift_time);
      const scheduleDate = scheduleTime.toDateString();
      const isFutureTime = scheduleTime > now;
      const isToday = scheduleDate === todayDateString;
      const isScheduled = schedule.status === 'scheduled';
      const isNotMissed = !isScheduleMissed(schedule);
      
      return isToday && 
             isFutureTime && 
             isScheduled && 
             isNotMissed;
    });
    
    const completedToday = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.shift_time).toDateString();
      return scheduleDate === todayDateString && schedule.status === 'completed';
    });

    console.log('Categories:', {
      activeSchedule: activeSchedule?.id,
      missedSchedules: missedSchedules.length,
      upcomingToday: upcomingToday.length,
      completedToday: completedToday.length
    });

    return {
      activeSchedule,
      missedSchedules,
      upcomingToday,
      completedToday
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-careviah-green"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const { activeSchedule, missedSchedules, upcomingToday, completedToday } = getSchedulesByCategory();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        {/* Active Session Card */}
        {activeSchedule && (
          <ActiveSessionCard schedule={activeSchedule} />
        )}

        {/* Stats Cards Section */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile Layout */}
          {isMobile ? (
            <div className="space-y-4">
              {/* Missed Schedules - Full Width */}
              <Card className="bg-white border-0 shadow-sm rounded-xl">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 text-sm font-medium mb-1">Missed Scheduled</p>
                  <p className="text-red-600 text-3xl font-bold">{stats.missedScheduled}</p>
                </CardContent>
              </Card>
              
              {/* Upcoming and Completed - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white border-0 shadow-sm rounded-xl">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600 text-xs font-medium mb-1">Upcoming Today's</p>
                    <p className="text-gray-600 text-xs font-medium mb-2">Schedule</p>
                    <p className="text-orange-600 text-2xl font-bold">{stats.upcomingToday}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-0 shadow-sm rounded-xl">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600 text-xs font-medium mb-1">Today's Completed</p>
                    <p className="text-gray-600 text-xs font-medium mb-2">Schedule</p>
                    <p className="text-green-600 text-2xl font-bold">{stats.completedToday}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Desktop/Tablet Layout */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-3">Missed Scheduled</p>
                      <p className="text-red-600 text-4xl lg:text-5xl font-bold">{stats.missedScheduled}</p>
                    </div>
                    <div className="text-red-400">
                      <Clock className="w-10 h-10 lg:w-12 lg:h-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-3">Upcoming Today's Schedule</p>
                      <p className="text-orange-600 text-4xl lg:text-5xl font-bold">{stats.upcomingToday}</p>
                    </div>
                    <div className="text-orange-400">
                      <Calendar className="w-10 h-10 lg:w-12 lg:h-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-3">Today's Completed Schedule</p>
                      <p className="text-green-600 text-4xl lg:text-5xl font-bold">{stats.completedToday}</p>
                    </div>
                    <div className="text-green-400">
                      <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Main Schedule Sections */}
        <div className="space-y-6 lg:space-y-8">
          {/* Today's Schedule Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              Today's Schedule 
              <span className="ml-2 bg-careviah-green text-white text-sm px-2 py-1 rounded-full">
                {upcomingToday.length + completedToday.length}
              </span>
            </h2>
            {(upcomingToday.length > 0 || completedToday.length > 0) && (
              <Button variant="ghost" className="text-careviah-green text-sm">
                See All
              </Button>
            )}
          </div>

          {/* Today's Schedule Cards */}
          <div className="space-y-4">
            {/* Upcoming Schedules */}
            {upcomingToday.map((schedule) => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                onRefresh={loadData}
              />
            ))}

            {/* Completed Schedules */}
            {completedToday.map((schedule) => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                isCompleted={true}
                onRefresh={loadData}
              />
            ))}

            {/* Empty State for Today's Schedule */}
            {upcomingToday.length === 0 && completedToday.length === 0 && (
              <Card className="bg-white border-0 shadow-sm rounded-xl">
                <CardContent className="p-8 lg:p-12 text-center">
                  <Calendar className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg lg:text-xl text-gray-500 mb-2">No schedules for today</p>
                  <p className="text-sm text-gray-400">Your upcoming schedules will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Missed Schedules Section */}
        {missedSchedules.length > 0 && (
          <div className="mt-8 lg:mt-10">
            <Card className="bg-red-50 border-red-200 shadow-sm rounded-xl">
              <CardHeader className="bg-red-100 border-b border-red-200 py-4 rounded-t-xl">
                <CardTitle className="text-red-700 text-center text-lg lg:text-xl">
                  Missed Schedules ({missedSchedules.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {missedSchedules.map((schedule) => (
                    <ScheduleCard 
                      key={schedule.id} 
                      schedule={schedule} 
                      isMissed={true}
                      onRefresh={loadData}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom padding for mobile navigation */}
        <div className="pb-20 sm:pb-0" />
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
