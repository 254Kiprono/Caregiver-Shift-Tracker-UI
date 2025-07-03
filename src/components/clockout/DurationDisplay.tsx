
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface DurationDisplayProps {
  duration: string;
  serviceName: string;
  caregiverName: string;
}

const DurationDisplay: React.FC<DurationDisplayProps> = ({
  duration,
  serviceName,
  caregiverName,
}) => {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6 text-center">
        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          {duration || '01:35:40'}
        </div>
        <div className="text-base sm:text-lg font-semibold text-careviah-green mb-2">
          {serviceName}
        </div>
        <div className="flex items-center justify-center space-x-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarFallback className="bg-careviah-green text-white text-sm">
              {caregiverName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm sm:text-base">{caregiverName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DurationDisplay;
