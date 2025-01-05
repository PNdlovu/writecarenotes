import { 
  MAREntry, 
  MARValidationRule, 
  MedicationRequirements,
  MedicationStatus
} from '@/types/mar';
import { differenceInMinutes, parseISO } from 'date-fns';

class MARValidation {
  private rules: Map<string, MARValidationRule[]> = new Map();

  constructor() {
    // Initialize region-specific validation rules
    this.initializeRules();
  }

  private initializeRules() {
    // Wales-specific rules
    this.rules.set('wales', [
      {
        type: 'WITNESS',
        condition: (entry: MAREntry) => 
          entry.status === 'GIVEN' && !entry.witnessedBy,
        message: 'Witness signature required for medication administration in Wales',
      },
      {
        type: 'SECOND_CHECK',
        condition: (entry: MAREntry) => 
          entry.status === 'GIVEN' && !entry.secondCheckBy,
        message: 'Second check required for medication administration in Wales',
      },
      {
        type: 'TIME_WINDOW',
        condition: (entry: MAREntry) => {
          if (!entry.administeredTime || !entry.scheduledTime) return false;
          const timeDiff = Math.abs(
            differenceInMinutes(
              parseISO(entry.administeredTime),
              parseISO(entry.scheduledTime)
            )
          );
          return timeDiff > 60;
        },
        message: 'Medication administered outside acceptable time window',
      },
    ]);

    // Add similar rules for other regions...
  }

  validateEntry(entry: MAREntry): string[] {
    const errors: string[] = [];
    const rules = this.rules.get(entry.region) || [];

    for (const rule of rules) {
      if (rule.condition(entry)) {
        errors.push(rule.message);
      }
    }

    return errors;
  }
}

class MARAnalytics {
  calculateComplianceRate(entries: MAREntry[]): number {
    const total = entries.length;
    if (total === 0) return 100;

    const compliant = entries.filter(entry => 
      entry.status === 'GIVEN' && 
      this.isAdministeredOnTime(entry)
    ).length;

    return (compliant / total) * 100;
  }

  private isAdministeredOnTime(entry: MAREntry): boolean {
    if (!entry.administeredTime || !entry.scheduledTime) return false;

    const timeDiff = Math.abs(
      differenceInMinutes(
        parseISO(entry.administeredTime),
        parseISO(entry.scheduledTime)
      )
    );

    return timeDiff <= 60; // Within 1 hour window
  }

  generateMedicationReport(entries: MAREntry[]) {
    const totalEntries = entries.length;
    const givenCount = entries.filter(e => e.status === 'GIVEN').length;
    const missedCount = entries.filter(e => e.status === 'MISSED').length;
    const refusedCount = entries.filter(e => e.status === 'REFUSED').length;
    const heldCount = entries.filter(e => e.status === 'HELD').length;
    const notAvailableCount = entries.filter(e => e.status === 'NOT_AVAILABLE').length;

    const lateAdministrations = entries.filter(entry => 
      entry.status === 'GIVEN' && !this.isAdministeredOnTime(entry)
    ).length;

    return {
      totalEntries,
      givenCount,
      missedCount,
      refusedCount,
      heldCount,
      notAvailableCount,
      lateAdministrations,
      complianceRate: this.calculateComplianceRate(entries),
    };
  }
}

export class MARService {
  private validation: MARValidation;
  private analytics: MARAnalytics;

  constructor() {
    this.validation = new MARValidation();
    this.analytics = new MARAnalytics();
  }

  async submitEntry(entry: Omit<MAREntry, 'id'>): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Validate the entry
      const validationErrors = this.validation.validateEntry(entry as MAREntry);
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors };
      }

      // TODO: Submit to backend API
      console.log('Submitting MAR entry:', entry);

      return { success: true };
    } catch (error) {
      console.error('Error submitting MAR entry:', error);
      return { 
        success: false, 
        errors: ['An unexpected error occurred while submitting the entry'] 
      };
    }
  }

  validateEntry(entry: MAREntry): string[] {
    return this.validation.validateEntry(entry);
  }

  generateReport(entries: MAREntry[]) {
    return this.analytics.generateMedicationReport(entries);
  }

  calculateCompliance(entries: MAREntry[]): number {
    return this.analytics.calculateComplianceRate(entries);
  }
}

// Create a singleton instance
export const marService = new MARService();


