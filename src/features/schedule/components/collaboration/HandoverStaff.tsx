import React from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Staff } from '@prisma/client'

interface HandoverStaffProps {
  outgoingStaff: Staff[]
  incomingStaff: Staff[]
  onUpdateStaff: (updates: {
    outgoingStaff: Staff[]
    incomingStaff: Staff[]
  }) => void
}

const StaffList = ({ staff, label }: { staff: Staff[]; label: string }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">{label}</h3>
      <Badge>{staff.length} staff</Badge>
    </div>
    <div className="mt-4 space-y-4">
      {staff.map((member) => (
        <div key={member.id} className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={member.image || ''} />
            <AvatarFallback>{member.name?.charAt(0) || 'S'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        </div>
      ))}
      {staff.length === 0 && (
        <p className="text-center text-gray-500">No staff assigned</p>
      )}
    </div>
  </Card>
)

export const HandoverStaff: React.FC<HandoverStaffProps> = ({
  outgoingStaff,
  incomingStaff,
  onUpdateStaff,
}) => {
  return (
    <div className="space-y-6">
      <StaffList staff={outgoingStaff} label="Outgoing Staff" />
      <StaffList staff={incomingStaff} label="Incoming Staff" />
    </div>
  )
}
