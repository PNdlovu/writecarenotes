import { ApiClient } from '@/lib/api-client';
import { API_VERSIONS } from '@/config/api-versions';
import { RegionalComplianceValidator } from '@/lib/validators/regional-compliance';
import { Logger } from '@/lib/logger';

interface MigrationTest {
  name: string;
  run: () => Promise<boolean>;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

interface MigrationTestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
  timestamp: string;
}

interface MigrationReport {
  clientId: string;
  organization: string;
  sourceVersion: string;
  targetVersion: string;
  timestamp: string;
  tests: MigrationTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    criticalFailures: number;
  };
  recommendations: string[];
}

export class MigrationTester {
  private sourceClient: ApiClient;
  private targetClient: ApiClient;
  private validator: RegionalComplianceValidator;
  private logger: Logger;

  constructor(
    baseUrl: string,
    sourceVersion: string,
    targetVersion: string,
    region: string
  ) {
    this.sourceClient = new ApiClient({ baseUrl, version: sourceVersion });
    this.targetClient = new ApiClient({ baseUrl, version: targetVersion });
    this.validator = new RegionalComplianceValidator(region as any);
    this.logger = new Logger({ service: 'migration-tester' });
  }

  /**
   * Defines all migration tests
   */
  private getMigrationTests(): MigrationTest[] {
    return [
      {
        name: 'facility_data_consistency',
        description: 'Verify facility data consistency across versions',
        severity: 'critical',
        run: async () => {
          const sourceData = await this.sourceClient.getFacility('test-facility');
          const targetData = await this.targetClient.getFacility('test-facility');

          // Check core data fields
          return (
            sourceData.id === targetData.id &&
            sourceData.name === targetData.name &&
            JSON.stringify(sourceData.departments) ===
              JSON.stringify(targetData.departments)
          );
        },
      },
      {
        name: 'regional_compliance',
        description: 'Verify regional compliance requirements',
        severity: 'critical',
        run: async () => {
          const facilityData = await this.targetClient.getFacility('test-facility');
          const validation = await this.validator.validateFacility(facilityData);
          return validation.valid;
        },
      },
      {
        name: 'error_handling',
        description: 'Verify error handling consistency',
        severity: 'warning',
        run: async () => {
          try {
            await this.targetClient.getFacility('non-existent');
            return false; // Should have thrown an error
          } catch (error: any) {
            return (
              error.code === 'FACILITY_NOT_FOUND' && error.correlationId !== undefined
            );
          }
        },
      },
      {
        name: 'performance_check',
        description: 'Verify performance meets requirements',
        severity: 'warning',
        run: async () => {
          const start = Date.now();
          await this.targetClient.getFacility('test-facility');
          const duration = Date.now() - start;
          return duration < 1000; // Less than 1 second
        },
      },
      {
        name: 'authentication',
        description: 'Verify authentication mechanisms',
        severity: 'critical',
        run: async () => {
          try {
            // Test with invalid token
            const invalidClient = new ApiClient({
              baseUrl: this.targetClient['baseUrl'],
              version: this.targetClient['version'],
              token: 'invalid-token',
            });
            await invalidClient.getFacility('test-facility');
            return false; // Should have thrown an error
          } catch (error: any) {
            return error.status === 401;
          }
        },
      },
    ];
  }

  /**
   * Runs all migration tests
   */
  async runTests(): Promise<MigrationReport> {
    const tests = this.getMigrationTests();
    const results: MigrationTestResult[] = [];
    let criticalFailures = 0;

    for (const test of tests) {
      try {
        const passed = await test.run();
        results.push({
          name: test.name,
          passed,
          timestamp: new Date().toISOString(),
        });

        if (!passed && test.severity === 'critical') {
          criticalFailures++;
        }

        this.logger.info(`Migration test ${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
      } catch (error: any) {
        results.push({
          name: test.name,
          passed: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });

        if (test.severity === 'critical') {
          criticalFailures++;
        }

        this.logger.error(`Migration test ${test.name} error:`, error);
      }
    }

    const summary = {
      total: tests.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      criticalFailures,
    };

    return {
      clientId: 'test-client',
      organization: 'Test Organization',
      sourceVersion: this.sourceClient['version'],
      targetVersion: this.targetClient['version'],
      timestamp: new Date().toISOString(),
      tests: results,
      summary,
      recommendations: this.generateRecommendations(results),
    };
  }

  /**
   * Generates recommendations based on test results
   */
  private generateRecommendations(results: MigrationTestResult[]): string[] {
    const recommendations: string[] = [];
    const failedTests = results.filter((r) => !r.passed);

    for (const test of failedTests) {
      switch (test.name) {
        case 'facility_data_consistency':
          recommendations.push(
            'Review data mapping between versions and ensure all required fields are properly transformed'
          );
          break;
        case 'regional_compliance':
          recommendations.push(
            'Update facility data to meet regional compliance requirements'
          );
          break;
        case 'error_handling':
          recommendations.push(
            'Implement consistent error handling with correlation IDs'
          );
          break;
        case 'performance_check':
          recommendations.push(
            'Optimize API response times and implement caching if necessary'
          );
          break;
        case 'authentication':
          recommendations.push(
            'Review and update authentication mechanisms to meet security requirements'
          );
          break;
      }
    }

    return recommendations;
  }

  /**
   * Runs a dry-run migration
   */
  async dryRun() {
    this.logger.info('Starting migration dry-run');
    const report = await this.runTests();

    if (report.summary.criticalFailures > 0) {
      this.logger.error(
        `Migration dry-run failed with ${report.summary.criticalFailures} critical failures`
      );
      throw new Error('Migration dry-run failed');
    }

    this.logger.info('Migration dry-run completed successfully');
    return report;
  }

  /**
   * Validates migration readiness
   */
  async validateReadiness(): Promise<boolean> {
    const report = await this.runTests();
    return report.summary.criticalFailures === 0;
  }
}


