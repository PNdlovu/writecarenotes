/**
 * @fileoverview Centralized monitoring functionality for the application
 */

import { prisma } from '@/lib/prisma'
import { thresholds } from '@/config/thresholds'
import { notifications } from '@/config/notifications'
import { sendEmail } from '@/lib/email'
import { sendSMS } from '@/lib/sms'
import { EventGridPublisherClient } from '@azure/eventgrid'
import { env } from '@/env.mjs'

// Types
export interface MonitoringEvent {
  type: string
  subtype?: string
  value: string | number
  timestamp: Date
  metadata?: Record<string, any>
}

export interface MonitoringThresholds {
  warning?: number
  critical?: number
  warning_min?: number
  warning_max?: number
  critical_min?: number
  critical_max?: number
}

export interface AlertConfig {
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  channels: string[]
  escalation?: {
    timeout: number
    to: string[]
  }
}

// Initialize Event Grid client for real-time events
const eventGridClient = new EventGridPublisherClient(
  env.AZURE_EVENTGRID_ENDPOINT,
  'Monitoring',
  env.AZURE_EVENTGRID_KEY
)

/**
 * Process a monitoring event
 */
export async function processMonitoringEvent(
  facilityId: string,
  event: MonitoringEvent
) {
  try {
    // Get facility settings
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        regionalSettings: true,
        specializedCare: true
      }
    })

    if (!facility) {
      throw new Error('Facility not found')
    }

    // Get relevant thresholds
    const baseThresholds = thresholds[event.type as keyof typeof thresholds]
    if (!baseThresholds) {
      throw new Error(`Invalid event type: ${event.type}`)
    }

    // Apply regional and specialized care adjustments
    const adjustedThresholds = calculateAdjustedThresholds(
      baseThresholds,
      facility.regionalSettings,
      facility.specializedCare
    )

    // Evaluate event against thresholds
    const evaluation = evaluateEvent(event, adjustedThresholds)

    // Store event
    const storedEvent = await prisma.monitoringEvent.create({
      data: {
        facilityId,
        type: event.type,
        subtype: event.subtype,
        value: String(event.value),
        timestamp: event.timestamp,
        metadata: event.metadata,
        status: evaluation.status,
        message: evaluation.message
      }
    })

    // Generate alerts if needed
    if (evaluation.status === 'critical' || evaluation.status === 'warning') {
      await generateAlerts(storedEvent, evaluation, facility)
    }

    // Publish event to Event Grid for real-time processing
    await publishEvent(storedEvent, evaluation)

    return {
      event: storedEvent,
      evaluation
    }

  } catch (error) {
    console.error('Monitoring event processing error:', error)
    throw error
  }
}

/**
 * Calculate adjusted thresholds based on facility settings
 */
function calculateAdjustedThresholds(
  baseThresholds: any,
  regionalSettings: any,
  specializedCare: any[]
) {
  let adjusted = { ...baseThresholds }

  // Apply regional adjustments
  if (regionalSettings?.regulatoryBody) {
    const regionalAdjustments = thresholds[regionalSettings.regulatoryBody as keyof typeof thresholds]
    if (regionalAdjustments) {
      adjusted = applyAdjustments(adjusted, regionalAdjustments)
    }
  }

  // Apply specialized care adjustments
  specializedCare.forEach(care => {
    const specializedAdjustments = thresholds[care.type as keyof typeof thresholds]
    if (specializedAdjustments) {
      adjusted = applyAdjustments(adjusted, specializedAdjustments)
    }
  })

  return adjusted
}

/**
 * Apply threshold adjustments
 */
function applyAdjustments(base: any, adjustments: any) {
  const result = { ...base }

  for (const [key, value] of Object.entries(adjustments)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = applyAdjustments(result[key] || {}, value)
    } else if (typeof value === 'number') {
      if (key.includes('multiplier')) {
        const targetKey = key.replace('_multiplier', '')
        if (typeof result[targetKey] === 'number') {
          result[targetKey] *= value
        }
      } else {
        result[key] = value
      }
    }
  }

  return result
}

/**
 * Evaluate event against thresholds
 */
function evaluateEvent(event: MonitoringEvent, thresholds: MonitoringThresholds) {
  const { value } = event
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  if (typeof numericValue !== 'number' || isNaN(numericValue)) {
    return {
      status: 'invalid',
      message: 'Invalid numeric value'
    }
  }

  // Check critical thresholds
  if (
    (thresholds.critical_min !== undefined && numericValue < thresholds.critical_min) ||
    (thresholds.critical_max !== undefined && numericValue > thresholds.critical_max) ||
    (thresholds.critical !== undefined && numericValue > thresholds.critical)
  ) {
    return {
      status: 'critical',
      message: `${event.type} is at critical level`
    }
  }

  // Check warning thresholds
  if (
    (thresholds.warning_min !== undefined && numericValue < thresholds.warning_min) ||
    (thresholds.warning_max !== undefined && numericValue > thresholds.warning_max) ||
    (thresholds.warning !== undefined && numericValue > thresholds.warning)
  ) {
    return {
      status: 'warning',
      message: `${event.type} requires attention`
    }
  }

  return {
    status: 'normal',
    message: `${event.type} is within normal range`
  }
}

/**
 * Generate alerts for monitoring events
 */
async function generateAlerts(event: any, evaluation: any, facility: any) {
  try {
    // Create alert record
    const alert = await prisma.alert.create({
      data: {
        facilityId: facility.id,
        eventId: event.id,
        type: 'MONITORING',
        severity: evaluation.status === 'critical' ? 'HIGH' : 'MEDIUM',
        message: evaluation.message,
        metadata: {
          eventType: event.type,
          eventSubtype: event.subtype,
          value: event.value,
          thresholds: evaluation.thresholds
        },
        status: 'OPEN'
      }
    })

    // Get notification config
    const notificationConfig = notifications.channels

    // Send notifications based on severity
    if (evaluation.status === 'critical') {
      // Send immediate notifications
      await Promise.all([
        // Email notifications
        sendEmail({
          to: facility.contactDetails.email,
          subject: `Critical Alert: ${event.type}`,
          html: `
            <h1>Critical Alert</h1>
            <p>${evaluation.message}</p>
            <p>Value: ${event.value}</p>
            <p>Timestamp: ${event.timestamp}</p>
          `
        }),
        // SMS notifications
        sendSMS({
          to: facility.contactDetails.phone,
          message: `CRITICAL: ${evaluation.message}. Value: ${event.value}`
        })
      ])
    } else if (evaluation.status === 'warning') {
      // Send warning notifications
      await sendEmail({
        to: facility.contactDetails.email,
        subject: `Warning Alert: ${event.type}`,
        html: `
          <h1>Warning Alert</h1>
          <p>${evaluation.message}</p>
          <p>Value: ${event.value}</p>
          <p>Timestamp: ${event.timestamp}</p>
        `
      })
    }

    return alert

  } catch (error) {
    console.error('Alert generation error:', error)
    // Don't throw - we don't want to break the monitoring flow
  }
}

/**
 * Publish event to Event Grid for real-time processing
 */
async function publishEvent(event: any, evaluation: any) {
  try {
    await eventGridClient.send([
      {
        eventType: 'CareHome.Monitoring.Event',
        subject: `monitoring/${event.type}`,
        dataVersion: '1.0',
        data: {
          id: event.id,
          type: event.type,
          subtype: event.subtype,
          value: event.value,
          timestamp: event.timestamp,
          status: evaluation.status,
          message: evaluation.message,
          metadata: event.metadata
        },
        eventTime: new Date()
      }
    ])
  } catch (error) {
    console.error('Event Grid publishing error:', error)
    // Don't throw - we don't want to break the monitoring flow
  }
}

/**
 * Get monitoring metrics for a facility
 */
export async function getMonitoringMetrics(facilityId: string, timespan = 86400000) {
  const from = new Date(Date.now() - timespan)

  // Get events
  const events = await prisma.monitoringEvent.findMany({
    where: {
      facilityId,
      timestamp: {
        gte: from
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    include: {
      alerts: true
    }
  })

  // Calculate metrics
  const metrics = {
    total: events.length,
    by_status: {
      critical: events.filter(e => e.status === 'critical').length,
      warning: events.filter(e => e.status === 'warning').length,
      normal: events.filter(e => e.status === 'normal').length
    },
    by_type: events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    alerts: {
      total: events.reduce((acc, e) => acc + e.alerts.length, 0),
      open: events.reduce((acc, e) => acc + e.alerts.filter(a => a.status === 'OPEN').length, 0)
    },
    latest: events[0]
  }

  return metrics
} 


