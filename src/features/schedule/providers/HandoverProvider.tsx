/**
 * @writecarenotes.com
 * @fileoverview Provider component for handover context
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Provider component that manages handover context and state,
 * making it available to all child components.
 */

import { createContext, useContext, ReactNode } from 'react';
import { useHandover } from '../hooks/useHandover';
import type { HandoverSession } from '../types/handover';

interface HandoverContextType {
  session: HandoverSession | null;
  updateSession: (session: HandoverSession) => void;
  addNote: (note: any) => void;
  updateNote: (noteId: string, content: string) => void;
  addAttachment: (file: File, type: string) => void;
  removeAttachment: (attachmentId: string) => void;
  addTask: (task: any) => void;
  updateTask: (task: any) => void;
  updateQuality: (score: number) => void;
}

const HandoverContext = createContext<HandoverContextType | null>(null);

export const useHandoverContext = () => {
  const context = useContext(HandoverContext);
  if (!context) {
    throw new Error('useHandoverContext must be used within a HandoverProvider');
  }
  return context;
};

interface HandoverProviderProps {
  children: ReactNode;
}

export const HandoverProvider = ({ children }: HandoverProviderProps) => {
  const handover = useHandover();

  return (
    <HandoverContext.Provider value={handover}>
      {children}
    </HandoverContext.Provider>
  );
}; 