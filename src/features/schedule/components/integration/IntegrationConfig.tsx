import React, { useState, useEffect } from 'react';
import {
  IntegrationConfig as IIntegrationConfig,
  IntegrationService,
} from '../../services/integration-service';
import {
  Button,
  Card,
  Dialog,
  Icon,
  Input,
  Select,
  Switch,
  Tabs,
  Toast,
} from '@/components/ui';

interface IntegrationConfigProps {
  integrationId?: string;
  tenantId: string;
  department?: string;
  onSave: (config: IIntegrationConfig) => void;
  onCancel: () => void;
}

export const IntegrationConfig: React.FC<IntegrationConfigProps> = ({
  integrationId,
  tenantId,
  department,
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<IIntegrationConfig>({
    id: integrationId || '',
    name: '',
    type: 'EHR',
    provider: '',
    config: {},
    enabled: true,
    tenantId,
    department,
  });

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [metrics, setMetrics] = useState<{
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
  } | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const integrationService = IntegrationService.getInstance();

  useEffect(() => {
    if (integrationId) {
      loadConfig();
      loadMetrics();
    }
  }, [integrationId]);

  const loadConfig = async () => {
    const configs = await integrationService.listIntegrations({
      tenantId,
      department,
    });
    const existingConfig = configs.find(c => c.id === integrationId);
    if (existingConfig) {
      setConfig(existingConfig);
    }
  };

  const loadMetrics = async () => {
    if (integrationId) {
      const metrics = await integrationService.getIntegrationMetrics({
        integrationId,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date(),
      });
      setMetrics(metrics);
    }
  };

  const handleSave = async () => {
    const validation = await integrationService.validateConfig(config);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave(config);
  };

  const testConnection = async () => {
    const result = await integrationService.testConnection(config);
    setTestResult({
      success: result,
      message: result ? 'Connection successful' : 'Connection failed',
    });
  };

  const getProviderOptions = (type: string) => {
    switch (type) {
      case 'EHR':
        return ['Epic', 'Cerner', 'Allscripts', 'Meditech'];
      case 'MESSAGING':
        return ['Slack', 'Microsoft Teams', 'Email', 'SMS'];
      case 'CALENDAR':
        return ['Google Calendar', 'Microsoft Outlook', 'iCal'];
      case 'REPORTING':
        return ['PowerBI', 'Tableau', 'Custom'];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Integration Configuration</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  value={config.name}
                  onChange={(e) =>
                    setConfig({ ...config, name: e.target.value })
                  }
                  placeholder="Enter integration name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Select
                  value={config.type}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      type: e.target.value as any,
                      provider: '',
                    })
                  }
                >
                  <option value="EHR">Electronic Health Record</option>
                  <option value="MESSAGING">Messaging</option>
                  <option value="CALENDAR">Calendar</option>
                  <option value="REPORTING">Reporting</option>
                  <option value="CUSTOM">Custom</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <Select
                  value={config.provider}
                  onChange={(e) =>
                    setConfig({ ...config, provider: e.target.value })
                  }
                >
                  <option value="">Select Provider</option>
                  {getProviderOptions(config.type).map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Switch
                  checked={config.enabled}
                  onChange={(enabled) => setConfig({ ...config, enabled })}
                  label="Enable Integration"
                />
              </div>
            </div>

            <Tabs>
              <Tabs.Tab label="Configuration">
                <div className="p-4">
                  <ConfigurationEditor
                    type={config.type}
                    provider={config.provider}
                    config={config.config}
                    onChange={(newConfig) =>
                      setConfig({ ...config, config: newConfig })
                    }
                  />
                </div>
              </Tabs.Tab>

              {integrationId && (
                <Tabs.Tab label="Metrics">
                  <div className="p-4">
                    <MetricsDisplay metrics={metrics} />
                  </div>
                </Tabs.Tab>
              )}

              <Tabs.Tab label="Advanced">
                <div className="p-4">
                  <AdvancedSettings
                    config={config}
                    onChange={(updates) => setConfig({ ...config, ...updates })}
                  />
                </div>
              </Tabs.Tab>
            </Tabs>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          {errors.length > 0 && (
            <div className="text-red-500 text-sm">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          {testResult && (
            <Toast
              type={testResult.success ? 'success' : 'error'}
              message={testResult.message}
            />
          )}
        </div>

        <div className="flex space-x-4">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={testConnection}>
            Test Connection
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ConfigurationEditorProps {
  type: string;
  provider: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

const ConfigurationEditor: React.FC<ConfigurationEditorProps> = ({
  type,
  provider,
  config,
  onChange,
}) => {
  // Implementation would provide specific configuration fields based on type and provider
  return (
    <div className="space-y-4">
      {/* Add configuration fields based on type and provider */}
    </div>
  );
};

interface MetricsDisplayProps {
  metrics: {
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
  } | null;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Operations</h3>
          <p className="mt-1 text-3xl font-semibold">{metrics.totalOperations}</p>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="mt-1 text-3xl font-semibold">
            {(metrics.successRate * 100).toFixed(1)}%
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">
            Average Response Time
          </h3>
          <p className="mt-1 text-3xl font-semibold">
            {metrics.averageResponseTime.toFixed(2)}ms
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Error Rate</h3>
          <p className="mt-1 text-3xl font-semibold">
            {(metrics.errorRate * 100).toFixed(1)}%
          </p>
        </div>
      </Card>
    </div>
  );
};

interface AdvancedSettingsProps {
  config: IIntegrationConfig;
  onChange: (updates: Partial<IIntegrationConfig>) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  config,
  onChange,
}) => {
  // Implementation would provide advanced configuration options
  return (
    <div className="space-y-4">
      {/* Add advanced configuration fields */}
    </div>
  );
};
