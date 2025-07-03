import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Mail, Phone, MapPin } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui-setupconfig/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui-setupconfig/card';
import { Avatar, AvatarFallback } from '../components/ui-setupconfig/avatar';
import { Badge } from '../components/ui-setupconfig/badge';
import { Schedule } from '../types/schedule';
import { scheduleService } from '../services/scheduleService';
import { useToast } from '../hooks/use-toast';
import { useGeolocation } from '../hooks/useGeolocation';
import { useClockInValidation } from '../hooks/useClockInValidation';

const ScheduleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCurrentLocation, latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  const { validateClockIn, isValidating } = useClockInValidation();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('Getting your location...');

  useEffect(() => {
    const loadSchedule = async () => {
      if (!id) return;
      
      try {
        console.log('Loading schedule details for ID:', id);
        const scheduleData = await scheduleService.getScheduleById(id);
        console.log('Schedule data loaded:', scheduleData);
        
        if (scheduleData) {
          // Transform backend data to frontend format
          const transformedSchedule: Schedule = {
            ...scheduleData,
            caregiverName: scheduleData.client_name || 'Unknown Caregiver',
            caregiverId: scheduleData.user_id || '',
            serviceName: 'Caregiver Service',
            date: new Date(scheduleData.shift_time).toLocaleDateString(),
            time: new Date(scheduleData.shift_time).toLocaleTimeString(),
            clientContact: {
              email: 'client@example.com',
              phone: '+1234567890'
            },
            address: scheduleData.location,
            serviceNotes: 'Standard caregiver service',
            tasks: scheduleData.tasks?.map(task => ({
              ...task,
              name: task.description,
              completed: task.status === 'completed'
            })) || []
          };
          setSchedule(transformedSchedule);
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

  // Get user location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Convert coordinates to address when location is available
  useEffect(() => {
    if (latitude && longitude) {
      convertCoordinatesToAddress(latitude, longitude);
    } else if (locationError) {
      setUserAddress('Unable to get your location. Please enable location services.');
    } else if (locationLoading) {
      setUserAddress('Getting your location...');
    }
  }, [latitude, longitude, locationLoading, locationError]);

  const convertCoordinatesToAddress = async (lat: number, lng: number) => {
    try {
      // Using a reverse geocoding service (you can replace with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setUserAddress(data.display_name);
      } else if (data && data.locality && data.principalSubdivision) {
        setUserAddress(`${data.locality}, ${data.principalSubdivision}`);
      } else {
        setUserAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Failed to convert coordinates to address:', error);
      setUserAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const isScheduleMissed = (schedule: Schedule): boolean => {
    if (schedule.status !== 'scheduled') return false;
    
    const scheduleTime = new Date(schedule.shift_time);
    const now = new Date();
    
    // Consider schedule missed if current time is past schedule time + 5 minutes grace period
    const missedThreshold = new Date(scheduleTime.getTime() + 5 * 60 * 1000);
    return now > missedThreshold;
  };

  const handleClockIn = async () => {
    if (!schedule || !id) return;

    // Validate schedule using the validation hook
    if (!validateClockIn(schedule)) {
      return;
    }

    setIsClockingIn(true);
    
    try {
      // Get current location but don't block clock-in if it fails
      if (!latitude || !longitude) {
        // Try to get location one more time
        getCurrentLocation();
        
        // If still no location, proceed with default coordinates
        const defaultLat = 0;
        const defaultLng = 0;
        
        console.log('No location available, using default coordinates for clock-in');
        await scheduleService.startVisit(id, { 
          latitude: defaultLat, 
          longitude: defaultLng 
        });
      } else {
        console.log('Starting visit with caregiver location:', { latitude, longitude });
        await scheduleService.startVisit(id, { latitude, longitude });
      }
      
      toast({
        title: "Clock In Successful",
        description: "You have successfully clocked in to this schedule.",
      });
      
      // Update schedule status
      const updatedSchedule = { ...schedule, status: 'in_progress' as const };
      setSchedule(updatedSchedule);
    } catch (error) {
      console.error('Clock in failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock in. Please try again.';
      
      toast({
        title: "Clock In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsClockingIn(false);
    }
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

  const isMissed = isScheduleMissed(schedule);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 p-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Schedule Details</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Schedule Header */}
        <Card className="mb-6">
          <CardHeader className="bg-careviah-light-blue p-4 sm:p-6">
            <CardTitle className="text-center text-careviah-green text-lg sm:text-xl">
              {schedule.serviceName}
              {isMissed && (
                <Badge className="ml-2 bg-red-500 text-white">Missed</Badge>
              )}
            </CardTitle>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarFallback className="bg-careviah-green text-white text-sm">
                  {schedule.caregiverName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm sm:text-base">{schedule.caregiverName}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-2 sm:space-y-0 mt-4 text-sm">
              <div className="flex items-center space-x-1 text-careviah-cyan">
                <Calendar className="w-4 h-4" />
                <span>{schedule.date}</span>
              </div>
              <div className="flex items-center space-x-1 text-careviah-cyan">
                <Clock className="w-4 h-4" />
                <span>{schedule.time}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Client Contact & Address */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Client Contact:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm break-all">{schedule.clientContact.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm">{schedule.clientContact.phone}</span>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Address:</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{schedule.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Tasks:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.tasks.length > 0 ? (
                schedule.tasks.map((task) => (
                  <div key={task.id} className="border-b pb-4 last:border-b-0">
                    <h5 className="font-medium text-careviah-green mb-2 text-sm sm:text-base">{task.name}</h5>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600 font-medium">No tasks assigned to this schedule</p>
                  <p className="text-xs text-gray-500 mt-1">Clock-in is not available without assigned tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Notes */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Service Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 leading-relaxed">{schedule.serviceNotes}</p>
          </CardContent>
        </Card>

        {/* Clock-in Location */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Your Current Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <MapPin className={`w-8 h-8 ${locationLoading ? 'text-blue-500 animate-pulse' : locationError ? 'text-red-400' : 'text-green-500'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 leading-relaxed">{userAddress}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your location will be verified against the client's address for clock-in
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="mt-6 sm:mt-8">
          {schedule.status === 'scheduled' && !isMissed ? (
            <Button
              onClick={handleClockIn}
              disabled={isClockingIn || isValidating}
              className="w-full bg-careviah-green hover:bg-careviah-green/90 text-white py-3 h-12 text-base"
            >
              {isClockingIn ? 'Clocking In...' : 'Clock-in Now'}
            </Button>
          ) : schedule.status === 'in_progress' ? (
            <Button
              onClick={() => navigate(`/clock-out/${schedule.id}`)}
              className="w-full bg-careviah-green hover:bg-careviah-green/90 text-white py-3 h-12 text-base"
            >
              Clock Out Now
            </Button>
          ) : isMissed ? (
            <div className="text-center">
              <Badge className="px-4 py-2 text-sm bg-red-500 text-white">
                Schedule Missed - Clock-in Not Available
              </Badge>
            </div>
          ) : (
            <div className="text-center">
              <Badge className="px-4 py-2 text-sm">
                Schedule {schedule.status}
              </Badge>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScheduleDetails;
