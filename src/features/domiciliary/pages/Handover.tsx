/**
 * @writecarenotes.com
 * @fileoverview Handover system for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handover interface for domiciliary care services.
 * Integrates with existing handover module to provide comprehensive
 * shift handovers, task tracking, and care continuity.
 */

import { useHandover } from '@/features/schedule/hooks/useHandover';
import { HandoverProvider } from '@/features/schedule/providers/HandoverProvider';
import { HandoverSession } from '@/features/schedule/components/collaboration/HandoverSession';
import { HandoverNotes } from '@/features/schedule/components/collaboration/HandoverNotes';
import { HandoverStaff } from '@/features/schedule/components/collaboration/HandoverStaff';
import { HandoverQuality } from '@/features/schedule/components/collaboration/HandoverQuality';
import { HandoverAttachments } from '@/features/schedule/components/collaboration/HandoverAttachments';
import { CareTaskCard } from '@/features/schedule/components/collaboration/CareTaskCard';
import { CareTaskForm } from '@/features/schedule/components/collaboration/CareTaskForm';
import type { HandoverSession as HandoverSessionType } from '@/features/schedule/types/handover';

export const HandoverSystem = () => {
  const { 
    session, 
    updateSession,
    addNote,
    updateNote,
    addAttachment,
    removeAttachment,
    addTask,
    updateTask,
    updateQuality
  } = useHandover();

  if (!session) {
    return null;
  }

  return (
    <HandoverProvider>
      <div className="space-y-4 p-4 md:p-6">
        <HandoverSession
          session={session}
          onUpdate={updateSession}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <HandoverNotes 
              sessionId={session.id}
              notes={session.notes ?? []}
              onAddNote={addNote}
              onUpdateNote={updateNote}
            />
            <HandoverStaff 
              outgoingStaff={session.outgoingStaff ?? []}
              incomingStaff={session.incomingStaff ?? []}
              onUpdateStaff={updateTask}
            />
            {session.tasks?.map(task => (
              <CareTaskCard 
                key={task.id}
                task={task}
                onStatusChange={(status) => updateTask({ ...task, status })}
                onAddNote={() => {}}
                onViewHistory={() => {}}
              />
            ))}
          </div>
          
          <div className="lg:col-span-4 space-y-4">
            <HandoverQuality 
              session={session}
              onUpdateQuality={updateQuality}
            />
            <HandoverAttachments 
              sessionId={session.id}
              attachments={session.attachments ?? []}
              onAddAttachment={addAttachment}
              onRemoveAttachment={removeAttachment}
            />
            <CareTaskForm 
              residents={session.residents}
              staff={session.staff}
              onCreateTask={addTask}
            />
          </div>
        </div>
      </div>
    </HandoverProvider>
  );
}; 