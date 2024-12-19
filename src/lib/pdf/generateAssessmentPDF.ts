import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface Assessment {
  id: string;
  type: string;
  createdAt: string;
  completedBy: string;
  findings: Array<{
    category: string;
    content: string;
  }>;
  recommendations: Array<{
    content: string;
  }>;
  resident: {
    firstName: string;
    lastName: string;
    roomNumber: string;
    dateOfBirth: string;
  };
}

export async function generateAssessmentPDF(assessment: Assessment): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      // Handle document chunks
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc
        .fontSize(20)
        .text('Resident Assessment Report', { align: 'center' })
        .moveDown();

      // Resident Information
      doc
        .fontSize(14)
        .text('Resident Information')
        .moveDown(0.5);

      doc
        .fontSize(12)
        .text(`Name: ${assessment.resident.firstName} ${assessment.resident.lastName}`)
        .text(`Room: ${assessment.resident.roomNumber}`)
        .text(`Date of Birth: ${new Date(assessment.resident.dateOfBirth).toLocaleDateString()}`)
        .moveDown();

      // Assessment Information
      doc
        .fontSize(14)
        .text('Assessment Information')
        .moveDown(0.5);

      doc
        .fontSize(12)
        .text(`Type: ${assessment.type}`)
        .text(`Date: ${new Date(assessment.createdAt).toLocaleDateString()}`)
        .text(`Completed By: ${assessment.completedBy}`)
        .moveDown();

      // Findings
      doc
        .fontSize(14)
        .text('Findings')
        .moveDown(0.5);

      assessment.findings.forEach((finding) => {
        doc
          .fontSize(12)
          .text(finding.category, { underline: true })
          .text(finding.content)
          .moveDown();
      });

      // Recommendations
      doc
        .fontSize(14)
        .text('Recommendations')
        .moveDown(0.5);

      assessment.recommendations.forEach((recommendation, index) => {
        doc
          .fontSize(12)
          .text(`${index + 1}. ${recommendation.content}`)
          .moveDown(0.5);
      });

      // Footer
      doc
        .fontSize(10)
        .text(
          `Generated on ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}


