
import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui-setupconfig/card';
import { Checkbox } from '../ui-setupconfig/checkbox';
import { Textarea } from '../ui-setupconfig/textarea';
import { Button } from '../ui-setupconfig/button';
import { Task } from '../../types/schedule';

interface TasksSectionProps {
  tasks: Task[];
  onTaskComplete: (taskId: string, completed: boolean) => void;
  onTaskReason: (taskId: string, reason: string) => void;
}

const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  onTaskComplete,
  onTaskReason,
}) => {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Tasks:</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">Please tick the tasks that you have done</p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {tasks.map((task) => (
          <div key={task.id} className="border-b pb-4 sm:pb-6 last:border-b-0">
            <h5 className="font-medium text-careviah-green mb-2 text-sm sm:text-base">{task.name}</h5>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">{task.description}</p>
            
            <div className="flex items-center space-x-6 mb-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`task-yes-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={(checked) => onTaskComplete(task.id, checked as boolean)}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <label htmlFor={`task-yes-${task.id}`} className="text-sm text-green-600 flex items-center font-medium">
                  <Check className="w-4 h-4 mr-1" />
                  Yes
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`task-no-${task.id}`}
                  checked={!task.completed}
                  onCheckedChange={(checked) => onTaskComplete(task.id, !(checked as boolean))}
                  className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                />
                <label htmlFor={`task-no-${task.id}`} className="text-sm text-red-600 flex items-center font-medium">
                  <X className="w-4 h-4 mr-1" />
                  No
                </label>
              </div>
            </div>
            
            {!task.completed && (
              <Textarea
                placeholder="Add reason..."
                value={task.reason || ''}
                onChange={(e) => onTaskReason(task.id, e.target.value)}
                className="mt-3 text-sm"
                rows={3}
              />
            )}
          </div>
        ))}
        
        <Button
          variant="ghost"
          className="text-careviah-cyan hover:text-careviah-cyan/80 hover:bg-careviah-cyan/10 text-sm font-medium"
        >
          + Add new task
        </Button>
      </CardContent>
    </Card>
  );
};

export default TasksSection;
