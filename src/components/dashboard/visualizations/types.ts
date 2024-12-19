import { BadgeProps } from '@/components/ui/badge'

export interface AuditLog {
  timestamp: Date
  action: string
  userId: string
  details: Record<string, any>
  ipAddress?: string
}

export interface AccessControl {
  roles: string[]
  permissions: string[]
  region?: string
  facility?: string
}

export interface DataValidation {
  schema: Record<string, any>
  version: string
  lastValidated?: Date
}

export interface CacheConfig {
  ttl: number
  strategy: 'memory' | 'persistent'
  version?: string
}

export interface OfflineConfig {
  syncStrategy: 'immediate' | 'periodic' | 'manual'
  lastSync?: Date
  pendingChanges?: number
}

export interface LocaleConfig {
  language: string
  region: string
  currency: string
  timezone: string
}

export interface MetricData {
  id: string
  name: string
  value: number
  status: string
  description?: string
  trend?: number
  target?: number
  validation?: DataValidation
  audit?: AuditLog[]
  cache?: CacheConfig
}

export interface ComplianceData {
  id: string
  status: string
  lastCheck: Date
  nextReview: Date
  issues: string[]
  requirements: {
    id: string
    name: string
    status: string
    description: string
    dueDate: Date
    assignedTo?: string[]
    priority: 'high' | 'medium' | 'low'
    evidence?: string[]
    audit?: AuditLog[]
  }[]
  validation?: DataValidation
  access?: AccessControl
  audit?: AuditLog[]
}

export interface PerformanceData {
  id: string
  staffingRatio: number
  qualityScore: number
  avgResponseTime: number
  targetResponseTime: number
  metrics: MetricData[]
  trends?: {
    period: string
    values: number[]
  }[]
  validation?: DataValidation
  access?: AccessControl
  audit?: AuditLog[]
}

export interface RegionData {
  id: string
  name: string
  code: string
  performance: number
  metrics: {
    id: string
    category: string
    value: number
    trend?: number
    validation?: DataValidation
  }[]
  locale: LocaleConfig
  access?: AccessControl
  audit?: AuditLog[]
}

export type BadgeVariant = NonNullable<BadgeProps['variant']>

export interface ChartProps {
  data: any
  isLoading?: boolean
  error?: Error
  onDrillDown?: (config: DrillDownConfig) => Promise<void>
  onExport?: (options: ExportOptions) => Promise<void>
  onError?: (error: Error) => void
  access?: AccessControl
  locale?: LocaleConfig
  offline?: OfflineConfig
  validation?: DataValidation
  cache?: CacheConfig
}

export interface DrillDownConfig {
  enabled: boolean
  level: number
  path: string[]
  filters: Record<string, any>
  access?: AccessControl
  audit?: AuditLog
}

export interface ExportOptions {
  format: 'xlsx' | 'pdf' | 'json'
  dateRange: {
    start: Date
    end: Date
  }
  metrics: string[]
  includeAnalytics: boolean
  access?: AccessControl
  audit?: AuditLog
  encryption?: {
    enabled: boolean
    method: string
    keyId?: string
  }
}

export interface ErrorConfig {
  retry?: {
    count: number
    delay: number
  }
  fallback?: React.ReactNode
  reporting?: {
    service: string
    level: 'info' | 'warning' | 'error'
    tags?: Record<string, string>
  }
}

export interface PerformanceMetrics {
  renderTime: number
  dataSize: number
  cacheHits: number
  apiLatency: number
  memoryUsage?: number
}

export interface ChartConfig {
  title: string;
  region: 'UK' | 'IE' | 'ALL';
  type: 'bar' | 'line' | 'pie' | 'radar';
  compliance?: boolean;
  darkMode?: boolean;
  accessibility?: {
    announceData?: boolean;
    keyboardNavigation?: boolean;
    highContrast?: boolean;
  };
}

export interface RegionalData {
  region: string;
  metrics: {
    compliance: number;
    incidents: number;
    satisfaction: number;
    staffing: number;
  };
  lastUpdated: Date;
}

export interface ComplianceMetrics {
  cqc?: number;
  ciw?: number;
  rqia?: number;
  careInspectorate?: number;
  hiqa?: number;
}

export interface OfstedRating {
  overall: 1 | 2 | 3 | 4; // 1: Outstanding, 2: Good, 3: Requires Improvement, 4: Inadequate
  categories: {
    effectiveness: 1 | 2 | 3 | 4;
    leadership: 1 | 2 | 3 | 4;
    care: 1 | 2 | 3 | 4;
    responsiveness: 1 | 2 | 3 | 4;
    safety: 1 | 2 | 3 | 4;
  };
  lastInspection: Date;
  nextInspectionDue?: Date;
  improvementActions?: string[];
}

export interface OfstedMetrics {
  currentRating: OfstedRating;
  historicalRatings: {
    date: Date;
    rating: OfstedRating;
  }[];
  complianceStatus: {
    policies: boolean;
    training: boolean;
    safeguarding: boolean;
    staffing: boolean;
  };
}

// Add other shared interfaces... 


