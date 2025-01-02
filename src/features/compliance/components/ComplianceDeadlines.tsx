import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge/Badge"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay, isAfter, isBefore, addDays } from 'date-fns'

interface ComplianceDeadline {
  id: string
  title: string
  dueDate: Date
  type: 'report' | 'review' | 'inspection' | 'action'
  status: 'pending' | 'overdue' | 'completed'
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
}

interface ComplianceDeadlinesProps {
  deadlines: ComplianceDeadline[]
  onDeadlineClick: (deadline: ComplianceDeadline) => void
}

export function ComplianceDeadlines({ deadlines, onDeadlineClick }: ComplianceDeadlinesProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDayDeadlines = (date: Date) => {
    return deadlines.filter(deadline => 
      isSameDay(new Date(deadline.dueDate), date)
    )
  }

  const selectedDeadlines = getDayDeadlines(selectedDate)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasDeadline: (date) => deadlines.some(d => 
                isSameDay(new Date(d.dueDate), date)
              )
            }}
            modifiersClassNames={{
              hasDeadline: "font-bold underline text-primary"
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Deadlines for {format(selectedDate, 'PPP')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDeadlines.length === 0 ? (
            <p className="text-sm text-gray-500">No deadlines for this date</p>
          ) : (
            <div className="space-y-4">
              {selectedDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-start space-x-4 p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                  onClick={() => onDeadlineClick(deadline)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{deadline.title}</h4>
                      <Badge className={getStatusColor(deadline.status)}>
                        {deadline.status}
                      </Badge>
                      <Badge className={getPriorityColor(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <span>Due: {format(new Date(deadline.dueDate), 'PPp')}</span>
                      {deadline.assignedTo && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Assigned to: {deadline.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
