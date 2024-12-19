import React from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: 'rest' | 'workTime' | 'overtime' | 'break' | 'custom';
  status: 'compliant' | 'warning' | 'violation';
  details?: string;
}

interface ComplianceStats {
  totalRules: number;
  compliantRules: number;
  warningRules: number;
  violatedRules: number;
}

export const LaborLawChecker: React.FC = () => {
  const { data: complianceRules } = useQuery<ComplianceRule[]>(
    ['compliance', 'rules'],
    () => scheduleAPI.getComplianceRules(),
  );

  const { data: stats } = useQuery<ComplianceStats>(
    ['compliance', 'stats'],
    () => scheduleAPI.getComplianceStats(),
  );

  const getStatusColor = (status: ComplianceRule['status']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'violation':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Rules</div>
          <div className="text-2xl font-semibold">{stats?.totalRules}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Compliant</div>
          <div className="text-2xl font-semibold text-green-600">
            {stats?.compliantRules}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Warnings</div>
          <div className="text-2xl font-semibold text-yellow-600">
            {stats?.warningRules}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Violations</div>
          <div className="text-2xl font-semibold text-red-600">
            {stats?.violatedRules}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Rules</h3>
          <div className="space-y-4">
            {complianceRules?.map((rule) => (
              <div
                key={rule.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                      rule.status
                    )}`}
                  >
                    {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                  </span>
                </div>
                {rule.details && (
                  <div className="text-sm text-gray-600 mt-2">{rule.details}</div>
                )}
                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                    {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
