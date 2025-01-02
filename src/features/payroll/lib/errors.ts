export class PayrollError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'PayrollError';
  }
}

export class PayrollCalculationError extends PayrollError {
  constructor(message: string, public readonly details: Record<string, any>) {
    super(message, 'PAYROLL_CALCULATION_ERROR');
    this.name = 'PayrollCalculationError';
  }
}

export class RegionalConfigError extends PayrollError {
  constructor(message: string, public readonly region: string) {
    super(message, 'REGIONAL_CONFIG_ERROR');
    this.name = 'RegionalConfigError';
  }
}

export class OfflineSyncError extends PayrollError {
  constructor(message: string, public readonly changeId?: string) {
    super(message, 'OFFLINE_SYNC_ERROR');
    this.name = 'OfflineSyncError';
  }
}

export class ValidationError extends PayrollError {
  constructor(message: string, public readonly validationErrors: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
