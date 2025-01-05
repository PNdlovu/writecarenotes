import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

export const AccessibleTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} role="button" aria-label={content}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const HelpText: React.FC<{
  text: string;
}> = ({ text }) => (
  <AccessibleTooltip content={text}>
    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
  </AccessibleTooltip>
);

export const TaskPriorityIndicator: React.FC<{
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}> = ({ priority }) => {
  const colors = {
    LOW: 'bg-gray-200',
    MEDIUM: 'bg-blue-200',
    HIGH: 'bg-yellow-200',
    URGENT: 'bg-red-200',
  };

  const descriptions = {
    LOW: 'Can be done when convenient',
    MEDIUM: 'Should be done today',
    HIGH: 'Needs attention soon',
    URGENT: 'Requires immediate attention',
  };

  return (
    <AccessibleTooltip content={descriptions[priority]}>
      <div
        className={`w-3 h-3 rounded-full ${colors[priority]}`}
        role="status"
        aria-label={`Priority: ${priority}`}
      />
    </AccessibleTooltip>
  );
};

export const TaskAlert: React.FC<{
  title: string;
  description: string;
  variant?: 'default' | 'warning';
}> = ({ title, description, variant = 'default' }) => (
  <Alert variant={variant}>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>
);

export const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  description: string;
}> = ({ icon, label, onClick, description }) => (
  <AccessibleTooltip content={description}>
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label={label}
    >
      {icon}
    </button>
  </AccessibleTooltip>
);

export const TimeRemaining: React.FC<{
  dueDate: Date;
}> = ({ dueDate }) => {
  const now = new Date();
  const timeLeft = dueDate.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  
  let message = '';
  let variant: 'default' | 'warning' = 'default';
  
  if (hoursLeft < 0) {
    message = 'Overdue';
    variant = 'warning';
  } else if (hoursLeft < 1) {
    message = 'Due soon';
    variant = 'warning';
  } else if (hoursLeft < 24) {
    message = `Due in ${hoursLeft} hours`;
  } else {
    message = `Due in ${Math.floor(hoursLeft / 24)} days`;
  }

  return (
    <AccessibleTooltip content={dueDate.toLocaleString()}>
      <span
        className={`text-sm ${
          variant === 'warning' ? 'text-red-600' : 'text-gray-600'
        }`}
        role="timer"
        aria-label={`Time remaining: ${message}`}
      >
        {message}
      </span>
    </AccessibleTooltip>
  );
};
