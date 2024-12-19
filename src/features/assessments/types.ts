export interface Assessment {
  id: string;
  residentId: string;
  residentName: string;
  type: string;
  date: string;
  assessor: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentFilters {
  search?: string;
  category?: string;
  status?: Assessment['status'];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CreateAssessmentData {
  residentId: string;
  type: string;
  date: string;
  assessor: string;
  notes?: string;
}
