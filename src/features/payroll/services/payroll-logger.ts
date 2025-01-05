import { Logger } from '@/lib/logging';
import { TenantContext } from '@/lib/multi-tenant/types';

export class PayrollLogger {
  private readonly logger: Logger;
  private readonly tenantId: string;

  constructor(tenantContext: TenantContext) {
    this.logger = new Logger('PayrollService');
    this.tenantId = tenantContext.tenant.id;
  }

  info(message: string, metadata: Record<string, any> = {}) {
    this.logger.info(message, {
      ...metadata,
      tenantId: this.tenantId,
      service: 'payroll'
    });
  }

  error(message: string, error: Error, metadata: Record<string, any> = {}) {
    this.logger.error(message, {
      ...metadata,
      tenantId: this.tenantId,
      service: 'payroll',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
  }

  warn(message: string, metadata: Record<string, any> = {}) {
    this.logger.warn(message, {
      ...metadata,
      tenantId: this.tenantId,
      service: 'payroll'
    });
  }

  audit(action: string, metadata: Record<string, any> = {}) {
    this.logger.info(`Audit: ${action}`, {
      ...metadata,
      tenantId: this.tenantId,
      service: 'payroll',
      auditType: 'payroll',
      timestamp: new Date().toISOString()
    });
  }
}
