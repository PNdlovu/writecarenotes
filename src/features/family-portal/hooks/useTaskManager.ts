/**
 * @fileoverview Task Manager Hook
 * Hook for managing care-related tasks
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/UseToast';
import type { Task } from '../components/collaboration/TaskManager';

interface UseTaskManagerProps {
  residentId: string;
  familyMemberId: string;
}

interface UseTaskManagerReturn {
  tasks: Task[];
  isLoading: boolean;
  error?: string;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  assignTask: (id: string, assigneeIds: string[]) => Promise<void>;
}

export function useTaskManager({
  residentId,
  familyMemberId,
}: UseTaskManagerProps): UseTaskManagerReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, [residentId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Implement API call to load tasks
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Morning Medication',
          description: 'Administer morning medication as prescribed',
          type: 'medication',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(),
          assignedTo: [
            {
              id: '1',
              name: 'John Doe',
              role: 'Caregiver',
            },
          ],
          createdBy: familyMemberId,
          createdAt: new Date(),
          updatedAt: new Date(),
          recurrence: {
            frequency: 'daily',
            interval: 1,
          },
        },
        {
          id: '2',
          title: 'Physical Therapy Session',
          description: 'Scheduled physical therapy session',
          type: 'appointment',
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(),
          assignedTo: [
            {
              id: '2',
              name: 'Jane Smith',
              role: 'Therapist',
            },
          ],
          createdBy: familyMemberId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setTasks(mockTasks);
      setError(undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id'>): Promise<void> => {
    try {
      // Implement API call to add task
      const newTask: Task = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: familyMemberId,
      };

      setTasks(prev => [...prev, newTask]);
      toast({
        title: 'Task Added',
        description: 'Successfully added new task',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add task';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    try {
      // Implement API call to update task
      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        )
      );

      toast({
        title: 'Task Updated',
        description: 'Successfully updated task',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      // Implement API call to delete task
      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: 'Task Deleted',
        description: 'Successfully deleted task',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const completeTask = async (id: string): Promise<void> => {
    try {
      // Implement API call to complete task
      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? {
                ...task,
                status: 'completed',
                completedAt: new Date(),
                updatedAt: new Date(),
              }
            : task
        )
      );

      toast({
        title: 'Task Completed',
        description: 'Successfully completed task',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete task';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const assignTask = async (id: string, assigneeIds: string[]): Promise<void> => {
    try {
      // Implement API call to assign task
      // This would typically involve looking up user details for the assigneeIds
      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? {
                ...task,
                assignedTo: assigneeIds.map(aid => ({
                  id: aid,
                  name: 'User ' + aid, // This would come from the API
                  role: 'Family Member',
                })),
                updatedAt: new Date(),
              }
            : task
        )
      );

      toast({
        title: 'Task Assigned',
        description: 'Successfully assigned task',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign task';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    assignTask,
  };
}


