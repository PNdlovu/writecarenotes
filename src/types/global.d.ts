// Global type definitions that extend existing types without breaking changes
import { User, CareHome, Resident, Medication, Schedule } from '@prisma/client'

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
    careHomes?: CareHome[];
  }

  // Extended CareHome type with additional properties
  interface ExtendedCareHome extends CareHome {
    residents?: Resident[];
    staff?: Staff[];
  }

  // Extended Resident type with additional properties
  interface ExtendedResident extends Resident {
    medications?: Medication[];
    careHome?: CareHome;
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
    careHomeName?: string;
  }

  // Schedule types
  interface ScheduleEntry extends Schedule {
    staff?: ExtendedUser;
    careHome?: CareHome;
  }

  interface Organization {
    id: string;
    name: string;
    careHomes?: CareHome[];
  }

  interface Staff {
    careHome?: CareHome;
  }

  interface Incident {
    careHomeName?: string;
  }

  interface Resident {
    careHome?: CareHome;
  }
}

export {}
