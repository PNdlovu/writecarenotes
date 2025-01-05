// src/hooks/useCareHomeManagement.ts
import { useState, useEffect, useCallback, useContext } from 'react';
import { careHomeService } from '@/services/careHomeService';
import { AppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/useToast';
import {
  CareHome,
  Department,
  Staff,
  ResourceAllocation,
  Schedule,
} from '@/types/core';

interface UseCareHomeManagementReturn {
  careHome: CareHome | null;
  departments: Department[];
  staff: Staff[];
  resources: ResourceAllocation[];
  isLoading: boolean;
  error: Error | null;
  loadCareHome: (id: string) => Promise<void>;
  updateCareHome: (data: Partial<CareHome>) => Promise<void>;
  createDepartment: (data: {
    name: string;
    type: string;
    head?: string;
    capacity?: number;
  }) => Promise<void>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addStaffMember: (data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    departments: string[];
    qualifications: string[];
    schedule?: Schedule;
    contact: {
      phone: string;
      emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
      };
    };
  }) => Promise<void>;
  updateStaffMember: (id: string, data: Partial<Staff>) => Promise<void>;
  removeStaffMember: (id: string) => Promise<void>;
  allocateResource: (
    resourceId: string,
    departmentId: string,
    quantity: number,
    startDate: Date,
    endDate?: Date
  ) => Promise<void>;
  deallocateResource: (allocationId: string) => Promise<void>;
  updateSchedule: (staffId: string, schedule: Schedule) => Promise<void>;
  validateLicense: (licenseNumber: string) => Promise<{
    valid: boolean;
    expiryDate?: string;
    status?: string;
  }>;
  generateReport: (startDate: Date, endDate: Date) => Promise<Blob>;
}

export function useCareHomeManagement(
  careHomeId?: string
): UseCareHomeManagementReturn {
  const [careHome, setCareHome] = useState<CareHome | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [resources, setResources] = useState<ResourceAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { currentTenant } = useContext(AppContext);
  const { showToast } = useToast();

  // Load care home data
  const loadCareHome = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          careHomeData,
          departmentsData,
          staffData,
          resourcesData,
        ] = await Promise.all([
          careHomeService.getCareHome(id),
          careHomeService.listDepartments(id),
          careHomeService.listStaff(id),
          Promise.all(
            (await careHomeService.listDepartments(id)).departments.map(
              (dept) => careHomeService.getResourceAllocations(dept.id)
            )
          ),
        ]);

        setCareHome(careHomeData);
        setDepartments(departmentsData.departments);
        setStaff(staffData.staff);
        setResources(resourcesData.flat());
      } catch (err: any) {
        setError(err);
        showToast({
          title: 'Error',
          description: err.message || 'Failed to load care home data',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  // Load initial data if careHomeId is provided
  useEffect(() => {
    if (careHomeId) {
      loadCareHome(careHomeId);
    }
  }, [careHomeId, loadCareHome]);

  // Care Home Operations
  const updateCareHome = useCallback(
    async (data: Partial<CareHome>) => {
      if (!careHome) return;

      try {
        const updated = await careHomeService.updateCareHome(
          careHome.id,
          data
        );
        setCareHome(updated);
        showToast({
          title: 'Success',
          description: 'Care home updated successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to update care home',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  // Department Operations
  const createDepartment = useCallback(
    async (data: {
      name: string;
      type: string;
      head?: string;
      capacity?: number;
    }) => {
      if (!careHome) return;

      try {
        const newDepartment = await careHomeService.createDepartment({
          ...data,
          careHomeId: careHome.id,
        });
        setDepartments((prev) => [...prev, newDepartment]);
        showToast({
          title: 'Success',
          description: 'Department created successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to create department',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  const updateDepartment = useCallback(
    async (id: string, data: Partial<Department>) => {
      if (!careHome) return;

      try {
        const updated = await careHomeService.updateDepartment(id, data);
        setDepartments((prev) =>
          prev.map((dept) => (dept.id === id ? updated : dept))
        );
        showToast({
          title: 'Success',
          description: 'Department updated successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to update department',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  const deleteDepartment = useCallback(
    async (id: string) => {
      if (!careHome) return;

      try {
        await careHomeService.deleteDepartment(id, careHome.id);
        setDepartments((prev) => prev.filter((dept) => dept.id !== id));
        showToast({
          title: 'Success',
          description: 'Department deleted successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to delete department',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  // Staff Operations
  const addStaffMember = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      departments: string[];
      qualifications: string[];
      schedule?: Schedule;
      contact: {
        phone: string;
        emergencyContact: {
          name: string;
          phone: string;
          relationship: string;
        };
      };
    }) => {
      if (!careHome) return;

      try {
        const newStaff = await careHomeService.addStaffMember({
          ...data,
          careHomeId: careHome.id,
        });
        setStaff((prev) => [...prev, newStaff]);
        showToast({
          title: 'Success',
          description: 'Staff member added successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to add staff member',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  const updateStaffMember = useCallback(
    async (id: string, data: Partial<Staff>) => {
      if (!careHome) return;

      try {
        const updated = await careHomeService.updateStaffMember(id, data);
        setStaff((prev) =>
          prev.map((member) => (member.id === id ? updated : member))
        );
        showToast({
          title: 'Success',
          description: 'Staff member updated successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to update staff member',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  const removeStaffMember = useCallback(
    async (id: string) => {
      if (!careHome) return;

      try {
        await careHomeService.removeStaffMember(id, careHome.id);
        setStaff((prev) => prev.filter((member) => member.id !== id));
        showToast({
          title: 'Success',
          description: 'Staff member removed successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to remove staff member',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  // Resource Operations
  const allocateResource = useCallback(
    async (
      resourceId: string,
      departmentId: string,
      quantity: number,
      startDate: Date,
      endDate?: Date
    ) => {
      if (!careHome) return;

      try {
        const allocation = await careHomeService.allocateResource(
          resourceId,
          departmentId,
          quantity,
          startDate,
          endDate
        );
        setResources((prev) => [...prev, allocation]);
        showToast({
          title: 'Success',
          description: 'Resource allocated successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to allocate resource',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  const deallocateResource = useCallback(
    async (allocationId: string) => {
      if (!careHome) return;

      try {
        await careHomeService.deallocateResource(allocationId);
        setResources((prev) =>
          prev.filter((allocation) => allocation.id !== allocationId)
        );
        showToast({
          title: 'Success',
          description: 'Resource deallocated successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to deallocate resource',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  // Schedule Operations
  const updateSchedule = useCallback(
    async (staffId: string, schedule: Schedule) => {
      if (!careHome) return;

      try {
        await careHomeService.updateStaffSchedule(staffId, schedule);
        setStaff((prev) =>
          prev.map((member) =>
            member.id === staffId
              ? { ...member, schedule }
              : member
          )
        );
        showToast({
          title: 'Success',
          description: 'Schedule updated successfully',
          type: 'success',
        });
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to update schedule',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  // Validation Operations
  const validateLicense = useCallback(
    async (licenseNumber: string) => {
      try {
        return await careHomeService.validateLicense(licenseNumber);
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to validate license',
          type: 'error',
        });
        throw err;
      }
    },
    [showToast]
  );

  // Reporting Operations
  const generateReport = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!careHome) throw new Error('Care home not selected');

      try {
        return await careHomeService.generateReport(
          careHome.id,
          startDate,
          endDate
        );
      } catch (err: any) {
        showToast({
          title: 'Error',
          description: err.message || 'Failed to generate report',
          type: 'error',
        });
        throw err;
      }
    },
    [careHome, showToast]
  );

  return {
    careHome,
    departments,
    staff,
    resources,
    isLoading,
    error,
    loadCareHome,
    updateCareHome,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    addStaffMember,
    updateStaffMember,
    removeStaffMember,
    allocateResource,
    deallocateResource,
    updateSchedule,
    validateLicense,
    generateReport,
  };
}


