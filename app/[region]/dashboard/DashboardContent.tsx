'use client';

import React from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRegion } from '@/lib/region/hooks/useRegion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardStats } from '@/features/carehome/components/dashboard/DashboardStats';
import { ActivityFeed } from '@/features/carehome/components/dashboard/ActivityFeed';
import { AlertsPanel } from '@/features/carehome/components/dashboard/AlertsPanel';
import { ComplianceStatus } from '@/features/carehome/components/compliance/ComplianceStatus';
import { VisitList } from '@/features/domiciliary/components/visits/VisitList';
import { VisitFilters } from '@/features/domiciliary/components/visits/VisitFilters';
import { VisitScheduler } from '@/features/domiciliary/components/visits/VisitScheduler';
import { useVisits } from '@/features/domiciliary/hooks/useVisits';
import { Tooltip } from '@/components/ui/Tooltip';

interface DashboardContentProps {
  region: string;
}

export function DashboardContent({ region }: DashboardContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [careHome, setCareHome] = useState<CareHomeData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [careMetrics, setCareMetrics] = useState<CareMetric[]>([]);
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);

  // Demo care home ID - in production this would come from auth context
  const careHomeId = "demo-123";

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [
          careHomeData,
          metricsData,
          careMetricsData,
          deadlinesData,
          performanceTrends
        ] = await Promise.all([
          fetchCareHomeData(careHomeId),
          fetchDashboardMetrics(careHomeId),
          fetchCareMetrics(careHomeId),
          fetchComplianceDeadlines(careHomeId),
          fetchPerformanceTrends(careHomeId)
        ]);

        setCareHome(careHomeData);
        setMetrics(metricsData);
        setCareMetrics(careMetricsData);
        setDeadlines(deadlinesData);
        setPerformanceData(performanceTrends);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // TODO: Show error toast
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();

    // Set up polling for real-time updates
    const pollInterval = setInterval(fetchDashboardData, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [careHomeId]);

  const navigateTo = (path: string) => {
    router.push(`/${region}${path}`);
  };

  if (loading || !careHome || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Bed Occupancy",
      value: `${metrics.bedOccupancy.value}%`,
      trend: `${metrics.bedOccupancy.trend > 0 ? '+' : ''}${metrics.bedOccupancy.trend}%`,
      icon: Bed,
      onClick: () => navigateTo('/occupancy'),
      color: 'text-blue-500',
      description: `${metrics.bedOccupancy.occupied} of ${metrics.bedOccupancy.total} beds`,
      ariaLabel: `Bed occupancy is ${metrics.bedOccupancy.value} percent, ${metrics.bedOccupancy.trend > 0 ? 'up' : 'down'} ${Math.abs(metrics.bedOccupancy.trend)} percent`
    },
    {
      title: "Staff Coverage",
      value: `${metrics.staffCoverage.value}%`,
      trend: `${metrics.staffCoverage.trend > 0 ? '+' : ''}${metrics.staffCoverage.trend}%`,
      icon: UserCheck,
      onClick: () => navigateTo('/staff'),
      color: 'text-green-500',
      description: `${metrics.staffCoverage.present} of ${metrics.staffCoverage.required} required`,
      ariaLabel: `Staff coverage is ${metrics.staffCoverage.value} percent, ${metrics.staffCoverage.trend > 0 ? 'up' : 'down'} ${Math.abs(metrics.staffCoverage.trend)} percent`
    },
    {
      title: "Care Compliance",
      value: `${metrics.careCompliance.value}%`,
      trend: `${metrics.careCompliance.trend > 0 ? '+' : ''}${metrics.careCompliance.trend}%`,
      icon: ShieldCheck,
      onClick: () => navigateTo('/compliance'),
      color: 'text-purple-500',
      description: `${metrics.careCompliance.completed} of ${metrics.careCompliance.total} requirements met`,
      ariaLabel: `Care compliance is ${metrics.careCompliance.value} percent, ${metrics.careCompliance.trend > 0 ? 'up' : 'down'} ${Math.abs(metrics.careCompliance.trend)} percent`
    },
    {
      title: "Incidents",
      value: metrics.incidents.value.toString(),
      trend: metrics.incidents.trend.toString(),
      icon: AlertTriangle,
      onClick: () => navigateTo('/incidents'),
      color: 'text-yellow-500',
      description: `${metrics.incidents.critical} critical, ${metrics.incidents.moderate} moderate`,
      ariaLabel: `${metrics.incidents.value} open incidents, ${Math.abs(metrics.incidents.trend)} ${metrics.incidents.trend > 0 ? 'more' : 'fewer'} than yesterday`
    }
  ];

  const quickActions = [
    { 
      name: "Record Medication", 
      icon: Stethoscope, 
      path: '/medication/record',
      ariaLabel: "Record new medication administration"
    },
    { 
      name: "Daily Assessment", 
      icon: ClipboardCheck, 
      path: '/assessments/daily',
      ariaLabel: "Complete daily resident assessment"
    },
    { 
      name: "Staff Handover", 
      icon: Users, 
      path: '/staff/handover',
      ariaLabel: "Record staff handover notes"
    },
    { 
      name: "Incident Report", 
      icon: AlertCircle, 
      path: '/incidents/new',
      ariaLabel: "Report new incident"
    }
  ];

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case "Medication Compliance":
        return Pill;
      case "Care Plan Reviews":
        return FileCheck;
      case "Staff Training":
        return UserCog;
      case "Risk Assessments":
        return FileWarning;
      case "Response Time":
        return Clock;
      case "Health Checks":
        return HeartPulse;
      default:
        return Activity;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 py-6 bg-white rounded-lg shadow-sm mb-6">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-black">
              {careHome.name}
            </h1>
            <Tooltip content={`CQC Registration: ${careHome.registrationNumber}`}>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {careHome.rating}
              </span>
            </Tooltip>
          </div>
          <p className="text-lg text-black font-medium">
            Welcome back to your management portal
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {careHome.type}
            </span>
            <span className="flex items-center gap-1">
              <FileCheck className="h-4 w-4" />
              Last Inspection: {careHome.lastInspection}
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="h-4 w-4" />
              Manager: {careHome.manager}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
          {quickActions.map((action) => (
            <Tooltip key={action.path} content={action.ariaLabel}>
              <Button
                variant="outline"
                onClick={() => navigateTo(action.path)}
                className="bg-white hover:bg-gray-50 text-black border-gray-200 shadow-sm"
                aria-label={action.ariaLabel}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.name}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Tooltip key={index} content={stat.ariaLabel}>
            <Card 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-black">
                  <stat.icon className={`mr-2 h-4 w-4 ${stat.color}`} />
                  {stat.title}
                </CardTitle>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  stat.trend.startsWith('+') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stat.trend}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black tracking-tight">
                  {stat.value}
                </div>
                <CardDescription className="text-gray-600 mt-1">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Tooltip>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mt-6">
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-200">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center text-black">
              <Activity className="mr-2 h-5 w-5 text-blue-500" />
              Care Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {careMetrics.map((metric, index) => (
                <Tooltip key={index} content={`Current ${metric.name.toLowerCase()}`}>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    role="status"
                    aria-label={`${metric.name}: ${metric.value}${metric.unit ? metric.unit : '%'}`}
                  >
                    <div className={`h-8 w-8 ${
                      metric.status === 'success' ? 'text-green-500' : 
                      metric.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {(() => {
                        const Icon = getMetricIcon(metric.name);
                        return <Icon className="h-8 w-8" />;
                      })()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">{metric.name}</div>
                      <div className="text-2xl font-bold text-black tracking-tight">
                        {metric.value}{metric.unit ? metric.unit : '%'}
                      </div>
                      {metric.total && (
                        <div className="text-xs text-gray-500">
                          of {metric.total}
                        </div>
                      )}
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center justify-between text-black">
              <div className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-purple-500" />
                Upcoming Deadlines
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigateTo('/deadlines')} className="text-gray-600">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {deadlines.map((deadline, index) => {
                const DeadlineIcon = (() => {
                  switch (deadline.type) {
                    case 'inspection':
                      return Building;
                    case 'training':
                      return UserCog;
                    case 'policy':
                      return FileCheck;
                    case 'assessment':
                      return AlertCircle;
                    default:
                      return CalendarClock;
                  }
                })();

                return (
                  <Tooltip 
                    key={index} 
                    content={`${deadline.name} - Assigned to: ${deadline.assignedTo}${deadline.notes ? ` - ${deadline.notes}` : ''}`}
                  >
                    <div 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      role="listitem"
                      aria-label={`${deadline.name} due on ${deadline.date}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          deadline.priority === 'high' ? 'bg-red-100' :
                          deadline.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <DeadlineIcon className={`h-4 w-4 ${
                            deadline.priority === 'high' ? 'text-red-500' :
                            deadline.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-black">{deadline.name}</div>
                          <div className="text-xs text-gray-600">{new Date(deadline.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <BadgeAlert className={`h-4 w-4 ${
                        deadline.priority === 'high' ? 'text-red-500' :
                        deadline.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4 hover:shadow-lg transition-all duration-200">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center justify-between text-black">
              <div className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-blue-500" />
                Performance Trends
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigateTo('/reports')} className="text-gray-600">
                View Reports
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DashboardVisualizations.DashboardOverview 
              metrics={performanceData?.datasets || []}
              locale={{
                language: REGION_LOCALE_MAP[region as keyof typeof REGION_LOCALE_MAP],
                region: region.toUpperCase(),
                currency: 'GBP',
                timezone: 'Europe/London'
              }}
              config={{
                title: `${region.charAt(0).toUpperCase() + region.slice(1)} Care Performance`,
                region: region === 'nireland' ? 'IE' : 'UK',
                type: 'bar',
                compliance: true,
                darkMode: false,
                accessibility: {
                  announceData: true,
                  keyboardNavigation: true,
                  highContrast: false
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3 hover:shadow-lg transition-all duration-200">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center justify-between text-black">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                Key Updates
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigateTo('/activity')} className="text-gray-600">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 