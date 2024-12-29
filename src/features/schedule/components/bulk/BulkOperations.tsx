import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  Dropdown,
  Icon,
  Input,
  Select,
  Toast,
} from '@/components/ui';
import { HandoverTask, Staff } from '../../types/handover';

interface BulkOperationsProps {
  selectedItems: HandoverTask[];
  availableStaff: Staff[];
  onUpdate: (updates: Partial<HandoverTask>[]) => Promise<void>;
  onDelete: (taskIds: string[]) => Promise<void>;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedItems,
  availableStaff,
  onUpdate,
  onDelete,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [operation, setOperation] = useState<string>('');
  const [updateValue, setUpdateValue] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBulkOperation = async () => {
    try {
      setProcessing(true);
      setError(null);

      switch (operation) {
        case 'status':
          await onUpdate(
            selectedItems.map((item) => ({
              ...item,
              status: updateValue as any,
            }))
          );
          break;

        case 'priority':
          await onUpdate(
            selectedItems.map((item) => ({
              ...item,
              priority: updateValue as any,
            }))
          );
          break;

        case 'assign':
          await onUpdate(
            selectedItems.map((item) => ({
              ...item,
              assignedTo: availableStaff.find(
                (staff) => staff.id === updateValue
              ),
            }))
          );
          break;

        case 'delete':
          await onDelete(selectedItems.map((item) => item.id));
          break;

        default:
          throw new Error('Invalid operation');
      }

      setShowConfirmDialog(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const renderOperationFields = () => {
    switch (operation) {
      case 'status':
        return (
          <Select
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        );

      case 'priority':
        return (
          <Select
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        );

      case 'assign':
        return (
          <Select
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
          >
            <option value="">Unassigned</option>
            {availableStaff.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} ({staff.role})
              </option>
            ))}
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="w-48"
        >
          <option value="">Select Operation</option>
          <option value="status">Update Status</option>
          <option value="priority">Update Priority</option>
          <option value="assign">Assign Staff</option>
          <option value="delete">Delete Tasks</option>
        </Select>

        {renderOperationFields()}

        <Button
          variant="primary"
          disabled={!operation || processing}
          onClick={() => setShowConfirmDialog(true)}
        >
          {processing ? (
            <Icon name="spinner" className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Icon name="check" className="w-4 h-4 mr-2" />
          )}
          Apply to {selectedItems.length} items
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}

      <Dialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirm Bulk Operation"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to {operation}{' '}
            {selectedItems.length} tasks?
          </p>
          {operation === 'delete' && (
            <p className="text-red-500">
              This action cannot be undone.
            </p>
          )}
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant={operation === 'delete' ? 'danger' : 'primary'}
              onClick={handleBulkOperation}
              disabled={processing}
            >
              {processing ? (
                <Icon name="spinner" className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Icon
                  name={operation === 'delete' ? 'trash' : 'check'}
                  className="w-4 h-4 mr-2"
                />
              )}
              Confirm
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
