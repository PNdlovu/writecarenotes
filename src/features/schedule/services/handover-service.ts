import { HandoverNote, HandoverSession, HandoverTask, HandoverAttachment, ComplianceStatus } from '../types/handover';

class HandoverService {
  private readonly baseUrl = '/api/organizations/[id]/care-homes/[careHomeId]/handovers';

  // Session Management
  async getCurrentHandoverSession(): Promise<HandoverSession | null> {
    const response = await fetch(`${this.baseUrl}/current`);
    if (!response.ok) {
      throw new Error('Failed to fetch current handover session');
    }
    return response.json();
  }

  async startHandoverSession(shiftId: string): Promise<HandoverSession> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId }),
    });
    if (!response.ok) {
      throw new Error('Failed to start handover session');
    }
    return response.json();
  }

  async updateHandoverSession(
    sessionId: string, 
    updates: Partial<HandoverSession>
  ): Promise<HandoverSession> {
    const response = await fetch(`${this.baseUrl}/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update handover session');
    }
    return response.json();
  }

  async completeHandoverSession(
    sessionId: string, 
    data: Partial<HandoverSession>
  ): Promise<HandoverSession> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to complete handover session');
    }
    return response.json();
  }

  // Notes Management
  async getHandoverNotes(sessionId: string): Promise<HandoverNote[]> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/notes`);
    if (!response.ok) {
      throw new Error('Failed to fetch handover notes');
    }
    return response.json();
  }

  async addHandoverNote(
    sessionId: string, 
    note: Omit<HandoverNote, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<HandoverNote> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to add handover note');
    }
    return response.json();
  }

  async updateHandoverNote(
    sessionId: string, 
    noteId: string, 
    note: Partial<HandoverNote>
  ): Promise<HandoverNote> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to update handover note');
    }
    return response.json();
  }

  // Task Management
  async getHandoverTasks(sessionId: string): Promise<HandoverTask[]> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch handover tasks');
    }
    return response.json();
  }

  async addTask(
    sessionId: string, 
    task: Omit<HandoverTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<HandoverTask> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to add task');
    }
    return response.json();
  }

  async updateTask(
    sessionId: string, 
    taskId: string, 
    task: Partial<HandoverTask>
  ): Promise<HandoverTask> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  }

  // Attachment Management
  async getAttachments(sessionId: string): Promise<HandoverAttachment[]> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/attachments`);
    if (!response.ok) {
      throw new Error('Failed to fetch attachments');
    }
    return response.json();
  }

  async uploadAttachment(
    sessionId: string,
    file: File,
    type: 'DOCUMENT' | 'IMAGE' | 'VOICE' | 'OTHER',
    noteId?: string
  ): Promise<HandoverAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (noteId) {
      formData.append('noteId', noteId);
    }

    const response = await fetch(`${this.baseUrl}/${sessionId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload attachment');
    }
    return response.json();
  }

  async deleteAttachment(sessionId: string, attachmentId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/${sessionId}/attachments/${attachmentId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete attachment');
    }
  }

  // Quality & Compliance
  async updateQuality(
    sessionId: string,
    updates: {
      qualityScore?: number;
      complianceStatus?: ComplianceStatus;
    }
  ): Promise<HandoverSession> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/quality`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update quality metrics');
    }
    return response.json();
  }

  // Staff Management
  async updateStaff(
    sessionId: string,
    updates: {
      outgoingStaffIds: string[];
      incomingStaffIds: string[];
    }
  ): Promise<HandoverSession> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/staff`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update staff');
    }
    return response.json();
  }
}

export const handoverService = new HandoverService();
