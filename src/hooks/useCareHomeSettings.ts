import { useState, useEffect } from 'react';
import { CareHomeSettings } from '../types/careHomeSettings';
import { careHomeService } from '../services/careHomeService';
import { useAuth } from './useAuth';
import { useToast } from '@chakra-ui/react';

export const useCareHomeSettings = (careHomeId: string) => {
  const [settings, setSettings] = useState<CareHomeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();
  const toast = useToast();

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await careHomeService.getCareHomeSettings(careHomeId, getAuthHeaders());
      setSettings(response);
      setError(null);
    } catch (err) {
      setError('Failed to load care home settings');
      toast({
        title: 'Error',
        description: 'Failed to load care home settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updatedSettings: Partial<CareHomeSettings>) => {
    try {
      setLoading(true);
      const response = await careHomeService.updateCareHomeSettings(
        careHomeId,
        updatedSettings,
        getAuthHeaders()
      );
      setSettings(response);
      toast({
        title: 'Success',
        description: 'Care home settings updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return true;
    } catch (err) {
      setError('Failed to update care home settings');
      toast({
        title: 'Error',
        description: 'Failed to update care home settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [careHomeId]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    reloadSettings: loadSettings,
  };
};


