import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ScheduleTemplate, RecurrencePattern } from '../../types/enterprise';
import { scheduleAPI } from '../../api/scheduleAPI';

export const ScheduleAutomation: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const { data: templates = [] } = useQuery<ScheduleTemplate[]>(
    ['scheduleTemplates'],
    () => scheduleAPI.getScheduleTemplates(),
  );

  const createTemplateMutation = useMutation(
    (newTemplate: Partial<ScheduleTemplate>) =>
      scheduleAPI.createScheduleTemplate(newTemplate),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['scheduleTemplates']);
        handleCloseDialog();
      },
    }
  );

  const deleteTemplateMutation = useMutation(
    (templateId: string) => scheduleAPI.deleteScheduleTemplate(templateId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['scheduleTemplates']);
      },
    }
  );

  const applyTemplateMutation = useMutation(
    (params: { templateId: string; startDate: string }) =>
      scheduleAPI.applyScheduleTemplate(params),
    {
      onSuccess: () => {
        setApplyDialogOpen(false);
        queryClient.invalidateQueries(['schedules']);
      },
    }
  );

  const handleOpenDialog = (template?: ScheduleTemplate) => {
    setSelectedTemplate(template || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTemplate(null);
    setDialogOpen(false);
  };

  const handleCreateTemplate = (formData: any) => {
    createTemplateMutation.mutate({
      ...formData,
      pattern: {
        type: formData.patternType,
        interval: parseInt(formData.interval),
        daysOfWeek: formData.daysOfWeek,
      },
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleApplyTemplate = (templateId: string, startDate: string) => {
    applyTemplateMutation.mutate({ templateId, startDate });
  };

  const renderPatternChip = (pattern: RecurrencePattern) => {
    let label = '';
    switch (pattern.type) {
      case 'daily':
        label = `Every ${pattern.interval} day(s)`;
        break;
      case 'weekly':
        label = `Every ${pattern.interval} week(s)`;
        break;
      case 'monthly':
        label = `Every ${pattern.interval} month(s)`;
        break;
      case 'custom':
        label = 'Custom pattern';
        break;
    }
    return (
      <span className="inline-block px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Schedule Templates & Automation</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          onClick={() => handleOpenDialog()}
        >
          <span className="material-icons-outlined">add</span>
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  {renderPatternChip(template.pattern)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDialog(template)}
                    className="p-2 text-gray-600 hover:text-blue-600"
                  >
                    <span className="material-icons-outlined">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <span className="material-icons-outlined">delete</span>
                  </button>
                  <button
                    onClick={() => setApplyDialogOpen(true)}
                    className="p-2 text-gray-600 hover:text-green-600"
                  >
                    <span className="material-icons-outlined">play_arrow</span>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">
                  Shifts ({template.shifts.length})
                </h4>
                <ul className="space-y-2">
                  {template.shifts.map((shift, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                    >
                      <span>{`${shift.startTime} - ${shift.endTime}`}</span>
                      <span className="text-gray-600">
                        Position: {shift.position}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {template.rules.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Rules</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.rules.map((rule, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                      >
                        {rule.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Template Name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedTemplate?.name}
                />
              </div>
              <div className="col-span-2">
                <textarea
                  placeholder="Description"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  defaultValue={selectedTemplate?.description}
                />
              </div>
              <div>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedTemplate?.pattern.type || 'daily'}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Interval"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedTemplate?.pattern.interval || 1}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateTemplate({})}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedTemplate ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {applyDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Apply Template</h3>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setApplyDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleApplyTemplate(selectedTemplate?.id || '', '2024-01-01')
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
