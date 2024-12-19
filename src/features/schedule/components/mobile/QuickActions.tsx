import React from 'react';
import { useQuery, useMutation } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface QuickAction {
  id: string;
  type: 'clock' | 'break' | 'request' | 'swap' | 'report';
  label: string;
  icon: string;
  available: boolean;
  requiresLocation?: boolean;
}

interface ActionStatus {
  clockedIn: boolean;
  onBreak: boolean;
  pendingRequests: number;
  pendingSwaps: number;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
}

export const QuickActions: React.FC = () => {
  const { data: actions } = useQuery<QuickAction[]>(
    ['quick-actions'],
    () => scheduleAPI.getQuickActions(),
  );

  const { data: status } = useQuery<ActionStatus>(
    ['action-status'],
    () => scheduleAPI.getActionStatus(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const actionMutation = useMutation(
    (actionId: string) => scheduleAPI.executeQuickAction(actionId),
  );

  const getLocationAndExecute = async (actionId: string) => {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        actionMutation.mutate(actionId);
      } catch (error) {
        console.error('Location access denied:', error);
      }
    } else {
      actionMutation.mutate(actionId);
    }
  };

  const renderActionButton = (action: QuickAction) => {
    const isActive = action.type === 'clock' ? status?.clockedIn :
                    action.type === 'break' ? status?.onBreak : false;

    return (
      <button
        key={action.id}
        onClick={() => action.requiresLocation ? getLocationAndExecute(action.id) : actionMutation.mutate(action.id)}
        disabled={!action.available}
        className={`
          relative flex flex-col items-center justify-center p-4 rounded-lg
          ${isActive ? 'bg-blue-600 text-white' : 'bg-white'}
          ${action.available ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}
          transition-all duration-200 ease-in-out
          touch-manipulation
        `}
      >
        <span className="material-icons-outlined text-2xl mb-2">{action.icon}</span>
        <span className="text-sm font-medium">{action.label}</span>
        {action.type === 'request' && status?.pendingRequests ? (
          <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
            {status.pendingRequests}
          </span>
        ) : null}
        {action.type === 'swap' && status?.pendingSwaps ? (
          <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-yellow-500 text-white text-xs rounded-full">
            {status.pendingSwaps}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {actions?.map(renderActionButton)}
      </div>

      {status?.location && (
        <div className="text-xs text-gray-500 text-center">
          Last location update:{' '}
          {new Date(status.location.timestamp).toLocaleTimeString()}
        </div>
      )}

      {actionMutation.isError && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm text-center">
          Failed to perform action. Please try again.
        </div>
      )}
    </div>
  );
};
