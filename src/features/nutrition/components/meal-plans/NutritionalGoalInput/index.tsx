import React from 'react'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Select } from '@/components/ui/Select/Select'
import { Card } from '@/components/ui/Card'

interface NutritionalGoal {
  nutrientType: string
  targetAmount: number
  unit: string
}

interface NutritionalGoalInputProps {
  value: NutritionalGoal[]
  onChange: (goals: NutritionalGoal[]) => void
}

const NUTRIENT_TYPES = [
  { value: 'PROTEIN', label: 'Protein', defaultUnit: 'g' },
  { value: 'CARBS', label: 'Carbohydrates', defaultUnit: 'g' },
  { value: 'FAT', label: 'Fat', defaultUnit: 'g' },
  { value: 'FIBER', label: 'Fiber', defaultUnit: 'g' },
  { value: 'CALCIUM', label: 'Calcium', defaultUnit: 'mg' },
  { value: 'IRON', label: 'Iron', defaultUnit: 'mg' },
  { value: 'VITAMIN_A', label: 'Vitamin A', defaultUnit: 'IU' },
  { value: 'VITAMIN_C', label: 'Vitamin C', defaultUnit: 'mg' },
  { value: 'VITAMIN_D', label: 'Vitamin D', defaultUnit: 'IU' }
]

export const NutritionalGoalInput: React.FC<NutritionalGoalInputProps> = ({
  value,
  onChange
}) => {
  const addGoal = () => {
    const unusedNutrients = NUTRIENT_TYPES.filter(
      type => !value.some(goal => goal.nutrientType === type.value)
    )
    
    if (unusedNutrients.length === 0) return

    const newNutrient = unusedNutrients[0]
    onChange([
      ...value,
      {
        nutrientType: newNutrient.value,
        targetAmount: 0,
        unit: newNutrient.defaultUnit
      }
    ])
  }

  const removeGoal = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateGoal = (index: number, updates: Partial<NutritionalGoal>) => {
    onChange(
      value.map((goal, i) =>
        i === index ? { ...goal, ...updates } : goal
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">
          Nutritional Goals
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addGoal}
          disabled={value.length >= NUTRIENT_TYPES.length}
        >
          Add Goal
        </Button>
      </div>

      <div className="space-y-4">
        {value.map((goal, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nutrient</label>
                <Select
                  value={goal.nutrientType}
                  onValueChange={(type) => {
                    const nutrient = NUTRIENT_TYPES.find(n => n.value === type)
                    if (nutrient) {
                      updateGoal(index, {
                        nutrientType: type,
                        unit: nutrient.defaultUnit
                      })
                    }
                  }}
                >
                  {NUTRIENT_TYPES.map(type => (
                    <Select.Option
                      key={type.value}
                      value={type.value}
                      disabled={value.some(
                        (g, i) => i !== index && g.nutrientType === type.value
                      )}
                    >
                      {type.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Target</label>
                <Input
                  type="number"
                  value={goal.targetAmount}
                  onChange={(e) => 
                    updateGoal(index, {
                      targetAmount: parseFloat(e.target.value) || 0
                    })
                  }
                  min={0}
                  step={0.1}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Unit</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={goal.unit}
                    onChange={(e) => 
                      updateGoal(index, { unit: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGoal(index)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
