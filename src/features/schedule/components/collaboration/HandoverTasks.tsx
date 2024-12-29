import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Filter, SortAsc } from 'lucide-react';
import { HandoverTask } from '../../types/handover';
import { CareTaskCard } from './CareTaskCard';
import { CareTaskForm } from './CareTaskForm';
import { TaskAlert } from './AccessibilityHelpers';

interface HandoverTasksProps {
  tasks: HandoverTask[];
  residents?: Array<{ id: string; name: string; room?: string; photo?: string }>;
  staff?: Array<{ id: string; name: string; role?: string; image?: string }>;
  onCreateTask: (task: Partial<HandoverTask>) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<HandoverTask>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const HandoverTasks: React.FC<HandoverTasksProps> = ({
  tasks,
  residents,
  staff,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>('priority');

  // Check for urgent or overdue tasks
  const hasUrgentTasks = tasks.some(
    (task) => task.priority === 'URGENT' && task.status !== 'COMPLETED'
  );
  const hasOverdueTasks = tasks.some(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== 'COMPLETED'
  );

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      );
    } else {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  });

  // Filter tasks
  const filteredTasks = sortedTasks.filter((task) => {
    switch (filter) {
      case 'PENDING':
        return task.status === 'PENDING';
      case 'IN_PROGRESS':
        return task.status === 'IN_PROGRESS';
      case 'COMPLETED':
        return task.status === 'COMPLETED';
      case 'URGENT':
        return task.priority === 'URGENT';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {hasUrgentTasks && (
        <TaskAlert
          title="Urgent Tasks Pending"
          description="There are urgent tasks that require immediate attention."
          variant="warning"
        />
      )}
      {hasOverdueTasks && (
        <TaskAlert
          title="Overdue Tasks"
          description="Some tasks are past their due date. Please review and update their status."
          variant="warning"
        />
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Add Care Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Care Task</DialogTitle>
                <DialogDescription>
                  Create a new care task for a resident
                </DialogDescription>
              </DialogHeader>
              <CareTaskForm
                residents={residents}
                staff={staff}
                onCreateTask={async (task) => {
                  await onCreateTask(task);
                  setShowAddTask(false);
                }}
                onCancel={() => setShowAddTask(false)}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() =>
              setSortBy(sortBy === 'priority' ? 'dueDate' : 'priority')
            }
          >
            <SortAsc className="w-4 h-4 mr-1" />
            Sort by {sortBy === 'priority' ? 'Due Date' : 'Priority'}
          </Button>

          <Button variant="outline" onClick={() => setFilter('ALL')}>
            <Filter className="w-4 h-4 mr-1" />
            {filter === 'ALL' ? 'All Tasks' : filter}
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          {filteredTasks.length} tasks shown
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <CareTaskCard
            key={task.id}
            task={task}
            onStatusChange={(status) => onUpdateTask(task.id, { status })}
            onAddNote={() => {
              // Implement note addition
            }}
            onViewHistory={() => {
              // Implement history view
            }}
          />
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found. Create a new task to get started.
          </div>
        )}
      </div>
    </div>
  );
};
