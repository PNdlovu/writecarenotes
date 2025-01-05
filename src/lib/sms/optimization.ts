import { SMSTemplateType } from './templates'
import { getFacilityCosts } from './analytics'

interface MessageOptimizationRules {
  maxLength: number
  allowedTimeStart: number // 24-hour format
  allowedTimeEnd: number
  rateLimitPerHour: number
  priorityLevel: 'low' | 'normal' | 'high'
  allowBatching: boolean
  retryAttempts: number
  costThreshold: number
}

const defaultRules: Record<string, MessageOptimizationRules> = {
  emergency: {
    maxLength: 320,
    allowedTimeStart: 0, // 24/7
    allowedTimeEnd: 24,
    rateLimitPerHour: 100,
    priorityLevel: 'high',
    allowBatching: false,
    retryAttempts: 3,
    costThreshold: 0.10, // No limit for emergency
  },
  staff: {
    maxLength: 160,
    allowedTimeStart: 6, // 6 AM
    allowedTimeEnd: 22, // 10 PM
    rateLimitPerHour: 50,
    priorityLevel: 'normal',
    allowBatching: true,
    retryAttempts: 2,
    costThreshold: 0.05,
  },
  reminder: {
    maxLength: 160,
    allowedTimeStart: 8, // 8 AM
    allowedTimeEnd: 20, // 8 PM
    rateLimitPerHour: 30,
    priorityLevel: 'low',
    allowBatching: true,
    retryAttempts: 1,
    costThreshold: 0.03,
  },
}

export function getOptimizationRules(category: string): MessageOptimizationRules {
  return defaultRules[category] || defaultRules.reminder
}

interface CostOptimizationResult {
  shouldSend: boolean
  optimizedMessage?: string
  recommendedTime?: Date
  batchRecommended?: boolean
  reason?: string
}

export async function optimizeMessage({
  message,
  category,
  facilityId,
  currentTime = new Date(),
}: {
  message: string
  category: string
  facilityId: string
  currentTime?: Date
}): Promise<CostOptimizationResult> {
  const rules = getOptimizationRules(category)
  const hour = currentTime.getHours()

  // Check time restrictions
  if (hour < rules.allowedTimeStart || hour >= rules.allowedTimeEnd) {
    const nextAllowedTime = new Date(currentTime)
    nextAllowedTime.setHours(rules.allowedTimeStart, 0, 0, 0)
    if (hour >= rules.allowedTimeEnd) {
      nextAllowedTime.setDate(nextAllowedTime.getDate() + 1)
    }

    return {
      shouldSend: false,
      recommendedTime: nextAllowedTime,
      reason: 'Outside allowed time window',
    }
  }

  // Check message length and optimize if needed
  let optimizedMessage = message
  if (message.length > rules.maxLength) {
    optimizedMessage = message.substring(0, rules.maxLength - 3) + '...'
  }

  // Check cost threshold
  const monthStart = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1)
  const costs = await getFacilityCosts(facilityId, monthStart, currentTime)
  
  if (costs.averageCost > rules.costThreshold) {
    return {
      shouldSend: false,
      reason: 'Cost threshold exceeded',
    }
  }

  // Recommend batching if appropriate
  const batchRecommended = rules.allowBatching && costs.messageCount > 10

  return {
    shouldSend: true,
    optimizedMessage,
    batchRecommended,
  }
}

interface BatchOptimizationResult {
  messages: string[]
  totalCost: number
  savingsPercent: number
  recommendedDeliveryTimes: Date[]
}

export async function optimizeBatch(
  messages: string[],
  category: string
): Promise<BatchOptimizationResult> {
  const rules = getOptimizationRules(category)
  const optimizedMessages: string[] = []
  const deliveryTimes: Date[] = []
  
  // Calculate optimal delivery times
  const now = new Date()
  const messagesPerHour = Math.min(messages.length, rules.rateLimitPerHour)
  const intervalMinutes = 60 / messagesPerHour

  for (let i = 0; i < messages.length; i++) {
    // Optimize message content
    let message = messages[i]
    if (message.length > rules.maxLength) {
      message = message.substring(0, rules.maxLength - 3) + '...'
    }
    optimizedMessages.push(message)

    // Calculate delivery time
    const deliveryTime = new Date(now.getTime() + (i * intervalMinutes * 60 * 1000))
    // Adjust if outside allowed hours
    if (deliveryTime.getHours() >= rules.allowedTimeEnd) {
      deliveryTime.setDate(deliveryTime.getDate() + 1)
      deliveryTime.setHours(rules.allowedTimeStart, 0, 0, 0)
    }
    deliveryTimes.push(deliveryTime)
  }

  // Calculate cost savings
  const originalCost = messages.reduce((total, msg) => total + (msg.length > 160 ? 2 : 1) * 0.05, 0)
  const optimizedCost = optimizedMessages.reduce((total, msg) => total + (msg.length > 160 ? 2 : 1) * 0.05, 0)
  const savingsPercent = ((originalCost - optimizedCost) / originalCost) * 100

  return {
    messages: optimizedMessages,
    totalCost: optimizedCost,
    savingsPercent,
    recommendedDeliveryTimes: deliveryTimes,
  }
}

export function estimateMessageCost(message: string): number {
  const segments = Math.ceil(message.length / 160)
  return segments * 0.05 // Assuming £0.05 per segment
}

export function suggestOptimalSendTime(
  category: string,
  targetAudience: 'staff' | 'residents' | 'family'
): Date {
  const now = new Date()
  const rules = getOptimizationRules(category)
  
  // Define optimal hours for different audiences
  const optimalHours = {
    staff: { start: 7, end: 9 }, // Early morning for staff
    residents: { start: 9, end: 18 }, // During day for residents
    family: { start: 18, end: 20 }, // Evening for family
  }

  const optimal = optimalHours[targetAudience]
  const currentHour = now.getHours()

  let suggestedTime = new Date(now)

  if (currentHour < optimal.start) {
    // Set to today's optimal start time
    suggestedTime.setHours(optimal.start, 0, 0, 0)
  } else if (currentHour >= optimal.end) {
    // Set to tomorrow's optimal start time
    suggestedTime.setDate(suggestedTime.getDate() + 1)
    suggestedTime.setHours(optimal.start, 0, 0, 0)
  } else if (currentHour >= optimal.start && currentHour < optimal.end) {
    // Keep current time if within optimal window
    return now
  }

  return suggestedTime
} 


