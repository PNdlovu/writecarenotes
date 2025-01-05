/**
 * Hook for managing care home compliance across different regulatory frameworks.
 * Supports offline operations and multi-tenant environments.
 * 
 * @remarks
 * This hook handles compliance requirements for:
 * - CQC (England)
 * - CIW (Wales)
 * - Care Inspectorate (Scotland)
 * - RQIA (Northern Ireland)
 * - HIQA (Ireland)
 * 
 * @example
 * ```tsx
 * function ComplianceView() {
 *   const { 
 *     complianceStatus,
 *     updateComplianceStatus,
 *     submitInspectionReport
 *   } = useComplianceManagement('care-home-id');
 * 
 *   // Handle updates
 *   const handleStatusUpdate = async (status) => {
 *     await updateComplianceStatus(status);
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
import { 
  ComplianceStatus, 
  InspectionRating, 
  ComplianceRequirement,
  RegulatoryBody,
  InspectionReport
} from '../types/compliance';

interface UseComplianceManagementReturn {
  complianceStatus: ComplianceStatus | null;
  inspectionReports: InspectionReport[];
  requirements: ComplianceRequirement[];
  isLoading: boolean;
  error: Error | null;
  fetchComplianceStatus: (careHomeId: string) => Promise<void>;
  updateComplianceStatus: (status: Partial<ComplianceStatus>) => Promise<void>;
  submitInspectionReport: (report: Omit<InspectionReport, 'id'>) => Promise<void>;
  updateRequirement: (
    requirementId: string,
    updates: Partial<ComplianceRequirement>
  ) => Promise<void>;
  scheduleInspection: (
    regulatoryBody: RegulatoryBody,
    date: Date
  ) => Promise<void>;
  generateComplianceReport: (
    startDate: Date,
    endDate: Date
  ) => Promise<Blob>;
}

export function useComplianceManagement(
  careHomeId?: string
): UseComplianceManagementReturn {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [inspectionReports, setInspectionReports] = useState<InspectionReport[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { showToast } = useToast();
  const { isOnline, syncStatus } = useOfflineSupport();
  const { tenant } = useTenantContext();
  const { region, regulations } = useRegion();

  const fetchComplianceStatus = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Handle offline scenario
      if (!isOnline) {
        const offlineData = await syncStatus.getOfflineData('compliance', id);
        if (offlineData) {
          setComplianceStatus(offlineData.status);
          setInspectionReports(offlineData.reports);
          setRequirements(offlineData.requirements);
          return;
        }
      }

      // Online fetch with tenant and region context
      const [status, reports, reqs] = await Promise.all([
        fetch(`/api/carehomes/${id}/compliance`, {
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }).then(res => res.json()),
        fetch(`/api/carehomes/${id}/inspections`, {
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }).then(res => res.json()),
        fetch(`/api/carehomes/${id}/requirements`, {
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }).then(res => res.json())
      ]);

      // Store data for offline use
      if (isOnline) {
        await syncStatus.storeOfflineData('compliance', id, {
          status,
          reports,
          requirements: reqs
        });
      }

      setComplianceStatus(status);
      setInspectionReports(reports);
      setRequirements(reqs);
    } catch (err: any) {
      setError(err);
      showToast({
        title: 'Error',
        description: 'Failed to fetch compliance data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast, isOnline, syncStatus, tenant.id, region]);

  const updateComplianceStatus = useCallback(async (status: Partial<ComplianceStatus>) => {
    if (!careHomeId) return;
    try {
      const updated = await fetch(`/api/carehomes/${careHomeId}/compliance`, {
        method: 'PATCH',
        body: JSON.stringify(status),
        headers: {
          'X-Tenant-ID': tenant.id,
          'X-Region': region
        }
      }).then(res => res.json());
      
      setComplianceStatus(updated);
      showToast({
        title: 'Success',
        description: 'Compliance status updated successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to update compliance status',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const submitInspectionReport = useCallback(async (report: Omit<InspectionReport, 'id'>) => {
    if (!careHomeId) return;
    try {
      const newReport = await fetch(`/api/carehomes/${careHomeId}/inspections`, {
        method: 'POST',
        body: JSON.stringify(report),
        headers: {
          'X-Tenant-ID': tenant.id,
          'X-Region': region
        }
      }).then(res => res.json());
      
      setInspectionReports(prev => [...prev, newReport]);
      showToast({
        title: 'Success',
        description: 'Inspection report submitted successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to submit inspection report',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const updateRequirement = useCallback(async (
    requirementId: string,
    updates: Partial<ComplianceRequirement>
  ) => {
    if (!careHomeId) return;
    try {
      const updated = await fetch(
        `/api/carehomes/${careHomeId}/requirements/${requirementId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }
      ).then(res => res.json());
      
      setRequirements(prev => 
        prev.map(req => req.id === requirementId ? updated : req)
      );
      showToast({
        title: 'Success',
        description: 'Requirement updated successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to update requirement',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const scheduleInspection = useCallback(async (
    regulatoryBody: RegulatoryBody,
    date: Date
  ) => {
    if (!careHomeId) return;
    try {
      await fetch(`/api/carehomes/${careHomeId}/inspections/schedule`, {
        method: 'POST',
        body: JSON.stringify({ regulatoryBody, date }),
        headers: {
          'X-Tenant-ID': tenant.id,
          'X-Region': region
        }
      });
      
      showToast({
        title: 'Success',
        description: 'Inspection scheduled successfully',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to schedule inspection',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  const generateComplianceReport = useCallback(async (
    startDate: Date,
    endDate: Date
  ): Promise<Blob> => {
    if (!careHomeId) throw new Error('Care home ID is required');
    
    try {
      const response = await fetch(
        `/api/carehomes/${careHomeId}/compliance/report`,
        {
          method: 'POST',
          body: JSON.stringify({ startDate, endDate }),
          headers: {
            'X-Tenant-ID': tenant.id,
            'X-Region': region
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      return await response.blob();
    } catch (err: any) {
      showToast({
        title: 'Error',
        description: 'Failed to generate compliance report',
        type: 'error'
      });
      throw err;
    }
  }, [careHomeId, showToast, tenant.id, region]);

  return {
    complianceStatus,
    inspectionReports,
    requirements,
    isLoading,
    error,
    fetchComplianceStatus,
    updateComplianceStatus,
    submitInspectionReport,
    updateRequirement,
    scheduleInspection,
    generateComplianceReport
  };
}


