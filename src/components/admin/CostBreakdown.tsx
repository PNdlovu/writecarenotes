/**
 * @writecarenotes.com
 * @fileoverview Cost breakdown visualization component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive cost analysis dashboard component that visualizes service
 * expenses through multiple interactive visualizations. Features include:
 * - Hierarchical cost breakdown via Treemap
 * - Service distribution through Pie Charts
 * - Cost flow visualization using Sankey diagrams
 * - Interactive tooltips with detailed information
 * - Custom color schemes for better distinction
 * - Responsive layout adaptation
 * - Time range filtering options
 * - Accessibility support
 */

import React from 'react';

// Data Visualization
import {
  ResponsiveContainer,
  Treemap,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Sankey,
  Rectangle
} from 'recharts';

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

// Types
interface CostBreakdownProps {
  data: {
    services: {
      name: string;
      cost: number;
      breakdown: {
        category: string;
        amount: number;
      }[];
    }[];
    timeRange: string;
    total: number;
  };
}

// Constants
const COLORS = [
  '#2563EB',  // Primary blue
  '#7C3AED',  // Purple
  '#10B981',  // Green
  '#F59E0B',  // Yellow
  '#EF4444',  // Red
  '#8B5CF6',  // Light purple
  '#EC4899',  // Pink
  '#6366F1',  // Indigo
  '#14B8A6',  // Teal
  '#F97316'   // Orange
];

export const CostBreakdown: React.FC<CostBreakdownProps> = ({ data }) => {
  const [view, setView] = React.useState<'treemap' | 'pie' | 'sankey'>('treemap');
  const [selectedService, setSelectedService] = React.useState<string | null>(null);

  const treemapData = {
    name: 'Total Cost',
    children: data.services.map(service => ({
      name: service.name,
      size: service.cost,
      children: service.breakdown.map(item => ({
        name: item.category,
        size: item.amount
      }))
    }))
  };

  const pieData = data.services.map(service => ({
    name: service.name,
    value: service.cost
  }));

  const sankeyData = {
    nodes: [
      { name: 'Total Cost' },
      ...data.services.map(s => ({ name: s.name })),
      ...data.services.flatMap(s => 
        s.breakdown.map(b => ({ name: `${s.name} - ${b.category}` }))
      )
    ],
    links: [
      ...data.services.map(s => ({
        source: 'Total Cost',
        target: s.name,
        value: s.cost
      })),
      ...data.services.flatMap(s =>
        s.breakdown.map(b => ({
          source: s.name,
          target: `${s.name} - ${b.category}`,
          value: b.amount
        }))
      )
    ]
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-blue-600">{formatCurrency(payload[0].value)}</p>
        <p className="text-sm text-gray-500">
          {((payload[0].value / data.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Cost Breakdown - {data.timeRange}
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setView('treemap')}
            className={`px-4 py-2 rounded-lg ${
              view === 'treemap'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Treemap
          </button>
          <button
            onClick={() => setView('pie')}
            className={`px-4 py-2 rounded-lg ${
              view === 'pie'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setView('sankey')}
            className={`px-4 py-2 rounded-lg ${
              view === 'sankey'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Flow Diagram
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="h-[500px] bg-white rounded-lg shadow-lg p-6">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'treemap' ? (
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              content={<CustomTreemapCell />}
            >
              <RechartsTooltip content={<CustomTooltip />} />
            </Treemap>
          ) : view === 'pie' ? (
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={200}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value,
                  name
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#fff"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {name} ({((value / data.total) * 100).toFixed(1)}%)
                    </text>
                  );
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                    onClick={() => setSelectedService(entry.name)}
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <Sankey
              data={sankeyData}
              node={{
                nodePadding: 50,
                nodeWidth: 10
              }}
              link={{
                stroke: '#d1d5db'
              }}
              margin={{ top: 20, right: 160, bottom: 20, left: 160 }}
            >
              <RechartsTooltip content={<CustomTooltip />} />
            </Sankey>
          )}
        </ResponsiveContainer>
      </div>

      {/* Details Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Breakdown
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.services.map((service, index) => (
              <tr
                key={service.name}
                className={
                  selectedService === service.name
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }
                onClick={() => setSelectedService(service.name)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {service.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(service.cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {((service.cost / data.total) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {service.breakdown.map(item => (
                      <div
                        key={item.category}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-500">{item.category}</span>
                        <span className="text-gray-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-semibold">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-semibold">
                {formatCurrency(data.total)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-semibold">
                100%
              </td>
              <td className="px-6 py-4" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const CustomTreemapCell = (props: any) => {
  const { x, y, width, height, name, value, depth } = props;
  const isParent = depth === 1;

  return (
    <g>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isParent ? COLORS[props.index % COLORS.length] : '#fff'}
        stroke="#fff"
        strokeWidth={2}
        opacity={isParent ? 1 : 0.8}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isParent ? '#fff' : '#000'}
          fontSize={12}
        >
          {name}
        </text>
      )}
    </g>
  );
};

export default CostBreakdown;
