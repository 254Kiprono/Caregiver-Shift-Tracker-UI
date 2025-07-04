
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetTime: string;
  onExpired?: () => void;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetTime, 
  onExpired,
  className = "" 
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetTime);
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpired) {
          onExpired();
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onExpired]);

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center space-x-1 text-red-600 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Time's up!</span>
      </div>
    );
  }

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className={`flex items-center space-x-1 text-orange-600 ${className}`}>
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">
        {timeLeft.hours > 0 
          ? `${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`
          : `${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`
        }
      </span>
    </div>
  );
};

export default CountdownTimer;
