import { useState, useCallback, useEffect } from 'react';
import { EmergencyService } from '../services/emergencyService';
import { 
  EmergencyIncident, 
  EmergencyAction, 
  EmergencyType,
  EmergencyStatus 
} from '../types';
import { getNextRequiredAction, generateProtocolSummary } from '../utils/protocolUtils';
import { useNotification } from '@/features/notifications/hooks/useNotification';
import { useAccess } from '@/features/access-management/hooks/useAccess';

const emergencyService = new EmergencyService();

export const useEmergency = (incidentId?: string) => {
  const [incident, setIncident] = useState<EmergencyIncident | null>(null);
  const [actions, setActions] = useState<EmergencyAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { grantEmergencyAccess } = useAccess();

  const loadIncident = useCallback(async () => {
    if (!incidentId) return;
    
    try {
      setLoading(true);
      const loadedIncident = await emergencyService.getIncident(incidentId);
      const incidentActions = await emergencyService.getIncidentActions(incidentId);
      setIncident(loadedIncident);
      setActions(incidentActions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emergency incident');
      showNotification({
        type: 'error',
        message: 'Failed to load emergency incident',
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setLoading(false);
    }
  }, [incidentId, showNotification]);

  const declareEmergency = useCallback(async (
    type: EmergencyType,
    location: string,
    details: string
  ) => {
    try {
      setLoading(true);
      const newIncident = await emergencyService.declareEmergency(
        type,
        location,
        details
      );
      setIncident(newIncident);
      showNotification({
        type: 'success',
        message: 'Emergency Declared',
        description: 'Emergency protocols have been initiated'
      });
      return newIncident;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to declare emergency');
      showNotification({
        type: 'error',
        message: 'Failed to declare emergency',
        description: err instanceof Error ? err.message : undefined
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const recordAction = useCallback(async (
    action: Omit<EmergencyAction, 'id' | 'timestamp'>
  ) => {
    if (!incident) {
      throw new Error('No active incident');
    }

    try {
      setLoading(true);
      const newAction: EmergencyAction = {
        ...action,
        id: crypto.randomUUID(),
        timestamp: new Date()
      };
      await emergencyService.recordAction(incident.id, newAction);
      setActions(prev => [...prev, newAction]);
      
      showNotification({
        type: 'success',
        message: 'Action Recorded',
        description: 'Emergency action has been logged'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record action');
      showNotification({
        type: 'error',
        message: 'Failed to record action',
        description: err instanceof Error ? err.message : undefined
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [incident, showNotification]);

  const updateStatus = useCallback(async (status: EmergencyStatus) => {
    if (!incident) {
      throw new Error('No active incident');
    }

    try {
      setLoading(true);
      await emergencyService.updateIncidentStatus(incident.id, status);
      setIncident(prev => prev ? { ...prev, status } : null);
      
      showNotification({
        type: 'success',
        message: 'Status Updated',
        description: `Emergency status updated to ${status}`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      showNotification({
        type: 'error',
        message: 'Failed to update status',
        description: err instanceof Error ? err.message : undefined
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [incident, showNotification]);

  const getProtocolStatus = useCallback(() => {
    if (!incident) return null;
    
    const nextAction = getNextRequiredAction(incident.protocol, actions);
    const summary = generateProtocolSummary(incident, actions);
    
    return {
      nextAction,
      summary
    };
  }, [incident, actions]);

  useEffect(() => {
    loadIncident();
  }, [loadIncident]);

  return {
    incident,
    actions,
    loading,
    error,
    declareEmergency,
    recordAction,
    updateStatus,
    getProtocolStatus,
    refresh: loadIncident
  };
};
