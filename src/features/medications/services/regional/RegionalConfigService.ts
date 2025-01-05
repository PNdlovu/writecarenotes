/**
 * @writecarenotes.com
 * @fileoverview Regional Configuration Service for Medications
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles region-specific configurations and requirements for medication management
 * across England, Wales, Scotland, Northern Ireland, and Republic of Ireland.
 */

import type { Region } from '@/features/compliance/types/compliance.types';

interface RegionalConfig {
  regulatoryBody: string;
  controlledDrugsRequirements: string[];
  storageRequirements: string[];
  documentationRequirements: string[];
  languageRequirements: string[];
  localGuidelines: string[];
}

export class RegionalConfigService {
  private readonly regionalConfigs: Record<Region, RegionalConfig> = {
    ENGLAND: {
      regulatoryBody: 'CQC',
      controlledDrugsRequirements: [
        'CD Register must be bound and paginated',
        'Two signatures required for CD administration',
        'Daily CD checks required'
      ],
      storageRequirements: [
        'Separate CD cabinet compliant with The Misuse of Drugs (Safe Custody) Regulations 1973',
        'Temperature monitoring for medication storage areas',
        'Separate fridge for medication storage'
      ],
      documentationRequirements: [
        'NICE guidelines compliance',
        'NHS medication administration records',
        'Electronic prescribing standards'
      ],
      languageRequirements: ['English'],
      localGuidelines: [
        'NICE Guidelines',
        'NHS England Medication Safety Guidelines',
        'Royal Pharmaceutical Society Guidelines'
      ]
    },
    WALES: {
      regulatoryBody: 'CIW',
      controlledDrugsRequirements: [
        'CD Register must be bound and paginated',
        'Two signatures required for CD administration',
        'Daily CD checks required'
      ],
      storageRequirements: [
        'Separate CD cabinet compliant with Welsh regulations',
        'Temperature monitoring for medication storage areas',
        'Separate fridge for medication storage'
      ],
      documentationRequirements: [
        'All Wales Medicines Strategy Group compliance',
        'Bilingual documentation requirements',
        'Electronic prescribing standards'
      ],
      languageRequirements: ['English', 'Welsh'],
      localGuidelines: [
        'All Wales Medicines Strategy Group Guidelines',
        'NHS Wales Medication Safety Guidelines'
      ]
    },
    SCOTLAND: {
      regulatoryBody: 'Care Inspectorate',
      controlledDrugsRequirements: [
        'CD Register must be bound and paginated',
        'Two signatures required for CD administration',
        'Daily CD checks required'
      ],
      storageRequirements: [
        'Separate CD cabinet compliant with Scottish regulations',
        'Temperature monitoring for medication storage areas',
        'Separate fridge for medication storage'
      ],
      documentationRequirements: [
        'Scottish Care Standards compliance',
        'NHS Scotland MAR requirements',
        'Electronic prescribing standards'
      ],
      languageRequirements: ['English', 'Scottish Gaelic'],
      localGuidelines: [
        'Scottish Care Standards',
        'NHS Scotland Medication Guidelines',
        'Healthcare Improvement Scotland Guidelines'
      ]
    },
    NORTHERN_IRELAND: {
      regulatoryBody: 'RQIA',
      controlledDrugsRequirements: [
        'CD Register must be bound and paginated',
        'Two signatures required for CD administration',
        'Daily CD checks required'
      ],
      storageRequirements: [
        'Separate CD cabinet compliant with NI regulations',
        'Temperature monitoring for medication storage areas',
        'Separate fridge for medication storage'
      ],
      documentationRequirements: [
        'RQIA Standards compliance',
        'HSC documentation requirements',
        'Electronic prescribing standards'
      ],
      languageRequirements: ['English', 'Irish'],
      localGuidelines: [
        'RQIA Care Standards',
        'HSC Medication Guidelines',
        'NI Medicines Governance Guidelines'
      ]
    },
    IRELAND: {
      regulatoryBody: 'HIQA',
      controlledDrugsRequirements: [
        'CD Register must be bound and paginated',
        'Two signatures required for CD administration',
        'Daily CD checks required'
      ],
      storageRequirements: [
        'Separate CD cabinet compliant with Irish regulations',
        'Temperature monitoring for medication storage areas',
        'Separate fridge for medication storage'
      ],
      documentationRequirements: [
        'HIQA Standards compliance',
        'HSE documentation requirements',
        'Electronic prescribing standards'
      ],
      languageRequirements: ['English', 'Irish'],
      localGuidelines: [
        'HIQA National Standards',
        'HSE Medication Management Guidelines',
        'PSI Guidelines'
      ]
    }
  };

  constructor(private readonly region: Region) {}

  getRegionalConfig(): RegionalConfig {
    return this.regionalConfigs[this.region];
  }

  getControlledDrugsRequirements(): string[] {
    return this.regionalConfigs[this.region].controlledDrugsRequirements;
  }

  getStorageRequirements(): string[] {
    return this.regionalConfigs[this.region].storageRequirements;
  }

  getDocumentationRequirements(): string[] {
    return this.regionalConfigs[this.region].documentationRequirements;
  }

  getLanguageRequirements(): string[] {
    return this.regionalConfigs[this.region].languageRequirements;
  }

  getLocalGuidelines(): string[] {
    return this.regionalConfigs[this.region].localGuidelines;
  }

  getRegulatoryBody(): string {
    return this.regionalConfigs[this.region].regulatoryBody;
  }

  validateRegionalCompliance(requirements: string[]): boolean {
    const regionalRequirements = [
      ...this.getControlledDrugsRequirements(),
      ...this.getStorageRequirements(),
      ...this.getDocumentationRequirements()
    ];

    return requirements.every(req => regionalRequirements.includes(req));
  }
} 