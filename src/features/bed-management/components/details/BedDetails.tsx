// src/features/bed-management/components/details/BedDetails.tsx

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Bed } from '../../types/bed.types'

interface BedDetailsProps {
  bed: Bed
  onEdit?: () => void
  onTransfer?: () => void
  onMaintenance?: () => void
}

export function BedDetails({ 
  bed, 
  onEdit, 
  onTransfer, 
  onMaintenance 
}: BedDetailsProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Bed {bed.number}</h2>
          <p className="text-gray-500">{bed.wing} Wing, Floor {bed.floor}</p>
        </div>
        <Badge variant={getBedStatusVariant(bed.status)}>
          {bed.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Type</h3>
          <p>{bed.type}</p>
        </div>
        <div>
          <h3 className="font-semibold">Features</h3>
          <div className="flex gap-2 flex-wrap">
            {bed.features.map(feature => (
              <Badge key={feature} variant="outline">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Maintenance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Last Maintenance</p>
            <p>{bed.lastMaintenanceDate?.toLocaleDateString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Scheduled</p>
            <p>{bed.nextMaintenanceDate?.toLocaleDateString() || 'N/A'}</p>
          </div>
        </div>
      </div>

      {bed.notes && (
        <div>
          <h3 className="font-semibold">Notes</h3>
          <p className="text-gray-600">{bed.notes}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        {onEdit && (
          <Button onClick={onEdit}>
            Edit Details
          </Button>
        )}
        {onTransfer && (
          <Button variant="outline" onClick={onTransfer}>
            Transfer
          </Button>
        )}
        {onMaintenance && (
          <Button variant="outline" onClick={onMaintenance}>
            Schedule Maintenance
          </Button>
        )}
      </div>
    </Card>
  )
}

function getBedStatusVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'AVAILABLE':
      return 'success'
    case 'OCCUPIED':
      return 'default'
    case 'MAINTENANCE':
      return 'warning'
    case 'OUT_OF_SERVICE':
      return 'destructive'
    default:
      return 'default'
  }
}


