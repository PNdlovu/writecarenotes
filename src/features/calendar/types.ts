export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'appointment' | 'activity' | 'medication' | 'assessment';
  description?: string;
  residentId?: string;
  residentName?: string;
  staffId?: string;
  staffName?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  date: string;
  type: CalendarEvent['type'];
  description?: string;
  residentId?: string;
  staffId?: string;
}
