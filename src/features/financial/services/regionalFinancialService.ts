import { Logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { REGIONAL_CONFIGS } from '../core/constants/regional.constants';
import { 
  Region, 
  RegionalConfig, 
  LocalAuthorityRate,
  FundingAssessment,
  FundingType
} from '../core/types/regional.types';

export class RegionalFinancialService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('regional-financial-service');
  }

  async getRegionalConfig(region: Region): Promise<RegionalConfig> {
    const config = REGIONAL_CONFIGS[region];
    if (!config) {
      throw new Error(`No configuration found for region: ${region}`);
    }
    return config;
  }

  async getLocalAuthorityRates(
    authorityId: string,
    date: Date = new Date()
  ): Promise<LocalAuthorityRate | null> {
    try {
      return await prisma.localAuthorityRate.findFirst({
        where: {
          authorityId,
          effectiveFrom: {
            lte: date
          },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gt: date } }
          ]
        },
        include: {
          additionalNeeds: true
        }
      });
    } catch (error) {
      this.logger.error('Failed to get local authority rates', { 
        error, 
        authorityId 
      });
      throw error;
    }
  }

  async createFundingAssessment(
    input: Omit<FundingAssessment, 'id'>
  ): Promise<FundingAssessment> {
    try {
      // Validate region and funding type compatibility
      const config = await this.getRegionalConfig(input.region);
      if (!config.fundingTypes.includes(input.fundingType)) {
        throw new Error(`Funding type ${input.fundingType} not supported in ${input.region}`);
      }

      // Create funding assessment
      return await prisma.fundingAssessment.create({
        data: {
          ...input,
          contributionBreakdown: {
            create: input.contributionBreakdown
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to create funding assessment', { 
        error, 
        input 
      });
      throw error;
    }
  }

  async calculateFunding(
    residentId: string,
    fundingType: FundingType,
    assessmentDate: Date = new Date()
  ): Promise<{
    weeklyAmount: number;
    breakdown: Array<{ source: string; amount: number; }>;
  }> {
    try {
      // Get resident details including care needs
      const resident = await prisma.resident.findUnique({
        where: { id: residentId },
        include: {
          careNeeds: true,
          careHome: {
            include: {
              organization: true
            }
          }
        }
      });

      if (!resident) {
        throw new Error(`Resident not found: ${residentId}`);
      }

      const region = resident.careHome.organization.region as Region;
      const config = await this.getRegionalConfig(region);

      let weeklyAmount = 0;
      const breakdown = [];

      switch (fundingType) {
        case 'LOCAL_AUTHORITY':
          const rates = await this.getLocalAuthorityRates(
            resident.careHome.localAuthorityId,
            assessmentDate
          );
          if (rates) {
            weeklyAmount = rates.baseRate;
            breakdown.push({ source: 'Base Rate', amount: rates.baseRate });

            // Add additional needs funding
            for (const need of resident.careNeeds) {
              const additionalRate = rates.additionalNeeds.find(
                r => r.category === need.category
              );
              if (additionalRate) {
                weeklyAmount += additionalRate.rate;
                breakdown.push({
                  source: `Additional Need - ${need.category}`,
                  amount: additionalRate.rate
                });
              }
            }
          }
          break;

        case 'NHS':
          // Calculate NHS funding based on care needs
          const nhsRate = await this.getNHSFundingRate(
            region,
            resident.careNeeds.map(n => n.category)
          );
          weeklyAmount = nhsRate.totalAmount;
          breakdown.push(...nhsRate.breakdown);
          break;

        case 'MIXED':
          // Calculate mixed funding based on assessment
          const mixedFunding = await this.calculateMixedFunding(
            residentId,
            assessmentDate
          );
          weeklyAmount = mixedFunding.totalAmount;
          breakdown.push(...mixedFunding.breakdown);
          break;
      }

      return { weeklyAmount, breakdown };
    } catch (error) {
      this.logger.error('Failed to calculate funding', { 
        error, 
        residentId, 
        fundingType 
      });
      throw error;
    }
  }

  private async getNHSFundingRate(
    region: Region,
    careCategories: string[]
  ): Promise<{
    totalAmount: number;
    breakdown: Array<{ source: string; amount: number; }>;
  }> {
    // Simplified NHS funding calculation
    return {
      totalAmount: 0,
      breakdown: [{ source: 'NHS Standard Rate', amount: 0 }]
    };
  }

  private async calculateMixedFunding(
    residentId: string,
    assessmentDate: Date
  ): Promise<{
    totalAmount: number;
    breakdown: Array<{ source: string; amount: number; }>;
  }> {
    // Simplified mixed funding calculation
    return {
      totalAmount: 0,
      breakdown: [
        { source: 'Local Authority Contribution', amount: 0 },
        { source: 'Self-Funded Contribution', amount: 0 }
      ]
    };
  }
}


