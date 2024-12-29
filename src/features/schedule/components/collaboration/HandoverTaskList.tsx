import React, { useState, useCallback } from 'react';
import { HandoverTask, Staff } from '../../types/handover';
import { CareTaskCard } from './CareTaskCard';
import { Button, Input, Select, Tooltip } from '@/components/ui';
import { useHandoverSession } from '../../hooks/useHandoverSession';
import { useDebouncedCallback } from 'use-debounce';

interface HandoverTaskListProps {
  sessionId: string;
  tasks: HandoverTask[];
  currentStaff: Staff;
  onTaskUpdate: (taskId: string, updates: Partial<HandoverTask>) => Promise<void>;
}

export const HandoverTaskList: React.FC<HandoverTaskListProps> = ({
  sessionId,
  tasks,
  currentStaff,
  onTaskUpdate,
}) => {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'status' | 'createdAt'>('priority');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  const { updateTask } = useHandoverSession(sessionId);

  const handleSearch = useDebouncedCallback((value: string) => {
    setFilter(value.toLowerCase());
  }, 300);

  const handleSort = useCallback((value: 'priority' | 'status' | 'createdAt') => {
    setSortBy(value);
  }, []);

  const handleTaskSelect = useCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  const handleBatchUpdate = useCallback(async (update: Partial<HandoverTask>) => {
    await Promise.all(
      selectedTasks.map(taskId => updateTask(taskId, update))
    );
    setSelectedTasks([]);
  }, [selectedTasks, updateTask]);

  const filteredTasks = tasks.filter(task => {
    const searchText = `${task.title} ${task.description || ''} ${task.category}`.toLowerCase();
    return searchText.includes(filter);
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      case 'status':
        return getStatusWeight(b.status) - getStatusWeight(a.status);
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          type="search"
          placeholder="Search tasks..."
          onChange={e => handleSearch(e.target.value)}
          className="w-64"
        />
        <Select
          value={sortBy}
          onChange={e => handleSort(e.target.value as typeof sortBy)}
          options={[
            { value: 'priority', label: 'Sort by Priority' },
            { value: 'status', label: 'Sort by Status' },
            { value: 'createdAt', label: 'Sort by Created Date' },
          ]}
          className="w-48"
        />
      </div>

      {selectedTasks.length > 0 && (
        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
          <span>{selectedTasks.length} tasks selected</span>
          <Tooltip content="Mark as Complete">
            <Button
              variant="secondary"
              onClick={() => handleBatchUpdate({ status: 'COMPLETED' })}
            >
              Complete All
            </Button>
          </Tooltip>
          <Tooltip content="Assign to Me">
            <Button
              variant="secondary"
              onClick={() => handleBatchUpdate({ assignedTo: currentStaff })}
            >
              Assign to Me
            </Button>
          </Tooltip>
        </div>
      )}

      <div className="space-y-2">
        {sortedTasks.map(task => (
          <CareTaskCard
            key={task.id}
            task={task}
            isSelected={selectedTasks.includes(task.id)}
            onSelect={() => handleTaskSelect(task.id)}
            onUpdate={updates => onTaskUpdate(task.id, updates)}
            currentStaff={currentStaff}
          />
        ))}
      </div>

      {sortedTasks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No tasks found
        </div>
      )}
    </div>
  );
};

function getPriorityWeight(priority: string): number {
  const weights = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };
  return weights[priority as keyof typeof weights] || 0;
}

function getStatusWeight(status: string): number {
  const weights = {
    PENDING: 3,
    IN_PROGRESS: 2,
    COMPLETED: 1,
  };
  return weights[status as keyof typeof weights] || 0;
}
