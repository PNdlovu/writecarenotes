// Global type definitions that extend existing types without breaking changes
import { User, Facility, Resident, Medication, Schedule } from '@prisma/client'

declare global {
  // Extend window type
  interface Window {
    workbox?: any;
  }

  // Common API Response types
  type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }

  // Extended User type with additional properties
  interface ExtendedUser extends User {
    facilities?: Facility[];
  }

  // Extended Facility type with additional properties
  interface ExtendedFacility extends Facility {
    residents?: Resident[];
    staff?: ExtendedUser[];
  }

  // Extended Resident type with additional properties
  interface ExtendedResident extends Resident {
    medications?: Medication[];
    facility?: Facility;
  }

  // API Request types
  interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }

  interface SearchParams {
    query?: string;
    filters?: Record<string, any>;
  }

  // Common form types
  interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
  }

  // Auth types
  interface LoginCredentials {
    email: string;
    password: string;
  }

  interface RegistrationData extends LoginCredentials {
    name: string;
    facilityName?: string;
  }

  // Schedule types
  interface ScheduleEntry extends Schedule {
    staff?: ExtendedUser;
    facility?: Facility;
  }
}

export {}
