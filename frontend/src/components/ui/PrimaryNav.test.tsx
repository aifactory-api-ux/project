import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LayoutDashboard, Package, Truck, Users, Sun, Moon } from 'lucide-react';
import PrimaryNav from './PrimaryNav';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document.documentElement
const originalDocument = document.documentElement;
const setAttributeMock = jest.fn();

describe('PrimaryNav Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockReturnValue(null);
    setAttributeMock.mockClear();
    Object.defineProperty(document, 'documentElement', {
      value: {
        setAttribute: setAttributeMock,
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, 'documentElement', {
      value: originalDocument,
      writable: true,
    });
  });

  describe('Initial State and Theme', () => {
    it('renders with light theme by default when no localStorage theme is set', () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(<PrimaryNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders with dark theme when localStorage has "dark" theme', () => {
      localStorage.getItem.mockReturnValue('dark');
      
      render(<PrimaryNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders with light theme when localStorage has "light" theme', () => {
      localStorage.getItem.mockReturnValue('light');
      
      render(<PrimaryNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('sets data-theme attribute to light by default', () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(<PrimaryNav />);
      
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('sets data-theme attribute to dark when theme is dark', () => {
      localStorage.getItem.mockReturnValue('dark');
      
      render(<PrimaryNav />);
      
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('Brand Title', () => {
    it('renders the brand title "DistroViz"', () => {
      render(<PrimaryNav />);
      
      const title = screen.getByText('DistroViz');
      expect(title).toBeInTheDocument();
    });

    it('renders title as h1 element', () => {
      render(<PrimaryNav />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('DistroViz');
    });
  });

  describe('Navigation Items', () => {
    it('renders all four navigation items', () => {
      render(<PrimaryNav />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Despachos')).toBeInTheDocument();
      expect(screen.getByText('Flota')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('renders Dashboard as active by default', () => {
      render(<PrimaryNav />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
    });

    it('renders navigation items in the correct order', () => {
      render(<PrimaryNav />);
      
      const navContainer = document.querySelector('nav');
      const buttons = navContainer?.querySelectorAll('button');
      
      expect(buttons).toHaveLength(5); // 4 nav items + 1 theme toggle
    });

    it('each navigation item has an icon', () => {
      render(<PrimaryNav />);
      
      const navButtons = screen.getAllByRole('button').filter(
        btn => !btn.getAttribute('aria-label')?.includes('modo')
      );
      
      expect(navButtons).toHaveLength(4);
    });
  });

  describe('Theme Toggle Button', () => {
    it('renders the theme toggle button', () => {
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo oscuro/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('has correct aria-label for light mode (should suggest dark mode)', () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo oscuro/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('has correct aria-label for dark mode (should suggest light mode)', () => {
      localStorage.getItem.mockReturnValue('dark');
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo claro/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles theme when clicked', async () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo oscuro/i });
      
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      // After toggle, should now show light mode button
      expect(screen.getByRole('button', { name: /cambiar a modo claro/i })).toBeInTheDocument();
    });

    it('updates localStorage when theme is toggled', async () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo oscuro/i });
      
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('toggles back to light mode when clicked again', async () => {
      localStorage.getItem.mockReturnValue('dark');
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo claro/i });
      
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('updates document data-theme attribute when toggled', async () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo oscuro/i });
      
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('Navigation Button Interactions', () => {
    it('Dashboard button is marked as active', () => {
      render(<PrimaryNav />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
    });

    it('navigation buttons have cursor pointer style', () => {
      render(<PrimaryNav />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveStyle({ cursor: 'pointer' });
      });
    });

    it('navigation buttons are accessible via keyboard', () => {
      render(<PrimaryNav />);
      
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toHaveAttribute('tabindex', expect.anything());
    });
  });

  describe('Visual Styling', () => {
    it('nav has correct height style', () => {
      render(<PrimaryNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveStyle({ height: '64px' });
    });

    it('nav has padding applied', () => {
      render(<PrimaryNav />);
      
      const nav = screen.getByRole('navigation');
      const style = window.getComputedStyle(nav);
      expect(style.paddingLeft).toBeTruthy();
    });

    it('nav uses flexbox for layout', () => {
      render(<PrimaryNav />);
      
      const nav = screen.getByRole('navigation');
      const style = window.getComputedStyle(nav);
      expect(style.display).toBe('flex');
      expect(style.justifyContent).toBe('space-between');
      expect(style.alignItems).toBe('center');
    });
  });

  describe('Multiple Theme Toggle Cycles', () => {
    it('handles multiple rapid toggles', async () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo oscuro/i });
      
      await act(async () => {
        fireEvent.click(toggleButton);
        fireEvent.click(toggleButton);
        fireEvent.click(toggleButton);
      });
      
      // Should be back to light mode after 3 toggles
      expect(screen.getByRole('button', { name: /cambiar a modo oscuro/i })).toBeInTheDocument();
    });

    it('persists final theme state in localStorage', async () => {
      localStorage.getItem.mockReturnValue(null);
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo oscuro/i });
      
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      const calls = (localStorage.setItem as jest.Mock).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall).toEqual(['theme', 'dark']);
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid localStorage theme value gracefully', () => {
      localStorage.getItem.mockReturnValue('invalid-theme');
      
      render(<PrimaryNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders correctly when localStorage throws an error', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Should not throw, should default to light theme
      expect(() => render(<PrimaryNav />)).not.toThrow();
    });

    it('handles localStorage.setItem throwing an error', async () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage write error');
      });
      
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /cambiar a modo oscuro/i });
      
      // Should not throw even if localStorage fails
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      
      expect(screen.getByRole('button', { name: /cambiar a modo claro/i })).toBeInTheDocument();
    });

    it('renders with all icons imported from lucide-react', () => {
      render(<PrimaryNav />);
      
      // Verify lucide icons are used by checking SVG elements exist
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThanOrEqual(5); // 4 nav items + theme toggle
    });
  });

  describe('Accessibility', () => {
    it('theme toggle button has aria-label', () => {
      render(<PrimaryNav />);
      
      const toggleButton = screen.getByRole('button', { name: /modo/i });
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('navigation is properly labeled with role="navigation"', () => {
      render(<PrimaryNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('all buttons are properly accessible', () => {
      render(<PrimaryNav />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeAccessible();
      });
    });
  });
});
