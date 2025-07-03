
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetTime: string;
  gracePeriod?: number; // Grace period in minutes after target time
  onExpired?: () => void;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetTime, 
  gracePeriod = 0,
  onExpired,
  className = "" 
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isPastDue: boolean;
    isInGracePeriod: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isExpired: false, isPastDue: false, isInGracePeriod: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetTime);
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      const gracePeriodMs = gracePeriod * 60 * 1000; // Convert minutes to milliseconds

      // If we're way past the grace period, mark as expired
      if (difference < -gracePeriodMs) {
        setTimeLeft({ 
          hours: 0, 
          minutes: 0, 
          seconds: 0, 
          isExpired: true, 
          isPastDue: true, 
          isInGracePeriod: false 
        });
        if (onExpired) {
          onExpired();
        }
        return;
      }

      // If we're past the target time but within grace period
      if (difference < 0) {
        const absoluteDifference = Math.abs(difference);
        const hours = Math.floor(absoluteDifference / (1000 * 60 * 60));
        const minutes = Math.floor((absoluteDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absoluteDifference % (1000 * 60)) / 1000);

        setTimeLeft({ 
          hours, 
          minutes, 
          seconds, 
          isExpired: false, 
          isPastDue: true, 
          isInGracePeriod: true 
        });
        return;
      }

      // Normal countdown before target time
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ 
        hours, 
        minutes, 
        seconds, 
        isExpired: false, 
        isPastDue: false, 
        isInGracePeriod: false 
      });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime, gracePeriod, onExpired]);

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center space-x-1 text-red-600 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Missed!</span>
      </div>
    );
  }

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // Determine display properties based on state
  let displayColor = 'text-orange-600';
  let prefix = '';
  let bgColor = 'bg-orange-50';
  let borderColor = 'border-orange-200';

  if (timeLeft.isInGracePeriod) {
    displayColor = 'text-red-600';
    prefix = 'Grace Period: ';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
  } else if (timeLeft.isPastDue) {
    displayColor = 'text-red-600';
    prefix = 'Overdue: ';
  }

  return (
    <div className={`flex items-center space-x-1 ${displayColor} ${className}`}>
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">
        {prefix}
        {timeLeft.hours > 0 
          ? `${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`
          : `${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`
        }
      </span>
    </div>
  );
};

export default CountdownTimer;
