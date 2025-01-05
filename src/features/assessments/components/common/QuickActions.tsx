/**
 * @writecarenotes.com
 * @fileoverview Quick actions component for assessments
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component providing quick action buttons for assessment management.
 * Supports offline-aware functionality using the enterprise offline module.
 */

import React from 'react';
import { Plus, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useRouter } from 'next/router';
import { useOfflineSync } from '@/lib/offline/hooks/useOfflineSync';

interface QuickActionProps {
  onCreateAssessment?: () => void;
  onScheduleAssessment?: () => void;
  onViewHistory?: () => void;
}

export const QuickActions: React.FC<QuickActionProps> = ({
  onCreateAssessment,
  onScheduleAssessment,
  onViewHistory,
}) => {
  const router = useRouter();
  const { status } = useOfflineSync({
    storeName: 'assessments',
    onSyncError: (error) => {
      console.error('Assessment sync error:', error);
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={onCreateAssessment}
          disabled={!status?.isOnline}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Assessment
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onScheduleAssessment}
          disabled={!status?.isOnline}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Assessment
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onViewHistory}
        >
          <Clock className="mr-2 h-4 w-4" />
          View History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


