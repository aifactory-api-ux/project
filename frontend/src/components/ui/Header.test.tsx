import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Header from './Header';

jest.mock('../../styles/tokens', () => ({
  tokens: {
    colors: {
      primary: '#1e40af',
      primaryLight: '#3b82f6',
      secondary: '#6b7280',
      accent: '#f59e0b',
      surface: '#ffffff',
      darkSurface: '#1f2937',
      darkTextPrimary: '#f9fafb',
      darkTextSecondary: '#9ca3af',
      textSecondary: '#6b7280',
    },
    spacing: {
      sm: '8px',
      lg: '16px',
      xl: '24px',
    },
    radii: {
      md: '6px',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headings: {
        h1: { size: '24px', weight: '700', lineHeight: '1.2' },
        h3: { size: '14px', weight: '400', lineHeight: '1.4' },
      },
    },
  },
}));

jest.mock('lucide-react', () => ({
  Sun: () => <span data-testid="sun-icon" />,
  Moon: () => <span data-testid="moon-icon" />,
}));

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Initial Render', () => {
    it('renders with light theme by default when no localStorage value', () => {
      render(<Header />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('DistroViz');

      const subtitle = screen.getByText('Dashboard de Distribución');
      expect(subtitle).toBeInTheDocument();

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
    });

    it('renders with dark theme when localStorage contains "dark"', () => {
      localStorage.setItem('theme', 'dark');

      render(<Header />);

      const toggleButton = screen.getByRole('button', {
        name: /Cambiar a modo claro/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it('renders with light theme when localStorage contains "light"', () => {
      localStorage.setItem('theme', 'light');

      render(<Header />);

      const toggleButton = screen.getByRole('button', {
        name: /Cambiar a modo oscuro/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it('defaults to light theme when localStorage has invalid value', () => {
      localStorage.setItem('theme', 'invalid-value');

      render(<Header />);

      const toggleButton = screen.getByRole('button', {
        name: /Cambiar a modo oscuro/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Effect Behavior', () => {
    it('sets data-theme attribute to light by default on mount', () => {
      render(<Header />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('sets data-theme attribute to dark when stored in localStorage', () => {
      localStorage.setItem('theme', 'dark');

      render(<Header />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('sets localStorage theme to light by default', () => {
      render(<Header />);

      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('keeps localStorage theme as dark when already set', () => {
      localStorage.setItem('theme', 'dark');

      render(<Header />);

      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('updates data-theme attribute when effect re-runs', () => {
      const { rerender } = render(<Header />);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      localStorage.setItem('theme', 'dark');
      rerender(<Header />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Theme Toggle', () => {
    it('toggles theme from light to dark on button click', async () => {
      render(<Header />);
      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('toggles theme from dark to light on button click', async () => {
      localStorage.setItem('theme', 'dark');
      const { rerender } = render(<Header />);

      rerender(<Header />);
      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('updates button aria-label when toggling to dark', async () => {
      render(<Header />);
      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      expect(
        screen.getByRole('button', { name: /Cambiar a modo claro/i })
      ).toBeInTheDocument();
    });

    it('updates button aria-label when toggling to light', async () => {
      localStorage.setItem('theme', 'dark');
      const { rerender } = render(<Header />);

      rerender(<Header />);
      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      expect(
        screen.getByRole('button', { name: /Cambiar a modo oscuro/i })
      ).toBeInTheDocument();
    });

    it('toggles theme correctly multiple times', async () => {
      render(<Header />);
      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      await act(async () => {
        fireEvent.click(button);
      });
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      await act(async () => {
        fireEvent.click(button);
      });
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Icon Rendering', () => {
    it('displays Moon icon in light mode', () => {
      render(<Header />);

      const moonIcon = screen.getByTestId('moon-icon');
      expect(moonIcon).toBeInTheDocument();
    });

    it('displays Sun icon in dark mode', () => {
      localStorage.setItem('theme', 'dark');
      const { rerender } = render(<Header />);

      rerender(<Header />);

      const sunIcon = screen.getByTestId('sun-icon');
      expect(sunIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('button has correct aria-label in light mode', () => {
      render(<Header />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Cambiar a modo oscuro');
    });

    it('button has correct aria-label in dark mode', () => {
      localStorage.setItem('theme', 'dark');
      const { rerender } = render(<Header />);

      rerender(<Header />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Cambiar a modo claro');
    });

    it('button is focusable', () => {
      render(<Header />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Header Structure', () => {
    it('renders header element', () => {
      const { container } = render(<Header />);

      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('renders h1 with DistroViz title', () => {
      render(<Header />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('DistroViz');
    });

    it('renders subtitle span with dashboard text', () => {
      render(<Header />);

      const subtitle = screen.getByText('Dashboard de Distribución');
      expect(subtitle).toBeInTheDocument();
    });

    it('contains toggle button as a separate element', () => {
      const { container } = render(<Header />);

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(1);
    });
  });

  describe('Clean Up', () => {
    it('removes data-theme attribute after unmount', () => {
      const { unmount } = render(<Header />);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      unmount();

      document.documentElement.removeAttribute('data-theme');
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });
  });
});
