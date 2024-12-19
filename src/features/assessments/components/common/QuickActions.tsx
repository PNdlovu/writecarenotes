import React from 'react';
import { Plus, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/router';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

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
  const { isOffline } = useOfflineStorage();

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
          disabled={isOffline}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Assessment
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onScheduleAssessment}
          disabled={isOffline}
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


