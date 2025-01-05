import React, { useState } from 'react';
import { HandoverReport } from '../../services/reporting-service';
import { Card, Select, Button, Icon } from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface HandoverReportViewProps {
  report: HandoverReport;
  onPrint: () => void;
  onExport: (format: 'pdf' | 'csv') => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const HandoverReportView: React.FC<HandoverReportViewProps> = ({
  report,
  onPrint,
  onExport,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'tasks' | 'quality' | 'staff' | 'compliance'>('tasks');

  const taskData = [
    { name: 'Completed', value: report.tasks.completed },
    { name: 'In Progress', value: report.tasks.inProgress },
    { name: 'Pending', value: report.tasks.pending },
  ];

  const priorityData = Object.entries(report.tasks.byPriority).map(([priority, count]) => ({
    name: priority,
    value: count,
  }));

  const qualityData = [
    { name: 'Passed', value: report.quality.passed },
    { name: 'Failed', value: report.quality.failed },
    { name: 'Pending', value: report.quality.pending },
  ];

  const staffPerformanceData = Object.entries(report.staff.completionRates).map(([staffId, rate]) => ({
    name: staffId,
    rate: rate * 100,
  }));

  const exportToPdf = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`handover-report-${report.sessionId}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Handover Report</h2>
          <p className="text-gray-500">
            {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={onPrint}>
            <Icon name="printer" className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="secondary" onClick={() => exportToPdf()}>
            <Icon name="download" className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex space-x-4">
        <Select
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value as any)}
          className="w-48"
        >
          <option value="tasks">Tasks</option>
          <option value="quality">Quality</option>
          <option value="staff">Staff</option>
          <option value="compliance">Compliance</option>
        </Select>
      </div>

      <div id="report-content" className="space-y-6">
        {selectedMetric === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
              <PieChart width={400} height={300}>
                <Pie
                  data={taskData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
              <BarChart width={400} height={300} data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </Card>
          </div>
        )}

        {selectedMetric === 'quality' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Quality Check Results</h3>
              <PieChart width={400} height={300}>
                <Pie
                  data={qualityData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Critical Issues</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Critical Issues:</span>
                  <span className="font-bold text-red-500">
                    {report.quality.criticalIssues}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${(report.quality.criticalIssues / report.quality.totalChecks) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {selectedMetric === 'staff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
              <BarChart width={400} height={300} data={staffPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="#8884d8" name="Completion Rate %" />
              </BarChart>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Quality Check Contribution</h3>
              <div className="space-y-4">
                {Object.entries(report.staff.qualityCheckContribution).map(([staffId, count]) => (
                  <div key={staffId} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{staffId}</span>
                      <span>{count} checks</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(count / report.quality.totalChecks) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {selectedMetric === 'compliance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Overall Compliance</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {(report.compliance.overallCompliance * 100).toFixed(1)}%
                </div>
                <div className="mt-4">
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${report.compliance.overallCompliance * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Missing Documentation</h3>
              <div className="space-y-2">
                {report.compliance.missingDocumentation.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-red-600"
                  >
                    <Icon name="alert-circle" className="w-4 h-4" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
