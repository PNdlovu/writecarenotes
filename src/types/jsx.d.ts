import React from 'react';
import { AssessmentFiltersProps } from '@/components/assessments/AssessmentFilters';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'div': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      'assessment-filters': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & AssessmentFiltersProps,
        HTMLElement
      >;
    }
  }
}


