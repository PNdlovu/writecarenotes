import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClientLayout } from '@/app/client-layout';

// Mock the components used in ClientLayout
jest.mock('@/features/theme/components/RegionSelector', () => ({
  RegionSelector: () => <div data-testid="mock-region-selector">Region Selector</div>
}));

jest.mock('@/features/theme/components/AccessibilitySettings', () => ({
  AccessibilitySettings: () => <div data-testid="mock-accessibility-settings">Accessibility Settings</div>
}));

jest.mock('@/features/theme/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="mock-theme-toggle">Theme Toggle</div>
}));

jest.mock('@/components/offline/offline-status', () => ({
  OfflineStatus: () => <div data-testid="offline-status">Offline Status</div>
}));

jest.mock('@/components/landing/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>
}));

jest.mock('@/components/landing/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>
}));

jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>
}));

describe('ClientLayout', () => {
  it('renders all components in the correct structure', () => {
    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    // Verify all components are rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('region-selector')).toBeInTheDocument();
    expect(screen.getByTestId('accessibility-settings')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('offline-status')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();

    // Verify child content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    // Check main container classes
    const container = screen.getByText('Test Content').parentElement;
    expect(container).toHaveClass('flex-grow', 'container', 'mx-auto', 'px-4', 'py-8');

    // Check wrapper classes
    const wrapper = container?.parentElement;
    expect(wrapper).toHaveClass('min-h-screen', 'flex', 'flex-col');

    // Check utility bar classes
    const utilityBar = screen.getByTestId('theme-toggle').parentElement;
    expect(utilityBar).toHaveClass('fixed', 'top-4', 'right-4', 'z-50', 'flex', 'items-center', 'gap-2');
  });
});
