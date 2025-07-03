
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui-setupconfig/card';
import { Button } from './ui-setupconfig/button';
import { Avatar, AvatarFallback } from './ui-setupconfig/avatar';
import { MapPin, Clock } from 'lucide-react';
import { Schedule } from '../types/schedule';

interface ActiveSessionCardProps {
  schedule: Schedule;
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ schedule }) => {
  const navigate = useNavigate();
  const [currentDuration, setCurrentDuration] = useState('00:00:00');

  useEffect(() => {
    const calculateDuration = () => {
      const startTime = new Date(schedule.shift_time);
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Update immediately
    setCurrentDuration(calculateDuration());

    // Update everysecond
    const interval = setInterval(() => {
      setCurrentDuration(calculateDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule.shift_time]);

  const handleClockOut = () => {
    navigate(`/clock-out/${schedule.id}`);
  };

  return (
    <Card className="bg-careviah-green text-white border-0 shadow-lg rounded-xl mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-bold mb-3">
            {currentDuration}
          </div>
          <div className="text-base sm:text-lg font-semibold mb-4">
            {schedule.serviceName || 'Caregiver Service'}
          </div>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarFallback className="bg-white text-careviah-green text-sm">
                {schedule.caregiverName?.split(' ').map(n => n[0]).join('') || 'CG'}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm sm:text-base">
              {schedule.caregiverName || 'Caregiver'}
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{schedule.address || schedule.location}</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-6 text-sm">
            <Clock className="w-4 h-4" />
            <span>{new Date(schedule.shift_time).toLocaleTimeString()}</span>
          </div>
          <Button
            onClick={handleClockOut}
            className="w-full bg-white text-careviah-green hover:bg-gray-100 font-medium py-3 rounded-full"
          >
            Clock-Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveSessionCard;
