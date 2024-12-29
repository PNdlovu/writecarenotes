import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { HelpText } from './AccessibilityHelpers';
import {
  HandoverTask,
  HandoverTaskCategory,
  TASK_CATEGORY_ICONS,
  CARE_ACTIVITY_ICONS,
} from '../../types/handover';

interface CareTaskFormProps {
  residents?: Array<{ id: string; name: string; room?: string; photo?: string }>;
  staff?: Array<{ id: string; name: string; role?: string; image?: string }>;
  onCreateTask: (task: Partial<HandoverTask>) => Promise<void>;
  onCancel?: () => void;
}

export const CareTaskForm: React.FC<CareTaskFormProps> = ({
  residents,
  staff,
  onCreateTask,
  onCancel,
}) => {
  const [task, setTask] = useState({
    title: '',
    category: '' as HandoverTaskCategory,
    activity: '',
    priority: 'MEDIUM' as const,
    residentId: '',
    assignedToId: '',
    description: '',
    dueDate: null as Date | null,
    reminderTime: null as Date | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!task.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!task.category) {
      newErrors.category = 'Category is required';
    }
    if (!task.residentId) {
      newErrors.residentId = 'Please select a resident';
    }
    if (!task.assignedToId) {
      newErrors.assignedToId = 'Please assign to a staff member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await onCreateTask({
      ...task,
      status: 'PENDING',
    });

    // Reset form
    setTask({
      title: '',
      category: '' as HandoverTaskCategory,
      activity: '',
      priority: 'MEDIUM',
      residentId: '',
      assignedToId: '',
      description: '',
      dueDate: null,
      reminderTime: null,
    });
  };

  const getActivitiesForCategory = (category: HandoverTaskCategory) => {
    return Object.entries(CARE_ACTIVITY_ICONS).filter(([key]) =>
      key.startsWith(category)
    );
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Create Care Task</h3>
        <HelpText text="Create a new task for resident care" />
      </div>

      <div className="space-y-4">
        {/* Resident Selection */}
        <div className="space-y-2">
          <Label htmlFor="resident">
            Resident
            <HelpText text="Select the resident who needs care" />
          </Label>
          <Select
            value={task.residentId}
            onValueChange={(value) => setTask({ ...task, residentId: value })}
          >
            <SelectTrigger
              id="resident"
              className={cn(errors.residentId && 'border-red-500')}
            >
              <SelectValue placeholder="Select resident" />
            </SelectTrigger>
            <SelectContent>
              {residents?.map((resident) => (
                <SelectItem key={resident.id} value={resident.id}>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={resident.photo} />
                      <AvatarFallback>{resident.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>
                      {resident.name} {resident.room && `(Room ${resident.room})`}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.residentId && (
            <p className="text-sm text-red-500">{errors.residentId}</p>
          )}
        </div>

        {/* Care Category and Activity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">
              Care Category
              <HelpText text="Select the type of care needed" />
            </Label>
            <Select
              value={task.category}
              onValueChange={(value: HandoverTaskCategory) =>
                setTask({ ...task, category: value, activity: '' })
              }
            >
              <SelectTrigger
                id="category"
                className={cn(errors.category && 'border-red-500')}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_CATEGORY_ICONS).map(([category, { icon, color }]) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center space-x-2">
                      <span style={{ color }}>{icon}</span>
                      <span>{category.replace(/_/g, ' ')}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">
              Specific Activity
              <HelpText text="Select the specific care activity" />
            </Label>
            <Select
              value={task.activity}
              onValueChange={(value) => setTask({ ...task, activity: value })}
              disabled={!task.category}
            >
              <SelectTrigger id="activity">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                {task.category &&
                  getActivitiesForCategory(task.category).map(([key, { icon, description }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <span>{icon}</span>
                        <span>{description}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task Details */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Task Title
            <HelpText text="Enter a clear, descriptive title" />
          </Label>
          <Input
            id="title"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            placeholder="e.g., Morning medication"
            className={cn(errors.title && 'border-red-500')}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description
            <HelpText text="Add any important details or instructions" />
          </Label>
          <Textarea
            id="description"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            placeholder="Enter any specific instructions or notes..."
            className="min-h-[100px]"
          />
        </div>

        {/* Priority and Assignment */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority Level
              <HelpText text="Set the urgency of this task" />
            </Label>
            <Select
              value={task.priority}
              onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') =>
                setTask({ ...task, priority: value })
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low Priority</SelectItem>
                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                <SelectItem value="HIGH">High Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned">
              Assign To
              <HelpText text="Select staff member responsible" />
            </Label>
            <Select
              value={task.assignedToId}
              onValueChange={(value) => setTask({ ...task, assignedToId: value })}
            >
              <SelectTrigger
                id="assigned"
                className={cn(errors.assignedToId && 'border-red-500')}
              >
                <SelectValue placeholder="Assign to staff" />
              </SelectTrigger>
              <SelectContent>
                {staff?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>
                        {member.name} {member.role && `(${member.role})`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedToId && (
              <p className="text-sm text-red-500">{errors.assignedToId}</p>
            )}
          </div>
        </div>

        {/* Due Date and Reminder */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Due Date
              <HelpText text="When does this task need to be completed?" />
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !task.dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.dueDate ? (
                    format(task.dueDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={task.dueDate || undefined}
                  onSelect={(date) => setTask({ ...task, dueDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>
              Set Reminder
              <HelpText text="When should staff be reminded?" />
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !task.reminderTime && 'text-muted-foreground'
                  )}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {task.reminderTime ? (
                    format(task.reminderTime, 'PPP')
                  ) : (
                    <span>Set reminder</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={task.reminderTime || undefined}
                  onSelect={(date) => setTask({ ...task, reminderTime: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit}>Create Task</Button>
        </div>
      </div>
    </Card>
  );
};
