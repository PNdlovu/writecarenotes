'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HydrationVisualDynamic } from '@/features/nutrition/components/hydration/HydrationVisualDynamic'
import { HydrationEntryForm } from '@/features/nutrition/components/hydration/HydrationEntryForm'
import { defaultContainers, LiquidType, LiquidUnit } from '@/features/nutrition/types/hydration'
import { hydrationService } from '@/features/nutrition/services/hydration-service'
import { optimizedHydrationAIService } from '@/features/nutrition/services/hydration-ai-service-optimized'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export default function HydrationPage() {
  const [showEntryForm, setShowEntryForm] = React.useState(false)
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id || 'anonymous'

  // Fetch hydration data
  const { data: hydrationData } = useQuery({
    queryKey: ['hydration', userId],
    queryFn: () => hydrationService.getRecords({
      userId,
      startDate: new Date(new Date().setDate(new Date().getDate() - 7))
    })
  })

  // Fetch AI insights with optimized service
  const { data: insights } = useQuery({
    queryKey: ['hydration-insights', userId],
    queryFn: async () => {
      if (!hydrationData?.records || !hydrationData.goal) return []
      
      return optimizedHydrationAIService.analyzeHydration(
        userId,
        hydrationData.records,
        hydrationData.goal
      )
    },
    enabled: !!hydrationData?.records && !!hydrationData?.goal
  })

  // Create hydration record mutation
  const createRecord = useMutation({
    mutationFn: hydrationService.createRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration'] })
      setShowEntryForm(false)
    }
  })

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header with Dynamic Visualization */}
      <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-lg overflow-hidden">
        <HydrationVisualDynamic
          container={{
            type: 'Daily Progress',
            capacity: hydrationData?.goal?.dailyTarget || 2000,
            unit: LiquidUnit.ML,
            dimensions: { height: 400, width: 200 },
            fillColor: '#60A5FA',
            emptyColor: '#F3F4F6'
          }}
          currentAmount={hydrationData?.dailyTotals[new Date().toISOString().split('T')[0]] || 0}
          className="h-full"
        />
        
        {/* Overlay Stats */}
        <div className="absolute top-0 right-0 p-6 text-right">
          <h1 className="text-3xl font-bold text-blue-900">Hydration Tracking</h1>
          <p className="text-xl text-blue-700">
            {hydrationData?.dailyTotals[new Date().toISOString().split('T')[0]] || 0}ml
            <span className="text-sm text-blue-500 ml-2">
              of {hydrationData?.goal?.dailyTarget || 2000}ml
            </span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowEntryForm(true)}
          className="p-6 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all"
        >
          <span className="text-xl">+ Add Hydration Entry</span>
        </motion.button>
        
        {defaultContainers.map((container, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-white rounded-lg shadow-lg"
          >
            <HydrationVisualDynamic
              container={container}
              currentAmount={container.capacity * 0.7}
              className="h-[200px] mb-4"
              interactive
              onAmountChange={(amount) => {
                createRecord.mutate({
                  userId,
                  amount,
                  unit: container.unit,
                  type: LiquidType.WATER,
                  containerType: container.type,
                  timestamp: new Date(),
                  method: 'INDEPENDENT',
                  assistanceRequired: false,
                  visualLevel: (amount / container.capacity) * 100,
                  completed: true
                })
              }}
            />
            <p className="text-center text-gray-700 font-medium">{container.type}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights?.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-lg shadow-lg ${
              insight.type === 'advanced' ? 'bg-gradient-to-br from-blue-50 to-white' : 'bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
            <p className="text-gray-600 mb-4">{insight.description}</p>
            
            {insight.type === 'advanced' && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Confidence:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${insight.confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(insight.confidence * 100)}%</span>
                </div>
                {insight.recommendations.map((rec, i) => (
                  <p key={i} className="mt-2 text-blue-600">• {rec}</p>
                ))}
              </>
            )}

            {insight.type === 'basic' && (
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  insight.importance === 'high' 
                    ? 'bg-blue-100 text-blue-700'
                    : insight.importance === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {insight.importance.toUpperCase()} PRIORITY
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Entry Form Modal */}
      {showEntryForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
          >
            <HydrationEntryForm
              onSubmit={async (data) => {
                await createRecord.mutateAsync(data)
              }}
              onCancel={() => setShowEntryForm(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
