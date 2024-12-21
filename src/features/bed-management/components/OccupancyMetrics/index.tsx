import { useOccupancyMetrics } from '../../hooks/use-occupancy-metrics'

export function OccupancyMetrics() {
  const { data: metrics } = useOccupancyMetrics()

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">Occupancy Metrics</h2>
      {/* Implement occupancy metrics UI */}
    </div>
  )
} 