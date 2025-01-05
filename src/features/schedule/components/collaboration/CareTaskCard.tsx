import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  MessageSquare,
  History,
} from 'lucide-react';
import {
  AccessibleTooltip,
  TaskPriorityIndicator,
  TimeRemaining,
} from './AccessibilityHelpers';
import { HandoverTask, TASK_CATEGORY_ICONS, CARE_ACTIVITY_ICONS } from '../../types/handover';

interface CareTaskCardProps {
  task: HandoverTask;
  onStatusChange: (status: string) => void;
  onAddNote: () => void;
  onViewHistory: () => void;
}

export const CareTaskCard: React.FC<CareTaskCardProps> = ({
  task,
  onStatusChange,
  onAddNote,
  onViewHistory,
}) => {
  const categoryIcon = TASK_CATEGORY_ICONS[task.category];
  const activityIcon = task.activity ? CARE_ACTIVITY_ICONS[task.activity] : null;

  const statusColors = {
    PENDING: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const isUrgent = task.priority === 'URGENT';

  return (
    <Card className={`p-4 ${isUrgent ? 'border-red-500 border-2' : ''}`}>
      {/* Task Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: categoryIcon.color }}
            role="img"
            aria-label={`Task category: ${task.category}`}
          >
            <span className="text-xl">{activityIcon?.icon || categoryIcon.icon}</span>
          </div>
          <div>
            <h3 className="font-medium text-lg">{task.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <TaskPriorityIndicator priority={task.priority} />
              <Badge
                variant="outline"
                className={statusColors[task.status as keyof typeof statusColors]}
              >
                {task.status}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        </div>

        {task.dueDate && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <TimeRemaining dueDate={new Date(task.dueDate)} />
          </div>
        )}
      </div>

      {/* Resident Information */}
      {task.resident && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={task.resident.photo} alt={task.resident.name} />
              <AvatarFallback>{task.resident.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{task.resident.name}</p>
              {task.resident.room && (
                <p className="text-sm text-gray-500">Room {task.resident.room}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Description */}
      {task.description && (
        <p className="mt-4 text-gray-600">{task.description}</p>
      )}

      {/* Assignment Information */}
      {task.assignedTo && (
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
          <span>Assigned to:</span>
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignedTo.image} />
            <AvatarFallback>{task.assignedTo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{task.assignedTo.name}</span>
          {task.assignedTo.role && (
            <Badge variant="outline" className="ml-2">
              {task.assignedTo.role}
            </Badge>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AccessibleTooltip content="Mark as complete">
            <Button
              size="sm"
              variant={task.status === 'COMPLETED' ? 'default' : 'outline'}
              onClick={() => onStatusChange('COMPLETED')}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Button>
          </AccessibleTooltip>
          
          <AccessibleTooltip content="Add note">
            <Button size="sm" variant="outline" onClick={onAddNote}>
              <MessageSquare className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          </AccessibleTooltip>

          <AccessibleTooltip content="View history">
            <Button size="sm" variant="outline" onClick={onViewHistory}>
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
          </AccessibleTooltip>
        </div>

        {task.reminderTime && (
          <AccessibleTooltip
            content={`Reminder set for ${new Date(
              task.reminderTime
            ).toLocaleString()}`}
          >
            <div className="flex items-center text-sm text-gray-500">
              <Bell className="w-4 h-4 mr-1" />
              <span>Reminder set</span>
            </div>
          </AccessibleTooltip>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};
