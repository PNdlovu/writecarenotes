/**
 * WriteCareNotes.com
 * @fileoverview Bed Management API
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { api } from './api-client'

export const bedManagementApi = {
  getOverview: () => api.get('/api/bed-management/overview'),
  getBedStatus: () => api.get('/api/bed-management/status'),
  getOccupancyMetrics: () => api.get('/api/bed-management/metrics'),
  getMaintenanceStatus: () => api.get('/api/bed-management/maintenance')
} 