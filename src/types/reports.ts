export interface TimeDistribution {
  hour: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface MedicationCount {
  name: string;
  count: number;
}

export interface DailyTrend {
  date: string;
  total: number;
  missed: number;
  late: number;
  compliance: number;
}

export interface BaseMetrics {
  totalAdministrations: number;
  complianceRate: number;
  missedDoses: number;
  lateDoses: number;
  administrationsByTime: TimeDistribution[];
  administrationsByStatus: StatusDistribution[];
  topMedications: MedicationCount[];
  dailyTrend: DailyTrend[];
}

export interface InventoryMetrics {
  inventoryValue: number;
  expiringItems: number;
  lowStockItems: number;
}

export interface MedicationSafetyMetrics {
  doubleSignatureCompliance: number;
  controlledSubstanceAudit: {
    total: number;
    discrepancies: number;
    resolved: number;
  };
  prnAdministrations: {
    total: number;
    documented: number;
    effectiveness: number;
  };
  allergyAlerts: {
    triggered: number;
    acknowledged: number;
  };
}

export interface RegulatoryCompliance {
  incidentReports: {
    total: number;
    severity: Record<string, number>;
    status: Record<string, number>;
  };
  auditTrail: {
    modifications: number;
    signatures: number;
    overrides: number;
  };
  staffQualifications: {
    current: number;
    expired: number;
    expiringSoon: number;
  };
}

export interface ReportMetrics extends BaseMetrics {
  comparison?: BaseMetrics;
  safety?: MedicationSafetyMetrics;
  compliance?: RegulatoryCompliance;
  inventoryValue?: number;
  expiringItems?: number;
  lowStockItems?: number;
}

export type ReportType = "summary" | "inventory" | "comparative" | "daily";

export interface ReportError {
  message: string;
  code?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}


