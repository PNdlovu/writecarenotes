import { ApplicationInsightsClient } from '@azure/applicationinsights'
import { DefaultAzureCredential } from '@azure/identity'
import { WebPubSubClient } from '@azure/web-pubsub'
import { azureConfigService } from './azure-config'

interface AlertThresholds {
  cost: {
    daily: number
    monthly: number
    perFeature: number
  }
  performance: {
    responseTime: number
    errorRate: number
    cpuUsage: number
    memoryUsage: number
  }
  usage: {
    concurrentUsers: number
    apiRateLimit: number
    storageQuota: number
  }
}

interface AlertRule {
  id: string
  type: 'COST' | 'PERFORMANCE' | 'USAGE' | 'SECURITY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  condition: string
  threshold: number
  currentValue: number
  triggered: boolean
  lastTriggered?: Date
  notificationChannels: string[]
}

interface Alert {
  id: string
  ruleId: string
  timestamp: Date
  message: string
  details: any
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED'
  assignedTo?: string
}

export class MonitoringAlertsService {
  private static instance: MonitoringAlertsService
  private insights: ApplicationInsightsClient
  private pubsub: WebPubSubClient
  private alertRules: Map<string, AlertRule>
  private activeAlerts: Map<string, Alert>
  private thresholds: AlertThresholds

  private constructor() {
    const credential = new DefaultAzureCredential()
    this.insights = new ApplicationInsightsClient(credential, process.env.APPLICATIONINSIGHTS_CONNECTION_STRING!)
    this.pubsub = new WebPubSubClient(process.env.AZURE_PUBSUB_CONNECTION_STRING!, 'monitoring')
    
    this.alertRules = new Map()
    this.activeAlerts = new Map()
    this.thresholds = {
      cost: {
        daily: 100,
        monthly: 2000,
        perFeature: 50
      },
      performance: {
        responseTime: 1000,
        errorRate: 5,
        cpuUsage: 80,
        memoryUsage: 85
      },
      usage: {
        concurrentUsers: 1000,
        apiRateLimit: 100,
        storageQuota: 90
      }
    }

    this.initializeDefaultRules()
    this.startMonitoring()
  }

  public static getInstance(): MonitoringAlertsService {
    if (!MonitoringAlertsService.instance) {
      MonitoringAlertsService.instance = new MonitoringAlertsService()
    }
    return MonitoringAlertsService.instance
  }

  private initializeDefaultRules(): void {
    // Cost rules
    this.addRule({
      id: 'COST_DAILY_LIMIT',
      type: 'COST',
      severity: 'HIGH',
      condition: 'dailyCost > threshold',
      threshold: this.thresholds.cost.daily,
      currentValue: 0,
      triggered: false,
      notificationChannels: ['email', 'slack']
    })

    // Performance rules
    this.addRule({
      id: 'PERF_RESPONSE_TIME',
      type: 'PERFORMANCE',
      severity: 'MEDIUM',
      condition: 'avgResponseTime > threshold',
      threshold: this.thresholds.performance.responseTime,
      currentValue: 0,
      triggered: false,
      notificationChannels: ['slack']
    })

    // Usage rules
    this.addRule({
      id: 'USAGE_API_LIMIT',
      type: 'USAGE',
      severity: 'HIGH',
      condition: 'apiCalls > threshold',
      threshold: this.thresholds.usage.apiRateLimit,
      currentValue: 0,
      triggered: false,
      notificationChannels: ['email', 'slack']
    })
  }

  private async startMonitoring(): Promise<void> {
    setInterval(async () => {
      await this.checkAlertConditions()
    }, 60 * 1000) // Check every minute
  }

  private async checkAlertConditions(): Promise<void> {
    const config = await azureConfigService.getConfig()
    const now = new Date()

    for (const rule of this.alertRules.values()) {
      let shouldTrigger = false
      let value = 0

      switch (rule.id) {
        case 'COST_DAILY_LIMIT':
          value = await this.getDailyCost()
          shouldTrigger = value > rule.threshold
          break

        case 'PERF_RESPONSE_TIME':
          value = await this.getAverageResponseTime()
          shouldTrigger = value > rule.threshold
          break

        case 'USAGE_API_LIMIT':
          value = await this.getAPIUsage()
          shouldTrigger = value > rule.threshold
          break
      }

      rule.currentValue = value

      if (shouldTrigger && !rule.triggered) {
        await this.triggerAlert(rule, value)
      } else if (!shouldTrigger && rule.triggered) {
        await this.resolveAlert(rule)
      }
    }
  }

  private async triggerAlert(rule: AlertRule, value: number): Promise<void> {
    const alertId = `${rule.id}_${Date.now()}`
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      timestamp: new Date(),
      message: this.generateAlertMessage(rule, value),
      details: {
        rule,
        value,
        threshold: rule.threshold
      },
      severity: rule.severity,
      status: 'NEW'
    }

    this.activeAlerts.set(alertId, alert)
    rule.triggered = true
    rule.lastTriggered = new Date()

    await this.notifyAlert(alert)
  }

  private async resolveAlert(rule: AlertRule): Promise<void> {
    rule.triggered = false
    
    // Find and resolve related active alerts
    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.ruleId === rule.id && alert.status !== 'RESOLVED') {
        alert.status = 'RESOLVED'
        await this.notifyAlertResolution(alert)
      }
    }
  }

  private generateAlertMessage(rule: AlertRule, value: number): string {
    return `${rule.type} Alert: ${rule.id} threshold exceeded. Current value: ${value}, Threshold: ${rule.threshold}`
  }

  private async notifyAlert(alert: Alert): Promise<void> {
    const rule = this.alertRules.get(alert.ruleId)
    if (!rule) return

    // Log to Application Insights
    await this.insights.trackEvent({
      name: 'MonitoringAlert',
      properties: {
        alertId: alert.id,
        ruleId: alert.ruleId,
        severity: alert.severity,
        value: rule.currentValue,
        threshold: rule.threshold
      }
    })

    // Send real-time notification
    await this.pubsub.sendToAll({
      type: 'alert',
      data: alert
    })

    // Send notifications through configured channels
    for (const channel of rule.notificationChannels) {
      await this.sendNotification(channel, alert)
    }
  }

  private async notifyAlertResolution(alert: Alert): Promise<void> {
    await this.pubsub.sendToAll({
      type: 'alertResolution',
      data: alert
    })
  }

  private async sendNotification(channel: string, alert: Alert): Promise<void> {
    switch (channel) {
      case 'email':
        // Implement email notification
        break
      case 'slack':
        // Implement Slack notification
        break
    }
  }

  private async getDailyCost(): Promise<number> {
    const results = await this.insights.query(`
      customMetrics
      | where name == "CostOptimization_DailyCost"
      | where timestamp >= ago(24h)
      | summarize total = sum(value)
    `)
    return results[0]?.total || 0
  }

  private async getAverageResponseTime(): Promise<number> {
    const results = await this.insights.query(`
      requests
      | where timestamp >= ago(5m)
      | summarize avg(duration)
    `)
    return results[0]?.avg || 0
  }

  private async getAPIUsage(): Promise<number> {
    const results = await this.insights.query(`
      requests
      | where timestamp >= ago(1m)
      | count
    `)
    return results[0]?.count || 0
  }

  // Public methods
  public async addRule(rule: Omit<AlertRule, 'currentValue' | 'triggered'>): Promise<void> {
    this.alertRules.set(rule.id, {
      ...rule,
      currentValue: 0,
      triggered: false
    })
  }

  public async updateRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {
    const rule = this.alertRules.get(ruleId)
    if (rule) {
      this.alertRules.set(ruleId, { ...rule, ...updates })
    }
  }

  public async deleteRule(ruleId: string): Promise<void> {
    this.alertRules.delete(ruleId)
  }

  public getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.status !== 'RESOLVED')
  }

  public async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId)
    if (alert && alert.status === 'NEW') {
      alert.status = 'ACKNOWLEDGED'
      alert.assignedTo = userId
      await this.notifyAlertUpdate(alert)
    }
  }

  public async resolveAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId)
    if (alert && alert.status !== 'RESOLVED') {
      alert.status = 'RESOLVED'
      await this.notifyAlertResolution(alert)
    }
  }

  private async notifyAlertUpdate(alert: Alert): Promise<void> {
    await this.pubsub.sendToAll({
      type: 'alertUpdate',
      data: alert
    })
  }

  public getAlertHistory(timeRange: { start: Date; end: Date }): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => 
        alert.timestamp >= timeRange.start && 
        alert.timestamp <= timeRange.end
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  public async updateThresholds(updates: Partial<AlertThresholds>): Promise<void> {
    this.thresholds = {
      ...this.thresholds,
      ...updates
    }

    // Update related rules
    for (const rule of this.alertRules.values()) {
      switch (rule.type) {
        case 'COST':
          if (updates.cost?.daily && rule.id === 'COST_DAILY_LIMIT') {
            rule.threshold = updates.cost.daily
          }
          break
        case 'PERFORMANCE':
          if (updates.performance?.responseTime && rule.id === 'PERF_RESPONSE_TIME') {
            rule.threshold = updates.performance.responseTime
          }
          break
        case 'USAGE':
          if (updates.usage?.apiRateLimit && rule.id === 'USAGE_API_LIMIT') {
            rule.threshold = updates.usage.apiRateLimit
          }
          break
      }
    }
  }
}

export const monitoringAlertsService = MonitoringAlertsService.getInstance()
