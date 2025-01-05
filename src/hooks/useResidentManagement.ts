import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useOffline } from '@/hooks/useOffline';
import { useToast } from '@/hooks/useToast';

interface CarePlan {
  id: string;
  residentId: string;
  startDate: Date;
  endDate?: Date;
  careLevel: string;
  medications: {
    medicationId: string;
    schedule: string;
    dosage: string;
  }[];
  activities: {
    type: string;
    frequency: string;
    notes?: string;
  }[];
  dietaryRequirements: {
    restrictions: string[];
    preferences: string[];
    specialInstructions?: string;
  };
  notes: string;
}

interface MedicalHistory {
  id: string;
  residentId: string;
  conditions: {
    name: string;
    diagnosedDate: Date;
    status: 'ACTIVE' | 'MANAGED' | 'RESOLVED';
    notes?: string;
  }[];
  allergies: {
    type: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    notes?: string;
  }[];
  medications: {
    name: string;
    dosage: string;
    startDate: Date;
    endDate?: Date;
    prescribedBy: string;
  }[];
}

interface FamilyContact {
  id: string;
  residentId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isEmergencyContact: boolean;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
}

interface DailyActivity {
  id: string;
  residentId: string;
  date: Date;
  activities: {
    type: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
    completedBy: string;
  }[];
  meals: {
    type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    time: Date;
    consumed: 'FULL' | 'PARTIAL' | 'NONE';
    notes?: string;
  }[];
  vitals?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    oxygenSaturation?: number;
    recordedAt: Date;
    recordedBy: string;
  };
  mood?: string;
  notes?: string;
}

export function useResidentManagement(facilityId: string) {
  const { user, isLoading: authLoading, getAuthHeaders } = useAuth();
  const { isOnline, queueOfflineAction } = useOffline();
  const { syncOfflineData } = useOfflineSync();
  const { showToast } = useToast();
  
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [familyContacts, setFamilyContacts] = useState<FamilyContact[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadResidentData = useCallback(async (residentId: string) => {
    if (!user?.facility) return;
    setIsLoading(true);

    try {
      const headers = await getAuthHeaders();
      const [
        carePlanResponse,
        medicalHistoryResponse,
        contactsResponse,
        activitiesResponse
      ] = await Promise.all([
        fetch(`/api/facilities/${facilityId}/residents/${residentId}/care-plan`, {
          headers
        }),
        fetch(`/api/facilities/${facilityId}/residents/${residentId}/medical-history`, {
          headers
        }),
        fetch(`/api/facilities/${facilityId}/residents/${residentId}/contacts`, {
          headers
        }),
        fetch(`/api/facilities/${facilityId}/residents/${residentId}/activities`, {
          headers
        })
      ]);

      if (!carePlanResponse.ok || !medicalHistoryResponse.ok || 
          !contactsResponse.ok || !activitiesResponse.ok) {
        throw new Error('Failed to fetch resident data');
      }

      const [carePlan, medicalHistory, contacts, activities] = await Promise.all([
        carePlanResponse.json(),
        medicalHistoryResponse.json(),
        contactsResponse.json(),
        activitiesResponse.json()
      ]);

      setCarePlans(prevPlans => [...prevPlans, carePlan]);
      setMedicalHistories(prevHistories => [...prevHistories, medicalHistory]);
      setFamilyContacts(prevContacts => [...prevContacts, ...contacts]);
      setDailyActivities(prevActivities => [...prevActivities, ...activities]);
    } catch (error) {
      console.error('Failed to load resident data:', error);
      showToast('Failed to load resident data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, user?.facility, getAuthHeaders, showToast]);

  const updateCarePlan = useCallback(async (
    residentId: string,
    carePlan: Partial<CarePlan>
  ) => {
    if (!user?.facility) return null;

    if (!isOnline) {
      await queueOfflineAction('update-care-plan', {
        residentId,
        carePlan,
        facilityId,
        facilityId: user.facility
      });
      showToast('Care plan will be updated when back online', 'info');
      return carePlan;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/residents/${residentId}/care-plan`,
        {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(carePlan)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update care plan');
      }

      const updatedPlan = await response.json();
      setCarePlans(prev => 
        prev.map(plan => plan.residentId === residentId ? updatedPlan : plan)
      );

      showToast('Care plan updated successfully', 'success');
      return updatedPlan;
    } catch (error) {
      console.error('Failed to update care plan:', error);
      showToast('Failed to update care plan', 'error');
      return null;
    }
  }, [facilityId, isOnline, queueOfflineAction, user?.facility, getAuthHeaders, showToast]);

  const recordDailyActivity = useCallback(async (
    residentId: string,
    activity: Omit<DailyActivity, 'id'>
  ) => {
    if (!user?.facility) return null;

    if (!isOnline) {
      await queueOfflineAction('record-activity', {
        residentId,
        activity,
        facilityId,
        facilityId: user.facility
      });
      showToast('Activity will be recorded when back online', 'info');
      return activity;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/residents/${residentId}/activities`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(activity)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to record activity');
      }

      const newActivity = await response.json();
      setDailyActivities(prev => [...prev, newActivity]);

      showToast('Activity recorded successfully', 'success');
      return newActivity;
    } catch (error) {
      console.error('Failed to record activity:', error);
      showToast('Failed to record activity', 'error');
      return null;
    }
  }, [facilityId, isOnline, queueOfflineAction, user?.facility, getAuthHeaders, showToast]);

  return {
    carePlans,
    medicalHistories,
    familyContacts,
    dailyActivities,
    isLoading: isLoading || authLoading,
    loadResidentData,
    updateCarePlan,
    recordDailyActivity
  };
}


