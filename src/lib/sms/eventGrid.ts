import { EventGridPublisherClient, AzureKeyCredential } from '@azure/eventgrid'
import { env } from '@/env.mjs'

const eventGridClient = new EventGridPublisherClient(
  env.AZURE_EVENTGRID_ENDPOINT,
  'SMS',
  new AzureKeyCredential(env.AZURE_EVENTGRID_KEY)
)

export interface SMSStatusEvent {
  messageId: string
  status: string
  timestamp: Date
  phoneNumber: string
  error?: string
}

export async function publishSMSStatusEvent(event: SMSStatusEvent) {
  try {
    await eventGridClient.send([
      {
        eventType: 'CareHome.SMS.StatusUpdate',
        subject: `sms/${event.messageId}`,
        dataVersion: '1.0',
        data: {
          messageId: event.messageId,
          status: event.status,
          timestamp: event.timestamp.toISOString(),
          phoneNumber: event.phoneNumber,
          error: event.error,
        },
        eventTime: new Date(),
      },
    ])

    return { success: true }
  } catch (error) {
    console.error('Failed to publish SMS status event:', error)
    return { success: false, error: error.message }
  }
}

export async function handleSMSStatusWebhook(req: Request) {
  try {
    const events = await req.json()
    
    for (const event of events) {
      if (event.eventType === 'Microsoft.Communication.SMSDeliveryReportReceived') {
        await publishSMSStatusEvent({
          messageId: event.data.messageId,
          status: event.data.deliveryStatus,
          timestamp: new Date(event.eventTime),
          phoneNumber: event.data.to,
          error: event.data.errorMessage,
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to handle SMS status webhook:', error)
    return { success: false, error: error.message }
  }
} 


