import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  BarChart,
  PieChart,
  Calendar,
  Users,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';

interface ReportConfig {
  type: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  filters: {
    categories: string[];
    regions: string[];
    tags: string[];
  };
  format: 'PDF' | 'EXCEL' | 'CSV';
}

interface ComplianceCheck {
  id: string;
  type: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details: any;
  checkedAt: string;
}

interface DocumentReportingProps {
  documentId?: string;
  isGlobalReport?: boolean;
}

export function DocumentReporting({
  documentId,
  isGlobalReport = false,
}: DocumentReportingProps) {
  const { t } = useTranslation('documents');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: '',
    dateRange: { from: null, to: null },
    filters: {
      categories: [],
      regions: [],
      tags: [],
    },
    format: 'PDF',
  });
  const [showComplianceDetails, setShowComplianceDetails] =
    useState(false);

  // Fetch available report types
  const { data: reportTypes } = useQuery({
    queryKey: ['reportTypes'],
    queryFn: async () => {
      const response = await fetch('/api/documents/report-types');
      if (!response.ok) throw new Error('Failed to fetch report types');
      return response.json();
    },
  });

  // Fetch compliance status
  const { data: complianceChecks } = useQuery({
    queryKey: ['complianceChecks', documentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/documents/${documentId}/compliance`
      );
      if (!response.ok)
        throw new Error('Failed to fetch compliance status');
      return response.json();
    },
    enabled: !!documentId,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      const response = await fetch('/api/documents/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          documentId,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${config.format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: t('reporting.reportGenerated'),
        description: t('reporting.reportGeneratedDescription'),
      });
    },
  });

  // Run compliance check mutation
  const runComplianceCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/documents/${documentId}/compliance/check`,
        {
          method: 'POST',
        }
      );
      if (!response.ok)
        throw new Error('Failed to run compliance check');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('reporting.complianceCheckComplete'),
        description: t('reporting.complianceCheckDescription'),
      });
    },
  });

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAIL':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'WARNING':
        return (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">
            {t('reporting.reports')}
          </TabsTrigger>
          <TabsTrigger value="compliance">
            {t('reporting.compliance')}
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4">
            {/* Report Type */}
            <div className="space-y-2">
              <Label>{t('reporting.reportType')}</Label>
              <Select
                value={reportConfig.type}
                onValueChange={(value) =>
                  setReportConfig({ ...reportConfig, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('reporting.selectReportType')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes?.map((type: any) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>{t('reporting.dateRange')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    {reportConfig.dateRange.from ? (
                      reportConfig.dateRange.to ? (
                        <>
                          {format(
                            reportConfig.dateRange.from,
                            'PPP'
                          )}{' '}
                          -{' '}
                          {format(reportConfig.dateRange.to, 'PPP')}
                        </>
                      ) : (
                        format(reportConfig.dateRange.from, 'PPP')
                      )
                    ) : (
                      t('reporting.selectDateRange')
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                >
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: reportConfig.dateRange.from,
                      to: reportConfig.dateRange.to,
                    }}
                    onSelect={(range) =>
                      setReportConfig({
                        ...reportConfig,
                        dateRange: {
                          from: range?.from || null,
                          to: range?.to || null,
                        },
                      })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>{t('reporting.format')}</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value: 'PDF' | 'EXCEL' | 'CSV') =>
                  setReportConfig({
                    ...reportConfig,
                    format: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('reporting.selectFormat')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EXCEL">Excel</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full"
              onClick={() =>
                generateReportMutation.mutate(reportConfig)
              }
              disabled={!reportConfig.type}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('reporting.generateReport')}
            </Button>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {t('reporting.complianceStatus')}
            </h3>
            <Button
              onClick={() =>
                runComplianceCheckMutation.mutate()
              }
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('reporting.runCheck')}
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reporting.checkType')}</TableHead>
                  <TableHead>{t('reporting.status')}</TableHead>
                  <TableHead>{t('reporting.message')}</TableHead>
                  <TableHead>{t('reporting.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceChecks?.map(
                  (check: ComplianceCheck) => (
                    <TableRow key={check.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileCheck className="h-4 w-4" />
                          <span>{check.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getComplianceStatusIcon(check.status)}
                          <span>{check.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{check.message}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowComplianceDetails(true)
                          }
                        >
                          {t('reporting.viewDetails')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Compliance Details Dialog */}
      <Dialog
        open={showComplianceDetails}
        onOpenChange={setShowComplianceDetails}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t('reporting.complianceDetails')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Compliance details content */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


