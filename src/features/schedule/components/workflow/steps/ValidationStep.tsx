import React from 'react';
import { Input, Select, Switch } from '@/components/ui';
import { WorkflowStep } from '../../../services/workflow-service';

interface ValidationStepProps {
  step: WorkflowStep;
  onChange: (updates: Partial<WorkflowStep>) => void;
}

export const ValidationStep: React.FC<ValidationStepProps> = ({
  step,
  onChange,
}) => {
  const config = step.config || {};

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({
      config: { ...config, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Validation Type
        </label>
        <Select
          value={config.validationType}
          onChange={(e) => updateConfig({ validationType: e.target.value })}
        >
          <option value="DATA_COMPLETENESS">Data Completeness</option>
          <option value="DATA_FORMAT">Data Format</option>
          <option value="BUSINESS_RULES">Business Rules</option>
          <option value="CROSS_REFERENCE">Cross Reference</option>
          <option value="CUSTOM">Custom Validation</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Fields
        </label>
        <Input
          value={config.targetFields?.join(', ') || ''}
          onChange={(e) =>
            updateConfig({
              targetFields: e.target.value.split(',').map((f) => f.trim()),
            })
          }
          placeholder="Enter field names (comma-separated)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Validation Rules
        </label>
        <textarea
          value={config.rules}
          onChange={(e) => updateConfig({ rules: e.target.value })}
          className="w-full h-32 p-2 border rounded"
          placeholder="Enter validation rules"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Switch
          checked={config.stopOnFailure || false}
          onChange={(checked) => updateConfig({ stopOnFailure: checked })}
          label="Stop Workflow on Failure"
        />
        <Switch
          checked={config.notifyOnFailure || false}
          onChange={(checked) => updateConfig({ notifyOnFailure: checked })}
          label="Notify on Failure"
        />
      </div>

      {config.notifyOnFailure && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Recipients
          </label>
          <Input
            value={config.notificationRecipients?.join(', ') || ''}
            onChange={(e) =>
              updateConfig({
                notificationRecipients: e.target.value
                  .split(',')
                  .map((r) => r.trim()),
              })
            }
            placeholder="Enter recipient IDs (comma-separated)"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom Error Message
        </label>
        <Input
          value={config.errorMessage || ''}
          onChange={(e) => updateConfig({ errorMessage: e.target.value })}
          placeholder="Enter custom error message"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Retry Configuration
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            value={config.maxRetries || 0}
            onChange={(e) =>
              updateConfig({ maxRetries: parseInt(e.target.value) })
            }
            placeholder="Max retries"
          />
          <Input
            type="number"
            value={config.retryDelay || 0}
            onChange={(e) =>
              updateConfig({ retryDelay: parseInt(e.target.value) })
            }
            placeholder="Retry delay (seconds)"
          />
        </div>
      </div>
    </div>
  );
};
