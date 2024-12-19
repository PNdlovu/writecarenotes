export const PayrollConfig = {
  webhook: {
    secretKey: process.env.WEBHOOK_SECRET_KEY || '',
    timeoutMs: parseInt(process.env.WEBHOOK_TIMEOUT_MS || '30000', 10)
  },
  retry: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3', 10),
    delays: [5000, 15000, 30000], // Delays between retries in milliseconds
    backoffFactor: 1.5 // Exponential backoff factor
  },
  healthCheck: {
    intervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL || '3600000', 10),
    unhealthyThreshold: parseInt(process.env.UNHEALTHY_THRESHOLD || '5', 10),
    degradedThreshold: parseInt(process.env.DEGRADED_THRESHOLD || '3', 10)
  },
  integration: {
    timeoutMs: parseInt(process.env.INTEGRATION_TIMEOUT_MS || '60000', 10),
    batchSize: parseInt(process.env.INTEGRATION_BATCH_SIZE || '100', 10)
  }
};


