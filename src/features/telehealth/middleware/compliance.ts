import { Request, Response, NextFunction } from 'express';
import { TelehealthError } from '../errors/TelehealthError';

interface ComplianceConfig {
  region: string;
  requirements: {
    dataRetention: number; // in days
    encryption: boolean;
    auditLogging: boolean;
    gdpr: boolean;
    hipaa: boolean;
  };
  regulatoryBody: string;
}

const complianceConfigs: Record<string, ComplianceConfig> = {
  UK_CQC: {
    region: 'UK_CQC',
    requirements: {
      dataRetention: 365 * 7, // 7 years
      encryption: true,
      auditLogging: true,
      gdpr: true,
      hipaa: false
    },
    regulatoryBody: 'Care Quality Commission'
  },
  UK_OFSTED: {
    region: 'UK_OFSTED',
    requirements: {
      dataRetention: 365 * 3, // 3 years
      encryption: true,
      auditLogging: true,
      gdpr: true,
      hipaa: false
    },
    regulatoryBody: 'Ofsted'
  },
  UK_CIW: {
    region: 'UK_CIW',
    requirements: {
      dataRetention: 365 * 5, // 5 years
      encryption: true,
      auditLogging: true,
      gdpr: true,
      hipaa: false
    },
    regulatoryBody: 'Care Inspectorate Wales'
  },
  IE_HIQA: {
    region: 'IE_HIQA',
    requirements: {
      dataRetention: 365 * 6, // 6 years
      encryption: true,
      auditLogging: true,
      gdpr: true,
      hipaa: false
    },
    regulatoryBody: 'Health Information and Quality Authority'
  }
};

export function complianceMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const region = req.user?.region;
      if (!region) {
        throw new TelehealthError('Region context required', 400);
      }

      const config = complianceConfigs[region];
      if (!config) {
        throw new TelehealthError(`Unsupported region: ${region}`, 400);
      }

      // Add compliance headers
      res.set({
        'X-Regulatory-Body': config.regulatoryBody,
        'X-Data-Retention-Days': config.requirements.dataRetention.toString(),
        'X-GDPR-Compliant': config.requirements.gdpr.toString(),
        'X-Encryption-Required': config.requirements.encryption.toString()
      });

      // Add compliance context to request
      req.compliance = {
        region,
        config,
        timestamp: new Date().toISOString()
      };

      // Log compliance check
      await logComplianceCheck({
        region,
        endpoint: req.path,
        method: req.method,
        userId: req.user.id,
        organizationId: req.user.organizationId,
        timestamp: new Date()
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

async function logComplianceCheck(data: {
  region: string;
  endpoint: string;
  method: string;
  userId: string;
  organizationId: string;
  timestamp: Date;
}) {
  // Implementation will depend on your audit logging system
  console.log('Compliance check:', data);
} 