import React from 'react';
import { render } from '@testing-library/react';
import { Providers } from '@/app/providers';

// Mock the provider components
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="query-provider">{children}</div>
}));

jest.mock('@/components/providers/session-provider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="session-provider">{children}</div>
}));

jest.mock('@/components/providers/organization-provider', () => ({
  OrganizationProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="org-provider">{children}</div>
}));

jest.mock('@/components/providers/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>
}));

jest.mock('@/components/providers/offline-provider', () => ({
  OfflineProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="offline-provider">{children}</div>
}));

describe('Providers', () => {
  const mockSession = { user: { name: 'Test User' } };
  const mockOrganization = { id: '1', name: 'Test Org' };

  it('renders all providers in the correct order', () => {
    const { container } = render(
      <Providers session={mockSession} organization={mockOrganization}>
        <div>Test Content</div>
      </Providers>
    );

    // Get the HTML content as a string
    const html = container.innerHTML;

    // Verify the nesting order of providers using string indices
    const queryProviderIndex = html.indexOf('query-provider');
    const sessionProviderIndex = html.indexOf('session-provider');
    const orgProviderIndex = html.indexOf('org-provider');
    const themeProviderIndex = html.indexOf('theme-provider');
    const offlineProviderIndex = html.indexOf('offline-provider');

    // Verify correct nesting order
    expect(queryProviderIndex).toBeLessThan(sessionProviderIndex);
    expect(sessionProviderIndex).toBeLessThan(orgProviderIndex);
    expect(orgProviderIndex).toBeLessThan(themeProviderIndex);
    expect(themeProviderIndex).toBeLessThan(offlineProviderIndex);
  });

  it('renders children within all providers', () => {
    const { getByText } = render(
      <Providers session={mockSession} organization={mockOrganization}>
        <div>Test Content</div>
      </Providers>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('works without an organization', () => {
    const { getByText } = render(
      <Providers session={mockSession}>
        <div>Test Content</div>
      </Providers>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });
});
