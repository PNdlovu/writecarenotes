/**
 * @fileoverview Tests for audit pagination component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditPagination } from '../components/tables/AuditPagination';

describe('AuditPagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination with correct page numbers', () => {
    render(<AuditPagination {...defaultProps} />);

    // Should show first 5 pages, ellipsis, and last page
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles page changes correctly', () => {
    render(<AuditPagination {...defaultProps} />);

    // Click on page 3
    fireEvent.click(screen.getByText('3'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);

    // Click next button
    fireEvent.click(screen.getByText('Next'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);

    // Click previous button
    fireEvent.click(screen.getByText('Previous'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(0);
  });

  it('disables buttons when appropriate', () => {
    render(<AuditPagination {...defaultProps} currentPage={1} />);
    expect(screen.getByText('Previous')).toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();

    render(<AuditPagination {...defaultProps} currentPage={10} />);
    expect(screen.getByText('Previous')).not.toBeDisabled();
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('handles loading state correctly', () => {
    render(<AuditPagination {...defaultProps} isLoading={true} />);

    // All buttons should be disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('shows correct page range for middle pages', () => {
    render(<AuditPagination {...defaultProps} currentPage={5} />);

    // Should show first page, ellipsis, current page and neighbors, ellipsis, and last page
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBe(2);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows all pages when total pages is small', () => {
    render(<AuditPagination {...defaultProps} totalPages={5} />);

    // Should show all pages without ellipsis
    expect(screen.queryByText('...')).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows correct page info', () => {
    render(<AuditPagination {...defaultProps} currentPage={5} totalPages={10} />);
    expect(screen.getByText('Page 5 of 10')).toBeInTheDocument();
  });

  it('handles edge cases', () => {
    // Test with 0 total pages
    render(<AuditPagination {...defaultProps} totalPages={0} />);
    expect(screen.getByText('Page 1 of 0')).toBeInTheDocument();

    // Test with negative current page (should still render)
    render(<AuditPagination {...defaultProps} currentPage={-1} />);
    expect(screen.getByText('Page -1 of 10')).toBeInTheDocument();

    // Test with current page > total pages
    render(<AuditPagination {...defaultProps} currentPage={15} totalPages={10} />);
    expect(screen.getByText('Page 15 of 10')).toBeInTheDocument();
  });
}); 


