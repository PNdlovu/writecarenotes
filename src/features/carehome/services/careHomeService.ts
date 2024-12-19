import { MedicationService } from '@/features/medications/services/medicationService';
import { FinancialService } from '@/features/financial/services/financialService';
import { AuditService } from '@/features/audit/services/auditService';
import { CareHomeRepository } from '../repositories/careHomeRepository';
import { CareHomeError } from '../types/errors';
import { 
  Region,
  ComplianceStatus,
  ComplianceReport,
  RegionalRegulation
} from '../types/compliance';
import { 
  CareHomeWithRelations,
  CreateCareHomeDTO,
  CareHome, 
  CareHomeMetrics,
  OperationalMetrics,
  StaffMetrics,
  ResidentMetrics,
  ComplianceMetrics
} from '../types/carehome.types';
import { RegionalComplianceService } from '@/features/compliance/services/RegionalComplianceService';
import { OfflineSync } from '@/lib/offline/OfflineSync';
import { CareHomeCache } from '../database/CareHomeCache';
import { 
  CareHome, 
  CareHomeConfiguration,
  CareHomeType,
  CareLevel,
  RegistrationType,
  ServiceType
} from '../types/careHomeTypes';

export class CareHomeService {
  private medicationService: MedicationService;
  private financialService: FinancialService;
  private auditService: AuditService;
  private complianceService: RegionalComplianceService;
  private offlineSync: OfflineSync;
  private cache: CareHomeCache;

  constructor(
    private repository: CareHomeRepository,
    region: Region = Region.UK
  ) {
    this.medicationService = new MedicationService();
    this.financialService = new FinancialService(repository);
    this.auditService = new AuditService();
    this.complianceService = new RegionalComplianceService(region);
    this.offlineSync = new OfflineSync();
    this.cache = new CareHomeCache();
  }

  /**
   * Gets comprehensive operational metrics for a care home
   */
  async getOperationalMetrics(
    careHomeId: string, 
    period: { start: Date; end: Date }
  ): Promise<OperationalMetrics> {
    try {
      // Get base metrics
      const [
        staffMetrics,
        residentMetrics,
        medicationMetrics,
        financialMetrics,
        complianceMetrics
      ] = await Promise.all([
        this.getStaffMetrics(careHomeId, period),
        this.getResidentMetrics(careHomeId, period),
        this.medicationService.getMedicationMetrics(careHomeId, period),
        this.financialService.getFinancialMetrics(careHomeId, period),
        this.getComplianceMetrics(careHomeId, period)
      ]);

      // Calculate derived metrics
      const occupancyRate = this.calculateOccupancyRate(residentMetrics);
      const staffingRatio = this.calculateStaffingRatio(staffMetrics, residentMetrics);
      const costPerResident = this.calculateCostPerResident(financialMetrics, residentMetrics);

      return {
        staff: staffMetrics,
        residents: residentMetrics,
        medications: medicationMetrics,
        financials: financialMetrics,
        compliance: complianceMetrics,
        derived: {
          occupancyRate,
          staffingRatio,
          costPerResident
        }
      };
    } catch (error) {
      console.error('Failed to get operational metrics:', error);
      throw new CareHomeError('Failed to get operational metrics');
    }
  }

  /**
   * Gets staff-related metrics
   */
  private async getStaffMetrics(
    careHomeId: string,
    period: { start: Date; end: Date }
  ): Promise<StaffMetrics> {
    const staffData = await this.repository.getStaffData(careHomeId, period);
    
    return {
      totalStaff: staffData.total,
      staffingLevels: staffData.levels,
      qualifications: staffData.qualifications,
      attendance: staffData.attendance,
      training: staffData.training,
      performance: staffData.performance
    };
  }

  /**
   * Gets resident-related metrics
   */
  private async getResidentMetrics(
    careHomeId: string,
    period: { start: Date; end: Date }
  ): Promise<ResidentMetrics> {
    const residentData = await this.repository.getResidentData(careHomeId, period);
    
    return {
      totalResidents: residentData.total,
      careTypes: residentData.careTypes,
      dependencies: residentData.dependencies,
      occupancy: residentData.occupancy,
      incidents: residentData.incidents,
      satisfaction: residentData.satisfaction
    };
  }

  /**
   * Gets compliance-related metrics
   */
  private async getComplianceMetrics(
    careHomeId: string,
    period: { start: Date; end: Date }
  ): Promise<ComplianceMetrics> {
    const complianceData = await this.repository.getComplianceData(careHomeId, period);
    
    return {
      regulatoryCompliance: complianceData.regulatory,
      policies: complianceData.policies,
      training: complianceData.training,
      incidents: complianceData.incidents,
      inspections: complianceData.inspections
    };
  }

  /**
   * Calculates occupancy rate
   */
  private calculateOccupancyRate(residentMetrics: ResidentMetrics): number {
    return (residentMetrics.totalResidents / residentMetrics.occupancy.capacity) * 100;
  }

  /**
   * Calculates staffing ratio
   */
  private calculateStaffingRatio(staffMetrics: StaffMetrics, residentMetrics: ResidentMetrics): number {
    return staffMetrics.totalStaff / residentMetrics.totalResidents;
  }

  /**
   * Calculates cost per resident
   */
  private calculateCostPerResident(financialMetrics: any, residentMetrics: ResidentMetrics): number {
    return financialMetrics.totalCosts / residentMetrics.totalResidents;
  }

  /**
   * Validates care home operations against regional compliance requirements
   */
  async validateRegionalCompliance(careHomeId: string): Promise<ComplianceReport> {
    try {
      const [operationalMetrics, regulations] = await Promise.all([
        this.getOperationalMetrics(careHomeId, { start: new Date(), end: new Date() }),
        this.complianceService.getRegionalRegulations()
      ]);

      return this.complianceService.validateCompliance(operationalMetrics, regulations);
    } catch (error) {
      console.error('Failed to validate regional compliance:', error);
      throw new CareHomeError('Failed to validate regional compliance');
    }
  }

  /**
   * Ensures data is available offline and syncs when online
   */
  async ensureOfflineAvailability(careHomeId: string): Promise<void> {
    try {
      // Cache essential data
      const essentialData = await Promise.all([
        this.repository.getEssentialCareHomeData(careHomeId),
        this.medicationService.getEssentialMedicationData(careHomeId),
        this.complianceService.getEssentialComplianceData()
      ]);

      await this.cache.storeEssentialData(careHomeId, essentialData);
      
      // Setup background sync
      this.offlineSync.registerSyncHandler(careHomeId, async (changes) => {
        await this.repository.syncChanges(changes);
      });
    } catch (error) {
      console.error('Failed to ensure offline availability:', error);
      throw new CareHomeError('Failed to ensure offline availability');
    }
  }

  /**
   * Creates a new care home with specific configuration
   */
  async createCareHome(
    careHome: Omit<CareHome, 'id'>,
    configuration: Omit<CareHomeConfiguration, 'id' | 'careHomeId'>
  ): Promise<CareHome> {
    try {
      // Validate care home type and services compatibility
      this.validateCareHomeConfiguration(careHome, configuration);

      // Create care home record
      const newCareHome = await this.repository.createCareHome(careHome);

      // Create configuration with the new care home ID
      const newConfig: Omit<CareHomeConfiguration, 'id'> = {
        ...configuration,
        careHomeId: newCareHome.id
      };
      await this.repository.createCareHomeConfiguration(newConfig);

      // Log audit trail
      await this.auditService.logEvent('CARE_HOME_CREATED', {
        careHomeId: newCareHome.id,
        type: newCareHome.type,
        services: newCareHome.services
      });

      return newCareHome;
    } catch (error) {
      console.error('Failed to create care home:', error);
      throw new CareHomeError('Failed to create care home');
    }
  }

  /**
   * Updates care home configuration
   */
  async updateCareHomeConfiguration(
    careHomeId: string,
    configuration: Partial<CareHomeConfiguration>
  ): Promise<CareHomeConfiguration> {
    try {
      const existingCareHome = await this.repository.getCareHome(careHomeId);
      const existingConfig = await this.repository.getCareHomeConfiguration(careHomeId);

      // Merge existing and new configuration
      const updatedConfig = {
        ...existingConfig,
        ...configuration,
        careHomeId
      };

      // Validate updated configuration
      this.validateCareHomeConfiguration(existingCareHome, updatedConfig);

      // Update configuration
      const result = await this.repository.updateCareHomeConfiguration(careHomeId, updatedConfig);

      // Log audit trail
      await this.auditService.logEvent('CARE_HOME_CONFIG_UPDATED', {
        careHomeId,
        changes: configuration
      });

      return result;
    } catch (error) {
      console.error('Failed to update care home configuration:', error);
      throw new CareHomeError('Failed to update care home configuration');
    }
  }

  /**
   * Validates care home configuration against type and services
   */
  private validateCareHomeConfiguration(
    careHome: Omit<CareHome, 'id'>,
    configuration: Omit<CareHomeConfiguration, 'id'>
  ): void {
    // Validate care types match the main care home type
    if (!configuration.careTypes.includes(careHome.type)) {
      throw new CareHomeError('Care home type must be included in configuration care types');
    }

    // Validate staffing requirements based on care type
    this.validateStaffingRequirements(careHome.type, configuration.staffingRequirements);

    // Validate facility requirements based on services
    this.validateFacilityRequirements(careHome.services, configuration.facilityRequirements);

    // Validate regulatory requirements are complete
    if (!this.hasRequiredRegulations(careHome.type, configuration.regulatoryRequirements)) {
      throw new CareHomeError('Missing required regulatory requirements for care home type');
    }
  }

  /**
   * Validates staffing requirements based on care home type
   */
  private validateStaffingRequirements(
    careHomeType: CareHomeType,
    staffingRequirements: CareHomeConfiguration['staffingRequirements']
  ): void {
    const requiredRoles = this.getRequiredStaffRoles(careHomeType);
    const configuredRoles = staffingRequirements.map(req => req.role);

    const missingRoles = requiredRoles.filter(role => !configuredRoles.includes(role));
    if (missingRoles.length > 0) {
      throw new CareHomeError(`Missing required staff roles: ${missingRoles.join(', ')}`);
    }
  }

  /**
   * Gets required staff roles based on care home type
   */
  private getRequiredStaffRoles(careHomeType: CareHomeType): string[] {
    const baseRoles = ['Care Assistant', 'Manager'];
    
    switch (careHomeType) {
      case CareHomeType.NURSING_HOME:
      case CareHomeType.PALLIATIVE_CARE:
        return [...baseRoles, 'Registered Nurse', 'Clinical Lead'];
      case CareHomeType.DEMENTIA_CARE:
        return [...baseRoles, 'Dementia Specialist', 'Mental Health Nurse'];
      case CareHomeType.REHABILITATION:
        return [...baseRoles, 'Physiotherapist', 'Occupational Therapist'];
      case CareHomeType.LEARNING_DISABILITIES:
      case CareHomeType.MENTAL_HEALTH:
        return [...baseRoles, 'Support Worker', 'Mental Health Specialist'];
      default:
        return baseRoles;
    }
  }

  /**
   * Validates facility requirements based on services offered
   */
  private validateFacilityRequirements(
    services: ServiceType[],
    facilityRequirements: CareHomeConfiguration['facilityRequirements']
  ): void {
    const requiredFacilities = this.getRequiredFacilities(services);
    const configuredFacilities = facilityRequirements
      .filter(req => req.required)
      .map(req => req.facility);

    const missingFacilities = requiredFacilities.filter(
      facility => !configuredFacilities.includes(facility)
    );
    if (missingFacilities.length > 0) {
      throw new CareHomeError(`Missing required facilities: ${missingFacilities.join(', ')}`);
    }
  }

  /**
   * Gets required facilities based on services offered
   */
  private getRequiredFacilities(services: ServiceType[]): string[] {
    const facilityMap: Record<ServiceType, string[]> = {
      [ServiceType.NURSING_CARE]: ['Treatment Room', 'Medical Storage'],
      [ServiceType.DEMENTIA_SUPPORT]: ['Secure Garden', 'Memory Care Unit'],
      [ServiceType.REHABILITATION]: ['Therapy Room', 'Exercise Area'],
      [ServiceType.PALLIATIVE_CARE]: ['Private Suites', 'Family Room'],
      [ServiceType.SPECIALIST_CARE]: ['Specialist Equipment Room'],
      [ServiceType.DAY_CARE]: ['Activity Room', 'Dining Area'],
      [ServiceType.ACCOMMODATION]: ['Bedrooms', 'Common Areas'],
      [ServiceType.PERSONAL_CARE]: ['Assisted Bathrooms'],
      [ServiceType.RESPITE_CARE]: ['Short-Stay Rooms']
    };

    return Array.from(new Set(
      services.flatMap(service => facilityMap[service] || [])
    ));
  }

  /**
   * Checks if all required regulations are present
   */
  private hasRequiredRegulations(
    careHomeType: CareHomeType,
    regulations: CareHomeConfiguration['regulatoryRequirements']
  ): boolean {
    const requiredRegulations = this.getRequiredRegulations(careHomeType);
    return requiredRegulations.every(req =>
      regulations.some(reg => reg.requirement === req)
    );
  }

  /**
   * Gets required regulations based on care home type
   */
  private getRequiredRegulations(careHomeType: CareHomeType): string[] {
    const baseRegulations = [
      'Health and Safety',
      'Fire Safety',
      'Food Safety',
      'Infection Control'
    ];

    switch (careHomeType) {
      case CareHomeType.NURSING_HOME:
      case CareHomeType.PALLIATIVE_CARE:
        return [...baseRegulations, 'Nursing Standards', 'Medication Management'];
      case CareHomeType.DEMENTIA_CARE:
        return [...baseRegulations, 'Dementia Care Standards'];
      case CareHomeType.MENTAL_HEALTH:
        return [...baseRegulations, 'Mental Health Act Compliance'];
      case CareHomeType.LEARNING_DISABILITIES:
        return [...baseRegulations, 'Learning Disability Service Standards'];
      default:
        return baseRegulations;
    }
  }
}
