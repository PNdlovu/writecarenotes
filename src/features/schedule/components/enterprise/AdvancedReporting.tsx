import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { ReportTemplate, ReportFilter } from '../../types/enterprise';
import { scheduleAPI } from '../../api/scheduleAPI';

interface AdvancedReportingProps {
  startDate?: Date;
  endDate?: Date;
}

export const AdvancedReporting: React.FC<AdvancedReportingProps> = ({
  startDate = new Date(),
  endDate = new Date(),
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportData, setReportData] = useState<any[]>([]);

  const { data: templates = [] } = useQuery<ReportTemplate[]>(
    ['reportTemplates'],
    () => scheduleAPI.getReportTemplates(),
  );

  const generateReport = async (template: ReportTemplate) => {
    try {
      const data = await scheduleAPI.generateReport({
        templateId: template.id,
        filters: [
          ...template.filters,
          {
            field: 'date',
            operator: 'between',
            value: [startDate, endDate],
          },
        ],
      });
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleTemplateChange = (event: any) => {
    const templateId = event.target.value;
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      generateReport(template);
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implementation for export functionality
    console.log(`Exporting as ${format}...`);
  };

  const handleSchedule = (template: ReportTemplate) => {
    // Implementation for scheduling reports
    console.log('Scheduling report:', template);
  };

  const renderReportContent = () => {
    if (!reportData.length) return null;

    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return null;

    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {template.columns.map((column) => (
                <TableCell key={column.field}>{column.title}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((row, index) => (
              <TableRow key={index}>
                {template.columns.map((column) => (
                  <TableCell key={column.field}>
                    {row[column.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Advanced Reporting
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Report Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                  label="Report Template"
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedTemplate && (
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Tooltip title="Export as PDF">
                    <IconButton onClick={() => handleExport('pdf')}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Schedule Report">
                    <IconButton
                      onClick={() =>
                        handleSchedule(
                          templates.find((t) => t.id === selectedTemplate)!
                        )
                      }
                    >
                      <ScheduleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Email Report">
                    <IconButton>
                      <EmailIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {renderReportContent()}
        </Grid>
      </Grid>
    </Box>
  );
};
