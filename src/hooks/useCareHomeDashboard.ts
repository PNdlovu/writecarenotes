// src/hooks/useCareHomeDashboard.ts
import { useState, useEffect } from 'react';
import { getCareHomeById, getCareHomeMetrics } from '@/lib/api/carehome';
import { CareHome, Department, Staff, Incident, MaintenanceRequest } from '@prisma/client';

interface CareHomeMetrics {
  totalStaff: number;
  totalDepartments: number;
  occupancyRate: number;
}

interface DepartmentMetric {
  department: string;
  staffCount: number;
  occupancy: number;
}

interface DashboardStats {
  departmentMetrics: DepartmentMetric[];
}

export function useCareHomeDashboard(careHomeId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careHome, setCareHome] = useState<CareHome | null>(null);
  const [metrics, setMetrics] = useState<CareHomeMetrics | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [careHomeData, metricsData] = await Promise.all([
        getCareHomeById(careHomeId),
        getCareHomeMetrics(careHomeId),
      ]);

      if (!careHomeData) {
        throw new Error('Care home not found');
      }

      setCareHome(careHomeData);
      setMetrics(metricsData);
      setIncidents(careHomeData.incidents || []);
      setMaintenanceRequests(careHomeData.maintenanceRequests || []);

      // Calculate department metrics
      const departmentMetrics = careHomeData.departments.map(dept => ({
        department: dept.name,
        staffCount: careHomeData.staff.filter(s => s.departmentId === dept.id).length,
        occupancy: calculateDepartmentOccupancy(dept),
      }));

      setStats({ departmentMetrics });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateDepartmentOccupancy = (department: Department) => {
    // This is a placeholder - implement actual occupancy calculation based on your data model
    return Math.round(Math.random() * 100); // Replace with actual calculation
  };

  useEffect(() => {
    fetchDashboardData();
  }, [careHomeId]);

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  return {
    loading,
    error,
    careHome,
    metrics,
    stats,
    incidents,
    maintenanceRequests,
    refreshDashboard,
  };
}


