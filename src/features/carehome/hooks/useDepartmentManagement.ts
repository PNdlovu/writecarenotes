/**
 * Hook for managing care home departments with support for offline operations,
 * multi-tenant environments, and regional requirements.
 * 
 * @remarks
 * This hook provides comprehensive department management functionality including:
 * - Department CRUD operations
 * - Staff assignments
 * - Resource allocation
 * - Performance metrics
 * 
 * Supports offline-first operations and maintains data consistency across
 * tenant boundaries.
 * 
 * @example
 * ```tsx
 * function DepartmentView() {
 *   const {
 *     departments,
 *     createDepartment,
 *     assignStaff
 *   } = useDepartmentManagement('care-home-id');
 * 
 *   const handleCreate = async (data) => {
 *     await createDepartment(data);
 *   };
 * }
 * ```
 * 
 * @packageDocumentation
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { useTenantContext } from '@/contexts/TenantContext';
import { useRegion } from '@/hooks/useRegion';
import { Department, Staff, ResourceAllocation } from '../types/common';

interface UseDepartmentManagementReturn {
  departments: Department[];
  staffAssignments: Record<string, Staff[]>;
  resourceAllocations: ResourceAllocation[];
  isLoading: boolean;
  error: Error | null;
  fetchDepartments: (careHomeId: string) => Promise<void>;
  createDepartment: (data: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, updates: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  assignStaff: (departmentId: string, staffId: string) => Promise<void>;
  unassignStaff: (departmentId: string, staffId: string) => Promise<void>;
  allocateResource: (
    departmentId: string,
    resourceId: string,
    quantity: number
  ) => Promise<void>;
  getDepartmentMetrics: (departmentId: string) => Promise<{
    occupancy: number;
    staffUtilization: number;
    resourceUsage: number;
  }>;
}

export function useDepartmentManagement(
  careHomeId?: string
): UseDepartmentManagementReturn {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<Record<string, Staff[]>>({});
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { showToast } = useToast();
  const { isOnline, syncStatus } = useOfflineSupport();
  const { tenant } = useTenantContext();
  const { region } = useRegion();

  const fetchDepartments = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Handle offline scenario
      if (!isOnline) {
        const offlineData = await syncStatus.getOfflineData('departments', id);
        if (offlineData) {
          setDepartments(offlineData.departments);
          setStaffAssignments(offlineData.staffAssignments);
          setResourceAllocations(offlineData.resourceAllocations);
          return;
        }
      }

      // Online fetch with tenant and region context
      const [depts, assignments, resources] = await Promise.all([
        fetch(`/api/carehomes/${id}/departments`, {
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }).then(res => res.json()),
        fetch(`/api/carehomes/${id}/departments/staff`, {
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }).then(res => res.json()),
        fetch(`/api/carehomes/${id}/departments/resources`, {
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }).then(res => res.json())
      ]);

      // Store data for offline use
      if (isOnline) {
        await syncStatus.storeOfflineData('departments', id, {
          departments: depts,
          staffAssignments: assignments,
          resourceAllocations: resources
        });
      }

      setDepartments(depts);
      setStaffAssignments(assignments);
      setResourceAllocations(resources);
    } catch (err: any) {
      setError(err);
      showToast({
        title: 'Error',
        description: 'Failed to fetch department data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast, isOnline, syncStatus, tenant.id, region]);

  const createDepartment = useCallback(async (data: Omit<Department, 'id'>) => {
    if (!careHomeId) return;
    try {
      const newDepartment = await fetch(`/api/carehomes/${careHomeId}/departments`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenant.id,
          'X-Region': region
        },
        body: JSON.stringify(data)
      }).then(res => res.json());
      
      setDepartments(prev => [...prev, newDepartment]);
      showToast({
        title: 'Success',
        description: 'Department created successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to create department',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const updateDepartment = useCallback(async (
    id: string,
    updates: Partial<Department>
  ) => {
    if (!careHomeId) return;
    try {
      const updated = await fetch(
        `/api/carehomes/${careHomeId}/departments/${id}`,
        {
          method: 'PATCH',
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          },
          body: JSON.stringify(updates)
        }
      ).then(res => res.json());
      
      setDepartments(prev =>
        prev.map(dept => dept.id === id ? updated : dept)
      );
      showToast({
        title: 'Success',
        description: 'Department updated successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to update department',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const deleteDepartment = useCallback(async (id: string) => {
    if (!careHomeId) return;
    try {
      await fetch(
        `/api/carehomes/${careHomeId}/departments/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }
      );
      
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      showToast({
        title: 'Success',
        description: 'Department deleted successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to delete department',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const assignStaff = useCallback(async (
    departmentId: string,
    staffId: string
  ) => {
    if (!careHomeId) return;
    try {
      const updatedAssignments = await fetch(
        `/api/carehomes/${careHomeId}/departments/${departmentId}/staff`,
        {
          method: 'POST',
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          },
          body: JSON.stringify({ staffId })
        }
      ).then(res => res.json());
      
      setStaffAssignments(prev => ({
        ...prev,
        [departmentId]: updatedAssignments
      }));
      showToast({
        title: 'Success',
        description: 'Staff assigned successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to assign staff',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const unassignStaff = useCallback(async (
    departmentId: string,
    staffId: string
  ) => {
    if (!careHomeId) return;
    try {
      const updatedAssignments = await fetch(
        `/api/carehomes/${careHomeId}/departments/${departmentId}/staff/${staffId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }
      ).then(res => res.json());
      
      setStaffAssignments(prev => ({
        ...prev,
        [departmentId]: updatedAssignments
      }));
      showToast({
        title: 'Success',
        description: 'Staff unassigned successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to unassign staff',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const allocateResource = useCallback(async (
    departmentId: string,
    resourceId: string,
    quantity: number
  ) => {
    if (!careHomeId) return;
    try {
      const newAllocation = await fetch(
        `/api/carehomes/${careHomeId}/departments/${departmentId}/resources`,
        {
          method: 'POST',
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          },
          body: JSON.stringify({ resourceId, quantity })
        }
      ).then(res => res.json());
      
      setResourceAllocations(prev => [...prev, newAllocation]);
      showToast({
        title: 'Success',
        description: 'Resource allocated successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to allocate resource',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const getDepartmentMetrics = useCallback(async (departmentId: string) => {
    if (!careHomeId) throw new Error('Care home ID is required');
    
    try {
      return await fetch(
        `/api/carehomes/${careHomeId}/departments/${departmentId}/metrics`,
        {
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }
      ).then(res => res.json());
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to fetch department metrics',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  return {
    departments,
    staffAssignments,
    resourceAllocations,
    isLoading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignStaff,
    unassignStaff,
    allocateResource,
    getDepartmentMetrics
  };
}


