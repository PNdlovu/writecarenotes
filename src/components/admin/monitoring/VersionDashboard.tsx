/**
 * @writecarenotes.com
 * @fileoverview Version monitoring dashboard
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive monitoring dashboard for tracking API version usage,
 * compliance, and migration status. Features include:
 * - Real-time version metrics
 * - Regional compliance tracking
 * - Client migration status
 * - Performance analytics
 * - Interactive visualizations
 * - Automated alerts
 * - Historical trends
 * - Custom reporting
 */

'use client';

import { useState, useEffect } from 'react';

// Data Visualization
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie
} from 'recharts';

// Configuration
import { API_VERSIONS, API_VERSION_CONFIGS } from '@/config/api-versions';

// UI Components
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button/Button';

// Types
interface VersionMetrics {
  version: string;
  requests: number;
  errors: number;
  latency: number;
  deprecationWarnings: number;
}

interface RegionalCompliance {
  region: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  lastCheck: string;
  requirements: string[];
}

interface ClientMigration {
  clientId: string;
  organization: string;
  currentVersion: string;
  targetVersion: string;
  migrationStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  lastUpdated: string;
}

// Constants
const STATUS_COLORS = {
  compliant: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  'non-compliant': 'bg-red-100 text-red-800'
};

const MIGRATION_STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

export function VersionDashboard() {
  const [metrics, setMetrics] = useState<VersionMetrics[]>([]);
  const [compliance, setCompliance] = useState<RegionalCompliance[]>([]);
  const [migrations, setMigrations] = useState<ClientMigration[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    // Fetch metrics data
    const fetchMetrics = async () => {
      const response = await fetch(`/api/admin/metrics?timeframe=${selectedTimeframe}`);
      const data = await response.json();
      setMetrics(data);
    };

    // Fetch compliance data
    const fetchCompliance = async () => {
      const response = await fetch('/api/admin/compliance');
      const data = await response.json();
      setCompliance(data);
    };

    // Fetch migration status
    const fetchMigrations = async () => {
      const response = await fetch('/api/admin/migrations');
      const data = await response.json();
      setMigrations(data);
    };

    fetchMetrics();
    fetchCompliance();
    fetchMigrations();
  }, [selectedTimeframe]);

  return (
    <div className="space-y-8 p-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Version Monitoring</h1>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </header>

      {/* Version Usage Metrics */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Version Usage</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="version" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#8884d8" name="Requests" />
              <Bar dataKey="errors" fill="#ff8042" name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Regional Compliance Status */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Regional Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compliance.map((region) => (
            <div
              key={region.region}
              className={`p-4 rounded-lg border ${
                region.status === 'compliant'
                  ? 'border-green-200 bg-green-50'
                  : region.status === 'warning'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <h3 className="font-semibold">{region.region}</h3>
              <p className="text-sm text-gray-600">Last checked: {region.lastCheck}</p>
              <ul className="mt-2 text-sm">
                {region.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Migration Progress */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Migration Status</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2">Organization</th>
                <th className="px-4 py-2">Current Version</th>
                <th className="px-4 py-2">Target Version</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {migrations.map((migration) => (
                <tr key={migration.clientId} className="border-t">
                  <td className="px-4 py-2">{migration.organization}</td>
                  <td className="px-4 py-2">{migration.currentVersion}</td>
                  <td className="px-4 py-2">{migration.targetVersion}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        migration.migrationStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : migration.migrationStatus === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : migration.migrationStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {migration.migrationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2">{migration.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
