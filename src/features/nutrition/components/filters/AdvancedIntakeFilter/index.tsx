import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LiquidType } from '@prisma/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Select } from '@/components/ui/Select/Select'
import { Checkbox } from '@/components/ui/checkbox'
import { DateRangePicker } from '@/components/ui/date-range-picker'

const filterSchema = z.object({
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }),
  types: z.array(z.enum(['WATER', 'JUICE', 'TEA', 'COFFEE', 'MILK', 'SOUP', 'OTHER'])),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  sortBy: z.enum(['amount', 'timestamp']),
  sortOrder: z.enum(['asc', 'desc'])
})

type FilterFormData = z.infer<typeof filterSchema>

interface AdvancedIntakeFilterProps {
  onFilter: (filters: FilterFormData) => void
  initialFilters?: Partial<FilterFormData>
}

export const AdvancedIntakeFilter: React.FC<AdvancedIntakeFilterProps> = ({
  onFilter,
  initialFilters
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      dateRange: {
        from: undefined,
        to: undefined
      },
      types: [],
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'timestamp',
      sortOrder: 'desc',
      ...initialFilters
    }
  })

  const onSubmit = (data: FilterFormData) => {
    onFilter(data)
  }

  const handleReset = () => {
    reset({
      dateRange: {
        from: undefined,
        to: undefined
      },
      types: [],
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    })
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-1 block">
            Date Range
          </label>
          <DateRangePicker
            value={watch('dateRange')}
            onChange={(range) => setValue('dateRange', range)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            Liquid Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(LiquidType).map(type => (
              <label
                key={type}
                className="flex items-center gap-2"
              >
                <Checkbox
                  {...register('types')}
                  value={type}
                />
                <span className="text-sm">
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Minimum Amount (ml)
            </label>
            <Input
              type="number"
              {...register('minAmount', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Maximum Amount (ml)
            </label>
            <Input
              type="number"
              {...register('maxAmount', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Sort By
            </label>
            <Select {...register('sortBy')}>
              <Select.Option value="timestamp">Time</Select.Option>
              <Select.Option value="amount">Amount</Select.Option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Sort Order
            </label>
            <Select {...register('sortOrder')}>
              <Select.Option value="desc">Descending</Select.Option>
              <Select.Option value="asc">Ascending</Select.Option>
            </Select>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Reset Filters
          </Button>

          <Button type="submit">
            Apply Filters
          </Button>
        </div>
      </form>
    </Card>
  )
}
