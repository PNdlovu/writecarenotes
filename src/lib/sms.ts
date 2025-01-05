import { AzureCommunicationServicesClient } from '@azure/communication-sms'
import { env } from '@/env.mjs'

// Initialize Azure Communication Services client
const client = new AzureCommunicationServicesClient(env.AZURE_COMMUNICATION_CONNECTION_STRING)

export async function sendSMS({
  to,
  message,
}: {
  to: string
  message: string
}) {
  try {
    const response = await client.send({
      from: env.AZURE_PHONE_NUMBER,
      to: [to],
      message,
      enableDeliveryReport: true,
    })

    // Check if any messages failed to send
    const failedMessages = response.filter(r => r.successful === false)
    if (failedMessages.length > 0) {
      throw new Error(failedMessages[0].errorMessage || 'Failed to send SMS')
    }

    return {
      success: true,
      messageId: response[0].messageId,
    }
  } catch (error) {
    console.error('SMS sending error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function send2FACode({
  phoneNumber,
  code,
}: {
  phoneNumber: string
  code: string
}) {
  return sendSMS({
    to: phoneNumber,
    message: `Your Care Home Management verification code is: ${code}. This code will expire in 10 minutes.`,
  })
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

/**
 * Utility function to check SMS delivery status
 * Azure Communication Services provides delivery reports
 */
export async function checkSMSStatus(messageId: string) {
  try {
    const status = await client.getSendStatus(messageId)
    return {
      success: true,
      status: status.status,
      timestamp: status.timestamp,
    }
  } catch (error) {
    console.error('SMS status check error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
} 


