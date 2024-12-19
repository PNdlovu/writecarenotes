import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface HandoverNote {
  id: string;
  shiftId: string;
  authorId: string;
  authorName: string;
  content: string;
  category: 'general' | 'urgent' | 'followup' | 'task';
  timestamp: Date;
  attachments?: { id: string; name: string; url: string }[];
}

interface Task {
  id: string;
  shiftId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export const ShiftHandover: React.FC = () => {
  const [newNote, setNewNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HandoverNote['category']>('general');

  const { data: handoverNotes } = useQuery<HandoverNote[]>(
    ['handover', 'notes', 'current'],
    () => scheduleAPI.getCurrentShiftHandoverNotes(),
  );

  const { data: tasks } = useQuery<Task[]>(
    ['handover', 'tasks', 'current'],
    () => scheduleAPI.getCurrentShiftTasks(),
  );

  const addNoteMutation = useMutation(
    (note: { content: string; category: HandoverNote['category'] }) =>
      scheduleAPI.addHandoverNote(note),
    {
      onSuccess: () => {
        setNewNote('');
        setSelectedCategory('general');
      },
    }
  );

  const updateTaskMutation = useMutation(
    (task: Partial<Task> & { id: string }) => scheduleAPI.updateTask(task),
  );

  const getCategoryStyle = (category: HandoverNote['category']) => {
    switch (category) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'followup':
        return 'bg-yellow-100 text-yellow-800';
      case 'task':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Handover Notes</h3>
        
        <div className="mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a handover note..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="flex justify-between mt-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as HandoverNote['category'])}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="followup">Follow-up</option>
              <option value="task">Task</option>
            </select>
            <button
              onClick={() => addNoteMutation.mutate({ content: newNote, category: selectedCategory })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={!newNote.trim()}
            >
              Add Note
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {handoverNotes?.map((note) => (
            <div key={note.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{note.authorName}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getCategoryStyle(
                      note.category
                    )}`}
                  >
                    {note.category}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(note.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              {note.attachments && note.attachments.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {note.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      className="text-blue-600 hover:underline text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attachment.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tasks</h3>
        <div className="space-y-4">
          {tasks?.map((task) => (
            <div key={task.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={(e) =>
                    updateTaskMutation.mutate({
                      id: task.id,
                      status: e.target.checked ? 'completed' : 'pending',
                    })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {task.assignedTo && <span>Assigned to: {task.assignedTo}</span>}
                    {task.dueDate && (
                      <span className="ml-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
