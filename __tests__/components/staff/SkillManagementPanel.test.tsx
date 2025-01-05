import React from 'react';
import { render, screen } from '@testing-library/react';
import { SkillManagementPanel } from '@/components/staff/skills/SkillManagementPanel';

describe('SkillManagementPanel', () => {
  it('renders the component with correct heading', () => {
    render(<SkillManagementPanel />);
    
    expect(screen.getByText('Skills Management')).toBeInTheDocument();
  });

  it('renders the placeholder content', () => {
    render(<SkillManagementPanel />);
    
    expect(screen.getByText('Skills management panel content will go here')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<SkillManagementPanel />);
    
    const container = screen.getByText('Skills Management').parentElement;
    expect(container).toHaveClass('p-4');
    expect(screen.getByText('Skills Management')).toHaveClass('text-lg', 'font-semibold', 'mb-4');
  });
});
