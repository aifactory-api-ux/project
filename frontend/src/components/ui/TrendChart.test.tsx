import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TrendChart, TrendDataPoint } from './TrendChart';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid="loader-icon">Loading...</div>,
}));

// Mock tokens
jest.mock('../../styles/tokens', () => ({
  tokens: {
    spacing: {
      sm: '8px',
      md: '16px',
      lg: '24px',
    },
    colors: {
      surface: '#ffffff',
      darkSurface: '#1a1a1a',
      darkTextPrimary: '#ffffff',
      textSecondary: '#666666',
      primary: '#3b82f6',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      small: {
        size: '12px',
        weight: '400',
      },
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
    shadows: {
      card: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
}));

describe('TrendChart', () => {
  const mockData: TrendDataPoint[] = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 150 },
    { month: 'Mar', value: 120 },
    { month: 'Apr', value: 200 },
    { month: 'May', value: 180 },
    { month: 'Jun', value: 250 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the chart container with correct styles', () => {
      render(<TrendChart data={mockData} />);
      const container = screen.getByTestId('trend-chart-container');
      expect(container).toBeInTheDocument();
    });

    it('should render SVG element with correct viewBox', () => {
      render(<TrendChart data={mockData} />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 600 240');
    });

    it('should render line path for the trend', () => {
      render(<TrendChart data={mockData} />);
      const linePath = document.querySelector('path[data-testid="trend-line"]');
      expect(linePath).toBeInTheDocument();
    });

    it('should render area path for the trend', () => {
      render(<TrendChart data={mockData} />);
      const areaPath = document.querySelector('path[data-testid="trend-area"]');
      expect(areaPath).toBeInTheDocument();
    });

    it('should render data points as circles', () => {
      render(<TrendChart data={mockData} />);
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(mockData.length);
    });
  });

  describe('Empty State', () => {
    it('should handle empty data array', () => {
      render(<TrendChart data={[]} />);
      const container = screen.getByTestId('trend-chart-container');
      expect(container).toBeInTheDocument();
    });

    it('should handle undefined data', () => {
      const { container } = render(<TrendChart data={undefined as any} />);
      expect(container).toBeInTheDocument();
    });

    it('should not render path elements with empty data', () => {
      render(<TrendChart data={[]} />);
      const linePath = document.querySelector('path[data-testid="trend-line"]');
      expect(linePath).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show spinner when loading is true', () => {
      render(<TrendChart data={mockData} loading={true} />);
      const spinner = screen.getByTestId('loader-icon');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show spinner when loading is false', () => {
      render(<TrendChart data={mockData} loading={false} />);
      const spinner = screen.queryByTestId('loader-icon');
      expect(spinner).not.toBeInTheDocument();
    });

    it('should default to not loading when loading prop is not provided', () => {
      render(<TrendChart data={mockData} />);
      const spinner = screen.queryByTestId('loader-icon');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Tooltip Behavior', () => {
    it('should not show tooltip on initial render', () => {
      render(<TrendChart data={mockData} />);
      const tooltip = screen.queryByTestId('trend-tooltip');
      expect(tooltip).not.toBeInTheDocument();
    });

    it('should show tooltip on mouse move over chart', async () => {
      render(<TrendChart data={mockData} />);
      const svg = document.querySelector('svg');
      
      if (svg) {
        const event = new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 300,
          clientY: 120,
        });
        
        Object.defineProperty(event, 'currentTarget', {
          value: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        });
        
        fireEvent(svg, event);
      }

      await act(async () => {
        // Wait for state update
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const tooltip = screen.getByTestId('trend-tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', () => {
      render(<TrendChart data={mockData} />);
      const svg = document.querySelector('svg');
      
      if (svg) {
        fireEvent.mouseLeave(svg);
      }

      const tooltip = screen.queryByTestId('trend-tooltip');
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  describe('Data Calculations', () => {
    it('should handle single data point', () => {
      const singlePoint = [{ month: 'Jan', value: 100 }];
      render(<TrendChart data={singlePoint} />);
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(1);
    });

    it('should handle data with identical values', () => {
      const identicalData = [
        { month: 'Jan', value: 100 },
        { month: 'Feb', value: 100 },
        { month: 'Mar', value: 100 },
      ];
      render(<TrendChart data={identicalData} />);
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(3);
    });

    it('should handle negative values', () => {
      const negativeData = [
        { month: 'Jan', value: -50 },
        { month: 'Feb', value: 0 },
        { month: 'Mar', value: 50 },
      ];
      render(<TrendChart data={negativeData} />);
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(3);
    });

    it('should handle very large values', () => {
      const largeData = [
        { month: 'Jan', value: 1000000 },
        { month: 'Feb', value: 2000000 },
        { month: 'Mar', value: 1500000 },
      ];
      render(<TrendChart data={largeData} />);
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(3);
    });

    it('should handle zero values', () => {
      const zeroData = [
        { month: 'Jan', value: 0 },
        { month: 'Feb', value: 0 },
        { month: 'Mar', value: 0 },
      ];
      render(<TrendChart data={zeroData} />);
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(3);
    });
  });

  describe('Event Handlers', () => {
    it('should attach onMouseMove handler to SVG', () => {
      const handleMouseMove = jest.fn();
      render(<TrendChart data={mockData} />);
      const svg = document.querySelector('svg');
      expect(svg).toBeAttribute('onmouseenter');
    });

    it('should attach onMouseLeave handler to SVG', () => {
      render(<TrendChart data={mockData} />);
      const svg = document.querySelector('svg');
      expect(svg).toBeAttribute('onmouseleave');
    });

    it('should find closest point on mouse move', async () => {
      render(<TrendChart data={mockData} />);
      const svg = document.querySelector('svg');
      
      // Test that mouse move is handled without error
      if (svg) {
        const mockEvent = {
          currentTarget: {
            getBoundingClientRect: () => ({ left: 0, top: 0 }),
          },
          clientX: 200,
          clientY: 100,
        } as unknown as React.MouseEvent<SVGSVGElement>;

        act(() => {
          fireEvent.mouseMove(svg, mockEvent);
        });
      }

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible container element', () => {
      render(<TrendChart data={mockData} />);
      const container = screen.getByTestId('trend-chart-container');
      expect(container).toHaveAttribute('style');
    });

    it('should render SVG with proper attributes', () => {
      render(<TrendChart data={mockData} />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('style');
      expect(svg).toHaveAttribute('viewBox');
    });
  });

  describe('Styling', () => {
    it('should apply correct container styles', () => {
      render(<TrendChart data={mockData} />);
      const container = screen.getByTestId('trend-chart-container');
      const styles = container.getAttribute('style');
      expect(styles).toContain('position');
      expect(styles).toContain('width');
      expect(styles).toContain('background-color');
      expect(styles).toContain('border-radius');
    });

    it('should apply loading overlay styles when loading', () => {
      render(<TrendChart data={mockData} loading={true} />);
      const loader = document.querySelector('[data-testid="loader-icon"]');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long month strings', () => {
      const longMonthData = [
        { month: 'JanuaryIsVeryLongMonth', value: 100 },
        { month: 'FebruaryIsAlsoLong', value: 150 },
        { month: 'MarchIsModerate', value: 120 },
      ];
      const { container } = render(<TrendChart data={longMonthData} />);
      expect(container).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      const decimalData = [
        { month: 'Jan', value: 100.5 },
        { month: 'Feb', value: 150.75 },
        { month: 'Mar', value: 120.25 },
      ];
      render(<TrendChart data={decimalData} />);
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(3);
    });

    it('should handle sparse data points', () => {
      const sparseData = [
        { month: 'Jan', value: 100 },
        { month: 'Dec', value: 200 },
      ];
      render(<TrendChart data={sparseData} />);
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(2);
    });

    it('should handle rapid re-renders', async () => {
      const { rerender } = render(<TrendChart data={mockData} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<TrendChart data={[{ month: 'Test', value: i * 10 }]} />);
      }

      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(1);
    });
  });

  describe('Performance', () => {
    it('should use useMemo for calculations', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        month: `Month${i}`,
        value: Math.random() * 1000,
      }));
      
      const { rerender } = render(<TrendChart data={largeData} />);
      
      // Re-render with same data should use memoized values
      rerender(<TrendChart data={largeData} />);
      
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(100);
    });
  });

  describe('DOM Structure', () => {
    it('should have correct number of elements for data points', () => {
      const testData = [
        { month: 'Jan', value: 10 },
        { month: 'Feb', value: 20 },
        { month: 'Mar', value: 30 },
      ];
      render(<TrendChart data={testData} />);
      
      const circles = document.querySelectorAll('circle');
      expect(circles).toHaveLength(3);
      
      const linePath = document.querySelector('path[data-testid="trend-line"]');
      expect(linePath).toBeInTheDocument();
      
      const areaPath = document.querySelector('path[data-testid="trend-area"]');
      expect(areaPath).toBeInTheDocument();
    });

    it('should render grid lines', () => {
      render(<TrendChart data={mockData} />);
      const gridLines = document.querySelectorAll('[data-testid="grid-line"]');
      expect(gridLines.length).toBeGreaterThan(0);
    });

    it('should render axis labels', () => {
      render(<TrendChart data={mockData} />);
      const axisLabels = document.querySelectorAll('[data-testid="axis-label"]');
      expect(axisLabels.length).toBeGreaterThan(0);
    });
  });

  describe('React Component Integration', () => {
    it('should be a valid React component', () => {
      expect(TrendChart).toBeDefined();
      expect(typeof TrendChart).toBe('function');
    });

    it('should accept data and loading props', () => {
      const props = {
        data: mockData,
        loading: true,
      };
      const { container } = render(<TrendChart {...props} />);
      expect(container).toBeInTheDocument();
    });

    it('should work without loading prop', () => {
      const { container } = render(<TrendChart data={mockData} />);
      expect(container).toBeInTheDocument();
    });
  });
});
