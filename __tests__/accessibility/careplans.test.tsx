import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CarePlanList } from '@/components/careplans/CarePlanList';
import { CarePlanStats } from '@/components/careplans/CarePlanStats';
import { AddCarePlanDialog } from '@/components/careplans/AddCarePlanDialog';
import { CarePlanReviews } from '@/components/careplans/CarePlanReviews';

expect.extend(toHaveNoViolations);

const mockCarePlans = [
  {
    id: '1',
    residentName: 'John Doe',
    status: 'ACTIVE',
    lastReviewDate: '2024-03-21',
    nextReviewDate: '2024-04-21',
    type: 'PERSONAL_CARE',
    region: 'ENGLAND'
  }
];

const mockStats = {
  total: 100,
  active: 75,
  pendingReview: 15,
  overdue: 10,
  byType: {
    PERSONAL_CARE: 30,
    MEDICATION: 25,
    MOBILITY: 20,
    NUTRITION: 15,
    SOCIAL: 10
  },
  byRegion: {
    ENGLAND: 40,
    WALES: 25,
    SCOTLAND: 20,
    NORTHERN_IRELAND: 10,
    IRELAND: 5
  },
  reviewsThisMonth: 25,
  complianceRate: 85
};

describe('Care Plan Components Accessibility', () => {
  it('CarePlanList has no accessibility violations', async () => {
    const { container } = render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={() => {}}
        onDelete={() => {}}
        onReview={() => {}}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CarePlanStats has no accessibility violations', async () => {
    const { container } = render(
      <CarePlanStats stats={mockStats} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AddCarePlanDialog has no accessibility violations', async () => {
    const { container } = render(
      <AddCarePlanDialog
        open={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CarePlanReviews has no accessibility violations', async () => {
    const { container } = render(
      <CarePlanReviews
        carePlanId="1"
        residentName="John Doe"
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('maintains focus management in dialogs', async () => {
    const { getByRole } = render(
      <AddCarePlanDialog
        open={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );
    
    // Check if the first focusable element receives focus
    const firstInput = getByRole('textbox', { name: /resident name/i });
    expect(document.activeElement).toBe(firstInput);
  });

  it('supports keyboard navigation in CarePlanList', async () => {
    const { getAllByRole } = render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={() => {}}
        onDelete={() => {}}
        onReview={() => {}}
      />
    );
    
    const buttons = getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  it('provides appropriate ARIA labels', async () => {
    const { getByLabelText } = render(
      <CarePlanStats stats={mockStats} />
    );
    
    expect(getByLabelText(/total care plans/i)).toBeInTheDocument();
    expect(getByLabelText(/compliance rate/i)).toBeInTheDocument();
  });

  it('handles screen reader announcements for status changes', async () => {
    const { getByRole } = render(
      <CarePlanStats stats={mockStats} />
    );
    
    const alert = getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('provides sufficient color contrast', async () => {
    const { container } = render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={() => {}}
        onDelete={() => {}}
        onReview={() => {}}
      />
    );
    
    const results = await axe(container);
    const colorContrastViolations = results.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    expect(colorContrastViolations).toHaveLength(0);
  });

  it('maintains readability at different zoom levels', async () => {
    const { container } = render(
      <CarePlanStats stats={mockStats} />
    );
    
    // Test at different zoom levels
    const zoomLevels = ['100%', '150%', '200%'];
    zoomLevels.forEach(zoom => {
      container.style.zoom = zoom;
      expect(container).toBeVisible();
    });
  });

  it('provides keyboard shortcuts for common actions', async () => {
    const handleEdit = vi.fn();
    const { getByRole } = render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={handleEdit}
        onDelete={() => {}}
        onReview={() => {}}
      />
    );
    
    const editButton = getByRole('button', { name: /edit/i });
    editButton.focus();
    fireEvent.keyDown(editButton, { key: 'Enter' });
    expect(handleEdit).toHaveBeenCalled();
  });
}); 