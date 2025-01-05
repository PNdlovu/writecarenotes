export interface BedStatus {
  id: string
  number: string
  status: 'occupied' | 'available' | 'maintenance'
  lastUpdated: string
}

export interface MaintenanceStatus {
  id: string
  bedId: string
  type: string
  startDate: string
  expectedEndDate: string
  status: 'pending' | 'in-progress' | 'completed'
}

export interface OccupancyMetrics {
  total: number
  occupied: number
  available: number
  maintenance: number
  occupancyRate: number
}


