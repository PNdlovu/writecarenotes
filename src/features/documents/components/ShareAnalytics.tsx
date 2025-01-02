import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { useState } from 'react';
import { Users, Eye, Edit2, Link } from 'lucide-react';
import { Badge, Progress } from '@/components/ui/feedback';
import { HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ShareAnalytics {
  totalShares: number;
  activeShares: number;
  viewShares: number;
  editShares: number;
  linkShares: number;
  shareHistory: {
    date: string;
    shares: number;
    views: number;
  }[];
}

interface RegionalCompliance {
  region: 'england' | 'wales' | 'scotland' | 'dublin' | 'belfast';
  regulator: 'CQC' | 'CIW' | 'CI' | 'HIQA' | 'RQIA';
  complianceRate: number;
  criticalDocuments: number;
  lastInspectionDate?: string;
}

interface AnalyticsData {
  totalShares: number;
  activeShares: number;
  expiredShares: number;
  departmentBreakdown: { department: string; count: number }[];
  regionalCompliance: RegionalCompliance[];
  unreadDocuments: number;
}

interface ShareAnalyticsProps {
  documentId?: string;
}

const getRegulatorName = (region: string): string => {
  switch (region) {
    case 'england': return 'CQC';
    case 'wales': return 'CIW';
    case 'scotland': return 'CI';
    case 'dublin': return 'HIQA';
    case 'belfast': return 'RQIA';
    default: return '';
  }
};

const getComplianceColor = (rate: number, region: string): string => {
  // Different regions have slightly different thresholds
  const thresholds = {
    england: { warning: 80, success: 90 }, // CQC
    wales: { warning: 75, success: 85 },   // CIW
    scotland: { warning: 80, success: 90 }, // CI
    dublin: { warning: 80, success: 90 },   // HIQA
    belfast: { warning: 75, success: 85 },  // RQIA
  }[region] || { warning: 80, success: 90 };

  return rate >= thresholds.success 
    ? 'bg-green-500' 
    : rate >= thresholds.warning 
    ? 'bg-yellow-500' 
    : 'bg-red-500';
};

export default function ShareAnalytics({ documentId }: ShareAnalyticsProps) {
  const { t } = useTranslation('documents');
  const [timeRange, setTimeRange] = useState('7d');

  const { data: analyticsData } = useQuery<AnalyticsData>({
    queryKey: ['share-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/documents/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const { data: analytics, isLoading } = useQuery<ShareAnalytics>({
    queryKey: ['shareAnalytics', documentId, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(documentId && { documentId }),
        timeRange,
      });
      const response = await fetch(`/api/analytics/shares?${params}`);
      if (!response.ok) throw new Error('Failed to fetch share analytics');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader className="h-20 bg-gray-100" />
          <CardContent className="h-64 bg-gray-50" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('analytics.shareAnalytics')}</h2>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t('analytics.selectRange')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t('analytics.last7Days')}</SelectItem>
            <SelectItem value="30d">{t('analytics.last30Days')}</SelectItem>
            <SelectItem value="90d">{t('analytics.last90Days')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Document Share Overview */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.shareOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>{t('analytics.totalShares')}</span>
                <Badge variant="secondary">{analyticsData?.totalShares || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('analytics.activeShares')}</span>
                <Badge variant="success">{analyticsData?.activeShares || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('analytics.expiredShares')}</span>
                <Badge variant="destructive">{analyticsData?.expiredShares || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.complianceMetrics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>{t('analytics.complianceRate')}</span>
                <Progress 
                  value={analyticsData?.complianceRate || 0} 
                  className="w-1/2"
                  indicatorColor={
                    (analyticsData?.complianceRate || 0) >= 90 
                      ? 'bg-green-500' 
                      : (analyticsData?.complianceRate || 0) >= 75 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }
                />
              </div>
              <div className="flex justify-between items-center">
                <span>{t('analytics.criticalDocuments')}</span>
                <Badge variant="outline" className="bg-red-50">
                  {analyticsData?.criticalDocuments || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('analytics.unreadDocuments')}</span>
                <Badge variant="outline" className="bg-yellow-50">
                  {analyticsData?.unreadDocuments || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('analytics.departmentBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData?.departmentBreakdown.map((dept) => (
                <div key={dept.department} className="flex justify-between items-center">
                  <span>{dept.department}</span>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(dept.count / (analyticsData?.totalShares || 1)) * 100} 
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {dept.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Compliance Metrics */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('analytics.regionalCompliance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {analyticsData?.regionalCompliance.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {t(`regions.${region.region}`)} ({region.regulator})
                    </span>
                    <HelpCircle 
                      className="h-4 w-4 text-muted-foreground cursor-help"
                      title={t(`regulators.${region.regulator}.description`)}
                    />
                  </div>
                  <Progress 
                    value={region.complianceRate} 
                    className="w-full"
                    indicatorColor={getComplianceColor(region.complianceRate, region.region)}
                  />
                  <div className="flex justify-between text-sm">
                    <span>{t('analytics.compliance')}</span>
                    <span>{region.complianceRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('analytics.criticalDocs')}</span>
                    <Badge variant={region.criticalDocuments > 0 ? 'destructive' : 'secondary'}>
                      {region.criticalDocuments}
                    </Badge>
                  </div>
                  {region.lastInspectionDate && (
                    <div className="text-xs text-muted-foreground">
                      {t('analytics.lastInspection')}: {format(new Date(region.lastInspectionDate), 'PP')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalShares')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalShares}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.activeShares', { count: analytics?.activeShares })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.viewShares')}
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.viewShares}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.editShares')}
            </CardTitle>
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.editShares}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.linkShares')}
            </CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.linkShares}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.sharingTrends')}</CardTitle>
          <CardDescription>
            {t('analytics.sharingTrendsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.shareHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shares" fill="#3b82f6" name={t('analytics.shares')} />
                <Bar dataKey="views" fill="#10b981" name={t('analytics.views')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


