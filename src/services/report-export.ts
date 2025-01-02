import { BlobServiceClient } from '@azure/storage-blob'
import { DefaultAzureCredential } from '@azure/identity'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface ExportOptions {
  format: 'xlsx' | 'pdf' | 'csv'
  timeRange: {
    start: Date
    end: Date
  }
  includeCharts?: boolean
  includeTables?: boolean
  sections?: string[]
}

interface ReportData {
  costs: {
    total: number
    breakdown: Record<string, number>
    trends: Array<{ date: string; amount: number }>
  }
  usage: {
    activeUsers: number
    apiCalls: number
    features: Record<string, number>
  }
  performance: {
    averageResponseTime: number
    errorRate: number
    uptime: number
  }
}

export class ReportExportService {
  private static instance: ReportExportService
  private blobClient: BlobServiceClient

  private constructor() {
    const credential = new DefaultAzureCredential()
    this.blobClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    )
  }

  public static getInstance(): ReportExportService {
    if (!ReportExportService.instance) {
      ReportExportService.instance = new ReportExportService()
    }
    return ReportExportService.instance
  }

  public async exportReport(
    data: ReportData,
    options: ExportOptions
  ): Promise<string> {
    const fileName = this.generateFileName(options)
    let fileContent: Buffer

    switch (options.format) {
      case 'xlsx':
        fileContent = await this.generateExcel(data, options)
        break
      case 'pdf':
        fileContent = await this.generatePDF(data, options)
        break
      case 'csv':
        fileContent = await this.generateCSV(data, options)
        break
      default:
        throw new Error(`Unsupported format: ${options.format}`)
    }

    // Upload to Azure Blob Storage
    const containerClient = this.blobClient.getContainerClient('reports')
    await containerClient.createIfNotExists()
    
    const blobClient = containerClient.getBlockBlobClient(fileName)
    await blobClient.upload(fileContent, fileContent.length)

    // Generate SAS URL for download
    const sasUrl = await blobClient.generateSasUrl({
      permissions: 'read',
      expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })

    return sasUrl
  }

  private generateFileName(options: ExportOptions): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    return `report_${timestamp}.${options.format}`
  }

  private async generateExcel(
    data: ReportData,
    options: ExportOptions
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new()

    // Cost Sheet
    if (options.sections?.includes('costs')) {
      const costData = [
        ['Category', 'Amount'],
        ['Total Cost', data.costs.total],
        ...Object.entries(data.costs.breakdown)
      ]
      const costSheet = XLSX.utils.aoa_to_sheet(costData)
      XLSX.utils.book_append_sheet(workbook, costSheet, 'Costs')

      // Cost Trends
      if (options.includeCharts) {
        const trendData = [
          ['Date', 'Amount'],
          ...data.costs.trends.map(t => [t.date, t.amount])
        ]
        const trendSheet = XLSX.utils.aoa_to_sheet(trendData)
        XLSX.utils.book_append_sheet(workbook, trendSheet, 'Cost Trends')
      }
    }

    // Usage Sheet
    if (options.sections?.includes('usage')) {
      const usageData = [
        ['Metric', 'Value'],
        ['Active Users', data.usage.activeUsers],
        ['API Calls', data.usage.apiCalls],
        ['Features', ''],
        ...Object.entries(data.usage.features)
      ]
      const usageSheet = XLSX.utils.aoa_to_sheet(usageData)
      XLSX.utils.book_append_sheet(workbook, usageSheet, 'Usage')
    }

    // Performance Sheet
    if (options.sections?.includes('performance')) {
      const perfData = [
        ['Metric', 'Value'],
        ['Average Response Time', data.performance.averageResponseTime],
        ['Error Rate', data.performance.errorRate],
        ['Uptime', data.performance.uptime]
      ]
      const perfSheet = XLSX.utils.aoa_to_sheet(perfData)
      XLSX.utils.book_append_sheet(workbook, perfSheet, 'Performance')
    }

    // Convert to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    return Buffer.from(buffer)
  }

  private async generatePDF(
    data: ReportData,
    options: ExportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF()
    let yOffset = 20

    // Title
    doc.setFontSize(20)
    doc.text('Analytics Report', 20, yOffset)
    yOffset += 20

    // Date Range
    doc.setFontSize(12)
    doc.text(
      `Period: ${options.timeRange.start.toLocaleDateString()} - ${options.timeRange.end.toLocaleDateString()}`,
      20,
      yOffset
    )
    yOffset += 20

    // Costs Section
    if (options.sections?.includes('costs')) {
      doc.setFontSize(16)
      doc.text('Cost Analysis', 20, yOffset)
      yOffset += 10

      const costData = [
        ['Category', 'Amount'],
        ['Total', `$${data.costs.total.toFixed(2)}`],
        ...Object.entries(data.costs.breakdown).map(([cat, amount]) => [
          cat,
          `$${amount.toFixed(2)}`
        ])
      ]

      doc.autoTable({
        startY: yOffset,
        head: [costData[0]],
        body: costData.slice(1),
        theme: 'striped',
        styles: { fontSize: 10 }
      })

      yOffset = (doc as any).lastAutoTable.finalY + 20
    }

    // Usage Section
    if (options.sections?.includes('usage')) {
      if (yOffset > 250) {
        doc.addPage()
        yOffset = 20
      }

      doc.setFontSize(16)
      doc.text('Usage Statistics', 20, yOffset)
      yOffset += 10

      const usageData = [
        ['Metric', 'Value'],
        ['Active Users', data.usage.activeUsers.toString()],
        ['API Calls', data.usage.apiCalls.toString()],
        ...Object.entries(data.usage.features).map(([feature, count]) => [
          feature,
          count.toString()
        ])
      ]

      doc.autoTable({
        startY: yOffset,
        head: [usageData[0]],
        body: usageData.slice(1),
        theme: 'striped',
        styles: { fontSize: 10 }
      })

      yOffset = (doc as any).lastAutoTable.finalY + 20
    }

    // Performance Section
    if (options.sections?.includes('performance')) {
      if (yOffset > 250) {
        doc.addPage()
        yOffset = 20
      }

      doc.setFontSize(16)
      doc.text('Performance Metrics', 20, yOffset)
      yOffset += 10

      const perfData = [
        ['Metric', 'Value'],
        ['Avg Response Time', `${data.performance.averageResponseTime}ms`],
        ['Error Rate', `${data.performance.errorRate}%`],
        ['Uptime', `${data.performance.uptime}%`]
      ]

      doc.autoTable({
        startY: yOffset,
        head: [perfData[0]],
        body: perfData.slice(1),
        theme: 'striped',
        styles: { fontSize: 10 }
      })
    }

    return Buffer.from(doc.output('arraybuffer'))
  }

  private async generateCSV(
    data: ReportData,
    options: ExportOptions
  ): Promise<Buffer> {
    const rows: string[] = []

    // Header
    rows.push(`Analytics Report,${options.timeRange.start.toLocaleDateString()} - ${options.timeRange.end.toLocaleDateString()}`)
    rows.push('')

    // Costs
    if (options.sections?.includes('costs')) {
      rows.push('Cost Analysis')
      rows.push('Category,Amount')
      rows.push(`Total,$${data.costs.total.toFixed(2)}`)
      Object.entries(data.costs.breakdown).forEach(([category, amount]) => {
        rows.push(`${category},$${amount.toFixed(2)}`)
      })
      rows.push('')

      if (options.includeCharts) {
        rows.push('Cost Trends')
        rows.push('Date,Amount')
        data.costs.trends.forEach(trend => {
          rows.push(`${trend.date},$${trend.amount.toFixed(2)}`)
        })
        rows.push('')
      }
    }

    // Usage
    if (options.sections?.includes('usage')) {
      rows.push('Usage Statistics')
      rows.push('Metric,Value')
      rows.push(`Active Users,${data.usage.activeUsers}`)
      rows.push(`API Calls,${data.usage.apiCalls}`)
      rows.push('Feature Usage')
      Object.entries(data.usage.features).forEach(([feature, count]) => {
        rows.push(`${feature},${count}`)
      })
      rows.push('')
    }

    // Performance
    if (options.sections?.includes('performance')) {
      rows.push('Performance Metrics')
      rows.push('Metric,Value')
      rows.push(`Average Response Time,${data.performance.averageResponseTime}ms`)
      rows.push(`Error Rate,${data.performance.errorRate}%`)
      rows.push(`Uptime,${data.performance.uptime}%`)
    }

    return Buffer.from(rows.join('\n'))
  }
}

export const reportExportService = ReportExportService.getInstance()
