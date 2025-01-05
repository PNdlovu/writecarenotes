import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as z from 'zod'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/Input/Input'
import { Button } from '@/components/ui/Button/Button'
import { Calendar } from '@/components/ui/Calendar'
import { Select } from '@/components/ui/Select/Select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/Toast'
import { DietaryRequirementSelect } from '../DietaryRequirementSelect'
import { NutritionalGoalInput } from '../NutritionalGoalInput'

const mealPlanSchema = z.object({
  residentId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  type: z.enum(['REGULAR', 'SPECIAL', 'THERAPEUTIC']),
  dietaryRequirements: z.array(z.string()),
  restrictions: z.array(z.string()),
  goals: z.array(z.object({
    nutrientType: z.string(),
    targetAmount: z.number(),
    unit: z.string()
  })),
  notes: z.string().optional()
})

type MealPlanFormData = z.infer<typeof mealPlanSchema>

interface MealPlanFormProps {
  residentId: string
  onSuccess?: () => void
}

export const MealPlanForm: React.FC<MealPlanFormProps> = ({
  residentId,
  onSuccess
}) => {
  const queryClient = useQueryClient()
  const form = useForm<MealPlanFormData>({
    resolver: zodResolver(mealPlanSchema),
    defaultValues: {
      residentId,
      type: 'REGULAR',
      dietaryRequirements: [],
      restrictions: [],
      goals: [],
      notes: ''
    }
  })

  const createMealPlan = useMutation({
    mutationFn: async (data: MealPlanFormData) => {
      const response = await fetch('/api/nutrition/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create meal plan')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
      toast({
        title: 'Success',
        description: 'Meal plan created successfully',
        variant: 'success'
      })
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const onSubmit = (data: MealPlanFormData) => {
    createMealPlan.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date Range
              </label>
              <Calendar
                mode="range"
                selected={{
                  from: form.watch('startDate'),
                  to: form.watch('endDate')
                }}
                onSelect={(range) => {
                  if (range?.from) form.setValue('startDate', range.from)
                  if (range?.to) form.setValue('endDate', range.to)
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Plan Type
              </label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => 
                  form.setValue('type', value as MealPlanFormData['type'])
                }
              >
                <Select.Option value="REGULAR">Regular</Select.Option>
                <Select.Option value="SPECIAL">Special</Select.Option>
                <Select.Option value="THERAPEUTIC">Therapeutic</Select.Option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notes
              </label>
              <Input
                {...form.register('notes')}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <DietaryRequirementSelect
              value={form.watch('dietaryRequirements')}
              onChange={(values) => 
                form.setValue('dietaryRequirements', values)
              }
            />

            <NutritionalGoalInput
              value={form.watch('goals')}
              onChange={(goals) => form.setValue('goals', goals)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={createMealPlan.isPending}
          >
            {createMealPlan.isPending ? 'Creating...' : 'Create Meal Plan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
