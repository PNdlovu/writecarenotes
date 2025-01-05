import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/features/theme';

const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <SessionProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </SessionProvider>
    ),
    ...options,
  });
};

export * from '@testing-library/react';
export { customRender as render };
