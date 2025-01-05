export interface FamilyMember {
  id: string;
  residentId: string;
  firstName: string;
  lastName: string;
  relationship: FamilyRelationship;
  contactDetails: ContactDetails;
  accessLevel: AccessLevel;
  preferences: FamilyPortalPreferences;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  lastLogin?: Date;
}

export type FamilyRelationship = 
  | 'PARENT'
  | 'GUARDIAN'
  | 'SPOUSE'
  | 'CHILD'
  | 'SIBLING'
  | 'OTHER_RELATIVE'
  | 'POWER_OF_ATTORNEY'
  | 'ADVOCATE';

export interface ContactDetails {
  email: string;
  phone: string;
  alternativePhone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
  };
}

export type AccessLevel = 
  | 'FULL_ACCESS'        // Can view all information and give all consents
  | 'MEDICAL_ONLY'       // Can only view/consent to medical information
  | 'FINANCIAL_ONLY'     // Can only view/manage financial matters
  | 'VIEW_ONLY'          // Can only view basic information
  | 'CUSTOM';            // Custom permissions set

export interface FamilyPortalPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  };
  language: string;
  timezone: string;
  communicationPreferences: {
    preferredMethod: 'EMAIL' | 'PHONE' | 'SMS';
    preferredTime?: {
      start: string;  // HH:mm format
      end: string;    // HH:mm format
    };
    doNotDisturb: boolean;
  };
  dashboardCustomization: {
    defaultView: 'TIMELINE' | 'SUMMARY' | 'CALENDAR';
    widgets: string[];
  };
}


