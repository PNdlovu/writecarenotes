import { 
  BasePerson, 
  BaseCarePlan, 
  CareType,
  ChildPerson,
  isChildPerson
} from '../types/care';

export class CareService {
  // Base methods for all care types
  async getPerson(id: string): Promise<BasePerson> {
    // Common retrieval logic
    return {} as BasePerson; // Placeholder
  }

  async getCarePlan(personId: string): Promise<BaseCarePlan> {
    // Common care plan logic
    return {} as BaseCarePlan; // Placeholder
  }

  async updateCarePlan(carePlan: BaseCarePlan): Promise<BaseCarePlan> {
    // Common update logic
    return carePlan;
  }

  // Type-specific extensions using type guards
  async getEducationDetails(person: BasePerson) {
    if (!isChildPerson(person)) {
      throw new Error('Education details only available for children');
    }
    // Children's home specific logic
    return person.education;
  }

  async getPlacementDetails(person: BasePerson) {
    if (!isChildPerson(person)) {
      throw new Error('Placement details only available for children');
    }
    // Children's home specific logic
    return person.placement;
  }

  // Utility methods
  isCareTypeSupported(careType: CareType): boolean {
    const supportedTypes: CareType[] = [
      'childrens',
      'elderly',
      'mental-health',
      'learning-disability',
      'physical-disability'
    ];
    return supportedTypes.includes(careType);
  }

  getRequiredDocuments(person: BasePerson): string[] {
    const baseDocuments = [
      'Care Plan',
      'Risk Assessment',
      'Medical Information',
      'Emergency Contacts'
    ];

    if (isChildPerson(person)) {
      return [
        ...baseDocuments,
        'Education Plan',
        'Placement Order',
        'Local Authority Agreement',
        'Social Worker Details'
      ];
    }

    return baseDocuments;
  }
}
