/**
 * @fileoverview Task Manager Component
 * Manages care-related tasks and assignments
 */

import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Badge } from "@/components/ui/Badge/Badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { useTaskManager } from '../../hooks/useTaskManager';
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

interface TaskManagerProps {
  residentId: string;
  familyMemberId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'care' | 'medication' | 'appointment' | 'general';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: Date;
  assignedTo: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  comments?: Array<{
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
  }>;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState<string | null>(null);
  const [filter, setFilter] = useState<Task['status']>('pending');

  const {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    assignTask,
  } = useTaskManager({ residentId, familyMemberId });

  const handleAddTask = async (task: Omit<Task, 'id'>) => {
    await addTask(task);
    setShowTaskDialog(false);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    await updateTask(id, updates);
    setShowTaskDetails(null);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    setShowTaskDetails(null);
  };

  const handleCompleteTask = async (id: string) => {
    await completeTask(id);
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => task.status === filter);
  };

  const renderPriorityBadge = (priority: Task['priority']) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline',
    };

    return (
      <Badge variant={variants[priority]}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Manager</h2>
          <p className="text-muted-foreground">
            Manage and coordinate care tasks
          </p>
        </div>
        <Button onClick={() => setShowTaskDialog(true)}>
          Add Task
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger
            value="pending"
            onClick={() => setFilter('pending')}
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            onClick={() => setFilter('completed')}
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {getFilteredTasks().map((task) => (
              <Card
                key={task.id}
                className="p-4 cursor-pointer hover:bg-accent"
                onClick={() => setShowTaskDetails(task.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => handleCompleteTask(task.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{task.title}</h4>
                        {renderPriorityBadge(task.priority)}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>📅 Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        {task.type && (
                          <Badge variant="outline">{task.type}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'in-progress' ? 'secondary' :
                      task.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }>
                      {task.status}
                    </Badge>
                    {task.assignedTo.length > 0 && (
                      <div className="flex -space-x-2">
                        {task.assignedTo.map((assignee) => (
                          <Avatar key={assignee.id} className="border-2 border-background">
                            <AvatarImage src={assignee.avatar} alt={assignee.name} />
                            <AvatarFallback>
                              {assignee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new care-related task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Task title" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="care">Care</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Task description" />
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium">Assign To</label>
              {/* Add assignee selection component */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleAddTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog
        open={showTaskDetails !== null}
        onOpenChange={() => setShowTaskDetails(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          {showTaskDetails && (
            <div>
              {/* Task details content */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};


