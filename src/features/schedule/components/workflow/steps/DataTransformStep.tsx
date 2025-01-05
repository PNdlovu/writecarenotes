import React, { useState } from 'react';
import { Input, Select, Button, Icon } from '@/components/ui';
import { WorkflowStep } from '../../../services/workflow-service';
import { CodeEditor } from '@/components/ui/CodeEditor';

interface DataTransformStepProps {
  step: WorkflowStep;
  onChange: (updates: Partial<WorkflowStep>) => void;
}

export const DataTransformStep: React.FC<DataTransformStepProps> = ({
  step,
  onChange,
}) => {
  const config = step.config || {};
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({
      config: { ...config, ...updates },
    });
  };

  const handlePreview = () => {
    try {
      // Sample input data for preview
      const sampleInput = {
        patient: {
          name: 'John Doe',
          age: 45,
          conditions: ['Diabetes', 'Hypertension'],
        },
        vitals: {
          bloodPressure: '120/80',
          temperature: 98.6,
        },
      };

      // Execute transformation
      const transformFn = new Function('data', config.transformScript);
      const result = transformFn(sampleInput);
      setPreviewData(result);
      setShowPreview(true);
    } catch (error) {
      console.error('Transform preview error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transform Type
        </label>
        <Select
          value={config.transformType}
          onChange={(e) => updateConfig({ transformType: e.target.value })}
        >
          <option value="MAP">Map Fields</option>
          <option value="FILTER">Filter Data</option>
          <option value="AGGREGATE">Aggregate Data</option>
          <option value="FORMAT">Format Data</option>
          <option value="CUSTOM">Custom Transform</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Input Fields
        </label>
        <Input
          value={config.inputFields?.join(', ') || ''}
          onChange={(e) =>
            updateConfig({
              inputFields: e.target.value.split(',').map((f) => f.trim()),
            })
          }
          placeholder="Enter input field names (comma-separated)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Output Fields
        </label>
        <Input
          value={config.outputFields?.join(', ') || ''}
          onChange={(e) =>
            updateConfig({
              outputFields: e.target.value.split(',').map((f) => f.trim()),
            })
          }
          placeholder="Enter output field names (comma-separated)"
        />
      </div>

      {config.transformType === 'CUSTOM' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transform Script
          </label>
          <div className="relative">
            <CodeEditor
              value={config.transformScript || ''}
              onChange={(value) => updateConfig({ transformScript: value })}
              language="javascript"
              height="200px"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handlePreview}
            >
              <Icon name="play" className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      )}

      {config.transformType === 'MAP' && (
        <div className="space-y-2">
          {(config.mappings || []).map((mapping: any, index: number) => (
            <div key={index} className="flex space-x-2">
              <Input
                value={mapping.source}
                onChange={(e) =>
                  updateConfig({
                    mappings: config.mappings.map((m: any, i: number) =>
                      i === index ? { ...m, source: e.target.value } : m
                    ),
                  })
                }
                placeholder="Source field"
              />
              <Icon name="arrow-right" className="w-4 h-4 my-auto" />
              <Input
                value={mapping.target}
                onChange={(e) =>
                  updateConfig({
                    mappings: config.mappings.map((m: any, i: number) =>
                      i === index ? { ...m, target: e.target.value } : m
                    ),
                  })
                }
                placeholder="Target field"
              />
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  updateConfig({
                    mappings: config.mappings.filter(
                      (_: any, i: number) => i !== index
                    ),
                  })
                }
              >
                <Icon name="trash" className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              updateConfig({
                mappings: [...(config.mappings || []), { source: '', target: '' }],
              })
            }
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      )}

      {showPreview && previewData && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Transform Preview
          </h3>
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(previewData, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Error Handling
        </label>
        <Select
          value={config.errorHandling}
          onChange={(e) => updateConfig({ errorHandling: e.target.value })}
        >
          <option value="SKIP">Skip Failed Records</option>
          <option value="FAIL">Fail on Error</option>
          <option value="DEFAULT">Use Default Value</option>
        </Select>
      </div>

      {config.errorHandling === 'DEFAULT' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Value
          </label>
          <Input
            value={config.defaultValue || ''}
            onChange={(e) => updateConfig({ defaultValue: e.target.value })}
            placeholder="Enter default value"
          />
        </div>
      )}
    </div>
  );
};
