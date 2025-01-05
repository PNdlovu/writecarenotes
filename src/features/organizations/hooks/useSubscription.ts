'use client'

import { useContext, createContext } from 'react'
import { Subscription } from '../types/subscription.types'
import { SubscriptionService } from '../services/subscriptionService'

interface SubscriptionContextType {
  subscription: Subscription | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  checkFeatureAccess: (feature: string) => boolean
  validateFeatureUsage: (feature: string, usage: number) => boolean
}

export const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
  checkFeatureAccess: () => false,
  validateFeatureUsage: () => false,
})

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}


