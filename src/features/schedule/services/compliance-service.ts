import { Region, RegulatoryBody, CareSettingType, HandoverTask } from '../types/handover';

interface ComplianceRequirement {
  id: string;
  region: Region;
  regulatoryBody: RegulatoryBody;
  careSetting: CareSettingType;
  requirements: {
    mandatoryFields: string[];
    documentTemplates: string[];
    staffQualifications: string[];
    reviewPeriods: {
      carePlans: number; // days
      riskAssessments: number;
      medications: number;
    };
  };
}

export class ComplianceService {
  private requirements: Map<string, ComplianceRequirement> = new Map([
    ['ENGLAND_ELDERLY', {
      id: 'ENGLAND_ELDERLY',
      region: 'ENGLAND',
      regulatoryBody: 'CQC',
      careSetting: 'ELDERLY_CARE',
      requirements: {
        mandatoryFields: ['riskAssessment', 'carePlan', 'medicationRecord'],
        documentTemplates: ['CQC_Care_Plan', 'Risk_Assessment'],
        staffQualifications: ['NVQ_Level_2', 'Medication_Training'],
        reviewPeriods: {
          carePlans: 90,
          riskAssessments: 180,
          medications: 28,
        },
      },
    }],
    ['ENGLAND_CHILDREN', {
      id: 'ENGLAND_CHILDREN',
      region: 'ENGLAND',
      regulatoryBody: 'Ofsted',
      careSetting: 'CHILDRENS_HOME',
      requirements: {
        mandatoryFields: [
          'safeguarding',
          'educationPlan',
          'developmentGoals',
          'familyContact'
        ],
        documentTemplates: ['Ofsted_Care_Plan', 'Education_Plan'],
        staffQualifications: ['Level_3_Diploma', 'Safeguarding'],
        reviewPeriods: {
          carePlans: 30,
          riskAssessments: 90,
          medications: 28,
        },
      },
    }],
    ['WALES_ELDERLY', {
      id: 'WALES_ELDERLY',
      region: 'WALES',
      regulatoryBody: 'CIW',
      careSetting: 'ELDERLY_CARE',
      requirements: {
        mandatoryFields: [
          'riskAssessment',
          'carePlan',
          'medicationRecord',
          'welshLanguagePreference'
        ],
        documentTemplates: ['CIW_Care_Plan', 'Welsh_Language_Plan'],
        staffQualifications: ['QCF_Level_2', 'Welsh_Language'],
        reviewPeriods: {
          carePlans: 90,
          riskAssessments: 180,
          medications: 28,
        },
      },
    }],
    // Add other region-care type combinations...
  ]);

  async validateCompliance(
    task: HandoverTask,
    region: Region,
    careSetting: CareSettingType
  ): Promise<{ valid: boolean; issues: string[] }> {
    const requirementKey = `${region}_${careSetting.split('_')[0]}`;
    const requirements = this.requirements.get(requirementKey);
    
    if (!requirements) {
      throw new Error(`No compliance requirements found for ${requirementKey}`);
    }

    const issues: string[] = [];

    // Check mandatory fields
    for (const field of requirements.requirements.mandatoryFields) {
      if (!task[field as keyof HandoverTask]) {
        issues.push(`Missing mandatory field: ${field}`);
      }
    }

    // Check staff qualifications if task involves direct care
    if (task.assignedTo && this.isDirectCareTask(task)) {
      const hasRequiredQualifications = await this.validateStaffQualifications(
        task.assignedTo.id,
        requirements.requirements.staffQualifications
      );
      if (!hasRequiredQualifications) {
        issues.push('Staff member missing required qualifications');
      }
    }

    // Check review periods
    if (task.category === 'CLINICAL_CARE') {
      const lastReview = await this.getLastReviewDate(task.residentId);
      const daysSinceReview = this.getDaysSince(lastReview);
      
      if (daysSinceReview > requirements.requirements.reviewPeriods.medications) {
        issues.push('Medication review period exceeded');
      }
    }

    // Special regional checks
    switch (region) {
      case 'WALES':
        if (!task.resident?.preferences?.includes('WELSH_LANGUAGE_ASSESSED')) {
          issues.push('Welsh language preference not assessed');
        }
        break;
      case 'SCOTLAND':
        if (!task.regulatoryRequirements?.standardRef) {
          issues.push('Scottish Care Standards reference missing');
        }
        break;
    }

    // Validate Ofsted requirements for children's homes
    if (region === 'ENGLAND' && careSetting === 'CHILDRENS_HOME') {
      await this.validateOfstedRequirements(task);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  async validateDocumentation(
    task: HandoverTask,
    region: Region,
    careSetting: CareSettingType
  ): Promise<{ valid: boolean; missing: string[] }> {
    const requirementKey = `${region}_${careSetting.split('_')[0]}`;
    const requirements = this.requirements.get(requirementKey);
    
    if (!requirements) {
      throw new Error(`No documentation requirements found for ${requirementKey}`);
    }

    const missing: string[] = [];
    const requiredDocs = requirements.requirements.documentTemplates;

    // Check for required documents
    for (const doc of requiredDocs) {
      const hasDoc = await this.checkDocumentExists(task.residentId, doc);
      if (!hasDoc) {
        missing.push(doc);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  private isDirectCareTask(task: HandoverTask): boolean {
    const directCareCategories = [
      'PERSONAL_CARE',
      'CLINICAL_CARE',
      'MEDICATION',
    ];
    return directCareCategories.includes(task.category);
  }

  private async validateStaffQualifications(
    staffId: string,
    requiredQualifications: string[]
  ): Promise<boolean> {
    // Implementation to check staff qualifications
    return true;
  }

  private async getLastReviewDate(residentId?: string): Promise<Date> {
    // Implementation to get last review date
    return new Date();
  }

  private getDaysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async checkDocumentExists(
    residentId?: string,
    documentType?: string
  ): Promise<boolean> {
    // Implementation to check document existence
    return true;
  }

  private async validateOfstedRequirements(task: HandoverTask): Promise<boolean> {
    if (task.category === 'CHILDRENS_CARE') {
      const ofstedCriteria = [
        'safeguarding',
        'education',
        'development',
        'wellbeing',
        'safety',
        'familyContact',
        'independentVisitor',
        'advocacy',
      ];

      const missingCriteria = ofstedCriteria.filter(
        (criterion) => !task.regulatoryRequirements?.[criterion]
      );

      if (missingCriteria.length > 0) {
        throw new Error(
          `Missing Ofsted requirements: ${missingCriteria.join(', ')}`
        );
      }
    }
    return true;
  }
}
