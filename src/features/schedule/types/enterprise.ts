import { Employee } from '../../../types/employee';
import { Shift } from '../../../types/schedule';

// Shift Bidding
export interface ShiftBid {
  id: string;
  shiftId: string;
  employeeId: string;
  bidStatus: 'pending' | 'approved' | 'rejected';
  priority: number;
  timestamp: string;
  notes?: string;
}

// Resource Management
export interface Resource {
  id: string;
  name: string;
  type: 'room' | 'equipment' | 'vehicle' | 'other';
  capacity?: number;
  availability: ResourceAvailability[];
  requirements?: string[];
}

export interface ResourceAvailability {
  id: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
}

// Workforce Optimization
export interface OptimizationRule {
  id: string;
  name: string;
  type: 'cost' | 'coverage' | 'preference' | 'skill';
  priority: number;
  conditions: Record<string, any>;
  weight: number;
}

export interface DemandForecast {
  id: string;
  date: string;
  hour: number;
  predictedDemand: number;
  confidence: number;
  factors: Record<string, number>;
}

// Team Management
export interface TeamCapacity {
  id: string;
  teamId: string;
  date: string;
  requiredHeadcount: number;
  actualHeadcount: number;
  skills: Record<string, number>;
}

// Communication
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender: string;
  timestamp: string;
  targetAudience: string[];
  expiresAt?: string;
}

export interface ShiftHandover {
  id: string;
  shiftId: string;
  fromEmployee: string;
  toEmployee: string;
  notes: string;
  tasks: HandoverTask[];
  timestamp: string;
}

export interface HandoverTask {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

// Schedule Templates
export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  pattern: RecurrencePattern;
  shifts: TemplateShift[];
  rules: OptimizationRule[];
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  exceptions?: string[];
  endDate?: string;
}

export interface TemplateShift extends Omit<Shift, 'id' | 'date'> {
  templateId: string;
  position: number;
}

// Payroll Integration
export interface PayrollRule {
  id: string;
  name: string;
  type: 'overtime' | 'differential' | 'premium' | 'allowance';
  conditions: PayrollCondition[];
  calculation: PayrollCalculation;
}

export interface PayrollCondition {
  type: 'time' | 'day' | 'location' | 'role' | 'custom';
  operator: 'equals' | 'greater' | 'less' | 'between' | 'in';
  value: any;
}

export interface PayrollCalculation {
  type: 'fixed' | 'multiplier' | 'formula';
  value: number | string;
  currency?: string;
}

// Reports
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'schedule' | 'attendance' | 'payroll' | 'compliance' | 'custom';
  filters: ReportFilter[];
  columns: ReportColumn[];
  schedule?: ReportSchedule;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
}

export interface ReportColumn {
  field: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  format?: string;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}
