import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bed } from '../types/bed.types'

interface BedCardProps {
  bed: Bed
  onAssign?: (bedId: string) => void
  onReserve?: (bedId: string) => void
  onDischarge?: (bedId: string) => void
}

export function BedCard({ bed, onAssign, onReserve, onDischarge }: BedCardProps) {
  const getStatusColor = (status: Bed['status']) => {
    const colors = {
      AVAILABLE: 'bg-green-500',
      OCCUPIED: 'bg-blue-500',
      RESERVED: 'bg-yellow-500',
      MAINTENANCE: 'bg-red-500',
      CLEANING: 'bg-purple-500',
      ISOLATION: 'bg-orange-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Bed {bed.number}</CardTitle>
            <CardDescription>{bed.type}</CardDescription>
          </div>
          <Badge className={getStatusColor(bed.status)}>{bed.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bed.currentOccupant && (
            <div>
              <h4 className="font-semibold">Current Occupant</h4>
              <p>Admission Date: {bed.currentOccupant.admissionDate.toLocaleDateString()}</p>
              <p>Care Level: {bed.currentOccupant.careLevel}</p>
            </div>
          )}

          {bed.nextReservation && (
            <div>
              <h4 className="font-semibold">Next Reservation</h4>
              <p>Expected Arrival: {bed.nextReservation.expectedArrivalDate.toLocaleDateString()}</p>
            </div>
          )}

          {bed.maintenanceSchedule && (
            <div>
              <h4 className="font-semibold">Maintenance</h4>
              <p>Next Due: {bed.maintenanceSchedule.nextDue.toLocaleDateString()}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {bed.status === 'AVAILABLE' && onAssign && (
              <Button onClick={() => onAssign(bed.id)}>Assign</Button>
            )}
            {bed.status === 'AVAILABLE' && onReserve && (
              <Button variant="outline" onClick={() => onReserve(bed.id)}>Reserve</Button>
            )}
            {bed.status === 'OCCUPIED' && onDischarge && (
              <Button variant="destructive" onClick={() => onDischarge(bed.id)}>Discharge</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


