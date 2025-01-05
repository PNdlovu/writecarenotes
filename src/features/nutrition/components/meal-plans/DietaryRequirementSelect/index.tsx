import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { MultiSelect } from '@/components/ui/multi-select'
import { Badge } from '@/components/ui/Badge/Badge'

interface DietaryRequirementSelectProps {
  value: string[]
  onChange: (values: string[]) => void
}

interface DietaryRequirement {
  id: string
  name: string
  description: string
  category: string
}

export const DietaryRequirementSelect: React.FC<DietaryRequirementSelectProps> = ({
  value,
  onChange
}) => {
  const { data: requirements, isLoading } = useQuery({
    queryKey: ['dietaryRequirements'],
    queryFn: async () => {
      const response = await fetch('/api/nutrition/dietary-requirements')
      if (!response.ok) throw new Error('Failed to fetch requirements')
      return response.json() as Promise<DietaryRequirement[]>
    }
  })

  if (isLoading) {
    return <div>Loading requirements...</div>
  }

  const options = requirements?.map(req => ({
    value: req.id,
    label: req.name,
    description: req.description,
    category: req.category
  })) || []

  const selectedOptions = options.filter(opt => value.includes(opt.value))

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        Dietary Requirements
      </label>
      
      <MultiSelect
        options={options}
        value={selectedOptions}
        onChange={(selected) => onChange(selected.map(s => s.value))}
        groupBy={(option) => option.category}
        renderOption={(option) => (
          <div className="flex flex-col">
            <span>{option.label}</span>
            <span className="text-sm text-gray-500">
              {option.description}
            </span>
          </div>
        )}
      />

      <div className="flex flex-wrap gap-2">
        {selectedOptions.map(option => (
          <Badge
            key={option.value}
            variant="outline"
            onClose={() => {
              onChange(value.filter(v => v !== option.value))
            }}
          >
            {option.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}
