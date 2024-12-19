import React from 'react';
import { useRouter } from 'next/router';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface GuidedTourProps {
  currentPage: 'dashboard' | 'templates' | 'scheduler' | 'completion';
}

export function GuidedTour({ currentPage }: GuidedTourProps) {
  const router = useRouter();
  const [completedTours, setCompletedTours] = useLocalStorage<string[]>('completed_tours', []);
  const [run, setRun] = React.useState(!completedTours.includes(currentPage));

  const dashboardSteps: Step[] = [
    {
      target: '.assessment-dashboard',
      content: 'Welcome to the Assessment Dashboard! Here you can view and manage all assessments.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.filter-controls',
      content: 'Use these filters to find specific assessments by status, priority, or date.',
      placement: 'bottom',
    },
    {
      target: '.quick-actions',
      content: 'Quick actions allow you to create new assessments or access frequently used templates.',
      placement: 'left',
    },
    {
      target: '.assessment-list',
      content: 'View all your assessments here. Click on any assessment to see more details.',
      placement: 'top',
    },
  ];

  const templateSteps: Step[] = [
    {
      target: '.template-manager',
      content: 'Welcome to Template Management! Create and manage assessment templates here.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.template-wizard',
      content: 'Use the Template Wizard to easily create new templates step by step.',
      placement: 'bottom',
    },
    {
      target: '.template-list',
      content: 'View and manage your existing templates. You can edit, duplicate, or archive them.',
      placement: 'top',
    },
  ];

  const schedulerSteps: Step[] = [
    {
      target: '.scheduler',
      content: 'Welcome to the Assessment Scheduler! Plan and manage assessment schedules here.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.calendar-view',
      content: 'View scheduled assessments in a calendar format. Drag and drop to reschedule.',
      placement: 'bottom',
    },
    {
      target: '.bulk-schedule',
      content: 'Use bulk scheduling to create multiple assessment schedules at once.',
      placement: 'left',
    },
  ];

  const completionSteps: Step[] = [
    {
      target: '.completion-form',
      content: 'Welcome to the Assessment Form! Complete your assessment here.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.auto-save',
      content: 'Your progress is automatically saved. You can return to complete it later.',
      placement: 'bottom',
    },
    {
      target: '.attachment-zone',
      content: 'Upload relevant files and documents here.',
      placement: 'left',
    },
  ];

  const steps = React.useMemo(() => {
    switch (currentPage) {
      case 'dashboard':
        return dashboardSteps;
      case 'templates':
        return templateSteps;
      case 'scheduler':
        return schedulerSteps;
      case 'completion':
        return completionSteps;
      default:
        return [];
    }
  }, [currentPage]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      if (!completedTours.includes(currentPage)) {
        setCompletedTours([...completedTours, currentPage]);
      }
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      hideBackButton={false}
      showProgress
      showSkipButton
      steps={steps}
      run={run}
      styles={{
        options: {
          primaryColor: '#0284c7',
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#0284c7',
        },
        buttonBack: {
          marginRight: 10,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Got it',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}


