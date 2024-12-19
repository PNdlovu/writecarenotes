import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useOfflineSupport } from './useOfflineSupport';
import { useToast } from '@/hooks/useToast';
import { facilityService } from '@/services/facilityService';
import { Department, DepartmentStats, DepartmentType, StaffRole } from '@/types/department';

interface DepartmentFormData {
  name: string;
  type: DepartmentType;
  description?: string;
  careLevels: string[];
  capacity: {
    residents: number;
    staffing: {
      role: StaffRole;
      minCount: number;
    }[];
  };
  location: {
    floor: number;
    wing?: string;
    zones: string[];
  };
  features: {
    medicationManagement: boolean;
    specializedCare: boolean;
    rehabilitation: boolean;
    activities: boolean;
    monitoring: boolean;
  };
}

export function useDepartmentManagement(facilityId: string) {
  const { user, isLoading: authLoading, getAuthHeaders } = useAuth();
  const { isOnline, queueOfflineAction } = useOfflineSupport();
  const { showToast } = useToast();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentStats, setDepartmentStats] = useState<Record<string, DepartmentStats>>({});
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDepartments = useCallback(async () => {
    if (!user?.facility) return;
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/departments`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      setDepartments(data);
      
      // Load department stats
      const statsPromises = data.map(async (dept: Department) => {
        const statsResponse = await fetch(
          `/api/facilities/${facilityId}/departments/${dept.id}/stats`,
          { headers }
        );
        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch stats for department ${dept.id}`);
        }
        return statsResponse.json();
      });
      
      const stats = await Promise.all(statsPromises);
      const statsMap = stats.reduce((acc, stat) => {
        acc[stat.departmentId] = stat;
        return acc;
      }, {} as Record<string, DepartmentStats>);
      
      setDepartmentStats(statsMap);
    } catch (error) {
      console.error('Failed to load departments:', error);
      showToast('Failed to load departments', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, user?.facility, getAuthHeaders, showToast]);

  const createDepartment = useCallback(async (data: DepartmentFormData) => {
    if (!user?.facility) return null;

    const departmentData = {
      ...data,
      facilityId: user.facility,
      status: 'ACTIVE' as const
    };

    if (!isOnline) {
      await queueOfflineAction('create-department', {
        data: departmentData,
        facilityId
      });
      showToast('Department will be created when back online', 'info');
      return departmentData;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/departments`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(departmentData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create department');
      }
      
      const newDepartment = await response.json();
      setDepartments(prev => [...prev, newDepartment]);
      showToast('Department created successfully', 'success');
      
      return newDepartment;
    } catch (error) {
      console.error('Failed to create department:', error);
      showToast('Failed to create department', 'error');
      return null;
    }
  }, [facilityId, isOnline, queueOfflineAction, user?.facility, getAuthHeaders, showToast]);

  const updateDepartment = useCallback(async (
    departmentId: string,
    data: Partial<DepartmentFormData>
  ) => {
    if (!user?.facility) return null;

    const updateData = {
      ...data,
      facilityId: user.facility
    };

    if (!isOnline) {
      await queueOfflineAction('update-department', {
        departmentId,
        data: updateData,
        facilityId
      });
      showToast('Department will be updated when back online', 'info');
      return updateData;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/departments/${departmentId}`,
        {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update department');
      }
      
      const updatedDepartment = await response.json();
      setDepartments(prev => 
        prev.map(dept => dept.id === departmentId ? updatedDepartment : dept)
      );
      
      showToast('Department updated successfully', 'success');
      return updatedDepartment;
    } catch (error) {
      console.error('Failed to update department:', error);
      showToast('Failed to update department', 'error');
      return null;
    }
  }, [facilityId, isOnline, queueOfflineAction, user?.facility, getAuthHeaders, showToast]);

  const assignStaffToDepartment = useCallback(async (
    departmentId: string,
    staffAssignments: { staffId: string; role: StaffRole; }[]
  ) => {
    if (!user?.facility) return;

    if (!isOnline) {
      await queueOfflineAction('assign-staff', {
        departmentId,
        staffAssignments,
        facilityId
      });
      showToast('Staff assignments will be updated when back online', 'info');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/departments/${departmentId}/staff`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ staffAssignments })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to assign staff');
      }
      
      await loadDepartments();
      showToast('Staff assigned successfully', 'success');
    } catch (error) {
      console.error('Failed to assign staff:', error);
      showToast('Failed to assign staff', 'error');
    }
  }, [facilityId, isOnline, loadDepartments, queueOfflineAction, user?.facility, getAuthHeaders, showToast]);

  return {
    departments,
    departmentStats,
    selectedDepartment,
    isLoading: isLoading || authLoading,
    loadDepartments,
    createDepartment,
    updateDepartment,
    assignStaffToDepartment,
    setSelectedDepartment,
  };
}


