/**
 * @writecarenotes.com
 * @fileoverview Hook for managing handover sessions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing handover sessions, including state management
 * and operations for notes, tasks, attachments, and quality metrics.
 */

import { useState, useCallback } from 'react';
import type { 
  HandoverSession, 
  HandoverNote, 
  HandoverTask,
  HandoverAttachment,
  AttachmentType
} from '../types/handover';

export const useHandover = () => {
  const [session, setSession] = useState<HandoverSession | null>(null);

  const updateSession = useCallback((updatedSession: HandoverSession) => {
    setSession(updatedSession);
  }, []);

  const addNote = useCallback((note: Omit<HandoverNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!session) return;
    
    const newNote: HandoverNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notes: [...(prev.notes || []), newNote]
      };
    });
  }, [session]);

  const updateNote = useCallback((noteId: string, content: string) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notes: prev.notes?.map(note => 
          note.id === noteId 
            ? { ...note, content, updatedAt: new Date() }
            : note
        ) || []
      };
    });
  }, [session]);

  const addAttachment = useCallback((file: File, type: AttachmentType) => {
    if (!session) return;

    const newAttachment: HandoverAttachment = {
      id: crypto.randomUUID(),
      handoverSessionId: session.id,
      type,
      filename: file.name,
      url: URL.createObjectURL(file),
      uploadedBy: { id: 'current-user', name: 'Current User' }, // TODO: Get from auth context
      uploadedById: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      };
    });
  }, [session]);

  const removeAttachment = useCallback((attachmentId: string) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        attachments: prev.attachments?.filter(att => att.id !== attachmentId) || []
      };
    });
  }, [session]);

  const addTask = useCallback((task: Partial<HandoverTask>) => {
    if (!session) return;

    const newTask: HandoverTask = {
      id: crypto.randomUUID(),
      handoverSessionId: session.id,
      title: task.title || '',
      status: 'PENDING',
      category: task.category || 'OTHER',
      priority: task.priority || 'MEDIUM',
      createdById: 'current-user',
      createdBy: { id: 'current-user', name: 'Current User' }, // TODO: Get from auth context
      createdAt: new Date(),
      updatedAt: new Date(),
      ...task
    };

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: [...(prev.tasks || []), newTask]
      };
    });
  }, [session]);

  const updateTask = useCallback((updatedTask: Partial<HandoverTask> & { id: string }) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks?.map(task => 
          task.id === updatedTask.id 
            ? { ...task, ...updatedTask, updatedAt: new Date() }
            : task
        ) || []
      };
    });
  }, [session]);

  const updateQuality = useCallback((qualityScore: number) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        qualityScore,
        updatedAt: new Date()
      };
    });
  }, [session]);

  return {
    session,
    updateSession,
    addNote,
    updateNote,
    addAttachment,
    removeAttachment,
    addTask,
    updateTask,
    updateQuality
  };
}; 