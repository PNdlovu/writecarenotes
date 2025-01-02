/**
 * WriteCareNotes.com
 * @fileoverview Quality Module Custom Hooks
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState, useEffect, useCallback } from 'react';
import { QualityService } from '../services/qualityService';
import { 
  QualityAudit, 
  QualityFilter, 
  QualityStats,
  ActionPlan,
  Action
} from '../types';
import { validateAudit } from '../utils/qualityUtils';

interface UseQualityAuditProps {
  auditId?: string;
  initialData?: QualityAudit;
}

interface UseQualityAuditsProps {
  filters?: QualityFilter;
  initialData?: QualityAudit[];
}

interface UseQualityStatsProps {
  careHomeId: string;
  refreshInterval?: number;
}

/**
 * Hook for managing a single quality audit
 */
export function useQualityAudit({ auditId, initialData }: UseQualityAuditProps) {
  const [audit, setAudit] = useState<QualityAudit | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const qualityService = QualityService.getInstance();

  const fetchAudit = useCallback(async () => {
    if (!auditId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await qualityService.getAudit(auditId);
      setAudit(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch audit'));
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  const updateAudit = useCallback(async (updates: Partial<QualityAudit>) => {
    if (!auditId || !audit) return;

    try {
      setLoading(true);
      setError(null);
      const updatedAudit = await qualityService.updateAudit(auditId, updates);
      setAudit(updatedAudit);
      return updatedAudit;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update audit'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auditId, audit]);

  const deleteAudit = useCallback(async () => {
    if (!auditId) return;

    try {
      setLoading(true);
      setError(null);
      await qualityService.deleteAudit(auditId);
      setAudit(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete audit'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    if (auditId && !initialData) {
      fetchAudit();
    }
  }, [auditId, initialData, fetchAudit]);

  return {
    audit,
    loading,
    error,
    updateAudit,
    deleteAudit,
    refreshAudit: fetchAudit
  };
}

/**
 * Hook for managing multiple quality audits
 */
export function useQualityAudits({ filters, initialData }: UseQualityAuditsProps = {}) {
  const [audits, setAudits] = useState<QualityAudit[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const qualityService = QualityService.getInstance();

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await qualityService.listAudits(filters);
      setAudits(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch audits'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createAudit = useCallback(async (newAudit: Omit<QualityAudit, 'id' | 'metadata'>) => {
    try {
      const validation = validateAudit(newAudit as QualityAudit);
      if (!validation.valid) {
        throw new Error(`Invalid audit data: ${validation.errors.join(', ')}`);
      }

      setLoading(true);
      setError(null);
      const createdAudit = await qualityService.createAudit(newAudit);
      setAudits(prev => [...prev, createdAudit]);
      return createdAudit;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create audit'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchAudits();
    }
  }, [initialData, fetchAudits]);

  return {
    audits,
    loading,
    error,
    createAudit,
    refreshAudits: fetchAudits
  };
}

/**
 * Hook for managing quality statistics
 */
export function useQualityStats({ careHomeId, refreshInterval = 0 }: UseQualityStatsProps) {
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const qualityService = QualityService.getInstance();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await qualityService.getQualityStats(careHomeId);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quality stats'));
    } finally {
      setLoading(false);
    }
  }, [careHomeId]);

  useEffect(() => {
    fetchStats();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refreshInterval]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
}

/**
 * Hook for managing action plans
 */
export function useActionPlan(auditId: string) {
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const qualityService = QualityService.getInstance();

  const createActionPlan = useCallback(async (plan: Omit<ActionPlan, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const createdPlan = await qualityService.createActionPlan(auditId, plan);
      setActionPlan(createdPlan);
      return createdPlan;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create action plan'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  const updateAction = useCallback(async (
    planId: string,
    actionId: string,
    updates: Partial<Action>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedAction = await qualityService.updateAction(
        auditId,
        planId,
        actionId,
        updates
      );
      
      setActionPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          actions: prev.actions.map(action =>
            action.id === actionId ? { ...action, ...updatedAction } : action
          )
        };
      });
      
      return updatedAction;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update action'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  return {
    actionPlan,
    loading,
    error,
    createActionPlan,
    updateAction
  };
}
