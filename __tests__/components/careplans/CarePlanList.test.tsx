import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CarePlanList } from '@/components/careplans/CarePlanList';
import { vi } from 'vitest';

// Mock data
const mockCarePlans = [
  {
    id: '1',
    residentName: 'John Doe',
    status: 'ACTIVE',
    lastReviewDate: '2024-03-21',
    nextReviewDate: '2024-04-21',
    type: 'PERSONAL_CARE',
    region: 'ENGLAND'
  },
  {
    id: '2',
    residentName: 'Jane Smith',
    status: 'PENDING_REVIEW',
    lastReviewDate: '2024-03-15',
    nextReviewDate: '2024-04-15',
    type: 'MEDICATION',
    region: 'WALES'
  }
];

const mockHandleEdit = vi.fn();
const mockHandleDelete = vi.fn();
const mockHandleReview = vi.fn();

describe('CarePlanList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the care plan list with correct data', () => {
    render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onReview={mockHandleReview}
      />
    );

    // Check if resident names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check if statuses are displayed
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('PENDING_REVIEW')).toBeInTheDocument();

    // Check if dates are displayed
    expect(screen.getByText('21/03/2024')).toBeInTheDocument();
    expect(screen.getByText('21/04/2024')).toBeInTheDocument();
  });

  it('handles edit action correctly', async () => {
    render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onReview={mockHandleReview}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockHandleEdit).toHaveBeenCalledWith(mockCarePlans[0]);
  });

  it('handles delete action with confirmation', async () => {
    render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onReview={mockHandleReview}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Check if confirmation dialog appears
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(mockHandleDelete).toHaveBeenCalledWith(mockCarePlans[0].id);
  });

  it('handles review action correctly', async () => {
    render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onReview={mockHandleReview}
      />
    );

    const reviewButtons = screen.getAllByRole('button', { name: /review/i });
    fireEvent.click(reviewButtons[0]);

    expect(mockHandleReview).toHaveBeenCalledWith(mockCarePlans[0]);
  });

  it('displays no care plans message when list is empty', () => {
    render(
      <CarePlanList
        carePlans={[]}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onReview={mockHandleReview}
      />
    );

    expect(screen.getByText(/No care plans found/i)).toBeInTheDocument();
  });

  it('filters care plans by search term', () => {
    render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onReview={mockHandleReview}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search care plans/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('sorts care plans by different columns', () => {
    render(
      <CarePlanList
        carePlans={mockCarePlans}
        onEdit={mockHandleEdit}
        onDelete={mockHandleDelete}
        onReview={mockHandleReview}
      />
    );

    // Click on resident name header to sort
    const nameHeader = screen.getByRole('columnheader', { name: /resident name/i });
    fireEvent.click(nameHeader);

    // Check if sorted in ascending order
    const residentNames = screen.getAllByRole('cell', { name: /(John Doe|Jane Smith)/i });
    expect(residentNames[0]).toHaveTextContent('Jane Smith');
    expect(residentNames[1]).toHaveTextContent('John Doe');

    // Click again to sort in descending order
    fireEvent.click(nameHeader);
    const residentNamesDesc = screen.getAllByRole('cell', { name: /(John Doe|Jane Smith)/i });
    expect(residentNamesDesc[0]).toHaveTextContent('John Doe');
    expect(residentNamesDesc[1]).toHaveTextContent('Jane Smith');
  });
}); 