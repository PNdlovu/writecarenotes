import { useState } from 'react';
import { z } from 'zod';

export const placementSchema = z.object({
  startDate: z.string(),
  expectedEndDate: z.string().optional(),
  placementType: z.string(),
  legalStatus: z.string(),
  placingAuthority: z.string(),
  reasonForPlacement: z.string(),
  riskAssessment: z.string(),
  carePlan: z.string(),
  contactArrangements: z.string(),
  educationArrangements: z.string(),
  healthNeeds: z.string(),
  culturalNeeds: z.string(),
  specialRequirements: z.string().optional(),
});

export type Placement = z.infer<typeof placementSchema>;

export const usePlacement = () => {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlacement = async (data: Placement) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/placement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create placement');
      }

      const result = await response.json();
      setPlacements([...placements, result.data]);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/placement');
      if (!response.ok) {
        throw new Error('Failed to fetch placements');
      }

      const result = await response.json();
      setPlacements(result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlacement = async (id: string, data: Partial<Placement>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/placement/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update placement');
      }

      const result = await response.json();
      setPlacements(placements.map(p => (p.id === id ? result.data : p)));
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePlacement = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/placement/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete placement');
      }

      setPlacements(placements.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    placements,
    loading,
    error,
    createPlacement,
    fetchPlacements,
    updatePlacement,
    deletePlacement,
  };
};
