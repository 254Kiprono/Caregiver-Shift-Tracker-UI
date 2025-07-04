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

  // Helper function to check if a schedule is truly from today
  const isScheduleFromToday = (schedule: Schedule): boolean => {
    const scheduleDate = new Date(schedule.shift_time);
    const today = new Date();
    
    // Get today's date in local timezone
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    // Get schedule date in local timezone
    const scheduleYear = scheduleDate.getFullYear();
    const scheduleMonth = scheduleDate.getMonth();
    const scheduleDay = scheduleDate.getDate();
    
    const isToday = scheduleYear === todayYear && 
                   scheduleMonth === todayMonth && 
                   scheduleDay === todayDay;
    
    console.log(`Schedule ${schedule.id} date check:`, {
      scheduleDate: scheduleDate.toLocaleDateString(),
      todayDate: today.toLocaleDateString(),
      isToday
    });
    
    return isToday;
  };

  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      
      console.log('Loading dashboard data...');
      
      // Load all different schedule types
      const [
        todaySchedules,
        upcomingSchedules, 
        missedSchedules,
        completedSchedules
      ] = await Promise.all([
        scheduleService.getTodaySchedules(),
        scheduleService.getUpcomingSchedules(),
        scheduleService.getMissedSchedules(),
        scheduleService.getTodayCompletedSchedules()
      ]);
      
      console.log('Raw API responses:');
      console.log('Today schedules:', todaySchedules);
      console.log('Upcoming schedules:', upcomingSchedules);
      console.log('Missed schedules:', missedSchedules);
      console.log('Completed schedules:', completedSchedules);
      
      // Filter all schedules to only include today's schedules
      const filteredTodaySchedules = todaySchedules.filter(isScheduleFromToday);
      const filteredUpcomingSchedules = upcomingSchedules.filter(isScheduleFromToday);
      const filteredMissedSchedules = missedSchedules.filter(isScheduleFromToday);
      const filteredCompletedSchedules = completedSchedules.filter(isScheduleFromToday);
      
      console.log('Filtered schedules for today:');
      console.log('Filtered today schedules:', filteredTodaySchedules);
      console.log('Filtered upcoming schedules:', filteredUpcomingSchedules);
      console.log('Filtered missed schedules:', filteredMissedSchedules);
      console.log('Filtered completed schedules:', filteredCompletedSchedules);
      
      // Combine all schedules, avoiding duplicates and only using today's schedules
      const allSchedules = [
        ...filteredTodaySchedules,
        ...filteredUpcomingSchedules,
        ...filteredMissedSchedules,
        ...filteredCompletedSchedules
      ].filter((schedule, index, self) => 
        index === self.findIndex(s => s.id === schedule.id)
      );
      
      console.log('Combined today schedules:', allSchedules);
      
      // Calculate stats using only today's schedules
      const today = new Date();
      const now = new Date();
      
      // Count missed schedules - those with status 'missed' from today only
      const missedCount = allSchedules.filter(schedule => {
        const isMissed = schedule.status === 'missed';
        console.log(`Schedule ${schedule.id} missed check:`, {
          isMissed,
          status: schedule.status
        });
        return isMissed;
      }).length;
      
      // Calculate upcoming today schedules (future schedules for today only)
      const upcomingTodayCount = allSchedules.filter(schedule => {
        const scheduleTime = new Date(schedule.shift_time);
        const isFutureTime = scheduleTime > now;
        const isScheduled = schedule.status === 'scheduled';
        
        console.log(`Upcoming check for schedule ${schedule.id}:`, {
          scheduleTime,
          isFutureTime,
          isScheduled,
          status: schedule.status
        });
        
        return isFutureTime && isScheduled;
      }).length;
      
      // Count completed schedules from today only
      const todayCompletedCount = allSchedules.filter(schedule => 
        schedule.status === 'completed'
      ).length;
      
      const calculatedStats = {
        missedScheduled: missedCount,
        upcomingToday: upcomingTodayCount,
        completedToday: todayCompletedCount,
      };
      
      console.log('Calculated stats for today only:', calculatedStats);
      
      setSchedules(allSchedules);
      setStats(calculatedStats);
      
      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      if (!silent) {
        setError('Failed to load dashboard data. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please check your internet connection.",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up silent real-time polling every 10 seconds
    const interval = setInterval(() => loadData(true), 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getSchedulesByCategory = () => {
    const today = new Date();
    const now = new Date();
    
    // Get active/in-progress schedule
    const activeSchedule = schedules.find(schedule => 
      schedule.status === 'in_progress'
    );
    
    // Get missed schedules from today with status 'missed'
    const missedSchedules = schedules.filter(schedule => 
      schedule.status === 'missed'
    );
    
    // Upcoming today: future schedules for today that are scheduled
    const upcomingToday = schedules.filter(schedule => {
      const scheduleTime = new Date(schedule.shift_time);
      const isFutureTime = scheduleTime > now;
      const isScheduled = schedule.status === 'scheduled';
      
      return isFutureTime && isScheduled;
    });
    
    // Completed schedules from today
    const completedToday = schedules.filter(schedule => 
      schedule.status === 'completed'
    );

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
            <Button onClick={() => loadData()}>Try Again</Button>
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
                onRefresh={() => loadData(true)}
              />
            ))}

            {/* Completed Schedules */}
            {completedToday.map((schedule) => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                isCompleted={true}
                onRefresh={() => loadData(true)}
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
                      onRefresh={() => loadData(true)}
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
