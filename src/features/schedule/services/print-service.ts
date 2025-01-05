import { HandoverSession, HandoverTask, Staff } from '../types/handover';
import { HandoverReport } from './reporting-service';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface PrintTemplate {
  name: string;
  description: string;
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export class PrintService {
  private readonly templates: Record<string, PrintTemplate> = {
    'daily-handover': {
      name: 'Daily Handover Sheet',
      description: 'Detailed view of daily handover tasks and notes',
      format: 'A4',
      orientation: 'portrait',
    },
    'weekly-summary': {
      name: 'Weekly Summary Report',
      description: 'Weekly overview of handover activities and metrics',
      format: 'A4',
      orientation: 'landscape',
    },
    'compliance-report': {
      name: 'Compliance Report',
      description: 'Detailed compliance status and issues',
      format: 'A4',
      orientation: 'portrait',
    },
    'staff-performance': {
      name: 'Staff Performance Report',
      description: 'Individual staff performance metrics',
      format: 'A4',
      orientation: 'landscape',
    },
  };

  getAvailableTemplates(): PrintTemplate[] {
    return Object.values(this.templates);
  }

  async printHandoverSession(session: HandoverSession, templateId: string): Promise<Blob> {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error('Template not found');
    }

    const doc = new jsPDF({
      orientation: template.orientation,
      unit: 'mm',
      format: template.format,
    });

    switch (templateId) {
      case 'daily-handover':
        await this.generateDailyHandover(doc, session);
        break;
      case 'weekly-summary':
        await this.generateWeeklySummary(doc, session);
        break;
      case 'compliance-report':
        await this.generateComplianceReport(doc, session);
        break;
      case 'staff-performance':
        await this.generateStaffReport(doc, session);
        break;
    }

    return doc.output('blob');
  }

  async exportToExcel(report: HandoverReport): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Tasks worksheet
    const tasksData = report.tasks.byCategory;
    const tasksWs = XLSX.utils.json_to_sheet(Object.entries(tasksData).map(([category, count]) => ({
      Category: category,
      Count: count,
      CompletionRate: `${(count / report.tasks.total * 100).toFixed(1)}%`,
    })));
    XLSX.utils.book_append_sheet(workbook, tasksWs, 'Tasks');

    // Quality checks worksheet
    const qualityData = {
      Passed: report.quality.passed,
      Failed: report.quality.failed,
      Pending: report.quality.pending,
      'Critical Issues': report.quality.criticalIssues,
    };
    const qualityWs = XLSX.utils.json_to_sheet([qualityData]);
    XLSX.utils.book_append_sheet(workbook, qualityWs, 'Quality Checks');

    // Staff performance worksheet
    const staffData = Object.entries(report.staff.completionRates).map(([staffId, rate]) => ({
      'Staff ID': staffId,
      'Completion Rate': `${(rate * 100).toFixed(1)}%`,
      'Tasks Assigned': report.staff.tasksPerStaff[staffId],
      'Quality Checks': report.staff.qualityCheckContribution[staffId],
    }));
    const staffWs = XLSX.utils.json_to_sheet(staffData);
    XLSX.utils.book_append_sheet(workbook, staffWs, 'Staff Performance');

    // Compliance worksheet
    const complianceData = {
      'Overall Compliance': `${(report.compliance.overallCompliance * 100).toFixed(1)}%`,
      'Critical Violations': report.compliance.criticalViolations.length,
      'Missing Documents': report.compliance.missingDocumentation.length,
    };
    const complianceWs = XLSX.utils.json_to_sheet([complianceData]);
    XLSX.utils.book_append_sheet(workbook, complianceWs, 'Compliance');

    return new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private async generateDailyHandover(doc: jsPDF, session: HandoverSession): Promise<void> {
    // Header
    doc.setFontSize(20);
    doc.text('Daily Handover Sheet', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${format(session.startTime, 'PPP')}`, 20, 30);
    doc.text(`Department: ${session.department}`, 20, 40);
    
    // Staff Information
    doc.setFontSize(14);
    doc.text('Staff Information', 20, 60);
    
    const staffTable = [
      ['Role', 'Outgoing Staff', 'Incoming Staff'],
      ...session.outgoingStaff.map((staff, index) => [
        staff.role,
        staff.name,
        session.incomingStaff[index]?.name || '',
      ]),
    ];
    
    (doc as any).autoTable({
      startY: 65,
      head: [staffTable[0]],
      body: staffTable.slice(1),
    });

    // Tasks
    doc.text('Tasks', 20, doc.lastAutoTable.finalY + 20);
    
    const taskTable = session.tasks.map(task => [
      task.title,
      task.status,
      task.priority,
      task.assignedTo?.name || 'Unassigned',
    ]);
    
    (doc as any).autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Task', 'Status', 'Priority', 'Assigned To']],
      body: taskTable,
    });

    // Notes
    if (session.notes.length > 0) {
      doc.text('Notes', 20, doc.lastAutoTable.finalY + 20);
      
      const noteTable = session.notes.map(note => [
        format(note.timestamp, 'pp'),
        note.author.name,
        note.content,
      ]);
      
      (doc as any).autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Time', 'Author', 'Note']],
        body: noteTable,
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  }

  private async generateWeeklySummary(doc: jsPDF, session: HandoverSession): Promise<void> {
    // Implementation for weekly summary template
  }

  private async generateComplianceReport(doc: jsPDF, session: HandoverSession): Promise<void> {
    // Implementation for compliance report template
  }

  private async generateStaffReport(doc: jsPDF, session: HandoverSession): Promise<void> {
    // Implementation for staff performance report template
  }
}
