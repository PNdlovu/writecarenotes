import React, { useState } from 'react';
import { HandoverSession } from '../../types/handover';
import { PrintService } from '../../services/print-service';
import { Button, Select, Modal, Icon } from '@/components/ui';

interface PrintPreviewProps {
  session: HandoverSession;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('daily-handover');
  const [loading, setLoading] = useState(false);
  const printService = new PrintService();

  const templates = printService.getAvailableTemplates();

  const handlePrint = async () => {
    try {
      setLoading(true);
      const blob = await printService.printHandoverSession(session, selectedTemplate);
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
      }
    } catch (error) {
      console.error('Error generating print preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const reportingService = new ReportingService();
      const report = await reportingService.generateSessionReport(session);
      const blob = await printService.exportToExcel(report);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `handover-report-${session.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Preview"
      size="lg"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Template
          </label>
          <Select
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
            className="w-full"
          >
            {templates.map(template => (
              <option key={template.name} value={template.name}>
                {template.name} - {template.description}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {templates.map(template => (
            <div
              key={template.name}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedTemplate === template.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedTemplate(template.name)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
                <Icon
                  name={template.orientation === 'portrait' ? 'file-text' : 'file'}
                  className="w-6 h-6 text-gray-400"
                />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {template.format} - {template.orientation}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="secondary"
            onClick={handleExportExcel}
            disabled={loading}
          >
            <Icon name="file-spreadsheet" className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            disabled={loading}
          >
            <Icon name="printer" className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
    </Modal>
  );
};
