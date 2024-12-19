// src/features/bed-management/components/forms/BedForm.tsx

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { bedSchema } from '../../api/validation'
import type { BedRequest } from '../../api/types'
import { BedType, BedStatus } from '../../types/bed.types'

interface BedFormProps {
  initialData?: BedRequest
  onSubmit: (data: BedRequest) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function BedForm({ initialData, onSubmit, isLoading, onCancel }: BedFormProps) {
  const form = useForm<BedRequest>({
    resolver: zodResolver(bedSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Bed Number"
        {...form.register('number')}
        error={form.formState.errors.number?.message}
      />
      
      <Select
        label="Bed Type"
        {...form.register('type')}
        error={form.formState.errors.type?.message}
      >
        {Object.values(BedType).map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </Select>

      <Select
        label="Status"
        {...form.register('status')}
        error={form.formState.errors.status?.message}
      >
        {Object.values(BedStatus).map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </Select>

      <Input
        type="number"
        label="Floor"
        {...form.register('floor', { valueAsNumber: true })}
        error={form.formState.errors.floor?.message}
      />

      <Input
        label="Wing"
        {...form.register('wing')}
        error={form.formState.errors.wing?.message}
      />

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Update Bed' : 'Create Bed'}
        </Button>
      </div>
    </form>
  )
}


