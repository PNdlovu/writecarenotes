import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BedOccupancyStats as Stats } from '../types/bed.types'

interface BedOccupancyStatsProps {
  stats: Stats
}

export function BedOccupancyStats({ stats }: BedOccupancyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Beds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Occupancy Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
          <p className="text-sm text-muted-foreground">
            {stats.occupied} occupied of {stats.total} beds
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Beds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.available}</div>
          <p className="text-sm text-muted-foreground">
            {stats.reserved} reserved
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.maintenance + stats.cleaning}</div>
          <p className="text-sm text-muted-foreground">
            {stats.isolation} in isolation
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


