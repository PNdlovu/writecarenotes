import React from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { HandoverNotes } from './HandoverNotes'
import { HandoverTasks } from './HandoverTasks'
import { HandoverAttachments } from './HandoverAttachments'
import { HandoverQuality } from './HandoverQuality'
import { HandoverStaff } from './HandoverStaff'
import { HandoverStatus } from '../../types/handover'
import type { HandoverSession as HandoverSessionType } from '../../types/handover'

interface HandoverSessionProps {
  session: HandoverSessionType
  onUpdate: (session: HandoverSessionType) => void
}

const statusColors = {
  DRAFT: 'bg-gray-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  VERIFIED: 'bg-purple-500',
}

export const HandoverSession: React.FC<HandoverSessionProps> = ({
  session,
  onUpdate,
}) => {
  const { data: authSession } = useSession()
  const [status, setStatus] = React.useState<HandoverStatus>(session.status)

  const handleStatusChange = async (newStatus: HandoverStatus) => {
    try {
      const updatedSession = { ...session, status: newStatus }
      await onUpdate(updatedSession)
      setStatus(newStatus)
    } catch (error) {
      console.error('Failed to update handover status:', error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shift Handover</CardTitle>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => handleStatusChange('IN_PROGRESS')}
            disabled={status !== 'DRAFT'}
          >
            Start Handover
          </Button>
          <Button
            variant="outline"
            onClick={() => handleStatusChange('COMPLETED')}
            disabled={status !== 'IN_PROGRESS'}
          >
            Complete Handover
          </Button>
          <Button
            variant="outline"
            onClick={() => handleStatusChange('VERIFIED')}
            disabled={status !== 'COMPLETED'}
          >
            Verify Handover
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notes">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="quality">Quality & Compliance</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <HandoverNotes
              sessionId={session.id}
              notes={[]}
              onAddNote={() => {}}
              onUpdateNote={() => {}}
            />
          </TabsContent>
          <TabsContent value="tasks">
            <HandoverTasks
              sessionId={session.id}
              tasks={[]}
              onAddTask={() => {}}
              onUpdateTask={() => {}}
            />
          </TabsContent>
          <TabsContent value="attachments">
            <HandoverAttachments
              sessionId={session.id}
              attachments={[]}
              onAddAttachment={() => {}}
              onRemoveAttachment={() => {}}
            />
          </TabsContent>
          <TabsContent value="quality">
            <HandoverQuality
              session={session}
              onUpdateQuality={() => {}}
            />
          </TabsContent>
          <TabsContent value="staff">
            <HandoverStaff
              outgoingStaff={session.outgoingStaff}
              incomingStaff={session.incomingStaff}
              onUpdateStaff={() => {}}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
