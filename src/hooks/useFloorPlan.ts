import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/lib/auth';
import { floorPlanService } from '@/services/floorPlanService';
import { FloorPlan, Room, Assignment, RoomStatus } from '@/types/floorPlan';

interface UseFloorPlanProps {
  facilityId: string;
  floorPlanId?: string;
}

export function useFloorPlan({ facilityId, floorPlanId }: UseFloorPlanProps) {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [currentFloorPlan, setCurrentFloorPlan] = useState<FloorPlan | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { getAuthHeaders, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Load floor plans
  const loadFloorPlans = useCallback(async () => {
    try {
      setLoading(true);
      const plans = await floorPlanService.getFloorPlans(facilityId, await getAuthHeaders());
      setFloorPlans(plans);
      
      // If floorPlanId is provided, set it as current
      if (floorPlanId && plans.length > 0) {
        const current = plans.find(plan => plan.id === floorPlanId);
        setCurrentFloorPlan(current || null);
      }
      // Otherwise, set the first floor plan as current
      else if (plans.length > 0) {
        setCurrentFloorPlan(plans[0]);
      }
      
      setError(null);
    } catch (err) {
      setError(err as Error);
      showToast('Failed to load floor plans', 'error');
    } finally {
      setLoading(false);
    }
  }, [facilityId, floorPlanId, getAuthHeaders, showToast]);

  // Create floor plan
  const createFloorPlan = useCallback(async (data: Partial<FloorPlan>) => {
    try {
      setLoading(true);
      const newPlan = await floorPlanService.createFloorPlan(facilityId, data, await getAuthHeaders());
      setFloorPlans(prev => [...prev, newPlan]);
      showToast('Floor plan created successfully', 'success');
      return newPlan;
    } catch (err) {
      setError(err as Error);
      showToast('Failed to create floor plan', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [facilityId, getAuthHeaders, showToast]);

  // Update floor plan
  const updateFloorPlan = useCallback(async (id: string, data: Partial<FloorPlan>) => {
    try {
      setLoading(true);
      const updatedPlan = await floorPlanService.updateFloorPlan(id, data, await getAuthHeaders());
      setFloorPlans(prev => prev.map(plan => plan.id === id ? updatedPlan : plan));
      if (currentFloorPlan?.id === id) {
        setCurrentFloorPlan(updatedPlan);
      }
      showToast('Floor plan updated successfully', 'success');
      return updatedPlan;
    } catch (err) {
      setError(err as Error);
      showToast('Failed to update floor plan', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFloorPlan?.id, getAuthHeaders, showToast]);

  // Delete floor plan
  const deleteFloorPlan = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await floorPlanService.deleteFloorPlan(id, await getAuthHeaders());
      setFloorPlans(prev => prev.filter(plan => plan.id !== id));
      if (currentFloorPlan?.id === id) {
        setCurrentFloorPlan(null);
      }
      showToast('Floor plan deleted successfully', 'success');
    } catch (err) {
      setError(err as Error);
      showToast('Failed to delete floor plan', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFloorPlan?.id, getAuthHeaders, showToast]);

  // Room operations
  const createRoom = useCallback(async (data: Partial<Room>) => {
    if (!currentFloorPlan) throw new Error('No floor plan selected');
    try {
      setLoading(true);
      const newRoom = await floorPlanService.createRoom(currentFloorPlan.id, data, await getAuthHeaders());
      setCurrentFloorPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          rooms: [...prev.rooms, newRoom],
        };
      });
      showToast('Room created successfully', 'success');
      return newRoom;
    } catch (err) {
      setError(err as Error);
      showToast('Failed to create room', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFloorPlan, getAuthHeaders, showToast]);

  const updateRoom = useCallback(async (id: string, data: Partial<Room>) => {
    if (!currentFloorPlan) throw new Error('No floor plan selected');
    try {
      setLoading(true);
      const updatedRoom = await floorPlanService.updateRoom(id, data, await getAuthHeaders());
      setCurrentFloorPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          rooms: prev.rooms.map(room => room.id === id ? updatedRoom : room),
        };
      });
      if (selectedRoom?.id === id) {
        setSelectedRoom(updatedRoom);
      }
      showToast('Room updated successfully', 'success');
      return updatedRoom;
    } catch (err) {
      setError(err as Error);
      showToast('Failed to update room', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFloorPlan, selectedRoom?.id, getAuthHeaders, showToast]);

  const deleteRoom = useCallback(async (id: string) => {
    if (!currentFloorPlan) throw new Error('No floor plan selected');
    try {
      setLoading(true);
      await floorPlanService.deleteRoom(id, await getAuthHeaders());
      setCurrentFloorPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          rooms: prev.rooms.filter(room => room.id !== id),
        };
      });
      if (selectedRoom?.id === id) {
        setSelectedRoom(null);
      }
      showToast('Room deleted successfully', 'success');
    } catch (err) {
      setError(err as Error);
      showToast('Failed to delete room', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFloorPlan, selectedRoom?.id, getAuthHeaders, showToast]);

  // Load initial data
  useEffect(() => {
    if (!authLoading) {
      loadFloorPlans();
    }
  }, [authLoading, loadFloorPlans]);

  return {
    floorPlans,
    currentFloorPlan,
    selectedRoom,
    loading: loading || authLoading,
    error,
    setCurrentFloorPlan,
    setSelectedRoom,
    loadFloorPlans,
    createFloorPlan,
    updateFloorPlan,
    deleteFloorPlan,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}


