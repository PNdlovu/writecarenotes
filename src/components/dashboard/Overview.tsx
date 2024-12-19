import { useState, useEffect } from 'react';
import { DashboardVisualizations } from './visualizations';
import { 
  MetricData, 
  LocaleConfig, 
  ChartConfig,
  PerformanceData,
  ComplianceMetrics,
  OfstedMetrics,
  RegionalData
} from './visualizations/types';
import { DASHBOARD_CONFIG, getDashboardConfig } from './index';

interface DashboardOverviewProps {
  organizationId: string;
  initialRegion?: keyof typeof DASHBOARD_CONFIG.complianceFrameworks;
  className?: string;
}

export const DashboardOverview = ({ 
  organizationId, 
  initialRegion = 'UK',
  className 
}: DashboardOverviewProps) => {
  const [region, setRegion] = useState(initialRegion);
  const [config, setConfig] = useState(() => getDashboardConfig(initialRegion));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [data, setData] = useState<{
    metrics: MetricData[];
    performance: PerformanceData;
    compliance: ComplianceMetrics;
    ofsted: OfstedMetrics;
    regional: RegionalData[];
  } | null>(null);

  const locale: LocaleConfig = {
    language: config.language,
    region: config.currentRegion,
    currency: config.currency,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  const chartConfig: ChartConfig = {
    title: "Care Home Dashboard",
    region: region === 'IE' ? 'IE' : 'UK',
    type: 'bar',
    compliance: true,
    darkMode: false, // TODO: Implement theme detection
    accessibility: {
      announceData: true,
      keyboardNavigation: true,
      highContrast: false
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all required data in parallel
        const [metricsData, performanceData, complianceData, ofstedData, regionalData] = await Promise.all([
          fetch(`/api/metrics?organizationId=${organizationId}&region=${region}`).then(r => r.json()),
          fetch(`/api/performance?organizationId=${organizationId}&region=${region}`).then(r => r.json()),
          fetch(`/api/compliance?organizationId=${organizationId}&region=${region}`).then(r => r.json()),
          fetch(`/api/ofsted?organizationId=${organizationId}&region=${region}`).then(r => r.json()),
          fetch(`/api/regional?organizationId=${organizationId}&region=${region}`).then(r => r.json())
        ]);

        setData({
          metrics: metricsData,
          performance: performanceData,
          compliance: complianceData,
          ofsted: ofstedData,
          regional: regionalData
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up auto-refresh
    const refreshInterval = setInterval(fetchDashboardData, DASHBOARD_CONFIG.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [organizationId, region]);

  const handleRegionChange = (newRegion: typeof region) => {
    setRegion(newRegion);
    setConfig(getDashboardConfig(newRegion));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Region Selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {region === 'IE' ? 'Ireland' : 'United Kingdom'} Dashboard
        </h1>
        <select 
          value={region}
          onChange={(e) => handleRegionChange(e.target.value as typeof region)}
          className="border rounded-md p-2"
        >
          {DASHBOARD_CONFIG.supportedRegions.map((r) => (
            <option key={r} value={r}>
              {r === 'IE' ? 'Ireland' : 'United Kingdom'}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Overview */}
      <DashboardVisualizations.DashboardOverview
        metrics={data.metrics}
        locale={locale}
        config={chartConfig}
      />

      {/* Performance Charts */}
      <DashboardVisualizations.PerformanceCharts
        config={chartConfig}
        data={data.performance}
      />

      {/* Compliance Charts */}
      <DashboardVisualizations.ComplianceCharts
        config={chartConfig}
        metrics={data.compliance}
      />

      {/* Regional Charts */}
      <DashboardVisualizations.RegionalCharts
        config={chartConfig}
        data={data.regional}
      />

      {/* Ofsted Charts (UK Only) */}
      {region === 'UK' && (
        <DashboardVisualizations.OfstedCharts
          config={chartConfig}
          metrics={data.ofsted}
        />
      )}
    </div>
  );
};


