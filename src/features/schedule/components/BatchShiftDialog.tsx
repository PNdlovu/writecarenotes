import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, eachDayOfInterval, addDays } from 'date-fns';
import { scheduleAPI } from '../api/schedule-api';
import { StaffMember } from '@/types/models';

interface BatchShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date;
  endDate: Date;
}

interface BatchShiftForm {
  templateId?: string;
  staffIds: string[];
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  notes: string;
}

export function BatchShiftDialog({
  isOpen,
  onClose,
  startDate,
  endDate,
}: BatchShiftDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<BatchShiftForm>({
    staffIds: [],
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: [],
    notes: '',
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['shift-templates'],
    queryFn: () => scheduleAPI.getShiftTemplates(),
  });

  const { data: staff = [] } = useQuery<StaffMember[]>({
    queryKey: ['staff'],
    queryFn: () => scheduleAPI.getStaffMembers(),
  });

  const createBatchShiftsMutation = useMutation({
    mutationFn: (data: BatchShiftForm) => scheduleAPI.createBatchShifts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBatchShiftsMutation.mutate(formData);
  };

  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const toggleDayOfWeek = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateId,
        startTime: template.startTime,
        endTime: template.endTime,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            Create Multiple Shifts
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Use Template (Optional)
              </label>
              <select
                value={formData.templateId || ''}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Staff Members
              </label>
              <div className="mt-1 max-h-40 overflow-y-auto border rounded-md">
                {staff.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.staffIds.includes(member.id)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          staffIds: e.target.checked
                            ? [...prev.staffIds, member.id]
                            : prev.staffIds.filter((id) => id !== member.id),
                        }))
                      }
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
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
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.daysOfWeek.includes(day.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Preview Dates
              </h4>
              <div className="text-sm text-gray-600">
                {eachDayOfInterval({ start: startDate, end: endDate })
                  .filter((date) =>
                    formData.daysOfWeek.includes(date.getDay())
                  )
                  .map((date) => (
                    <div key={date.toString()} className="mb-1">
                      {format(date, 'EEE, MMM d')}
                    </div>
                  ))}
              </div>
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
                disabled={
                  formData.staffIds.length === 0 ||
                  formData.daysOfWeek.length === 0
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Create Shifts
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
