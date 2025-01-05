import { ServiceBusClient, ServiceBusMessage } from '@azure/service-bus'
import { env } from '@/env.mjs'
import { SMSTemplateType, SMSTemplateData } from './templates'

const serviceBusClient = new ServiceBusClient(env.AZURE_SERVICE_BUS_CONNECTION_STRING)

// Queue names
const QUEUES = {
  NORMAL: 'sms-normal',
  HIGH_PRIORITY: 'sms-priority',
  BULK: 'sms-bulk',
} as const

interface QueuedSMSMessage {
  to: string
  template: SMSTemplateType
  data: SMSTemplateData<SMSTemplateType>
  priority?: 'normal' | 'high'
  metadata?: {
    facilityId?: string
    userId?: string
    category?: string
    batchId?: string
  }
}

export async function queueSMSMessage(message: QueuedSMSMessage) {
  const queueName = message.priority === 'high' ? QUEUES.HIGH_PRIORITY : QUEUES.NORMAL
  const sender = serviceBusClient.createSender(queueName)

  try {
    const serviceBusMessage: ServiceBusMessage = {
      body: message,
      contentType: 'application/json',
      messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timeToLive: message.priority === 'high' ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24, // 1 hour for high priority, 24 hours for normal
    }

    await sender.sendMessages(serviceBusMessage)
    return { success: true, messageId: serviceBusMessage.messageId }
  } catch (error) {
    console.error('Failed to queue SMS message:', error)
    return { success: false, error: error.message }
  } finally {
    await sender.close()
  }
}

export async function queueBulkSMSMessages(messages: QueuedSMSMessage[]) {
  const sender = serviceBusClient.createSender(QUEUES.BULK)
  const batchId = `batch-${Date.now()}`

  try {
    // Create a batch of messages
    const batch = await sender.createMessageBatch()
    
    for (const message of messages) {
      const serviceBusMessage: ServiceBusMessage = {
        body: { ...message, metadata: { ...message.metadata, batchId } },
        contentType: 'application/json',
        messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timeToLive: 1000 * 60 * 60 * 24, // 24 hours
      }

      if (!batch.tryAddMessage(serviceBusMessage)) {
        throw new Error('Message too large to fit in batch')
      }
    }

    await sender.sendMessages(batch)
    return { success: true, batchId }
  } catch (error) {
    console.error('Failed to queue bulk SMS messages:', error)
    return { success: false, error: error.message }
  } finally {
    await sender.close()
  }
}

// Process queued messages
export async function startMessageProcessor() {
  const receivers = [
    serviceBusClient.createReceiver(QUEUES.HIGH_PRIORITY),
    serviceBusClient.createReceiver(QUEUES.NORMAL),
    serviceBusClient.createReceiver(QUEUES.BULK),
  ]

  for (const receiver of receivers) {
    receiver.subscribe({
      processMessage: async (message) => {
        try {
          const { to, template, data, metadata } = message.body as QueuedSMSMessage
          
          // Process the message using the SMS service
          const result = await sendTemplatedSMS({
            to,
            template,
            data,
            options: {
              priority: metadata?.category === 'emergency' ? 'high' : 'normal',
              trackStatus: true,
            },
          })

          if (!result.success) {
            throw new Error(result.error)
          }
        } catch (error) {
          console.error('Failed to process queued message:', error)
          // Dead-letter the message if processing fails
          await receiver.deadLetter(message, {
            deadLetterReason: 'ProcessingFailure',
            deadLetterErrorDescription: error.message,
          })
        }
      },
      processError: async (args) => {
        console.error('Error processing message:', args.error)
      },
    })
  }
}

// Cleanup function
export async function stopMessageProcessor() {
  await serviceBusClient.close()
} 


