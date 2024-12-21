import { useMaintenanceStatus } from '../../hooks/use-maintenance-status'

export function MaintenanceStatus() {
  const { data: maintenance } = useMaintenanceStatus()

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">Maintenance Status</h2>
      {/* Implement maintenance status UI */}
    </div>
  )
} 