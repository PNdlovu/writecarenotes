import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button/Button'
import { Select } from '@/components/ui/Select/Select'
import { Input } from '@/components/ui/Input/Input'
import { toast } from '@/components/ui/Toast'
import { dietaryManagementService } from '@/features/nutrition/services/dietary-management-service'

interface MealItem {
  id: string
  name: string
  servingSize: string
  calories: number
  nutrients: {
    [key: string]: number
  }
  allergens: string[]
}

interface MealCustomizationProps {
  mealPlanId: string
  date: Date
  mealType: string
  items: MealItem[]
  onUpdate: () => void
}

export const MealCustomization: React.FC<MealCustomizationProps> = ({
  mealPlanId,
  date,
  mealType,
  items,
  onUpdate
}) => {
  const queryClient = useQueryClient()

  const { data: substitutions, isLoading } = useQuery({
    queryKey: ['mealSubstitutions', mealPlanId, date, mealType],
    queryFn: async () => {
      const response = await fetch(
        `/api/nutrition/meal-plans/${mealPlanId}/substitutions?` + 
        new URLSearchParams({
          date: date.toISOString(),
          mealType
        })
      )
      if (!response.ok) throw new Error('Failed to fetch substitutions')
      return response.json()
    }
  })

  const updateMeal = useMutation({
    mutationFn: async (updates: {
      itemId: string
      substitutionId: string | null
      customServing?: string
    }) => {
      const response = await fetch(
        `/api/nutrition/meal-plans/${mealPlanId}/meals`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            mealType,
            ...updates
          })
        }
      )
      if (!response.ok) throw new Error('Failed to update meal')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mealPlan', mealPlanId]
      })
      onUpdate()
      toast({
        title: 'Success',
        description: 'Meal updated successfully',
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

  if (isLoading) {
    return <div>Loading substitutions...</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {mealType} - {date.toLocaleDateString()}
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.servingSize} • {item.calories} kcal
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Nutrients</p>
                  <div className="text-sm text-gray-600">
                    {Object.entries(item.nutrients).map(([key, value]) => (
                      <div key={key}>
                        {key}: {value}g
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {item.allergens.length > 0 && (
                <div className="text-sm text-amber-600">
                  Contains allergens: {item.allergens.join(', ')}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">
                    Substitute with
                  </label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      updateMeal.mutate({
                        itemId: item.id,
                        substitutionId: value || null
                      })
                    }}
                  >
                    <Select.Option value="">Original Item</Select.Option>
                    {substitutions?.[item.id]?.map((sub: any) => (
                      <Select.Option
                        key={sub.id}
                        value={sub.id}
                        description={`${sub.calories} kcal`}
                      >
                        {sub.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Custom Serving
                  </label>
                  <div className="flex gap-2">
                    <Input
                      defaultValue={item.servingSize}
                      onBlur={(e) => {
                        if (e.target.value !== item.servingSize) {
                          updateMeal.mutate({
                            itemId: item.id,
                            substitutionId: null,
                            customServing: e.target.value
                          })
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            // Reset all customizations
            items.forEach(item => {
              updateMeal.mutate({
                itemId: item.id,
                substitutionId: null
              })
            })
          }}
        >
          Reset All
        </Button>
      </div>
    </div>
  )
}
