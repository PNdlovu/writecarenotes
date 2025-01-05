import { z } from 'zod'

export enum LiquidType {
  WATER = 'WATER',
  TEA = 'TEA',
  COFFEE = 'COFFEE',
  JUICE = 'JUICE',
  MILK = 'MILK',
  SMOOTHIE = 'SMOOTHIE',
  SOUP = 'SOUP',
  OTHER = 'OTHER',
}

export enum LiquidUnit {
  ML = 'ML',
  OZ = 'OZ',
}

export enum ConsumptionMethod {
  INDEPENDENT = 'INDEPENDENT',
  ASSISTED = 'ASSISTED',
  THICKENED = 'THICKENED',
  TUBE_FEEDING = 'TUBE_FEEDING',
}

export const hydrationRecordSchema = z.object({
  id: z.string().optional(), // Optional for new records
  residentId: z.string(),
  timestamp: z.date(),
  amount: z.number().min(0),
  unit: z.nativeEnum(LiquidUnit),
  type: z.nativeEnum(LiquidType),
  method: z.nativeEnum(ConsumptionMethod),
  consistency: z.string().optional(), // For thickened liquids
  temperature: z.string().optional(), // Hot, Cold, Room Temperature
  assistanceRequired: z.boolean(),
  assistanceNotes: z.string().optional(),
  containerType: z.string(), // For visualization
  visualLevel: z.number().min(0).max(100), // Percentage filled
  notes: z.string().optional(),
  takenWithMedication: z.boolean().default(false),
  completed: z.boolean().default(false),
})

export type HydrationRecord = z.infer<typeof hydrationRecordSchema>

export interface HydrationGoal {
  id: string
  residentId: string
  dailyTarget: number
  unit: LiquidUnit
  reminders: boolean
  reminderFrequency: number // minutes
  startTime: string // HH:mm
  endTime: string // HH:mm
  adjustForWeather: boolean
  preferences: LiquidType[]
  restrictions: string[]
  thickeningRequired: boolean
  thickeningLevel?: string
}

export interface HydrationStats {
  dailyTotal: number
  percentageOfGoal: number
  trend: number // Percentage change from previous day
  averageIntake: number
  lastIntake?: HydrationRecord
  missedTarget: boolean
  recommendations: string[]
}

export interface VisualContainer {
  type: string
  capacity: number
  unit: LiquidUnit
  dimensions: {
    height: number
    width: number
    shape: 'CYLINDER' | 'RECTANGLE' | 'CUSTOM'
  }
  fillColor: string
  emptyColor: string
  customPath?: string // SVG path for custom shapes
}

export const defaultContainers: VisualContainer[] = [
  {
    type: 'Glass',
    capacity: 250,
    unit: LiquidUnit.ML,
    dimensions: {
      height: 150,
      width: 70,
      shape: 'CYLINDER'
    },
    fillColor: '#A7C7E7',
    emptyColor: '#F5F5F5'
  },
  {
    type: 'Mug',
    capacity: 350,
    unit: LiquidUnit.ML,
    dimensions: {
      height: 120,
      width: 80,
      shape: 'CYLINDER'
    },
    fillColor: '#A7C7E7',
    emptyColor: '#F5F5F5'
  },
  {
    type: 'Water Bottle',
    capacity: 500,
    unit: LiquidUnit.ML,
    dimensions: {
      height: 200,
      width: 65,
      shape: 'CYLINDER'
    },
    fillColor: '#A7C7E7',
    emptyColor: '#F5F5F5'
  }
]
