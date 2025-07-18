
import React from 'react';
import { Schedule } from '../types/schedule';
import { Card, CardContent } from './ui-setupconfig/card';
import { Button } from './ui-setupconfig/button';
import { Clock, MapPin, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui-setupconfig/avatar';
import { Badge } from './ui-setupconfig/badge';
import CountdownTimer from './CountdownTimer';

interface ScheduleCardProps {
  schedule: Schedule;
  isMissed?: boolean;
  isCompleted?: boolean;
  onRefresh?: () => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ 
  schedule, 
  isMissed = false, 
  isCompleted = false,
  onRefresh 
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/schedule/${schedule.id}`);
  };

  const handleClockAction = () => {
    if (schedule.status === 'in_progress') {
      navigate(`/clock-out/${schedule.id}`);
    } else if (schedule.status === 'scheduled' && !isMissed) {
      navigate(`/schedule/${schedule.id}`);
    }
  };

  const getStatusBadge = () => {
    if (isMissed) return { text: 'Missed', className: 'bg-red-500 text-white' };
    if (isCompleted) return { text: 'Completed', className: 'bg-green-500 text-white' };
    if (schedule.status === 'in_progress') return { text: 'In Progress', className: 'bg-orange-500 text-white' };
    return { text: 'Scheduled', className: 'bg-gray-500 text-white' };
  };

  const getActionButton = () => {
    if (isMissed) return null;
    
    if (schedule.status === 'in_progress') {
      return (
        <Button 
          onClick={handleClockAction}
          className="w-full bg-careviah-green hover:bg-careviah-green/90 text-white rounded-full font-medium"
        >
          Clock-Out Now
        </Button>
      );
    } else if (schedule.status === 'scheduled') {
      return (
        <Button 
          onClick={handleClockAction}
          className="w-full bg-careviah-green hover:bg-careviah-green/90 text-white rounded-full font-medium"
        >
          Clock-in Now
        </Button>
      );
    } else if (isCompleted) {
      return (
        <Button 
          onClick={handleViewDetails}
          variant="outline"
          className="w-full border-gray-300 text-gray-600 rounded-full font-medium"
        >
          View Report
        </Button>
      );
    }

    return (
      <Button 
        onClick={handleViewDetails}
        variant="outline"
        className="w-full border-gray-300 text-gray-600 rounded-full font-medium"
      >
        View Progress
      </Button>
    );
  };

  const statusBadge = getStatusBadge();
  
  // Check if schedule is starting soon (within 30 minutes)
  const isStartingSoon = () => {
    if (schedule.status !== 'scheduled') return false;
    const scheduleTime = new Date(schedule.shift_time);
    const now = new Date();
    const timeDiff = scheduleTime.getTime() - now.getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    return timeDiff > 0 && timeDiff <= thirtyMinutes;
  };

  return (
    <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header with Status Badge */}
        <div className="flex items-center justify-between p-4 pb-3">
          <Badge className={`${statusBadge.className} text-xs font-medium px-3 py-1 rounded-full`}>
            {statusBadge.text}
          </Badge>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="px-4 pb-4">
          {/* Profile and Service Info */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-careviah-green text-white font-medium">
                {schedule.client_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base">{schedule.client_name}</h3>
              <p className="text-sm text-gray-600">{schedule.serviceName || 'Service Name A'}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">{schedule.location}</span>
          </div>

          {/* Date and Time */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-careviah-light-blue p-2 rounded-lg">
                <Calendar className="w-4 h-4 text-careviah-green" />
              </div>
              <span className="text-sm text-gray-600">
                {schedule.date || new Date(schedule.shift_time).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-careviah-light-blue p-2 rounded-lg">
                <Clock className="w-4 h-4 text-careviah-green" />
              </div>
              <span className="text-sm text-gray-600">
                {schedule.time || new Date(schedule.shift_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Countdown Timer for upcoming schedules */}
          {isStartingSoon() && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-700">Starting in:</span>
                <CountdownTimer 
                  targetTime={schedule.shift_time}
                  onExpired={onRefresh}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
