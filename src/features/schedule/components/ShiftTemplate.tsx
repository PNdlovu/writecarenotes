import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { scheduleAPI } from '../api/schedule-api';

interface ShiftTemplateProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  staffingRequirements: {
    role: string;
    count: number;
    certifications: string[];
  }[];
  recurringPattern?: {
    daysOfWeek: number[];
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  };
}

export function ShiftTemplate({ isOpen, onClose }: ShiftTemplateProps) {
  const queryClient = useQueryClient();
  const [newTemplate, setNewTemplate] = useState<Partial<ShiftTemplate>>({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    staffingRequirements: [
      {
        role: 'CAREGIVER',
        count: 1,
        certifications: [],
      },
    ],
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['shift-templates'],
    queryFn: () => scheduleAPI.getShiftTemplates(),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (template: Omit<ShiftTemplate, 'id'>) =>
      scheduleAPI.createShiftTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      setNewTemplate({
        name: '',
        startTime: '09:00',
        endTime: '17:00',
        staffingRequirements: [
          {
            role: 'CAREGIVER',
            count: 1,
            certifications: [],
          },
        ],
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => scheduleAPI.deleteShiftTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
    },
  });

  const handleAddStaffingRequirement = () => {
    setNewTemplate((prev) => ({
      ...prev,
      staffingRequirements: [
        ...(prev.staffingRequirements || []),
        {
          role: 'CAREGIVER',
          count: 1,
          certifications: [],
        },
      ],
    }));
  };

  const handleRemoveStaffingRequirement = (index: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      staffingRequirements: prev.staffingRequirements?.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newTemplate.name &&
      newTemplate.startTime &&
      newTemplate.endTime &&
      newTemplate.staffingRequirements
    ) {
      createTemplateMutation.mutate(newTemplate as Omit<ShiftTemplate, 'id'>);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            Shift Templates
          </Dialog.Title>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Existing Templates</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600">
                      {template.startTime} - {template.endTime}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template Name
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newTemplate.startTime}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, startTime: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={newTemplate.endTime}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, endTime: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staffing Requirements
              </label>
              {newTemplate.staffingRequirements?.map((req, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <select
                    value={req.role}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        staffingRequirements:
                          newTemplate.staffingRequirements?.map((r, i) =>
                            i === index ? { ...r, role: e.target.value } : r
                          ),
                      })
                    }
                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="CAREGIVER">Caregiver</option>
                    <option value="NURSE">Nurse</option>
                    <option value="DOCTOR">Doctor</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={req.count}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        staffingRequirements:
                          newTemplate.staffingRequirements?.map((r, i) =>
                            i === index
                              ? { ...r, count: parseInt(e.target.value) }
                              : r
                          ),
                      })
                    }
                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStaffingRequirement(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddStaffingRequirement}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Requirement
              </button>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
