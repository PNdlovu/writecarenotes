import { useBedStatus } from '../../hooks/use-bed-status'

export function BedStatusOverview() {
  const { data: bedStatus } = useBedStatus()

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">Bed Status Overview</h2>
      {/* Implement bed status overview UI */}
    </div>
  )
} 