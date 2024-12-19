'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import type { Session } from 'next-auth';

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string[];
  status: string;
}

interface UpcomingTasksProps {
  organizationId: string;
}

export const UpcomingTasks = () => {
  const { data: session } = useSession() as { data: Session | null };
  const organizationId = session?.user?.organizationId;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tasks?organizationId=${organizationId}`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [organizationId]);

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
        <div className="mt-4 space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {task.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                <span className="text-sm text-muted-foreground">
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


