import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LiquidType } from '@prisma/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Select } from '@/components/ui/Select/Select'
import { toast } from '@/components/ui/Toast'
import { liquidIntakeService } from '@/features/nutrition/services/liquid-intake-service'

interface LiquidIntakeTrackerProps {
  residentId: string
}

const LIQUID_TYPES: { value: LiquidType; label: string; color: string }[] = [
  { value: 'WATER', label: 'Water', color: '#2563eb' },
  { value: 'JUICE', label: 'Juice', color: '#ea580c' },
  { value: 'TEA', label: 'Tea', color: '#65a30d' },
  { value: 'COFFEE', label: 'Coffee', color: '#92400e' },
  { value: 'MILK', label: 'Milk', color: '#f5f5f4' },
  { value: 'SOUP', label: 'Soup', color: '#dc2626' },
  { value: 'OTHER', label: 'Other', color: '#6b7280' }
]

const QUICK_ADD_AMOUNTS = [100, 200, 250, 500]

export const LiquidIntakeTracker: React.FC<LiquidIntakeTrackerProps> = ({
  residentId
}) => {
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = React.useState<LiquidType>('WATER')
  const [customAmount, setCustomAmount] = React.useState('')

  const { data: dailyStats, isLoading } = useQuery({
    queryKey: ['liquidIntake', residentId, new Date().toDateString()],
    queryFn: () =>
      liquidIntakeService.getDailyIntakeStats(residentId, new Date())
  })

  const recordIntake = useMutation({
    mutationFn: async (amount: number) => {
      return liquidIntakeService.recordIntake({
        residentId,
        type: selectedType,
        amount,
        timestamp: new Date()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['liquidIntake', residentId]
      })
      toast({
        title: 'Success',
        description: 'Liquid intake recorded successfully',
        variant: 'success'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const handleQuickAdd = (amount: number) => {
    recordIntake.mutate(amount)
  }

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'error'
      })
      return
    }
    recordIntake.mutate(amount)
    setCustomAmount('')
  }

  if (isLoading) {
    return <div>Loading intake data...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Liquid Intake Tracker</h3>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {dailyStats?.total || 0} ml
            </div>
            <div className="text-sm text-gray-500">
              {dailyStats?.progress.toFixed(1)}% of daily target
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Liquid Type
            </label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as LiquidType)}
            >
              {LIQUID_TYPES.map(type => (
                <Select.Option
                  key={type.value}
                  value={type.value}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    {type.label}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Quick Add
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ADD_AMOUNTS.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => handleQuickAdd(amount)}
                >
                  {amount} ml
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Custom Amount (ml)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <Button onClick={handleCustomAdd}>Add</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Today's Breakdown</h3>
        <div className="space-y-4">
          {LIQUID_TYPES.map(type => {
            const amount = dailyStats?.byType[type.value] || 0
            const percentage =
              dailyStats?.total ? (amount / dailyStats.total) * 100 : 0

            return (
              <div key={type.value}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{type.label}</span>
                  <span>{amount} ml</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: type.color
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {dailyStats?.remainingTarget > 0 && (
        <div className="text-center text-sm text-gray-500">
          {dailyStats.remainingTarget} ml remaining to reach daily target
        </div>
      )}
    </div>
  )
}
