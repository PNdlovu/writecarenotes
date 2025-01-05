/**
 * @writecarenotes.com
 * @fileoverview Real-time medication alerts component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Real-time medication alerts component providing critical notifications
 * for medication-related events, stock levels, and compliance issues.
 * Supports offline capabilities and regional requirements.
 */

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bell, AlertTriangle, Clock, Package } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAlerts } from '../../hooks/useAlerts';
import type { Medication, MedicationAdministrationRecord } from '../../types/medication';

interface MedicationAlertsProps {
  medications: Medication[];
  marRecords: MedicationAdministrationRecord[];
  className?: string;
}

export const MedicationAlerts: React.FC<MedicationAlertsProps> = ({
  medications,
  marRecords,
  className = '',
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { generateAlerts, loading, error } = useAlerts();

  const alerts = useMemo(() => {
    if (!medications || !marRecords) return [];
    return generateAlerts(medications, marRecords);
  }, [medications, marRecords, generateAlerts]);

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'due':
        return <Clock className="w-4 h-4" />;
      case 'stock':
        return <Package className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (error) {
    return <div className="error-message">{error.message}</div>;
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={`medication-alerts ${className}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alerts.map((alert, index) => (
          <Card
            key={`${alert.id}-${index}`}
            className={`p-4 border-l-4 ${getAlertColor(alert.priority)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium truncate">
                    {alert.medication.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    {alert.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className={`mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {alert.message}
                </p>
                {alert.dueTime && (
                  <p className="mt-1 text-xs text-gray-500">
                    Due: {new Date(alert.dueTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            {alert.action && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Action Required: {alert.action}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {isMobile && alerts.length > 3 && (
        <p className="text-center text-xs text-gray-500 mt-2">
          Swipe to see more alerts
        </p>
      )}
    </div>
  );
}; 