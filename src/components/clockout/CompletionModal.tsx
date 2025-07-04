
import React from 'react';
import { Check, Clock, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui-setupconfig/dialog';
import { Button } from '../ui-setupconfig/button';
import { Schedule } from '../../types/schedule';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  schedule?: Schedule | null;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  schedule,
}) => {
  const getScheduleDate = () => {
    if (!schedule) return 'Date not available';
    return schedule.date || new Date(schedule.shift_time).toLocaleDateString();
  };

  const getScheduleTime = () => {
    if (!schedule) return 'Time not available';
    const startTime = schedule.time || new Date(schedule.shift_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = schedule.clockOutTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  const getDuration = () => {
    if (!schedule) return '';
    return schedule.duration || '1 hour';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[90%] mx-auto bg-careviah-green text-white border-0 rounded-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4 relative">
            <Check className="w-10 h-10 text-white" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-400 rounded-full opacity-40 animate-pulse"></div>
          </div>
          <DialogTitle className="text-xl lg:text-2xl text-white font-semibold">
            Schedule Completed
          </DialogTitle>
          <DialogDescription className="space-y-3 text-white/90 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm lg:text-base">{getScheduleDate()}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm lg:text-base">{getScheduleTime()}</span>
              {getDuration() && (
                <span className="text-xs lg:text-sm opacity-80">({getDuration()})</span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            onClick={onConfirm}
            variant="outline"
            className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-careviah-green h-12 rounded-full font-medium text-base transition-all duration-200"
          >
            Go to Home
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionModal;
