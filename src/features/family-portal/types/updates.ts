export interface ResidentUpdate {
  id: string;
  residentId: string;
  type: UpdateType;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  attachments?: Attachment[];
  priority: UpdatePriority;
  status: 'UNREAD' | 'READ' | 'ACKNOWLEDGED';
  acknowledgement?: {
    by: string;
    at: Date;
    comments?: string;
  };
}

export type UpdateType =
  | 'HEALTH'           // Health-related updates
  | 'ACTIVITY'         // Activity participation
  | 'WELLBEING'        // General wellbeing
  | 'MEDICATION'       // Medication changes
  | 'INCIDENT'         // Incidents or accidents
  | 'ACHIEVEMENT'      // Personal achievements
  | 'SOCIAL'           // Social interactions
  | 'APPOINTMENT'      // Upcoming appointments
  | 'GENERAL';         // General updates

export type UpdatePriority = 
  | 'URGENT'           // Requires immediate attention
  | 'HIGH'             // Important but not urgent
  | 'NORMAL'           // Regular updates
  | 'LOW';             // Informational updates

export interface Attachment {
  id: string;
  type: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    thumbnail?: string;
  };
}


