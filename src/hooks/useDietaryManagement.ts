import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useOfflineSupport } from './useOfflineSupport';
import { useToast } from '@/hooks/useToast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { dietaryService } from '../services/dietaryService';
import {
  DietaryProfile,
  MealPlan,
  MealService,
  NutritionLog,
  DietaryAlert,
  MealType,
  MenuItem,
  DietaryRestriction,
  NutritionGoal
} from '../types/dietary';

export function useDietaryManagement(facilityId: string) {
  const { user, isLoading: authLoading, getAuthHeaders } = useAuth();
  const { isOnline, queueOfflineAction } = useOfflineSupport();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dietary Profile Queries
  const useDietaryProfile = (residentId: string) => {
    return useQuery({
      queryKey: ['dietaryProfile', residentId],
      queryFn: async () => {
        const headers = await getAuthHeaders();
        return dietaryService.getDietaryProfile(residentId, headers);
      },
      enabled: !authLoading && !!user?.facility,
    });
  };

  const useUpdateDietaryProfile = () => {
    return useMutation({
      mutationFn: async ({ residentId, profile }: { residentId: string; profile: Partial<DietaryProfile> }) => {
        if (!isOnline) {
          await queueOfflineAction('update-dietary-profile', { residentId, profile });
          showToast('Profile will be updated when back online', 'info');
          return profile;
        }
        const headers = await getAuthHeaders();
        return dietaryService.updateDietaryProfile(residentId, profile, headers);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries(['dietaryProfile', data.residentId]);
        showToast('Dietary profile has been updated', 'success');
      },
      onError: () => {
        showToast('Failed to update dietary profile', 'error');
      }
    });
  };

  // Meal Plans
  const useMealPlans = (params: { startDate: Date; endDate: Date }) => {
    return useQuery({
      queryKey: ['mealPlans', facilityId, params],
      queryFn: async () => {
        const headers = await getAuthHeaders();
        return dietaryService.getMealPlans({ facilityId, ...params }, headers);
      },
      enabled: !authLoading && !!user?.facility,
    });
  };

  const useCreateMealPlan = () => {
    return useMutation({
      mutationFn: async (mealPlan: Omit<MealPlan, 'id'>) => {
        if (!isOnline) {
          await queueOfflineAction('create-meal-plan', { mealPlan });
          showToast('Meal plan will be created when back online', 'info');
          return mealPlan;
        }
        const headers = await getAuthHeaders();
        return dietaryService.createMealPlan(mealPlan, headers);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['mealPlans']);
        showToast('New meal plan has been created', 'success');
      },
      onError: () => {
        showToast('Failed to create meal plan', 'error');
      }
    });
  };

  const useUpdateMealPlan = () => {
    return useMutation({
      mutationFn: async ({ id, mealPlan }: { id: string; mealPlan: Partial<MealPlan> }) => {
        if (!isOnline) {
          await queueOfflineAction('update-meal-plan', { id, mealPlan });
          showToast('Meal plan will be updated when back online', 'info');
          return mealPlan;
        }
        const headers = await getAuthHeaders();
        return dietaryService.updateMealPlan(id, mealPlan, headers);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['mealPlans']);
        showToast('Meal plan has been updated', 'success');
      },
      onError: () => {
        showToast('Failed to update meal plan', 'error');
      }
    });
  };

  // Menu Items
  const useMenuItems = (params?: { restrictions?: DietaryRestriction[]; search?: string }) => {
    return useQuery({
      queryKey: ['menuItems', params],
      queryFn: async () => {
        const headers = await getAuthHeaders();
        return dietaryService.getMenuItems(params, headers);
      },
      enabled: !authLoading && !!user?.facility,
    });
  };

  const useCreateMenuItem = () => {
    return useMutation({
      mutationFn: async (item: Omit<MenuItem, 'id'>) => {
        if (!isOnline) {
          await queueOfflineAction('create-menu-item', { item });
          showToast('Menu item will be created when back online', 'info');
          return item;
        }
        const headers = await getAuthHeaders();
        return dietaryService.createMenuItem(item, headers);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['menuItems']);
        showToast('New menu item has been created', 'success');
      },
      onError: () => {
        showToast('Failed to create menu item', 'error');
      }
    });
  };

  // Meal Services
  const useMealServices = (date: Date, mealType?: MealType) => {
    return useQuery({
      queryKey: ['mealServices', facilityId, date, mealType],
      queryFn: async () => {
        const headers = await getAuthHeaders();
        return dietaryService.getMealServices({ facilityId, date, mealType }, headers);
      },
      enabled: !authLoading && !!user?.facility,
    });
  };

  const useRecordMealService = () => {
    return useMutation({
      mutationFn: async (service: Omit<MealService, 'id'>) => {
        if (!isOnline) {
          await queueOfflineAction('record-meal-service', { service });
          showToast('Meal service will be recorded when back online', 'info');
          return service;
        }
        const headers = await getAuthHeaders();
        return dietaryService.recordMealService(service, headers);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['mealServices']);
        showToast('Meal service has been recorded', 'success');
      },
      onError: () => {
        showToast('Failed to record meal service', 'error');
      }
    });
  };

  // Nutrition Logs
  const useNutritionLogs = (params: { residentId: string; startDate: Date; endDate: Date }) => {
    return useQuery({
      queryKey: ['nutritionLogs', params],
      queryFn: async () => {
        const headers = await getAuthHeaders();
        return dietaryService.getNutritionLogs(params, headers);
      },
      enabled: !authLoading && !!user?.facility,
    });
  };

  const useCreateNutritionLog = () => {
    return useMutation({
      mutationFn: async (log: Omit<NutritionLog, 'id'>) => {
        if (!isOnline) {
          await queueOfflineAction('create-nutrition-log', { log });
          showToast('Nutrition log will be created when back online', 'info');
          return log;
        }
        const headers = await getAuthHeaders();
        return dietaryService.createNutritionLog(log, headers);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['nutritionLogs']);
        showToast('New nutrition log has been created', 'success');
      },
      onError: () => {
        showToast('Failed to create nutrition log', 'error');
      }
    });
  };

  // Dietary Alerts
  const useDietaryAlerts = (params?: { residentId?: string; active?: boolean }) => {
    return useQuery({
      queryKey: ['dietaryAlerts', params],
      queryFn: async () => {
        const headers = await getAuthHeaders();
        return dietaryService.getDietaryAlerts(params, headers);
      },
      enabled: !authLoading && !!user?.facility,
    });
  };

  const useCreateDietaryAlert = () => {
    return useMutation({
      mutationFn: async (alert: Omit<DietaryAlert, 'id'>) => {
        if (!isOnline) {
          await queueOfflineAction('create-dietary-alert', { alert });
          showToast('Alert will be created when back online', 'info');
          return alert;
        }
        const headers = await getAuthHeaders();
        return dietaryService.createDietaryAlert(alert, headers);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['dietaryAlerts']);
        showToast('New dietary alert has been created', 'success');
      },
      onError: () => {
        showToast('Failed to create dietary alert', 'error');
      }
    });
  };

  const useResolveDietaryAlert = () => {
    return useMutation({
      mutationFn: async ({ id, resolvedBy }: { id: string; resolvedBy: string }) => {
        if (!isOnline) {
          await queueOfflineAction('resolve-dietary-alert', { id, resolvedBy });
          showToast('Alert will be resolved when back online', 'info');
          return { id, resolvedBy };
        }
        const headers = await getAuthHeaders();
        return dietaryService.resolveDietaryAlert(id, resolvedBy, headers);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['dietaryAlerts']);
        showToast('Dietary alert has been resolved', 'success');
      },
      onError: () => {
        showToast('Failed to resolve dietary alert', 'error');
      }
    });
  };

  // Reports
  const generateNutritionReport = async (params: {
    residentId?: string;
    startDate: Date;
    endDate: Date;
    type: 'CONSUMPTION' | 'WEIGHT' | 'HYDRATION' | 'COMPREHENSIVE';
  }) => {
    try {
      const headers = await getAuthHeaders();
      const blob = await dietaryService.generateNutritionReport({
        ...params,
        facilityId,
      }, headers);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrition-report-${params.type.toLowerCase()}-${format(params.startDate, 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Nutrition report has been generated and downloaded', 'success');
    } catch (error) {
      showToast('Failed to generate nutrition report', 'error');
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    isLoading: authLoading,
    useDietaryProfile,
    useUpdateDietaryProfile,
    useMealPlans,
    useCreateMealPlan,
    useUpdateMealPlan,
    useMenuItems,
    useCreateMenuItem,
    useMealServices,
    useRecordMealService,
    useNutritionLogs,
    useCreateNutritionLog,
    useDietaryAlerts,
    useCreateDietaryAlert,
    useResolveDietaryAlert,
    generateNutritionReport,
  };
}


