/**
 * @writecarenotes.com
 * @fileoverview Regional Medication Guidelines Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles regional medication guidelines and best practices for each region,
 * integrating with national healthcare standards and regulatory requirements.
 */

import { Region } from '@/features/compliance/types/compliance.types';
import { RegionalConfigService } from './RegionalConfigService';

interface GuidelineDocument {
  id: string;
  title: string;
  version: string;
  publishedDate: Date;
  source: string;
  category: string;
  content: string;
  applicableRegions: Region[];
}

interface BestPractice {
  id: string;
  title: string;
  description: string;
  rationale: string;
  implementation: string[];
  evidence: string[];
  applicableRegions: Region[];
}

export class GuidelinesService {
  private regionalConfig: RegionalConfigService;

  constructor(private readonly region: Region) {
    this.regionalConfig = new RegionalConfigService(region);
  }

  async getRegionalGuidelines(): Promise<GuidelineDocument[]> {
    try {
      const response = await fetch(`/api/guidelines/${this.region}`);
      if (!response.ok) {
        throw new Error('Failed to fetch regional guidelines');
      }
      return response.json();
    } catch (error) {
      throw new Error('Failed to retrieve regional guidelines');
    }
  }

  async getBestPractices(): Promise<BestPractice[]> {
    try {
      const response = await fetch(`/api/best-practices/${this.region}`);
      if (!response.ok) {
        throw new Error('Failed to fetch best practices');
      }
      return response.json();
    } catch (error) {
      throw new Error('Failed to retrieve best practices');
    }
  }

  async getGuidelinesByCategory(category: string): Promise<GuidelineDocument[]> {
    try {
      const response = await fetch(`/api/guidelines/${this.region}/${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guidelines by category');
      }
      return response.json();
    } catch (error) {
      throw new Error('Failed to retrieve guidelines by category');
    }
  }

  async searchGuidelines(query: string): Promise<GuidelineDocument[]> {
    try {
      const response = await fetch(`/api/guidelines/${this.region}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search guidelines');
      }
      return response.json();
    } catch (error) {
      throw new Error('Failed to search guidelines');
    }
  }

  getGuidelineCategories(): string[] {
    switch (this.region) {
      case Region.ENGLAND:
        return [
          'Medication Administration',
          'Controlled Drugs',
          'Storage and Security',
          'Record Keeping',
          'Staff Training',
          'Emergency Procedures',
          'Quality Assurance'
        ];
      case Region.WALES:
        return [
          'Medication Management',
          'Controlled Substances',
          'Storage Requirements',
          'Documentation',
          'Staff Competency',
          'Emergency Protocols',
          'Quality Standards'
        ];
      case Region.SCOTLAND:
        return [
          'Medicine Management',
          'Controlled Drug Handling',
          'Storage Guidelines',
          'Documentation Standards',
          'Staff Development',
          'Emergency Response',
          'Quality Management'
        ];
      case Region.NORTHERN_IRELAND:
        return [
          'Medicines Management',
          'Controlled Medications',
          'Storage Protocols',
          'Record Management',
          'Staff Training',
          'Emergency Guidelines',
          'Quality Systems'
        ];
      case Region.IRELAND:
        return [
          'Medication Administration',
          'Controlled Medicines',
          'Storage Standards',
          'Documentation Requirements',
          'Staff Education',
          'Emergency Procedures',
          'Quality Assurance'
        ];
      default:
        throw new Error('Unsupported region');
    }
  }

  async validateGuidelineCompliance(guidelineId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/guidelines/${this.region}/validate/${guidelineId}`);
      if (!response.ok) {
        throw new Error('Failed to validate guideline compliance');
      }
      const result = await response.json();
      return result.compliant;
    } catch (error) {
      throw new Error('Failed to validate guideline compliance');
    }
  }

  async getGuidelineUpdates(since: Date): Promise<GuidelineDocument[]> {
    try {
      const response = await fetch(
        `/api/guidelines/${this.region}/updates?since=${since.toISOString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch guideline updates');
      }
      return response.json();
    } catch (error) {
      throw new Error('Failed to retrieve guideline updates');
    }
  }

  async subscribeToUpdates(email: string): Promise<void> {
    try {
      const response = await fetch('/api/guidelines/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          region: this.region
        })
      });
      if (!response.ok) {
        throw new Error('Failed to subscribe to updates');
      }
    } catch (error) {
      throw new Error('Failed to subscribe to updates');
    }
  }
} 