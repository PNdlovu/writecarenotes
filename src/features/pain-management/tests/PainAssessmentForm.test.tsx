import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PainAssessmentForm } from '../components/PainAssessmentForm';
import { useTenantContext } from '@/lib/multi-tenant/hooks';
import { useNetwork } from '@/hooks/useNetwork';
import { Region } from '@/lib/region/types';

// Mock hooks
jest.mock('@/lib/multi-tenant/hooks');
jest.mock('@/hooks/useNetwork');
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('PainAssessmentForm', () => {
  beforeEach(() => {
    (useTenantContext as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      region: Region.ENGLAND,
    });
    (useNetwork as jest.Mock).mockReturnValue({ isOnline: true });
  });

  it('handles offline mode correctly', async () => {
    // Mock offline state
    (useNetwork as jest.Mock).mockReturnValue({ isOnline: false });

    render(
      <PainAssessmentForm
        residentId="test-resident"
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );

    // Check offline message is displayed
    expect(screen.getByText('offlineMode')).toBeInTheDocument();

    // Submit form in offline mode
    const submitButton = screen.getByRole('button', { name: 'saveAssessment' });
    fireEvent.click(submitButton);

    // Verify data is stored locally
    await waitFor(() => {
      expect(localStorage.getItem('painAssessments')).toBeTruthy();
    });
  });

  it('validates regional requirements', async () => {
    // Test England requirements
    (useTenantContext as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      region: Region.ENGLAND,
    });

    const { rerender } = render(
      <PainAssessmentForm
        residentId="test-resident"
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );

    // Check for double sign-off field
    expect(screen.getByLabelText('secondAssessor')).toBeInTheDocument();

    // Test Wales requirements
    (useTenantContext as jest.Mock).mockReturnValue({
      tenantId: 'test-tenant',
      region: Region.WALES,
    });

    rerender(
      <PainAssessmentForm
        residentId="test-resident"
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );

    // Check for Welsh language support
    expect(screen.getByLabelText('Graddfa Poen')).toBeInTheDocument();
  });

  it('supports multiple languages', () => {
    const { rerender } = render(
      <PainAssessmentForm
        residentId="test-resident"
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );

    // Check English labels
    expect(screen.getByText('painScale')).toBeInTheDocument();

    // Mock Welsh translation
    jest.mock('next-i18next', () => ({
      useTranslation: () => ({
        t: (key: string) => key === 'painScale' ? 'Graddfa Poen' : key,
      }),
    }));

    rerender(
      <PainAssessmentForm
        residentId="test-resident"
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );

    // Check Welsh labels
    expect(screen.getByText('Graddfa Poen')).toBeInTheDocument();
  });
}); 