import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { HydrationVisual } from '../HydrationVisual'
import { 
  hydrationRecordSchema, 
  type HydrationRecord,
  LiquidType,
  LiquidUnit,
  ConsumptionMethod,
  defaultContainers
} from '../../../types/hydration'

interface HydrationEntryFormProps {
  initialData?: Partial<HydrationRecord>
  onSubmit: (data: HydrationRecord) => Promise<void>
  onCancel: () => void
}

export const HydrationEntryForm: React.FC<HydrationEntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [selectedContainer, setSelectedContainer] = React.useState(defaultContainers[0])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HydrationRecord>({
    resolver: zodResolver(hydrationRecordSchema),
    defaultValues: {
      timestamp: new Date(),
      amount: 0,
      unit: LiquidUnit.ML,
      type: LiquidType.WATER,
      method: ConsumptionMethod.INDEPENDENT,
      assistanceRequired: false,
      containerType: defaultContainers[0].type,
      visualLevel: 0,
      completed: false,
      ...initialData,
    },
  })

  const watchAmount = watch('amount')
  const watchType = watch('type')
  const watchMethod = watch('method')

  // Handle container selection
  const handleContainerSelect = (container: typeof defaultContainers[0]) => {
    setSelectedContainer(container)
    setValue('containerType', container.type)
    setValue('unit', container.unit)
  }

  // Handle form submission
  const onFormSubmit = async (data: HydrationRecord) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Container Selection */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {defaultContainers.map((container, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleContainerSelect(container)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedContainer.type === container.type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex flex-col items-center">
              <HydrationVisual
                container={container}
                currentAmount={watchAmount}
                className="h-24 mb-2"
                interactive={false}
              />
              <span className="text-sm font-medium">{container.type}</span>
              <span className="text-xs text-gray-500">
                {container.capacity}{container.unit}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Amount Input with Visual Representation */}
      <div className="flex items-center gap-8">
        <div className="flex-1">
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <HydrationVisual
                  container={selectedContainer}
                  currentAmount={field.value}
                  onAmountChange={field.onChange}
                  className="h-48"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Liquid Type and Method */}
        <div className="flex-1 space-y-4">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Liquid
                </label>
                <select
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.values(LiquidType).map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />

          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consumption Method
                </label>
                <select
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.values(ConsumptionMethod).map((method) => (
                    <option key={method} value={method}>
                      {method.charAt(0) + method.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </div>
      </div>

      {/* Additional Details */}
      <AnimatePresence>
        {watchMethod === ConsumptionMethod.ASSISTED && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Controller
              name="assistanceNotes"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assistance Notes
                  </label>
                  <textarea
                    {...field}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              {...field}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={2}
            />
          </div>
        )}
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center">
              <svg
                className="w-4 h-4 mr-2 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Entry'
          )}
        </button>
      </div>
    </form>
  )
}

export default HydrationEntryForm
