import { prisma } from './prisma';

export interface DrugInteraction {
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  description: string;
  mechanism: string;
  recommendation: string;
}

export interface InteractionResult {
  interactions: DrugInteraction[];
  score: number; // 0-1, where 1 is highest risk
  requiresAttention: boolean;
}

export class InteractionDetection {
  private static instance: InteractionDetection;
  private modelEndpoint: string;

  private constructor() {
    this.modelEndpoint = process.env.ML_MODEL_ENDPOINT || 'https://api.ml-service.com/drug-interactions';
  }

  public static getInstance(): InteractionDetection {
    if (!InteractionDetection.instance) {
      InteractionDetection.instance = new InteractionDetection();
    }
    return InteractionDetection.instance;
  }

  private async getMedicationDetails(medicationId: string) {
    return await prisma.medication.findUnique({
      where: { id: medicationId },
      include: {
        resident: {
          include: {
            medications: true,
            allergies: true,
            conditions: true,
          },
        },
      },
    });
  }

  async detectInteractions(medicationId: string): Promise<InteractionResult> {
    const medication = await this.getMedicationDetails(medicationId);
    if (!medication) {
      throw new Error('Medication not found');
    }

    const resident = medication.resident;
    if (!resident) {
      throw new Error('Resident not found for this medication');
    }

    // Get all current medications for the resident
    const currentMedications = resident.medications.filter(med => med.active);

    // Check for interactions with other medications
    const interactions = await this.checkMedicationInteractions(
      medication,
      currentMedications,
      resident.allergies,
      resident.conditions
    );

    // Calculate risk score based on interactions
    const score = this.calculateRiskScore(interactions);

    return {
      interactions,
      score,
      requiresAttention: score > 0.7,
    };
  }

  private async checkMedicationInteractions(
    medication: any,
    currentMedications: any[],
    allergies: any[],
    conditions: any[]
  ): Promise<DrugInteraction[]> {
    // Mock ML model response
    // In a real implementation, this would call an actual ML model API
    const interactions: DrugInteraction[] = [];

    // Simple rule-based detection (mock)
    for (const otherMed of currentMedications) {
      if (Math.random() > 0.7) { // 30% chance of interaction for demo
        interactions.push({
          severity: this.getRandomSeverity(),
          description: `Potential interaction between ${medication.name} and ${otherMed.name}`,
          mechanism: 'May affect metabolism or absorption',
          recommendation: this.getRecommendation(),
        });
      }
    }

    return interactions;
  }

  private getRandomSeverity(): DrugInteraction['severity'] {
    const severities: DrugInteraction['severity'][] = ['LOW', 'MODERATE', 'HIGH', 'SEVERE'];
    return severities[Math.floor(Math.random() * severities.length)];
  }

  private getRecommendation(): string {
    const recommendations = [
      'Monitor resident closely',
      'Consider alternative medication',
      'Adjust dosing schedule',
      'Check blood levels regularly',
      'Consult with pharmacist',
    ];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }

  private calculateRiskScore(interactions: DrugInteraction[]): number {
    if (interactions.length === 0) return 0;

    const severityWeights = {
      LOW: 0.25,
      MODERATE: 0.5,
      HIGH: 0.75,
      SEVERE: 1,
    };

    const totalWeight = interactions.reduce((sum, interaction) => {
      return sum + severityWeights[interaction.severity];
    }, 0);

    return Math.min(totalWeight / (interactions.length * 2), 1);
  }

  async analyzeResidentProfile(residentId: string): Promise<{
    overallRisk: number;
    recommendations: string[];
  }> {
    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      include: {
        medications: true,
        allergies: true,
        conditions: true,
      },
    });

    if (!resident) {
      throw new Error('Resident not found');
    }

    // Mock analysis
    const recommendations: string[] = [];
    let overallRisk = 0;

    // Analyze medication combinations
    const medicationCount = resident.medications.length;
    if (medicationCount > 5) {
      recommendations.push('High number of medications - consider medication review');
      overallRisk += 0.2;
    }

    // Check for condition-specific risks
    if (resident.conditions.some(c => c.name.toLowerCase().includes('kidney'))) {
      recommendations.push('Monitor kidney function due to multiple medications');
      overallRisk += 0.15;
    }

    // Add allergy-related recommendations
    if (resident.allergies.length > 0) {
      recommendations.push('Verify all medications against allergy history');
      overallRisk += 0.1;
    }

    return {
      overallRisk: Math.min(overallRisk, 1),
      recommendations,
    };
  }
}
