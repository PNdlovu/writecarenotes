import { CareHomeData, DashboardMetrics, ComplianceDeadline, CareMetric } from '@/types/dashboard';

export class DashboardService {
  static async getCareHomeData(careHomeId: string): Promise<CareHomeData> {
    // TODO: Replace with actual API call
    return {
      id: careHomeId,
      name: "Sunshine Care Home",
      type: "Residential & Nursing",
      registrationNumber: "1-123456789",
      lastInspection: "15 Jan 2024",
      capacity: 50,
      manager: "Jane Smith",
      rating: "Good",
      lastUpdated: new Date().toISOString()
    };
  }

  static async getDashboardMetrics(careHomeId: string): Promise<DashboardMetrics> {
    // TODO: Replace with actual API call
    return {
      bedOccupancy: {
        value: 85,
        trend: 2,
        total: 50,
        occupied: 43
      },
      staffCoverage: {
        value: 92,
        trend: -1,
        required: 25,
        present: 23
      },
      careCompliance: {
        value: 98,
        trend: 3,
        total: 150,
        completed: 147
      },
      incidents: {
        value: 2,
        trend: -1,
        critical: 0,
        moderate: 2
      }
    };
  }

  static async getCareMetrics(careHomeId: string): Promise<CareMetric[]> {
    // TODO: Replace with actual API call
    return [
      { name: "Medication Compliance", value: 99, total: 100, status: "success" },
      { name: "Care Plan Reviews", value: 28, total: 30, status: "warning" },
      { name: "Staff Training", value: 95, total: 100, status: "success" },
      { name: "Risk Assessments", value: 47, total: 50, status: "warning" },
      { name: "Response Time", value: 3.2, unit: "minutes", status: "success" },
      { name: "Health Checks", value: 100, total: 100, status: "success" }
    ];
  }

  static async getComplianceDeadlines(careHomeId: string): Promise<ComplianceDeadline[]> {
    // TODO: Replace with actual API call
    return [
      { 
        name: "CQC Inspection Due", 
        date: "2024-04-15", 
        priority: "high",
        type: "inspection",
        assignedTo: "Jane Smith",
        notes: "Annual inspection preparation required"
      },
      { 
        name: "Staff Training Review", 
        date: "2024-03-28", 
        priority: "medium",
        type: "training",
        assignedTo: "HR Manager",
        notes: "Quarterly training compliance review"
      },
      { 
        name: "Policy Updates", 
        date: "2024-04-02", 
        priority: "low",
        type: "policy",
        assignedTo: "Quality Manager",
        notes: "Annual policy review and updates"
      },
      { 
        name: "Risk Assessment Review", 
        date: "2024-04-10", 
        priority: "medium",
        type: "assessment",
        assignedTo: "Clinical Lead",
        notes: "Monthly risk assessment review"
      }
    ];
  }

  static async getPerformanceTrends(careHomeId: string, period: string = '7d') {
    // TODO: Replace with actual API call
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Care Quality',
          data: [95, 96, 94, 98, 97, 96, 98]
        },
        {
          label: 'Staff Coverage',
          data: [90, 92, 91, 93, 92, 90, 92]
        }
      ]
    };
  }
} 