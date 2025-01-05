import { z } from 'zod';

// Shared enums
export const ComplianceRegion = z.enum(['england', 'wales', 'scotland', 'northern_ireland', 'ireland']);
export const ComplianceStatus = z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'IN_PROGRESS']);
export const DocumentStatus = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'EXPIRED']);
export const ComplianceCategory = z.enum(['SAFETY', 'CARE', 'STAFFING', 'LEADERSHIP', 'EFFECTIVENESS', 'RESPONSIVENESS']);
export const DocumentType = z.enum(['POLICY', 'PROCEDURE', 'ASSESSMENT', 'REPORT', 'CERTIFICATE', 'TRAINING']);

// Shared refinements
const futureDate = z.date().refine(date => date > new Date(), {
  message: 'Date must be in the future'
});

const validDateRange = z.object({
  validFrom: z.date(),
  validUntil: z.date()
}).refine(data => data.validUntil > data.validFrom, {
  message: 'Valid until date must be after valid from date'
});

const maxFileSize = 10 * 1024 * 1024; // 10MB
const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Stats endpoint schemas
export const statsQuerySchema = z.object({
  region: ComplianceRegion
});

export const statsResponseSchema = z.object({
  overallCompliance: z.number().min(0).max(100),
  totalRequirements: z.number().min(0),
  completedRequirements: z.number().min(0),
  overdueRequirements: z.number().min(0),
  upcomingDeadlines: z.number().min(0),
  recentSubmissions: z.number().min(0),
  complianceTrend: z.enum(['up', 'down', 'stable']),
  categoryScores: z.record(z.number().min(0).max(100))
}).refine(data => data.completedRequirements <= data.totalRequirements, {
  message: 'Completed requirements cannot exceed total requirements'
});

// Requirements endpoint schemas
export const requirementsQuerySchema = z.object({
  region: ComplianceRegion,
  category: ComplianceCategory.optional(),
  search: z.string().max(100).optional()
});

export const requirementSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: ComplianceCategory,
  status: ComplianceStatus.default('PENDING'),
  dueDate: futureDate.optional(),
  evidence: z.array(z.string().url()).max(10).optional(),
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  metadata: z.record(z.any()).optional()
}).refine(data => {
  if (data.status === 'COMPLIANT' && !data.evidence?.length) {
    return false;
  }
  return true;
}, {
  message: 'Compliant requirements must have evidence'
});

export const createRequirementSchema = z.object({
  region: ComplianceRegion,
  requirement: requirementSchema
});

export const updateRequirementSchema = z.object({
  id: z.string().uuid(),
  updates: requirementSchema.partial()
});

// Documents endpoint schemas
export const documentsQuerySchema = z.object({
  region: ComplianceRegion,
  category: ComplianceCategory.optional(),
  type: DocumentType.optional(),
  status: DocumentStatus.optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional()
}).refine(data => {
  if (data.fromDate && data.toDate) {
    return data.toDate > data.fromDate;
  }
  return true;
}, {
  message: 'To date must be after from date'
});

export const documentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: ComplianceCategory,
  type: DocumentType,
  status: DocumentStatus.default('DRAFT'),
  validFrom: z.date(),
  validUntil: z.date(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format'),
  metadata: z.record(z.any()).optional()
}).merge(validDateRange);

export const createDocumentSchema = z.object({
  document: documentSchema,
  file: z.custom<File>((file) => file instanceof File, 'Must be a file')
    .refine((file) => file.size <= maxFileSize, `File size must be less than ${maxFileSize / 1024 / 1024}MB`)
    .refine((file) => allowedFileTypes.includes(file.type), `File type must be one of: ${allowedFileTypes.join(', ')}`)
});

export const updateDocumentSchema = z.object({
  id: z.string().uuid(),
  updates: documentSchema.partial()
});

// Deadlines endpoint schemas
export const deadlinesQuerySchema = z.object({
  region: ComplianceRegion,
  timeframe: z.enum(['7days', '30days', '90days', 'all']).default('30days'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: ComplianceCategory.optional()
});

export const deadlineSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  dueDate: futureDate,
  status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE', 'IN_PROGRESS']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  category: ComplianceCategory,
  assignedTo: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  reminderDays: z.number().min(1).max(30).optional()
}).refine(data => {
  if (data.status === 'COMPLETED' && data.dueDate > new Date()) {
    return false;
  }
  return true;
}, {
  message: 'Cannot mark future deadlines as completed'
});

export const updateDeadlineSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE', 'IN_PROGRESS']).optional(),
  newDate: futureDate.optional()
}).refine(data => data.status || data.newDate, {
  message: 'Either status or newDate must be provided'
}).refine(data => {
  if (data.status === 'COMPLETED' && !data.newDate) {
    return new Date() <= new Date();
  }
  return true;
}, {
  message: 'Cannot mark future deadlines as completed'
});

// Error response schema
export const errorResponseSchema = z.object({
  message: z.string(),
  code: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.date().default(() => new Date()),
  path: z.string().optional(),
  requestId: z.string().uuid().optional()
}); 


