/**
 * @fileoverview Organization types and enums
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export enum Region {
  ENGLAND = 'england',
  WALES = 'wales',
  SCOTLAND = 'scotland',
  NORTHERN_IRELAND = 'northern-ireland',
  IRELAND = 'ireland'
}

export enum RegulatoryBody {
  CQC = 'cqc',
  CIW = 'ciw',
  CARE_INSPECTORATE = 'care-inspectorate',
  RQIA = 'rqia',
  HIQA = 'hiqa'
}

export interface Organization {
  id: string;
  name: string;
  region: Region;
  regulatoryBody: RegulatoryBody;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationWithDetails extends Organization {
  careHomes: CareHome[];
  users: User[];
}

export interface CareHome {
  id: string;
  name: string;
  address: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
} 