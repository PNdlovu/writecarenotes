import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar } from '@/components/ui/Calendar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Form/Label'
import { Switch } from '@/components/ui/Form/Switch'
import { useToast } from '@/components/ui/UseToast'
import { Spinner } from '@/components/ui/Loading/Spinner'
import type { StaffAvailability, AvailabilityType, RepeatFrequency } from '@/types/scheduling'

interface AvailabilityPanelProps {
  staffId: string
  initialAvailability?: StaffAvailability[]
}

export function AvailabilityPanel({ staffId, initialAvailability = [] }: AvailabilityPanelProps) {
  const { data: session } = useSession()
  const [availability, setAvailability] = useState<StaffAvailability[]>(initialAvailability)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [isRecurring, setIsRecurring] = useState(false)
  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '17:00',
    availabilityType: 'AVAILABLE' as AvailabilityType,
    notes: '',
    recurringPattern: {
      dayOfWeek: 1,
      repeatFrequency: 'WEEKLY' as RepeatFrequency,
      startDate: new Date(),
      endDate: undefined as Date | undefined,
    },
  })

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/staff/scheduling/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId,
          dates: selectedDates.map(d => d.toISOString()),
          startTime: formData.startTime,
          endTime: formData.endTime,
          availabilityType: formData.availabilityType,
          notes: formData.notes,
          recurringPattern: isRecurring ? formData.recurringPattern : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save availability')
      }

      const newAvailability = await response.json()
      setAvailability(prev => [...prev, ...newAvailability])
      setSelectedDates([])
      toast({
        title: 'Success',
        description: 'Availability saved successfully',
      })
    } catch (error) {
      console.error('Error saving availability:', error)
      toast({
        title: 'Error',
        description: 'Failed to save availability',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string, deletePattern: boolean = false) => {
    try {
      const response = await fetch(`/api/staff/scheduling/availability?id=${id}&deletePattern=${deletePattern}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete availability')
      }

      setAvailability(prev => prev.filter(a => a.id !== id))
      toast({
        title: 'Success',
        description: 'Availability deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting availability:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete availability',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Staff Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={setSelectedDates}
                className="rounded-md border"
              />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Availability Type</Label>
                <Select
                  value={formData.availabilityType}
                  onValueChange={value => setFormData(prev => ({ ...prev, availabilityType: value as AvailabilityType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                    <SelectItem value="PREFERRED">Preferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label>Recurring Pattern</Label>
              </div>

              {isRecurring && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Repeat Frequency</Label>
                    <Select
                      value={formData.recurringPattern.repeatFrequency}
                      onValueChange={value => setFormData(prev => ({
                        ...prev,
                        recurringPattern: {
                          ...prev.recurringPattern,
                          repeatFrequency: value as RepeatFrequency,
                        },
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={formData.recurringPattern.endDate?.toISOString().split('T')[0] || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        recurringPattern: {
                          ...prev.recurringPattern,
                          endDate: e.target.value ? new Date(e.target.value) : undefined,
                        },
                      }))}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={selectedDates.length === 0}
                className="w-full"
              >
                Save Availability
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availability.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {new Date(item.date).toLocaleDateString()} ({item.startTime} - {item.endTime})
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.availabilityType.toLowerCase()}
                    {item.notes && ` - ${item.notes}`}
                  </p>
                  {item.recurringPattern && (
                    <p className="text-sm text-gray-500">
                      Repeats {item.recurringPattern.repeatFrequency.toLowerCase()}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id, !!item.recurringPattern)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 


