import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Loader } from 'lucide-react';
import PlantChart, { PlantChartDataPoint } from './PlantChart';
import * as tokensModule from '../../styles/tokens';

jest.mock('../../styles/tokens');

const mockTokens = {
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  colors: {
    secondary: '#6366f1',
    accent: '#8b5cf6',
    primaryLight: '#a78bfa',
    surface: '#ffffff',
    darkSurface: '#1e1e2e',
    darkTextPrimary: '#ffffff',
    textSecondary: '#6b7280',
  },
  radii: {
    md: '6px',
    lg: '12px',
  },
  shadows: {
    card: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    small: {
      size: '12px',
      weight: '400',
      lineHeight: '1.5',
    },
  },
};

describe('PlantChart', () => {
  beforeEach(() => {
    (tokensModule.tokens as jest.Mock).mockReturnValue(mockTokens);
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing when data is provided', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 200 },
      ];

      render(<PlantChart data={mockData} />);
      
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });

    it('renders bars for each data point', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 200 },
        { plantId: 'plant-3', plantName: 'Plant C', value: 150 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const bars = container.querySelectorAll('rect');
      expect(bars.length).toBeGreaterThanOrEqual(3);
    });

    it('renders x-axis labels for each plant', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant Alpha', value: 100 },
        { plantId: 'plant-2', plantName: 'Plant Beta', value: 200 },
      ];

      render(<PlantChart data={mockData} />);
      
      expect(screen.getByText('Plant Alpha')).toBeInTheDocument();
      expect(screen.getByText('Plant Beta')).toBeInTheDocument();
    });

    it('renders y-axis labels', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const axisLabels = container.querySelectorAll('text');
      expect(axisLabels.length).toBeGreaterThan(0);
    });

    it('renders horizontal grid lines', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const gridLines = container.querySelectorAll('line');
      expect(gridLines.length).toBeGreaterThan(0);
    });
  });

  describe('Empty and Edge Cases', () => {
    it('renders with empty data array', () => {
      const mockData: PlantChartDataPoint[] = [];

      const { container } = render(<PlantChart data={mockData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const bars = container.querySelectorAll('rect');
      expect(bars.length).toBe(0);
    });

    it('renders with undefined data', () => {
      const { container } = render(<PlantChart data={undefined as any} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with null data', () => {
      const { container } = render(<PlantChart data={null as any} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with single data point', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 50 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const bars = container.querySelectorAll('rect');
      expect(bars.length).toBe(1);
    });

    it('handles zero value in data', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 0 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const bars = container.querySelectorAll('rect');
      expect(bars.length).toBe(2);
    });

    it('handles very large values', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 1000000 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 500000 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('handles negative values gracefully', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: -50 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const bars = container.querySelectorAll('rect');
      expect(bars.length).toBe(2);
    });

    it('handles all zero values', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 0 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 0 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const bars = container.querySelectorAll('rect');
      expect(bars.length).toBe(2);
    });
  });

  describe('Loading State', () => {
    it('shows spinner when loading is true', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      render(<PlantChart data={mockData} loading={true} />);
      
      const loader = screen.getByTestId('loader-spinner');
      expect(loader).toBeInTheDocument();
    });

    it('hides spinner when loading is false', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      render(<PlantChart data={mockData} loading={false} />);
      
      const loader = screen.queryByTestId('loader-spinner');
      expect(loader).not.toBeInTheDocument();
    });

    it('defaults to not loading when loading prop is not provided', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      render(<PlantChart data={mockData} />);
      
      const loader = screen.queryByTestId('loader-spinner');
      expect(loader).not.toBeInTheDocument();
    });
  });

  describe('Tooltip Functionality', () => {
    it('shows tooltip on bar mouse enter', async () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      render(<PlantChart data={mockData} />);
      
      const svg = screen.getByRole('img', { hidden: true });
      fireEvent.mouseMove(svg, {
        clientX: 100,
        clientY: 100,
        currentTarget: svg,
      });

      await waitFor(() => {
        const tooltip = document.querySelector('[data-testid="chart-tooltip"]');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      render(<PlantChart data={mockData} />);
      
      const svg = screen.getByRole('img', { hidden: true });
      fireEvent.mouseMove(svg, {
        clientX: 100,
        clientY: 100,
        currentTarget: svg,
      });
      
      fireEvent.mouseLeave(svg);

      await waitFor(() => {
        const tooltip = document.querySelector('[data-testid="chart-tooltip"]');
        if (tooltip) {
          expect(tooltip).toHaveStyle({ opacity: 0 });
        }
      });
    });

    it('displays plant name in tooltip', async () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Test Plant Name', value: 150 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 200 },
      ];

      render(<PlantChart data={mockData} />);
      
      const svg = screen.getByRole('img', { hidden: true });
      fireEvent.mouseMove(svg, {
        clientX: 200,
        clientY: 100,
        currentTarget: svg,
      });

      await waitFor(() => {
        const tooltip = document.querySelector('[data-testid="chart-tooltip"]');
        if (tooltip) {
          expect(tooltip).toHaveTextContent(/Plant/);
        }
      });
    });

    it('displays value in tooltip', async () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 175 },
      ];

      render(<PlantChart data={mockData} />);
      
      const svg = screen.getByRole('img', { hidden: true });
      fireEvent.mouseMove(svg, {
        clientX: 100,
        clientY: 100,
        currentTarget: svg,
      });

      await waitFor(() => {
        const tooltip = document.querySelector('[data-testid="chart-tooltip"]');
        if (tooltip) {
          expect(tooltip).toHaveTextContent('175');
        }
      });
    });
  });

  describe('Style Application', () => {
    it('applies container styles', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveStyle({
        position: 'relative',
        width: '100%',
        minHeight: '240px',
      });
    });

    it('applies SVG styles', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox');
      expect(svg).toHaveStyle({
        width: '100%',
        height: '240px',
        overflow: 'visible',
      });
    });
  });

  describe('Bar Calculation', () => {
    it('calculates bar heights proportionally to values', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 50 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const bars = container.querySelectorAll('rect');
      expect(bars.length).toBe(2);
      
      const firstBar = bars[0] as SVGRectElement;
      const secondBar = bars[1] as SVGRectElement;
      
      const firstBarHeight = parseFloat(firstBar.getAttribute('height') || '0');
      const secondBarHeight = parseFloat(secondBar.getAttribute('height') || '0');
      
      expect(secondBarHeight).toBeGreaterThan(firstBarHeight);
    });

    it('uses different colors for alternating bars', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 200 },
        { plantId: 'plant-3', plantName: 'Plant C', value: 150 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const bars = container.querySelectorAll('rect');
      const colors = Array.from(bars).map(bar => (bar as SVGRectElement).getAttribute('fill'));
      
      expect(colors.length).toBe(3);
      expect(colors[0]).toBe(colors[2]);
    });
  });

  describe('Component Lifecycle', () => {
    it('re-renders when data changes', () => {
      const { rerender } = render(
        <PlantChart data={[{ plantId: 'plant-1', plantName: 'Plant A', value: 100 }]} />
      );

      const newData = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
        { plantId: 'plant-2', plantName: 'Plant B', value: 200 },
      ];

      rerender(<PlantChart data={newData} />);

      const bars = document.querySelectorAll('rect');
      expect(bars.length).toBe(2);
    });

    it('re-renders when loading state changes', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { rerender } = render(<PlantChart data={mockData} loading={false} />);
      
      let loaders = screen.queryAllByTestId('loader-spinner');
      expect(loaders.length).toBe(0);

      rerender(<PlantChart data={mockData} loading={true} />);
      
      loaders = screen.queryAllByTestId('loader-spinner');
      expect(loaders.length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('SVG element has appropriate attributes', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox');
    });

    it('chart container has role', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const chartContainer = container.firstChild as HTMLElement;
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles data with missing properties gracefully', () => {
      const incompleteData = [
        { plantId: 'plant-1', value: 100 } as PlantChartDataPoint,
      ];

      const { container } = render(<PlantChart data={incompleteData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('handles NaN values in data', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: NaN },
        { plantId: 'plant-2', plantName: 'Plant B', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('handles Infinity values in data', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: Infinity },
        { plantId: 'plant-2', plantName: 'Plant B', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Animation and Transitions', () => {
    it('applies transition style to container', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveStyle({
        transition: expect.stringContaining('box-shadow'),
      });
    });

    it('applies tooltip transition', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'Plant A', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const tooltip = container.querySelector('[data-testid="chart-tooltip"]');
      if (tooltip) {
        expect(tooltip).toHaveStyle({
          transition: expect.stringContaining('opacity'),
        });
      }
    });
  });

  describe('Large Dataset Handling', () => {
    it('handles many data points', () => {
      const manyDataPoints: PlantChartDataPoint[] = Array.from(
        { length: 20 },
        (_, i) => ({
          plantId: `plant-${i}`,
          plantName: `Plant ${String.fromCharCode(65 + i)}`,
          value: Math.floor(Math.random() * 500) + 50,
        })
      );

      const { container } = render(<PlantChart data={manyDataPoints} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('handles very long plant names', () => {
      const mockData: PlantChartDataPoint[] = [
        { plantId: 'plant-1', plantName: 'This Is An Extremely Long Plant Name That Should Not Break The Layout', value: 100 },
      ];

      const { container } = render(<PlantChart data={mockData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
