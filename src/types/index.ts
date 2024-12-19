export interface Activity {
  id: string;
  carehomeId: string;
  organizationId: string;
  type: 'update' | 'create' | 'delete' | 'login' | 'compliance';
  category: 'care' | 'medication' | 'staff' | 'resident' | 'system';
  severity: 'info' | 'warning' | 'error';
  action: string;
  timestamp: Date;
  user: {
    name: string;
    role: string;
  };
  details?: Record<string, any>;
}

export interface QuickStat {
  id: string;
  carehomeId: string;
  organizationId: string;
  label: string;
  value: number;
  change: number;
  icon: string;
}

export interface Task {
  id: string;
  carehomeId: string;
  organizationId: string;
  title: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string[];
  status: string;
}

export * from './carehome';
export * from './core';
export * from './analytics';
export * from './department';
export * from './floorPlan';
export * from './activities';
export * from './scheduling';
export * from './staff';


