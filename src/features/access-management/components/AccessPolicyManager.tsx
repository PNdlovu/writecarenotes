/**
 * @fileoverview Component for managing access policies
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useContext, useState, useEffect } from 'react';
import { AccessManagementContext } from '../context/AccessManagementContext';
import { AccessPolicy } from '../types';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/Form';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';

interface AccessPolicyFormData {
  name: string;
  description: string;
  roles: string[];
  resources: string[];
  actions: string[];
  conditions?: {
    attribute: string;
    operator: string;
    value: string;
  }[];
}

export function AccessPolicyManager() {
  const { accessService } = useContext(AccessManagementContext);
  const [policies, setPolicies] = useState<AccessPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<AccessPolicy | null>(null);
  const [formData, setFormData] = useState<AccessPolicyFormData>({
    name: '',
    description: '',
    roles: [],
    resources: [],
    actions: []
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/access-policies');
      if (!response.ok) {
        throw new Error('Failed to load access policies');
      }
      const data = await response.json();
      setPolicies(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load policies');
      setError(error);
      console.error('Error loading policies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessService) return;

    try {
      setIsLoading(true);
      setError(null);

      if (selectedPolicy) {
        await accessService.updatePolicy(selectedPolicy.id, {
          ...formData,
          tenantId: selectedPolicy.tenantId
        });
      } else {
        await accessService.createPolicy({
          ...formData,
          tenantId: 'current-tenant-id' // Replace with actual tenant ID
        });
      }

      await loadPolicies();
      resetForm();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save policy');
      setError(error);
      console.error('Error saving policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (policy: AccessPolicy) => {
    setSelectedPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || '',
      roles: policy.roles,
      resources: policy.resources,
      actions: policy.actions,
      conditions: policy.conditions
    });
  };

  const resetForm = () => {
    setSelectedPolicy(null);
    setFormData({
      name: '',
      description: '',
      roles: [],
      resources: [],
      actions: []
    });
  };

  if (isLoading) {
    return <div>Loading access policies...</div>;
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
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {selectedPolicy ? 'Edit Policy' : 'Create New Policy'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Roles (comma-separated)
            </label>
            <Input
              type="text"
              value={formData.roles.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                roles: e.target.value.split(',').map(r => r.trim())
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resources (comma-separated)
            </label>
            <Input
              type="text"
              value={formData.resources.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                resources: e.target.value.split(',').map(r => r.trim())
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Actions (comma-separated)
            </label>
            <Input
              type="text"
              value={formData.actions.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                actions: e.target.value.split(',').map(a => a.trim())
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Saving...' : selectedPolicy ? 'Update Policy' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Existing Policies</h2>
        <div className="space-y-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{policy.name}</h3>
                  {policy.description && (
                    <p className="text-gray-600 mt-1">{policy.description}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Roles:</span>{' '}
                      {policy.roles.join(', ')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Resources:</span>{' '}
                      {policy.resources.join(', ')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Actions:</span>{' '}
                      {policy.actions.join(', ')}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleEdit(policy)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AccessPolicyManager; 