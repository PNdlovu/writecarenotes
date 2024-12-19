/**
 * @fileoverview Audit changes viewer component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { AuditChangesViewerProps } from '../../types/ui.types';

interface DiffViewerProps {
  field: string;
  before: any;
  after: any;
}

function DiffViewer({ field, before, after }: DiffViewerProps) {
  const hasChanged = JSON.stringify(before) !== JSON.stringify(after);
  
  if (!hasChanged) return null;

  const formatValue = (value: any) => {
    if (value === undefined || value === null) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="py-2">
      <h4 className="text-sm font-medium text-gray-700">{field}</h4>
      <div className="mt-1 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Before</p>
          <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-sm overflow-auto">
            {formatValue(before)}
          </pre>
        </div>
        <div>
          <p className="text-xs text-gray-500">After</p>
          <pre className="mt-1 p-2 bg-green-50 text-green-800 rounded text-sm overflow-auto">
            {formatValue(after)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function AuditChangesViewer({ changes }: AuditChangesViewerProps) {
  if (!changes || (!changes.before && !changes.after)) {
    return (
      <Card className="p-4">
        <p className="text-center text-gray-500">No changes recorded</p>
      </Card>
    );
  }

  const allFields = new Set([
    ...Object.keys(changes.before || {}),
    ...Object.keys(changes.after || {}),
  ]);

  return (
    <Card className="p-4 space-y-4">
      {/* Summary */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">Changes Summary</h3>
        <p className="text-sm text-gray-500">
          {allFields.size} field{allFields.size === 1 ? '' : 's'} modified
        </p>
      </div>

      {/* Changes List */}
      <div className="space-y-4">
        {Array.from(allFields).map((field) => (
          <DiffViewer
            key={field}
            field={field}
            before={changes.before?.[field]}
            after={changes.after?.[field]}
          />
        ))}
      </div>
    </Card>
  );
} 


