import {
  calculateCompletionPercentage,
  isAssessmentOverdue,
  sortAssessmentsByDueDate,
  filterAssessmentsByStatus,
} from '../utils/assessmentHelpers';
import { AssessmentStatus, AssessmentType } from '../types/assessment.types';

describe('Assessment Helpers', () => {
  const baseAssessment = {
    id: 'test-assessment',
    residentId: 'test-resident',
    type: AssessmentType.DAILY,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('calculateCompletionPercentage', () => {
    it('should return 0 for empty sections', () => {
      const assessment = {
        ...baseAssessment,
        sections: [],
      };
      expect(calculateCompletionPercentage(assessment)).toBe(0);
    });

    it('should calculate correct percentage for partially completed sections', () => {
      const assessment = {
        ...baseAssessment,
        sections: [
          { id: '1', completed: true },
          { id: '2', completed: false },
          { id: '3', completed: true },
          { id: '4', completed: false },
        ],
      };
      expect(calculateCompletionPercentage(assessment)).toBe(50);
    });

    it('should return 100 for fully completed sections', () => {
      const assessment = {
        ...baseAssessment,
        sections: [
          { id: '1', completed: true },
          { id: '2', completed: true },
        ],
      };
      expect(calculateCompletionPercentage(assessment)).toBe(100);
    });
  });

  describe('isAssessmentOverdue', () => {
    it('should return false for assessment without due date', () => {
      const assessment = {
        ...baseAssessment,
        dueDate: undefined,
      };
      expect(isAssessmentOverdue(assessment)).toBe(false);
    });

    it('should return true for past due date', () => {
      const assessment = {
        ...baseAssessment,
        dueDate: new Date('2023-01-01').toISOString(),
      };
      expect(isAssessmentOverdue(assessment)).toBe(true);
    });

    it('should return false for future due date', () => {
      const assessment = {
        ...baseAssessment,
        dueDate: new Date('2025-01-01').toISOString(),
      };
      expect(isAssessmentOverdue(assessment)).toBe(false);
    });

    it('should return false for completed assessment regardless of due date', () => {
      const assessment = {
        ...baseAssessment,
        status: AssessmentStatus.COMPLETED,
        dueDate: new Date('2023-01-01').toISOString(),
      };
      expect(isAssessmentOverdue(assessment)).toBe(false);
    });
  });

  describe('sortAssessmentsByDueDate', () => {
    const assessments = [
      {
        ...baseAssessment,
        id: '1',
        dueDate: new Date('2024-01-03').toISOString(),
      },
      {
        ...baseAssessment,
        id: '2',
        dueDate: new Date('2024-01-01').toISOString(),
      },
      {
        ...baseAssessment,
        id: '3',
        dueDate: new Date('2024-01-02').toISOString(),
      },
    ];

    it('should sort assessments by due date ascending', () => {
      const sorted = sortAssessmentsByDueDate(assessments, 'asc');
      expect(sorted.map(a => a.id)).toEqual(['2', '3', '1']);
    });

    it('should sort assessments by due date descending', () => {
      const sorted = sortAssessmentsByDueDate(assessments, 'desc');
      expect(sorted.map(a => a.id)).toEqual(['1', '3', '2']);
    });

    it('should handle assessments without due dates', () => {
      const mixedAssessments = [
        ...assessments,
        { ...baseAssessment, id: '4' }, // no due date
      ];
      const sorted = sortAssessmentsByDueDate(mixedAssessments, 'asc');
      expect(sorted[sorted.length - 1].id).toBe('4');
    });
  });

  describe('filterAssessmentsByStatus', () => {
    const assessments = [
      {
        ...baseAssessment,
        id: '1',
        status: AssessmentStatus.IN_PROGRESS,
      },
      {
        ...baseAssessment,
        id: '2',
        status: AssessmentStatus.COMPLETED,
      },
      {
        ...baseAssessment,
        id: '3',
        status: AssessmentStatus.IN_PROGRESS,
      },
    ];

    it('should filter assessments by single status', () => {
      const filtered = filterAssessmentsByStatus(assessments, AssessmentStatus.IN_PROGRESS);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(a => a.status === AssessmentStatus.IN_PROGRESS)).toBe(true);
    });

    it('should filter assessments by multiple statuses', () => {
      const filtered = filterAssessmentsByStatus(assessments, [
        AssessmentStatus.IN_PROGRESS,
        AssessmentStatus.COMPLETED,
      ]);
      expect(filtered).toHaveLength(3);
    });

    it('should return empty array for non-matching status', () => {
      const filtered = filterAssessmentsByStatus(assessments, AssessmentStatus.DRAFT);
      expect(filtered).toHaveLength(0);
    });
  });
});


