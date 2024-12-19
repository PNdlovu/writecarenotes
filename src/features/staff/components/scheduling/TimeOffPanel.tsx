import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../../services/staffService';
import { TimeOffRequest, StaffMember } from '../../types/staff';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const TimeOffPanel: React.FC = () => {
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null);
  const [newRequest, setNewRequest] = useState<Partial<TimeOffRequest>>({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    type: 'VACATION',
  });

  const queryClient = useQueryClient();

  const { data: timeOffRequests, isLoading } = useQuery({
    queryKey: ['timeOffRequests'],
    queryFn: () => staffService.getTimeOffRequests(),
  });

  const { data: staffMembers } = useQuery({
    queryKey: ['staffMembers'],
    queryFn: () => staffService.getStaffMembers(),
  });

  const createRequestMutation = useMutation({
    mutationFn: (request: Omit<TimeOffRequest, 'id'>) =>
      staffService.createTimeOffRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffRequests'] });
      toast.success('Time off request created successfully');
      setIsCreateRequestOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create time off request');
      console.error('Create request error:', error);
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: ({
      id,
      status,
      comments,
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      comments?: string;
    }) => staffService.reviewTimeOffRequest(id, status, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeOffRequests'] });
      toast.success('Time off request reviewed successfully');
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error('Failed to review time off request');
      console.error('Review request error:', error);
    },
  });

  const handleCreateRequest = () => {
    if (newRequest.staffId && newRequest.startDate && newRequest.endDate) {
      createRequestMutation.mutate(newRequest as Omit<TimeOffRequest, 'id'>);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500',
      APPROVED: 'bg-green-500',
      REJECTED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const renderTimeOffRequest = (request: TimeOffRequest) => {
    const staff = staffMembers?.find((s) => s.id === request.staffId);
    return (
      <div key={request.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <h3 className="font-semibold text-lg">
              {staff?.firstName} {staff?.lastName}
            </h3>
            <span className="text-sm text-gray-600">{request.type}</span>
          </div>
          <div>
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>
                {format(new Date(request.startDate), 'MMM dd, yyyy')} -{' '}
                {format(new Date(request.endDate), 'MMM dd, yyyy')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`px-3 py-1 rounded-full text-white text-sm mb-2 ${getStatusColor(
                request.status
              )}`}
            >
              {request.status}
            </span>
            {request.status === 'PENDING' && (
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    reviewRequestMutation.mutate({
                      id: request.id,
                      status: 'APPROVED',
                    })
                  }
                  className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() =>
                    reviewRequestMutation.mutate({
                      id: request.id,
                      status: 'REJECTED',
                    })
                  }
                  className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Time Off Requests</h1>
        <button
          onClick={() => setIsCreateRequestOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <CalendarIcon className="w-5 h-5 mr-2" />
          New Request
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading time off requests...</p>
      ) : (
        <div>{timeOffRequests?.map(renderTimeOffRequest)}</div>
      )}

      {/* Create Request Dialog */}
      <Dialog
        open={isCreateRequestOpen}
        onClose={() => setIsCreateRequestOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Create Time Off Request
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <select
                  value={newRequest.staffId || ''}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, staffId: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Staff Member</option>
                  {staffMembers?.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={newRequest.type || 'VACATION'}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VACATION">Vacation</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <DatePicker
                    selected={new Date(newRequest.startDate || '')}
                    onChange={(date) =>
                      setNewRequest({
                        ...newRequest,
                        startDate: date?.toISOString(),
                      })
                    }
                    dateFormat="MMMM d, yyyy"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <DatePicker
                    selected={new Date(newRequest.endDate || '')}
                    onChange={(date) =>
                      setNewRequest({
                        ...newRequest,
                        endDate: date?.toISOString(),
                      })
                    }
                    dateFormat="MMMM d, yyyy"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <textarea
                  placeholder="Reason"
                  value={newRequest.reason || ''}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsCreateRequestOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};


