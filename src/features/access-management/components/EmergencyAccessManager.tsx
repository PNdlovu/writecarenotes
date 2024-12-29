/**
 * @fileoverview Component for managing emergency access requests and approvals
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useContext, useState, useEffect } from 'react';
import { AccessManagementContext } from '../context/AccessManagementContext';
import { EmergencyAccess, EmergencyPermission } from '../types';

interface EmergencyAccessRequest {
  id: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: Date;
  expiresAt?: Date;
}

export function EmergencyAccessManager() {
  const { accessService } = useContext(AccessManagementContext);
  const [requests, setRequests] = useState<EmergencyAccessRequest[]>([]);
  const [activeAccesses, setActiveAccesses] = useState<EmergencyAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<EmergencyAccessRequest | null>(null);
  const [approvalReason, setApprovalReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [requestsResponse, accessesResponse] = await Promise.all([
        fetch('/api/emergency-access/requests'),
        fetch('/api/emergency-access/active')
      ]);

      if (!requestsResponse.ok || !accessesResponse.ok) {
        throw new Error('Failed to load emergency access data');
      }

      const [requestsData, accessesData] = await Promise.all([
        requestsResponse.json(),
        accessesResponse.json()
      ]);

      setRequests(requestsData);
      setActiveAccesses(accessesData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load data');
      setError(error);
      console.error('Error loading emergency access data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: EmergencyAccessRequest) => {
    if (!accessService) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/emergency-access/requests/${request.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: approvalReason })
      });

      if (!response.ok) {
        throw new Error('Failed to approve emergency access request');
      }

      await loadData();
      setSelectedRequest(null);
      setApprovalReason('');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to approve request');
      setError(error);
      console.error('Error approving request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (request: EmergencyAccessRequest) => {
    if (!accessService) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/emergency-access/requests/${request.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: approvalReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject emergency access request');
      }

      await loadData();
      setSelectedRequest(null);
      setApprovalReason('');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reject request');
      setError(error);
      console.error('Error rejecting request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (access: EmergencyAccess) => {
    if (!accessService) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/emergency-access/${access.roleId}/revoke`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to revoke emergency access');
      }

      await loadData();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to revoke access');
      setError(error);
      console.error('Error revoking access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading emergency access data...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Pending Emergency Access Requests</h2>
        <div className="space-y-4">
          {requests
            .filter(request => request.status === 'PENDING')
            .map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 bg-yellow-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      Emergency Access Request - {request.resourceType}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">User ID:</span> {request.userId}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Resource:</span>{' '}
                        {request.resourceType}:{request.resourceId}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Requested:</span>{' '}
                        {new Date(request.requestedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Active Emergency Accesses */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Active Emergency Accesses</h2>
        <div className="space-y-4">
          {activeAccesses.map((access) => (
            <div
              key={access.roleId}
              className="border rounded-lg p-4 bg-red-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">
                    Emergency Access - {access.roleId}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Permissions:</span>{' '}
                      {access.permissions.join(', ')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Granted By:</span>{' '}
                      {access.grantedBy}
                    </p>
                    {access.expiresAt && (
                      <p className="text-sm">
                        <span className="font-medium">Expires:</span>{' '}
                        {new Date(access.expiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(access)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">
              Review Emergency Access Request
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Approval/Rejection Reason
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencyAccessManager; 