/**
 * @writecarenotes.com
 * @fileoverview Regional Compliance Middleware for On-Call Phone System
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Middleware for handling regional compliance requirements across
 * different regulatory frameworks in the UK and Ireland.
 */

import { Request, Response, NextFunction } from 'express';
import { Region, RegionalCompliance, APIError } from '../types';

// Regional compliance requirements
const COMPLIANCE_REQUIREMENTS: Record<Region, RegionalCompliance> = {
    england: {
        region: 'england',
        requirements: {
            callRecording: true,
            staffQualifications: true,
            languageSupport: true,
            dataProtection: true
        },
        documentation: {
            format: ['pdf', 'docx'],
            language: ['english'],
            retention: 2555 // 7 years in days
        },
        emergencyProtocols: {
            responseTime: 15,
            escalationPath: ['primary', 'backup', 'emergency']
        }
    },
    wales: {
        region: 'wales',
        requirements: {
            callRecording: true,
            staffQualifications: true,
            languageSupport: true,
            dataProtection: true
        },
        documentation: {
            format: ['pdf', 'docx'],
            language: ['english', 'welsh'],
            retention: 2555
        },
        emergencyProtocols: {
            responseTime: 15,
            escalationPath: ['primary', 'backup', 'emergency']
        }
    },
    scotland: {
        region: 'scotland',
        requirements: {
            callRecording: true,
            staffQualifications: true,
            languageSupport: true,
            dataProtection: true
        },
        documentation: {
            format: ['pdf', 'docx'],
            language: ['english', 'gaelic'],
            retention: 2555
        },
        emergencyProtocols: {
            responseTime: 15,
            escalationPath: ['primary', 'backup', 'emergency']
        }
    },
    northernIreland: {
        region: 'northernIreland',
        requirements: {
            callRecording: true,
            staffQualifications: true,
            languageSupport: true,
            dataProtection: true
        },
        documentation: {
            format: ['pdf', 'docx'],
            language: ['english', 'irish'],
            retention: 2555
        },
        emergencyProtocols: {
            responseTime: 15,
            escalationPath: ['primary', 'backup', 'emergency']
        }
    },
    ireland: {
        region: 'ireland',
        requirements: {
            callRecording: true,
            staffQualifications: true,
            languageSupport: true,
            dataProtection: true
        },
        documentation: {
            format: ['pdf', 'docx'],
            language: ['english', 'irish'],
            retention: 2555
        },
        emergencyProtocols: {
            responseTime: 15,
            escalationPath: ['primary', 'backup', 'emergency']
        }
    }
};

// Regional compliance middleware
export const checkRegionalCompliance = (req: Request, res: Response, next: NextFunction) => {
    const region = req.body.region as Region;
    
    if (!region || !COMPLIANCE_REQUIREMENTS[region]) {
        const error: APIError = {
            code: 'INVALID_REGION',
            message: 'Invalid or unsupported region specified',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string,
            region
        };
        return res.status(400).json(error);
    }

    const requirements = COMPLIANCE_REQUIREMENTS[region];
    const complianceErrors: string[] = [];

    // Check call recording requirement
    if (requirements.requirements.callRecording && !req.body.recording) {
        complianceErrors.push('Call recording is required for this region');
    }

    // Check staff qualifications
    if (requirements.requirements.staffQualifications && !req.body.qualifications) {
        complianceErrors.push('Staff qualifications must be specified');
    }

    // Check language support
    if (requirements.requirements.languageSupport && 
        req.body.language && 
        !requirements.documentation.language.includes(req.body.language)) {
        complianceErrors.push('Unsupported language for this region');
    }

    // Check data protection
    if (requirements.requirements.dataProtection && !req.body.dataProtection) {
        complianceErrors.push('Data protection requirements must be specified');
    }

    if (complianceErrors.length > 0) {
        const error: APIError = {
            code: 'COMPLIANCE_ERROR',
            message: 'Regional compliance requirements not met',
            details: complianceErrors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string,
            region
        };
        return res.status(400).json(error);
    }

    // Add compliance requirements to request for downstream use
    req.regionalCompliance = requirements;
    next();
};

// Regional compliance helpers
export const compliance = {
    // Get retention period for a region
    getRetentionPeriod: (region: Region): number => {
        return COMPLIANCE_REQUIREMENTS[region].documentation.retention;
    },

    // Get required languages for a region
    getRequiredLanguages: (region: Region): string[] => {
        return COMPLIANCE_REQUIREMENTS[region].documentation.language;
    },

    // Get emergency response time for a region
    getEmergencyResponseTime: (region: Region): number => {
        return COMPLIANCE_REQUIREMENTS[region].emergencyProtocols.responseTime;
    },

    // Check if a specific requirement is needed for a region
    isRequirementNeeded: (region: Region, requirement: keyof RegionalCompliance['requirements']): boolean => {
        return COMPLIANCE_REQUIREMENTS[region].requirements[requirement];
    },

    // Get full compliance requirements for a region
    getRegionalRequirements: (region: Region): RegionalCompliance => {
        return COMPLIANCE_REQUIREMENTS[region];
    }
}; 