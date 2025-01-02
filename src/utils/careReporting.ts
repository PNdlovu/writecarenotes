import { BasePerson, CareType } from '@/types/care';
import { Region } from '@/types/regulatory';

interface CareReport {
  summary: {
    careType: CareType;
    region: Region;
    status: string;
    lastUpdated: Date;
  };
  compliance: {
    regulatory: {
      status: string;
      requirements: string[];
      nextReview?: Date;
    };
    care: {
      assessments: string[];
      plans: string[];
      reviews: string[];
    };
  };
  actions: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export const generateCareReport = (
  person: BasePerson,
  careType: CareType,
  region: Region
): CareReport => {
  const report: CareReport = {
    summary: {
      careType,
      region,
      status: 'Active',
      lastUpdated: new Date()
    },
    compliance: {
      regulatory: {
        status: 'Compliant',
        requirements: [],
      },
      care: {
        assessments: [],
        plans: [],
        reviews: []
      }
    },
    actions: {
      immediate: [],
      shortTerm: [],
      longTerm: []
    }
  };

  // Care type specific reporting
  switch (careType) {
    case 'childrens':
      if (person.ofstedRequirements) {
        const { ofstedRequirements } = person;
        
        // Registration status
        report.compliance.regulatory.status = ofstedRequirements.registration.registrationType;
        
        // Latest inspection
        const latestInspection = ofstedRequirements.inspections[0];
        if (latestInspection) {
          report.compliance.regulatory.requirements.push(
            `Latest Ofsted inspection: ${latestInspection.overallEffectiveness}`
          );
        }

        // Education monitoring
        report.compliance.care.assessments.push(
          `Education type: ${ofstedRequirements.educationProvision.arrangements.type}`
        );

        // Safeguarding
        report.compliance.care.plans.push(
          `Safeguarding lead: ${ofstedRequirements.safeguarding.designatedLead.name}`
        );

        // Actions based on requirements
        latestInspection?.requirements.forEach(req => {
          report.actions.immediate.push(req);
        });
      }
      break;

    case 'elderly-care':
      if (person.hasEndOfLifeCare) {
        report.compliance.care.plans.push('End of Life Care Plan in place');
      }
      break;

    case 'physical-disabilities':
      if (person.physicalAssessment) {
        report.compliance.care.assessments.push('Physical Assessment completed');
      }
      if (person.rehabilitationPlan) {
        report.compliance.care.plans.push('Rehabilitation Plan in place');
      }
      break;

    case 'domiciliary-care':
      if (person.carePackage) {
        report.compliance.care.plans.push('Care Package in place');
      }
      if (person.homeAssessment) {
        report.compliance.care.assessments.push('Home Assessment completed');
      }
      break;

    // Add other care types...
  }

  // Region specific reporting
  switch (region) {
    case 'ENGLAND':
      if (person.cqcRequirements) {
        report.compliance.regulatory.requirements.push(
          `CQC Rating: ${person.cqcRequirements.ratings.overall}`
        );
      }
      break;

    case 'WALES':
      if (person.ciwRequirements) {
        const inspections = person.ciwRequirements.inspectionHistory;
        if (inspections.length > 0) {
          report.compliance.regulatory.requirements.push(
            `Latest CIW inspection: ${inspections[0].outcome}`
          );
        }
      }
      break;

    // Add other regions...
  }

  return report;
};

export const generateCareSummary = (report: CareReport): string => {
  return `
Care Summary Report
------------------
Type: ${report.summary.careType}
Region: ${report.summary.region}
Status: ${report.summary.status}
Last Updated: ${report.summary.lastUpdated.toLocaleDateString()}

Regulatory Compliance
-------------------
Status: ${report.compliance.regulatory.status}
Requirements:
${report.compliance.regulatory.requirements.map(req => `- ${req}`).join('\n')}

Care Status
----------
Assessments:
${report.compliance.care.assessments.map(assessment => `- ${assessment}`).join('\n')}

Care Plans:
${report.compliance.care.plans.map(plan => `- ${plan}`).join('\n')}

Required Actions
--------------
Immediate:
${report.actions.immediate.map(action => `- ${action}`).join('\n')}

Short Term:
${report.actions.shortTerm.map(action => `- ${action}`).join('\n')}

Long Term:
${report.actions.longTerm.map(action => `- ${action}`).join('\n')}
  `.trim();
};
