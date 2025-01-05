/**
 * @writecarenotes.com
 * @fileoverview Metrics Collector Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for collecting and managing metrics across medication services,
 * providing monitoring and analytics capabilities.
 */

export interface MetricsCollector {
  incrementSuccess(operation: string): void;
  incrementError(operation: string): void;
  recordTiming(operation: string, duration: number): void;
  recordValue(metric: string, value: number): void;
  getMetrics(): ServiceMetrics;
}

export interface ServiceMetrics {
  operations: {
    [key: string]: {
      success: number;
      errors: number;
      averageTime?: number;
    };
  };
  values: {
    [key: string]: number[];
  };
  timestamp: Date;
}

class MetricsCollectorImpl implements MetricsCollector {
  private serviceName: string;
  private metrics: ServiceMetrics;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.metrics = {
      operations: {},
      values: {},
      timestamp: new Date()
    };
  }

  incrementSuccess(operation: string): void {
    if (!this.metrics.operations[operation]) {
      this.metrics.operations[operation] = {
        success: 0,
        errors: 0
      };
    }
    this.metrics.operations[operation].success++;
    this.updateTimestamp();
  }

  incrementError(operation: string): void {
    if (!this.metrics.operations[operation]) {
      this.metrics.operations[operation] = {
        success: 0,
        errors: 0
      };
    }
    this.metrics.operations[operation].errors++;
    this.updateTimestamp();
  }

  recordTiming(operation: string, duration: number): void {
    if (!this.metrics.operations[operation]) {
      this.metrics.operations[operation] = {
        success: 0,
        errors: 0,
        averageTime: duration
      };
      return;
    }

    const current = this.metrics.operations[operation];
    const totalOperations = current.success + current.errors;
    const currentAverage = current.averageTime || 0;
    
    current.averageTime = (currentAverage * totalOperations + duration) / (totalOperations + 1);
    this.updateTimestamp();
  }

  recordValue(metric: string, value: number): void {
    if (!this.metrics.values[metric]) {
      this.metrics.values[metric] = [];
    }
    this.metrics.values[metric].push(value);
    this.updateTimestamp();
  }

  getMetrics(): ServiceMetrics {
    return {
      ...this.metrics,
      timestamp: new Date()
    };
  }

  private updateTimestamp(): void {
    this.metrics.timestamp = new Date();
  }
}

export function createMetricsCollector(serviceName: string): MetricsCollector {
  return new MetricsCollectorImpl(serviceName);
}

// Common metric names
export const MetricNames = {
  // Administration metrics
  ROUND_COMPLETION_TIME: 'round_completion_time',
  ADMINISTRATION_SUCCESS_RATE: 'administration_success_rate',
  PRN_ADMINISTRATION_RATE: 'prn_administration_rate',
  MEDICATION_ERRORS: 'medication_errors',
  MISSED_DOSES: 'missed_doses',
  REFUSED_DOSES: 'refused_doses',

  // Stock metrics
  STOCK_ACCURACY: 'stock_accuracy',
  REORDER_RATE: 'reorder_rate',
  WASTAGE_RATE: 'wastage_rate',
  EXPIRY_RATE: 'expiry_rate',
  STOCK_OUTS: 'stock_outs',

  // Compliance metrics
  COMPLIANCE_RATE: 'compliance_rate',
  AUDIT_FINDINGS: 'audit_findings',
  DOCUMENTATION_COMPLETENESS: 'documentation_completeness',
  CONTROLLED_DRUGS_COMPLIANCE: 'controlled_drugs_compliance',
  COVERT_ADMIN_COMPLIANCE: 'covert_admin_compliance',

  // Staff metrics
  STAFF_COMPETENCY: 'staff_competency',
  TRAINING_COMPLETION: 'training_completion',
  WITNESS_AVAILABILITY: 'witness_availability',
  STAFF_ERRORS: 'staff_errors',

  // System metrics
  SYSTEM_AVAILABILITY: 'system_availability',
  API_RESPONSE_TIME: 'api_response_time',
  OFFLINE_SYNC_SUCCESS: 'offline_sync_success',
  DATA_INTEGRITY: 'data_integrity'
} as const;

// Operation names
export const OperationNames = {
  // Administration operations
  START_ROUND: 'start_round',
  COMPLETE_ROUND: 'complete_round',
  RECORD_ADMINISTRATION: 'record_administration',
  RECORD_PRN: 'record_prn',
  VALIDATE_ADMINISTRATION: 'validate_administration',

  // Stock operations
  CHECK_STOCK: 'check_stock',
  UPDATE_STOCK: 'update_stock',
  PROCESS_REORDER: 'process_reorder',
  RECORD_WASTAGE: 'record_wastage',
  MANAGE_EXPIRY: 'manage_expiry',

  // Compliance operations
  PERFORM_AUDIT: 'perform_audit',
  CHECK_COMPLIANCE: 'check_compliance',
  GENERATE_REPORT: 'generate_report',
  TRACK_REGULATIONS: 'track_regulations',
  PREPARE_INSPECTION: 'prepare_inspection',

  // Integration operations
  BNF_API_CALL: 'bnf_api_call',
  NICE_API_CALL: 'nice_api_call',
  SYNC_DATA: 'sync_data',
  PROCESS_OFFLINE: 'process_offline'
} as const;


