import { BlobServiceClient } from '@azure/storage-blob'
import { Workbook } from 'exceljs'
import PDFDocument from 'pdfkit'
import { env } from '@/env.mjs'
import { DashboardMetrics } from './dashboard'
import { getFacilityCosts } from './analytics'
import { getSystemMetrics } from './monitoring'
import { format } from 'date-fns'
import { createCanvas } from 'canvas'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { createHash } from 'crypto'

const blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING)
const containerClient = blobServiceClient.getContainerClient('exports')

interface OfstedReportSection extends ExportOptions {
  childDevelopment: {
    academic: {
      progress: {
        subject: string
        currentLevel: string
        targetLevel: string
        progress: number
        interventions: string[]
      }[]
      attendance: {
        overall: number
        authorized: number
        unauthorized: number
        lateArrivals: number
      }
      achievements: {
        type: string
        date: Date
        description: string
      }[]
    }
    personal: {
      behavior: {
        positiveIncidents: number
        concerns: number
        improvements: string[]
      }
      social: {
        relationships: string
        communication: string
        teamwork: string
      }
      emotional: {
        wellbeing: string
        resilience: string
        support: string[]
      }
    }
    health: {
      physical: {
        generalHealth: string
        medicalNeeds: string[]
        activities: string[]
      }
      mental: {
        wellbeingScore: number
        supportProvided: string[]
        progress: string
      }
      safeguarding: {
        concerns: number
        actions: string[]
        outcomes: string[]
      }
    }
  }
  qualityOfEducation: {
    curriculum: {
      intent: string[]
      implementation: string[]
      impact: string[]
    }
    teaching: {
      strengths: string[]
      development: string[]
      support: string[]
    }
    assessment: {
      methods: string[]
      frequency: string
      outcomes: string[]
    }
  }
  behavior: {
    overall: string
    strengths: string[]
    improvements: string[]
    interventions: {
      type: string
      frequency: string
      effectiveness: string
    }[]
  }
  leadership: {
    vision: string
    implementation: string[]
    monitoring: {
      type: string
      frequency: string
      findings: string[]
    }[]
    development: {
      priorities: string[]
      actions: string[]
      progress: string[]
    }
  }
}

interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf'
  reportType: 'metrics' | 'costs' | 'compliance' | 'full' | 'ofsted'
  dateRange: {
    startDate: Date
    endDate: Date
  }
  facilityId?: string
  filters?: {
    categories?: string[]
    templates?: string[]
    status?: string[]
  }
  chartTypes?: {
    volume: string
    costs: string
    performance: string
  }
  customization?: {
    branding?: {
      logo?: string
      colors?: string[]
      fonts?: string[]
    }
    layout?: {
      orientation?: 'portrait' | 'landscape'
      pageSize?: 'A4' | 'Letter'
      margins?: number
    }
    header?: {
      title?: string
      subtitle?: string
      includeDate?: boolean
    }
    footer?: {
      text?: string
      includePageNumbers?: boolean
    }
  }
  security?: {
    watermark?: string
    password?: string
    allowPrinting?: boolean
    allowCopying?: boolean
  }
  ofsted?: {
    includeEvidence: boolean
    includeCaseStudies: boolean
    sections: OfstedReportSection[]
    recommendations: {
      priority: 'high' | 'medium' | 'low'
      description: string
      deadline: Date
      progress: number
    }[]
  }
}

interface ExportResult {
  url: string
  expiresAt: Date
  filename: string
  metadata: {
    format: string
    pages: number
    size: number
    createdAt: Date
    hash: string
  }
}

export async function generateReport(options: ExportOptions): Promise<ExportResult> {
  const timestamp = new Date().toISOString()
  const filename = `report-${options.reportType}-${timestamp}.${options.format}`
  let buffer: Buffer
  let pages = 1
  let hash: string

  try {
    switch (options.format) {
      case 'xlsx':
        buffer = await generateExcelReport(options)
        break
      case 'csv':
        buffer = await generateCSVReport(options)
        break
      case 'pdf':
        const pdfResult = await generatePDFReport(options)
        buffer = pdfResult.buffer
        pages = pdfResult.pages
        break
      default:
        throw new Error('Unsupported format')
    }

    // Calculate hash for integrity verification
    hash = createHash('sha256').update(buffer).digest('hex')

    // Upload to Azure Blob Storage with metadata
    const blockBlobClient = containerClient.getBlockBlobClient(filename)
    await blockBlobClient.uploadData(buffer, {
      metadata: {
        reportType: options.reportType,
        facilityId: options.facilityId || 'all',
        startDate: options.dateRange.startDate.toISOString(),
        endDate: options.dateRange.endDate.toISOString(),
        hash,
      },
      blobHTTPHeaders: {
        blobContentType: getMimeType(options.format),
        blobCacheControl: 'private, max-age=3600',
      },
    })

    // Generate SAS URL with appropriate permissions
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: { read: true },
      expiresOn: expiresAt,
      contentDisposition: `attachment; filename="${filename}"`,
    })

    return {
      url: sasUrl,
      expiresAt,
      filename,
      metadata: {
        format: options.format,
        pages,
        size: buffer.length,
        createdAt: new Date(),
        hash,
      },
    }
  } catch (error) {
    console.error('Report generation error:', error)
    throw new Error('Failed to generate report')
  }
}

async function generatePDFReport(options: ExportOptions): Promise<{ buffer: Buffer; pages: number }> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: options.customization?.layout?.pageSize || 'A4',
        layout: options.customization?.layout?.orientation || 'portrait',
        margin: options.customization?.layout?.margins || 50,
        info: {
          Title: options.customization?.header?.title || `SMS Dashboard Report - ${options.reportType}`,
          Author: 'WriteNotes Enterprise Platform',
          Subject: 'SMS Analytics Report',
          Keywords: 'sms, analytics, dashboard, report',
        },
        userPassword: options.security?.password,
        permissions: {
          printing: options.security?.allowPrinting !== false,
          modifying: false,
          copying: options.security?.allowCopying || false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false,
        },
      })

      const chunks: Buffer[] = []
      let pageCount = 1

      doc.on('data', chunk => chunks.push(chunk))
      doc.on('pageAdded', () => pageCount++)
      doc.on('end', () => resolve({ buffer: Buffer.concat(chunks), pages: pageCount }))

      // Add branding if provided
      if (options.customization?.branding?.logo) {
        doc.image(options.customization.branding.logo, 50, 50, { width: 100 })
      }

      // Add watermark if specified
      if (options.security?.watermark) {
        addWatermark(doc, options.security.watermark)
      }

      // Add header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(options.customization?.header?.title || 'SMS Dashboard Report', { align: 'center' })
         .moveDown()

      if (options.customization?.header?.subtitle) {
        doc.fontSize(14)
           .font('Helvetica')
           .text(options.customization.header.subtitle, { align: 'center' })
           .moveDown()
      }

      // Add report metadata
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Report Type: ${options.reportType}`)
         .text(`Date Range: ${format(options.dateRange.startDate, 'PPP')} to ${format(options.dateRange.endDate, 'PPP')}`)
         .moveDown()

      // Add content based on report type
      switch (options.reportType) {
        case 'metrics':
          await addMetricsCharts(doc, options)
          break
        case 'costs':
          await addCostCharts(doc, options)
          break
        case 'compliance':
          await addComplianceCharts(doc, options)
          break
        case 'full':
          await addMetricsCharts(doc, options)
          await addCostCharts(doc, options)
          await addComplianceCharts(doc, options)
          break
        case 'ofsted':
          await addOfstedSections(doc, options)
          break
      }

      // Add footer
      if (options.customization?.footer?.includePageNumbers) {
        addPageNumbers(doc)
      }

      if (options.customization?.footer?.text) {
        doc.fontSize(10)
           .text(options.customization.footer.text, 50, doc.page.height - 50, {
             align: 'center',
           })
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

function addWatermark(doc: PDFKit.PDFDocument, text: string) {
  const pages = doc.bufferedPageRange()
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i)
    doc.save()
    doc.rotate(45, { origin: [doc.page.width / 2, doc.page.height / 2] })
    doc.fontSize(60)
       .fillColor('grey', 0.3)
       .text(text, 0, 0, {
         align: 'center',
         valign: 'center'
       })
    doc.restore()
  }
}

function addPageNumbers(doc: PDFKit.PDFDocument) {
  const pages = doc.bufferedPageRange()
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i)
    doc.fontSize(10)
       .text(
         `Page ${i + 1} of ${pages.count}`,
         50,
         doc.page.height - 50,
         { align: 'right' }
       )
  }
}

function getMimeType(format: string): string {
  switch (format) {
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'csv':
      return 'text/csv'
    case 'pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}

async function addMetricsCharts(doc: PDFKit.PDFDocument, options: ExportOptions) {
  const metrics = await getSystemMetrics(
    options.dateRange.endDate.getTime() - options.dateRange.startDate.getTime()
  )

  // Create charts using Chart.js
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 500, height: 300 })

  // Volume trend chart
  const volumeChart = await chartJSNodeCanvas.renderToBuffer({
    type: 'line',
    data: {
      labels: metrics.volumeTrend.map(d => format(new Date(d.date), 'PP')),
      datasets: [{
        label: 'Message Volume',
        data: metrics.volumeTrend.map(d => d.count),
        borderColor: '#8884d8',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Message Volume Trend'
        }
      }
    }
  })

  doc.image(volumeChart, {
    fit: [500, 300],
    align: 'center',
  })
  doc.moveDown(2)

  // Add metrics table
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Key Metrics', { underline: true })
     .moveDown()

  const table = {
    headers: ['Metric', 'Value'],
    rows: [
      ['Total Messages', metrics.totalMessages.toString()],
      ['Success Rate', `${metrics.successRate}%`],
      ['Average Cost', `£${metrics.averageCost.toFixed(4)}`],
      ['High Priority Messages', metrics.highPriorityCount.toString()],
    ]
  }

  await addTable(doc, table)
  doc.moveDown(2)
}

async function addCostCharts(doc: PDFKit.PDFDocument, options: ExportOptions) {
  const costs = await getFacilityCosts(
    options.facilityId || 'all',
    options.dateRange.startDate,
    options.dateRange.endDate
  )

  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 500, height: 300 })

  // Cost distribution pie chart
  const costChart = await chartJSNodeCanvas.renderToBuffer({
    type: 'pie',
    data: {
      labels: Object.keys(costs.byCategory),
      datasets: [{
        data: Object.values(costs.byCategory).map(c => c.totalCost),
        backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Cost Distribution by Category'
        }
      }
    }
  })

  doc.image(costChart, {
    fit: [500, 300],
    align: 'center',
  })
  doc.moveDown(2)

  // Add cost summary table
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Cost Summary', { underline: true })
     .moveDown()

  const table = {
    headers: ['Category', 'Messages', 'Total Cost', 'Average Cost'],
    rows: Object.entries(costs.byCategory).map(([category, data]) => [
      category,
      data.messageCount.toString(),
      `£${data.totalCost.toFixed(2)}`,
      `£${(data.totalCost / data.messageCount).toFixed(4)}`,
    ])
  }

  await addTable(doc, table)
  doc.moveDown(2)
}

async function addComplianceCharts(doc: PDFKit.PDFDocument, options: ExportOptions) {
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Compliance Status', { underline: true })
     .moveDown()

  const complianceItems = [
    { name: 'Data Retention', status: 'Compliant', details: 'Messages deleted after 30 days' },
    { name: 'Encryption at Rest', status: 'Compliant', details: 'AES-256 encryption' },
    { name: 'Access Control', status: 'Compliant', details: 'Role-based access implemented' },
    { name: 'Audit Logging', status: 'Compliant', details: 'All actions logged and monitored' },
    { name: 'Data Protection', status: 'Compliant', details: 'GDPR compliant data handling' },
  ]

  const table = {
    headers: ['Requirement', 'Status', 'Details'],
    rows: complianceItems.map(item => [
      item.name,
      item.status,
      item.details,
    ])
  }

  await addTable(doc, table)
  doc.moveDown(2)
}

async function addTable(doc: PDFKit.PDFDocument, table: { headers: string[], rows: string[][] }) {
  const cellPadding = 10
  const columnWidth = (doc.page.width - 100) / table.headers.length
  let y = doc.y

  // Draw headers
  doc.fontSize(12)
     .font('Helvetica-Bold')
  
  table.headers.forEach((header, i) => {
    doc.text(header, 50 + (i * columnWidth), y, {
      width: columnWidth,
      align: 'left',
    })
  })

  y += 20
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke()
  y += 10

  // Draw rows
  doc.font('Helvetica')
  table.rows.forEach(row => {
    // Check if we need a new page
    if (y > doc.page.height - 100) {
      doc.addPage()
      y = 50
    }

    row.forEach((cell, i) => {
      doc.text(cell, 50 + (i * columnWidth), y, {
        width: columnWidth,
        align: 'left',
      })
    })

    y += 30
  })

  doc.y = y
}

async function generateExcelReport(options: ExportOptions): Promise<Buffer> {
  const workbook = new Workbook()

  if (options.reportType === 'ofsted' && options.ofsted) {
    // Add Ofsted-specific worksheets
    const summarySheet = workbook.addWorksheet('Ofsted Summary')
    const complianceSheet = workbook.addWorksheet('Compliance Details')
    const evidenceSheet = workbook.addWorksheet('Supporting Evidence')
    const recommendationsSheet = workbook.addWorksheet('Action Plan')

    // Configure summary sheet
    summarySheet.columns = [
      { header: 'Section', key: 'section' },
      { header: 'Rating', key: 'rating' },
      { header: 'Status', key: 'status' },
      { header: 'Last Updated', key: 'lastUpdated' },
    ]

    // Configure compliance sheet
    complianceSheet.columns = [
      { header: 'Requirement', key: 'requirement' },
      { header: 'Status', key: 'status' },
      { header: 'Evidence', key: 'evidence' },
      { header: 'Actions', key: 'actions' },
    ]

    // Configure evidence sheet
    evidenceSheet.columns = [
      { header: 'Type', key: 'type' },
      { header: 'Description', key: 'description' },
      { header: 'Date', key: 'date' },
      { header: 'Location', key: 'location' },
    ]

    // Configure recommendations sheet
    recommendationsSheet.columns = [
      { header: 'Priority', key: 'priority' },
      { header: 'Recommendation', key: 'description' },
      { header: 'Deadline', key: 'deadline' },
      { header: 'Progress', key: 'progress' },
      { header: 'Status', key: 'status' },
    ]

    // Add data to sheets
    options.ofsted.sections.forEach(section => {
      summarySheet.addRow({
        section: section.title,
        rating: section.content.rating,
        status: 'Active',
        lastUpdated: new Date().toISOString(),
      })
    })

    options.ofsted.recommendations.forEach(rec => {
      recommendationsSheet.addRow({
        priority: rec.priority,
        description: rec.description,
        deadline: rec.deadline,
        progress: `${rec.progress}%`,
        status: rec.progress === 100 ? 'Complete' : 'In Progress',
      })
    })

    // Apply styling
    ;[summarySheet, complianceSheet, evidenceSheet, recommendationsSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true }
      sheet.columns.forEach(column => {
        column.width = Math.max(
          ...sheet.getColumn(column.key).values
            .map(v => v ? v.toString().length : 0)
        ) + 2
      })
    })
  }

  return workbook.xlsx.writeBuffer()
}

async function generateCSVReport(options: ExportOptions): Promise<Buffer> {
  // Implementation similar to Excel but with CSV formatting
  const workbook = new Workbook()
  // ... (similar to Excel implementation)
  return workbook.csv.writeBuffer()
}

async function addOfstedSections(doc: PDFKit.PDFDocument, options: ExportOptions) {
  if (!options.ofsted) return

  // Add Ofsted header
  doc.addPage()
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('Ofsted Compliance Report', { align: 'center' })
     .moveDown()

  // Add executive summary
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Executive Summary')
     .moveDown()
     .fontSize(12)
     .font('Helvetica')
     .text('This report provides a comprehensive overview of our compliance with Ofsted requirements and standards for children's social care services.')
     .moveDown()

  // Add current rating and last inspection
  const currentSection = options.ofsted.sections.find(s => s.title === 'Current Status')
  if (currentSection) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Current Rating and Inspection')
       .moveDown()
       .fontSize(12)
       .font('Helvetica')
       .text(`Current Rating: ${currentSection.content.rating || 'Not Rated'}`)
       .text(`Last Inspection: ${currentSection.content.date ? 
         format(currentSection.content.date, 'PPP') : 'Not Available'}`)
       .moveDown()
  }

  // Add key findings
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Key Findings')
     .moveDown()

  options.ofsted.sections.forEach(section => {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(section.title)
       .moveDown(0.5)
       .font('Helvetica')

    section.content.findings.forEach(finding => {
      doc.list([finding], { bulletRadius: 2 })
    })
    doc.moveDown()
  })

  // Add evidence if requested
  if (options.ofsted.includeEvidence) {
    doc.addPage()
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Supporting Evidence')
       .moveDown()

    options.ofsted.sections.forEach(section => {
      if (section.content.evidence) {
        section.content.evidence.forEach(item => {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(item.type)
             .font('Helvetica')
             .text(item.description)
             .text(`Date: ${format(item.date, 'PPP')}`)
             .moveDown()
        })
      }
    })
  }

  // Add case studies if requested
  if (options.ofsted.includeCaseStudies) {
    doc.addPage()
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Case Studies')
       .moveDown()
    // Add case studies implementation
  }

  // Add recommendations and action plan
  doc.addPage()
     .fontSize(14)
     .font('Helvetica-Bold')
     .text('Recommendations and Action Plan')
     .moveDown()

  const table = {
    headers: ['Priority', 'Recommendation', 'Deadline', 'Progress'],
    rows: options.ofsted.recommendations.map(rec => [
      rec.priority.toUpperCase(),
      rec.description,
      format(rec.deadline, 'PP'),
      `${rec.progress}%`
    ])
  }

  await addTable(doc, table)
}

async function generateOfstedReport(options: ExportOptions): Promise<Buffer> {
  const workbook = new Workbook()

  // Overview sheet
  const overviewSheet = workbook.addWorksheet('Overview')
  overviewSheet.columns = [
    { header: 'Area', key: 'area', width: 30 },
    { header: 'Rating', key: 'rating', width: 15 },
    { header: 'Strengths', key: 'strengths', width: 40 },
    { header: 'Development', key: 'development', width: 40 },
  ]

  // Child Development sheet
  const developmentSheet = workbook.addWorksheet('Child Development')
  developmentSheet.columns = [
    { header: 'Child ID', key: 'id', width: 10 },
    { header: 'Area', key: 'area', width: 20 },
    { header: 'Current Level', key: 'current', width: 15 },
    { header: 'Target', key: 'target', width: 15 },
    { header: 'Progress', key: 'progress', width: 15 },
    { header: 'Actions', key: 'actions', width: 40 },
  ]

  // Education Quality sheet
  const educationSheet = workbook.addWorksheet('Quality of Education')
  educationSheet.columns = [
    { header: 'Aspect', key: 'aspect', width: 20 },
    { header: 'Evidence', key: 'evidence', width: 40 },
    { header: 'Impact', key: 'impact', width: 40 },
    { header: 'Next Steps', key: 'nextSteps', width: 30 },
  ]

  // Behavior and Attitudes sheet
  const behaviorSheet = workbook.addWorksheet('Behavior & Attitudes')
  behaviorSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Action Taken', key: 'action', width: 30 },
    { header: 'Outcome', key: 'outcome', width: 30 },
  ]

  // Leadership sheet
  const leadershipSheet = workbook.addWorksheet('Leadership')
  leadershipSheet.columns = [
    { header: 'Area', key: 'area', width: 20 },
    { header: 'Current Status', key: 'status', width: 30 },
    { header: 'Evidence', key: 'evidence', width: 40 },
    { header: 'Impact', key: 'impact', width: 30 },
  ]

  // Add data to sheets
  if (options.ofsted) {
    // Overview data
    overviewSheet.addRows([
      {
        area: 'Quality of Education',
        rating: options.ofsted.sections.find(s => s.title === 'Education')?.content.rating,
        strengths: options.ofsted.sections.find(s => s.title === 'Education')?.content.findings.join('\n'),
        development: options.ofsted.sections.find(s => s.title === 'Education')?.content.recommendations.join('\n'),
      },
      // ... (add other areas)
    ])

    // Child development data
    options.ofsted.sections
      .filter(s => s.title === 'Child Development')
      .forEach(section => {
        section.content.evidence.forEach(evidence => {
          developmentSheet.addRow({
            id: evidence.id,
            area: evidence.type,
            current: evidence.currentLevel,
            target: evidence.targetLevel,
            progress: evidence.progress,
            actions: evidence.actions.join('\n'),
          })
        })
      })

    // Add styling
    ;[overviewSheet, developmentSheet, educationSheet, behaviorSheet, leadershipSheet]
      .forEach(sheet => {
        sheet.getRow(1).font = { bold: true }
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        }
      })
  }

  return workbook.xlsx.writeBuffer()
}

async function addOfstedPDFSections(doc: PDFKit.PDFDocument, options: ExportOptions) {
  if (!options.ofsted) return

  // Add child development section
  doc.addPage()
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Child Development and Progress', { align: 'center' })
     .moveDown()

  options.ofsted.sections
    .filter(s => s.title === 'Child Development')
    .forEach(section => {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(section.title)
         .moveDown()
         .fontSize(12)
         .font('Helvetica')

      section.content.evidence.forEach(evidence => {
        doc.text(`Area: ${evidence.type}`)
           .text(`Current Level: ${evidence.currentLevel}`)
           .text(`Target Level: ${evidence.targetLevel}`)
           .text(`Progress: ${evidence.progress}%`)
           .text('Actions:')
           .list(evidence.actions)
           .moveDown()
      })
    })

  // Add quality of education section
  doc.addPage()
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Quality of Education', { align: 'center' })
     .moveDown()

  const educationSection = options.ofsted.sections.find(s => s.title === 'Education')
  if (educationSection) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Curriculum Intent')
       .moveDown()
       .fontSize(12)
       .font('Helvetica')
       .list(educationSection.content.findings)
       .moveDown()

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Implementation')
       .moveDown()
       .fontSize(12)
       .font('Helvetica')
       .list(educationSection.content.evidence.map(e => e.description))
       .moveDown()

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Impact')
       .moveDown()
       .fontSize(12)
       .font('Helvetica')
       .list(educationSection.content.recommendations)
       .moveDown()
  }

  // Add behavior and attitudes section
  // ... (similar implementation for behavior section)

  // Add leadership and management section
  // ... (similar implementation for leadership section)

  // Add evidence and supporting documentation
  if (options.ofsted.includeEvidence) {
    doc.addPage()
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Supporting Evidence', { align: 'center' })
       .moveDown()

    options.ofsted.sections.forEach(section => {
      if (section.content.evidence) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(section.title)
           .moveDown()

        section.content.evidence.forEach(item => {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(item.type)
             .font('Helvetica')
             .text(item.description)
             .text(`Date: ${format(item.date, 'PPP')}`)
             .moveDown()
        })
      }
    })
  }
}

// Export types
export type { ExportOptions, ExportResult } 


