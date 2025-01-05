import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LiquidType } from '@prisma/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Select } from '@/components/ui/Select/Select'
import { toast } from '@/components/ui/Toast'
import { liquidIntakeService } from '@/features/nutrition/services/liquid-intake-service'

const intakeSchema = z.object({
  intakes: z.array(
    z.object({
      type: z.enum(['WATER', 'JUICE', 'TEA', 'COFFEE', 'MILK', 'SOUP', 'OTHER']),
      amount: z.number().min(0),
      timestamp: z.date(),
      notes: z.string().optional()
    })
  )
})

type IntakeFormData = z.infer<typeof intakeSchema>

interface BatchIntakeFormProps {
  residentId: string
  onSuccess?: () => void
}

export const BatchIntakeForm: React.FC<BatchIntakeFormProps> = ({
  residentId,
  onSuccess
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      intakes: [
        {
          type: 'WATER',
          amount: 0,
          timestamp: new Date(),
          notes: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'intakes'
  })

  const onSubmit = async (data: IntakeFormData) => {
    try {
      await liquidIntakeService.batchRecordIntake(
        data.intakes.map(intake => ({
          residentId,
          ...intake
        }))
      )

      toast({
        title: 'Success',
        description: 'Batch intake recorded successfully',
        variant: 'success'
      })

      reset()
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error'
      })
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-6">Batch Record Intake</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
          >
            <div>
              <label className="text-sm font-medium mb-1 block">
                Type
              </label>
              <Select
                {...register(`intakes.${index}.type`)}
                defaultValue={field.type}
              >
                {Object.values(LiquidType).map(type => (
                  <Select.Option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Amount (ml)
              </label>
              <Input
                type="number"
                {...register(`intakes.${index}.amount`, {
                  valueAsNumber: true
                })}
                defaultValue={field.amount}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Time
              </label>
              <Input
                type="datetime-local"
                {...register(`intakes.${index}.timestamp`, {
                  valueAsDate: true
                })}
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Notes
              </label>
              <div className="flex gap-2">
                <Input
                  {...register(`intakes.${index}.notes`)}
                  defaultValue={field.notes}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                type: 'WATER',
                amount: 0,
                timestamp: new Date(),
                notes: ''
              })
            }
          >
            Add Entry
          </Button>

          <Button type="submit">
            Save All
          </Button>
        </div>
      </form>
    </Card>
  )
}
