/**
 * WriteCareNotes.com
 * @fileoverview Emergency Module Custom Hooks
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState, useEffect, useCallback } from 'react';
import { EmergencyService } from '../services/emergencyService';
import {
  EmergencyIncident,
  EmergencyProtocol,
  EmergencyAction,
  EmergencyReport,
  EmergencyType,
  EmergencyDashboardFilters
} from '../types';
import {
  validateIncident,
  determineEmergencyType,
  determineSeverity,
  canResolveIncident
} from '../utils/emergencyUtils';

interface UseEmergencyIncidentProps {
  incidentId?: string;
  initialData?: EmergencyIncident;
}

interface UseEmergencyProtocolProps {
  type?: EmergencyType;
  initialData?: EmergencyProtocol[];
}

/**
 * Hook for managing a single emergency incident
 */
export function useEmergencyIncident({ incidentId, initialData }: UseEmergencyIncidentProps) {
  const [incident, setIncident] = useState<EmergencyIncident | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const emergencyService = EmergencyService.getInstance();

  const fetchIncident = useCallback(async () => {
    if (!incidentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await emergencyService.getIncident(incidentId);
      setIncident(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch incident'));
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  const updateIncident = useCallback(async (updates: Partial<EmergencyIncident>) => {
    if (!incidentId || !incident) return;

    try {
      setLoading(true);
      setError(null);
      const updatedIncident = await emergencyService.updateIncident(incidentId, updates);
      setIncident(updatedIncident);
      return updatedIncident;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update incident'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [incidentId, incident]);

  const recordAction = useCallback(async (action: Omit<EmergencyAction, 'id'>) => {
    if (!incidentId) return;

    try {
      setLoading(true);
      setError(null);
      const recordedAction = await emergencyService.recordAction(incidentId, action);
      setIncident(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          timeline: [...prev.timeline, recordedAction]
        };
      });
      return recordedAction;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to record action'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  const resolveIncident = useCallback(async () => {
    if (!incident) return;

    const resolution = canResolveIncident(incident);
    if (!resolution.resolvable) {
      throw new Error(resolution.reason);
    }

    try {
      setLoading(true);
      setError(null);
      const resolvedIncident = await emergencyService.updateIncident(incident.id, {
        status: 'RESOLVED',
        resolvedAt: new Date()
      });
      setIncident(resolvedIncident);
      return resolvedIncident;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to resolve incident'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [incident]);

  useEffect(() => {
    if (incidentId && !initialData) {
      fetchIncident();
    }
  }, [incidentId, initialData, fetchIncident]);

  return {
    incident,
    loading,
    error,
    updateIncident,
    recordAction,
    resolveIncident,
    refreshIncident: fetchIncident
  };
}

/**
 * Hook for managing multiple emergency incidents
 */
export function useEmergencyDashboard(filters?: EmergencyDashboardFilters) {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const emergencyService = EmergencyService.getInstance();

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emergencyService.listIncidents(filters);
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch incidents'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createIncident = useCallback(async (
    incidentData: Omit<EmergencyIncident, 'id' | 'timeline' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const validation = validateIncident(incidentData as EmergencyIncident);
      if (!validation.valid) {
        throw new Error(`Invalid incident data: ${validation.errors.join(', ')}`);
      }

      setLoading(true);
      setError(null);
      const createdIncident = await emergencyService.createIncident(incidentData);
      setIncidents(prev => [...prev, createdIncident]);
      return createdIncident;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create incident'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    createIncident,
    refreshIncidents: fetchIncidents
  };
}

/**
 * Hook for managing emergency protocols
 */
export function useEmergencyProtocols({ type, initialData }: UseEmergencyProtocolProps = {}) {
  const [protocols, setProtocols] = useState<EmergencyProtocol[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const emergencyService = EmergencyService.getInstance();

  const fetchProtocols = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emergencyService.getProtocols(type);
      setProtocols(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch protocols'));
    } finally {
      setLoading(false);
    }
  }, [type]);

  const saveProtocol = useCallback(async (protocol: Omit<EmergencyProtocol, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const savedProtocol = await emergencyService.saveProtocol(protocol);
      setProtocols(prev => {
        const index = prev.findIndex(p => p.id === savedProtocol.id);
        if (index >= 0) {
          return [
            ...prev.slice(0, index),
            savedProtocol,
            ...prev.slice(index + 1)
          ];
        }
        return [...prev, savedProtocol];
      });
      return savedProtocol;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save protocol'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchProtocols();
    }
  }, [initialData, fetchProtocols]);

  return {
    protocols,
    loading,
    error,
    saveProtocol,
    refreshProtocols: fetchProtocols
  };
}

/**
 * Hook for managing emergency reports
 */
export function useEmergencyReporting(incidentId: string) {
  const [report, setReport] = useState<EmergencyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const emergencyService = EmergencyService.getInstance();

  const createReport = useCallback(async (reportData: Omit<EmergencyReport, 'id' | 'submittedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const createdReport = await emergencyService.createReport({
        ...reportData,
        incidentId
      });
      setReport(createdReport);
      return createdReport;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create report'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  const updateReportStatus = useCallback(async (
    reportId: string,
    status: 'SUBMITTED' | 'REVIEWED' | 'APPROVED',
    reviewedBy?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReport = await emergencyService.updateReportStatus(
        reportId,
        status,
        reviewedBy
      );
      setReport(updatedReport);
      return updatedReport;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update report status'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    report,
    loading,
    error,
    createReport,
    updateReportStatus
  };
}
