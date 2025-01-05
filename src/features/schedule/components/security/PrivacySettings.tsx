import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface PrivacyPolicy {
  id: string;
  name: string;
  description: string;
  settings: {
    dataRetention: {
      enabled: boolean;
      duration: number;
      dataTypes: string[];
    };
    dataAccess: {
      restrictedFields: string[];
      accessLevels: Record<string, string[]>;
    };
    dataSharing: {
      enabled: boolean;
      thirdParties: string[];
      purposes: string[];
    };
    dataEncryption: {
      atRest: boolean;
      inTransit: boolean;
      keyRotation: number;
    };
  };
}

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
  category: 'access' | 'modification' | 'deletion' | 'export';
}

export const PrivacySettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const { data: policies } = useQuery<PrivacyPolicy[]>(
    ['privacy-policies'],
    () => scheduleAPI.getPrivacyPolicies()
  );

  const { data: auditLogs } = useQuery<AuditLog[]>(
    ['audit-logs'],
    () => scheduleAPI.getAuditLogs()
  );

  const updatePolicyMutation = useMutation(
    (policy: PrivacyPolicy) => scheduleAPI.updatePrivacyPolicy(policy),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('privacy-policies');
      },
    }
  );

  const createPolicyMutation = useMutation(
    (policy: Partial<PrivacyPolicy>) => scheduleAPI.createPrivacyPolicy(policy),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('privacy-policies');
      },
    }
  );

  const exportAuditLogsMutation = useMutation(
    () => scheduleAPI.exportAuditLogs()
  );

  const renderPolicyCard = (policy: PrivacyPolicy) => (
    <div
      key={policy.id}
      className={`
        p-6 rounded-lg border border-gray-200
        ${selectedPolicy === policy.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:bg-gray-50 transition-all duration-200
      `}
      onClick={() => setSelectedPolicy(policy.id)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium">{policy.name}</h3>
        <p className="text-sm text-gray-500">{policy.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Data Retention</h4>
          <div className="space-y-1">
            <div className="text-sm">
              {policy.settings.dataRetention.enabled ? (
                <>
                  <span className="text-green-600">●</span> Enabled
                  ({policy.settings.dataRetention.duration} days)
                </>
              ) : (
                <>
                  <span className="text-red-600">●</span> Disabled
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {policy.settings.dataRetention.dataTypes.length} data types
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Data Encryption</h4>
          <div className="space-y-1">
            <div className="text-sm">
              {policy.settings.dataEncryption.atRest &&
              policy.settings.dataEncryption.inTransit ? (
                <>
                  <span className="text-green-600">●</span> Full Protection
                </>
              ) : (
                <>
                  <span className="text-yellow-600">●</span> Partial Protection
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Key rotation: {policy.settings.dataEncryption.keyRotation} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPolicyEditor = (policy: PrivacyPolicy) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <input
            type="text"
            value={policy.name}
            onChange={(e) =>
              updatePolicyMutation.mutate({ ...policy, name: e.target.value })
            }
            className="text-xl font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
          />
          <input
            type="text"
            value={policy.description}
            onChange={(e) =>
              updatePolicyMutation.mutate({
                ...policy,
                description: e.target.value,
              })
            }
            className="mt-1 block w-full text-sm text-gray-500 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
          />
        </div>
        <button
          onClick={() => setSelectedPolicy(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="material-icons-outlined">close</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Data Retention</h4>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Enable Data Retention</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.settings.dataRetention.enabled}
                    onChange={(e) =>
                      updatePolicyMutation.mutate({
                        ...policy,
                        settings: {
                          ...policy.settings,
                          dataRetention: {
                            ...policy.settings.dataRetention,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>

              <div>
                <label className="text-sm">Retention Period (days)</label>
                <input
                  type="number"
                  value={policy.settings.dataRetention.duration}
                  onChange={(e) =>
                    updatePolicyMutation.mutate({
                      ...policy,
                      settings: {
                        ...policy.settings,
                        dataRetention: {
                          ...policy.settings.dataRetention,
                          duration: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label className="text-sm">Data Types</label>
                <select
                  multiple
                  value={policy.settings.dataRetention.dataTypes}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (option) => option.value
                    );
                    updatePolicyMutation.mutate({
                      ...policy,
                      settings: {
                        ...policy.settings,
                        dataRetention: {
                          ...policy.settings.dataRetention,
                          dataTypes: selected,
                        },
                      },
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="attendance">Attendance Records</option>
                  <option value="schedules">Schedules</option>
                  <option value="messages">Messages</option>
                  <option value="reports">Reports</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Data Encryption</h4>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Encryption at Rest</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.settings.dataEncryption.atRest}
                    onChange={(e) =>
                      updatePolicyMutation.mutate({
                        ...policy,
                        settings: {
                          ...policy.settings,
                          dataEncryption: {
                            ...policy.settings.dataEncryption,
                            atRest: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm">Encryption in Transit</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.settings.dataEncryption.inTransit}
                    onChange={(e) =>
                      updatePolicyMutation.mutate({
                        ...policy,
                        settings: {
                          ...policy.settings,
                          dataEncryption: {
                            ...policy.settings.dataEncryption,
                            inTransit: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>

              <div>
                <label className="text-sm">Key Rotation Period (days)</label>
                <input
                  type="number"
                  value={policy.settings.dataEncryption.keyRotation}
                  onChange={(e) =>
                    updatePolicyMutation.mutate({
                      ...policy,
                      settings: {
                        ...policy.settings,
                        dataEncryption: {
                          ...policy.settings.dataEncryption,
                          keyRotation: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Data Access</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm">Restricted Fields</label>
                <select
                  multiple
                  value={policy.settings.dataAccess.restrictedFields}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (option) => option.value
                    );
                    updatePolicyMutation.mutate({
                      ...policy,
                      settings: {
                        ...policy.settings,
                        dataAccess: {
                          ...policy.settings.dataAccess,
                          restrictedFields: selected,
                        },
                      },
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="ssn">Social Security Number</option>
                  <option value="salary">Salary Information</option>
                  <option value="medical">Medical Records</option>
                  <option value="contact">Contact Information</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Data Sharing</h4>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Enable Data Sharing</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.settings.dataSharing.enabled}
                    onChange={(e) =>
                      updatePolicyMutation.mutate({
                        ...policy,
                        settings: {
                          ...policy.settings,
                          dataSharing: {
                            ...policy.settings.dataSharing,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>

              <div>
                <label className="text-sm">Third Parties</label>
                <select
                  multiple
                  value={policy.settings.dataSharing.thirdParties}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (option) => option.value
                    );
                    updatePolicyMutation.mutate({
                      ...policy,
                      settings: {
                        ...policy.settings,
                        dataSharing: {
                          ...policy.settings.dataSharing,
                          thirdParties: selected,
                        },
                      },
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="analytics">Analytics Providers</option>
                  <option value="payroll">Payroll Services</option>
                  <option value="compliance">Compliance Auditors</option>
                  <option value="backup">Backup Services</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Audit Logs</h3>
        <button
          onClick={() => exportAuditLogsMutation.mutate()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Export Logs
        </button>
      </div>

      <div className="space-y-2">
        {auditLogs?.map((log) => (
          <div
            key={log.id}
            className="p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{log.action}</div>
                <div className="text-sm text-gray-500">{log.details}</div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">{log.user}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  log.category === 'access'
                    ? 'bg-blue-100 text-blue-800'
                    : log.category === 'modification'
                    ? 'bg-yellow-100 text-yellow-800'
                    : log.category === 'deletion'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {log.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Privacy Policies</h2>
            <button
              onClick={() =>
                createPolicyMutation.mutate({
                  name: 'New Policy',
                  description: 'Policy description',
                  settings: {
                    dataRetention: {
                      enabled: false,
                      duration: 30,
                      dataTypes: [],
                    },
                    dataAccess: {
                      restrictedFields: [],
                      accessLevels: {},
                    },
                    dataSharing: {
                      enabled: false,
                      thirdParties: [],
                      purposes: [],
                    },
                    dataEncryption: {
                      atRest: false,
                      inTransit: false,
                      keyRotation: 90,
                    },
                  },
                })
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add Policy
            </button>
          </div>
          <div className="space-y-4">
            {policies?.map(renderPolicyCard)}
          </div>
        </div>

        <div>{renderAuditLogs()}</div>
      </div>

      {selectedPolicy && policies && (
        <div className="bg-white rounded-lg shadow p-6">
          {renderPolicyEditor(policies.find((p) => p.id === selectedPolicy)!)}
        </div>
      )}
    </div>
  );
};
