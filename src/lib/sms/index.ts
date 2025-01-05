import { AzureCommunicationServicesClient } from '@azure/communication-sms'
import { env } from '@/env.mjs'
import { publishSMSStatusEvent } from './eventGrid'
import { createTemplatedMessage, SMSTemplateType, SMSTemplateData } from './templates'

interface SMSProvider {
  name: string
  phoneNumber: string
  client: AzureCommunicationServicesClient
}

// Configure primary and fallback providers
const providers: SMSProvider[] = [
  {
    name: 'primary',
    phoneNumber: env.AZURE_PHONE_NUMBER,
    client: new AzureCommunicationServicesClient(env.AZURE_COMMUNICATION_CONNECTION_STRING),
  },
  {
    name: 'fallback',
    phoneNumber: env.AZURE_FALLBACK_PHONE_NUMBER,
    client: new AzureCommunicationServicesClient(env.AZURE_FALLBACK_CONNECTION_STRING),
  },
]

export interface SendSMSOptions {
  to: string
  message: string
  priority?: 'normal' | 'high'
  retryCount?: number
  trackStatus?: boolean
}

export async function sendSMS({
  to,
  message,
  priority = 'normal',
  retryCount = 2,
  trackStatus = true,
}: SendSMSOptions) {
  const formattedNumber = formatPhoneNumber(to)
  if (!validateUKPhoneNumber(formattedNumber)) {
    return {
      success: false,
      error: 'Invalid UK phone number',
    }
  }

  let lastError: Error | null = null
  
  // Try each provider in sequence
  for (const provider of providers) {
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const response = await provider.client.send({
          from: provider.phoneNumber,
          to: [formattedNumber],
          message,
          enableDeliveryReport: trackStatus,
        })

        // Check if any messages failed to send
        const failedMessages = response.filter(r => r.successful === false)
        if (failedMessages.length > 0) {
          throw new Error(failedMessages[0].errorMessage || 'Failed to send SMS')
        }

        // Publish status event if tracking is enabled
        if (trackStatus) {
          await publishSMSStatusEvent({
            messageId: response[0].messageId,
            status: 'sent',
            timestamp: new Date(),
            phoneNumber: formattedNumber,
          })
        }

        return {
          success: true,
          messageId: response[0].messageId,
          provider: provider.name,
          attempt: attempt + 1,
        }
      } catch (error) {
        console.error(`SMS sending error (${provider.name}, attempt ${attempt + 1}):`, error)
        lastError = error as Error
        
        // If this is a high priority message, try the next provider immediately
        if (priority === 'high') break
        
        // For normal priority, wait before retry
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Failed to send SMS after all attempts',
  }
}

export async function sendTemplatedSMS<T extends SMSTemplateType>({
  to,
  template,
  data,
  options = {},
}: {
  to: string
  template: T
  data: SMSTemplateData<T>
  options?: Partial<SendSMSOptions>
}) {
  const message = createTemplatedMessage(template, data)
  return sendSMS({ to, message, ...options })
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Add country code if not present
  if (!cleaned.startsWith('44') && !cleaned.startsWith('+44')) {
    return `+44${cleaned.startsWith('0') ? cleaned.slice(1) : cleaned}`
  }
  
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

export function validateUKPhoneNumber(phoneNumber: string): boolean {
  // UK phone number regex (including +44 prefix)
  const ukPhoneRegex = /^\+44[1-9]\d{8,9}$/
  return ukPhoneRegex.test(formatPhoneNumber(phoneNumber))
}

export { checkSMSStatus } from './status'
export { handleSMSStatusWebhook } from './eventGrid'
export { smsTemplates } from './templates'
export type { SMSTemplateType, SMSTemplateData } from './templates' 


