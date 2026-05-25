import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KpiCard from '../../components/ui/KpiCard';
import { Package, TrendingUp, DollarSign, Loader } from 'lucide-react';
import { tokens } from '../../styles/tokens';

// Mock the tokens module to have full control over design tokens
jest.mock('../../styles/tokens', () => ({
  tokens: {
    colors: {
      surface: '#ffffff',
      accent: '#3b82f6',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
    },
    radii: {
      lg: '12px',
    },
    spacing: {
      md: '16px',
      sm: '8px',
    },
    shadows: {
      card: '0 1px 3px rgba(0,0,0,0.12)',
      cardHover: '0 4px 12px rgba(0,0,0,0.15)',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      kpiValue: {
        size: '32px',
        weight: 700,
        lineHeight: 1.25,
      },
      kpiLabel: {
        size: '14px',
        weight: 500,
        lineHeight: 1.4,
      },
    },
  },
}));

describe('KpiCard Component', () => {
  const defaultProps = {
    label: 'Total Deliveries',
    value: 150,
    icon: Package,
  };

  describe('Rendering', () => {
    it('renders the KpiCard component without crashing', () => {
      render(<KpiCard {...defaultProps} />);
      expect(screen.getByTestId('kpi-card')).toBeInTheDocument();
    });

    it('renders the label text correctly', () => {
      render(<KpiCard {...defaultProps} />);
      expect(screen.getByText('Total Deliveries')).toBeInTheDocument();
    });

    it('renders numeric value correctly', () => {
      render(<KpiCard {...defaultProps} />);
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('renders string value correctly', () => {
      render(<KpiCard {...defaultProps} value="1,234" />);
      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('renders large numeric values correctly', () => {
      render(<KpiCard {...defaultProps} value={999999999} />);
      expect(screen.getByText('999999999')).toBeInTheDocument();
    });

    it('renders zero value correctly', () => {
      render(<KpiCard {...defaultProps} value={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders negative numeric values correctly', () => {
      render(<KpiCard {...defaultProps} value={-50} />);
      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('renders empty string value correctly', () => {
      render(<KpiCard {...defaultProps} value="" />);
      expect(screen.getByText('')).toBeInTheDocument();
    });

    it('renders empty label correctly', () => {
      render(<KpiCard {...defaultProps} label="" />);
      expect(screen.getByText('')).toBeInTheDocument();
    });

    it('renders special characters in label correctly', () => {
      render(<KpiCard {...defaultProps} label="Revenue ($)" />);
      expect(screen.getByText('Revenue ($)')).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('renders the icon when not loading', () => {
      render(<KpiCard {...defaultProps} />);
      const iconElement = screen.getByTestId('kpi-card-icon');
      expect(iconElement).toBeInTheDocument();
    });

    it('renders different icon types correctly', () => {
      const { rerender } = render(<KpiCard {...defaultProps} icon={TrendingUp} />);
      expect(screen.getByTestId('kpi-card-icon')).toBeInTheDocument();

      rerender(<KpiCard {...defaultProps} icon={DollarSign} />);
      expect(screen.getByTestId('kpi-card-icon')).toBeInTheDocument();
    });

    it('applies custom icon color correctly', () => {
      render(<KpiCard {...defaultProps} iconColor="#ff5722" />);
      const iconElement = screen.getByTestId('kpi-card-icon');
      expect(iconElement).toHaveStyle({ color: '#ff5722' });
    });

    it('applies default accent color when iconColor is not specified', () => {
      render(<KpiCard {...defaultProps} />);
      const iconElement = screen.getByTestId('kpi-card-icon');
      expect(iconElement).toHaveStyle({ color: tokens.colors.accent });
    });

    it('accepts hex color format for iconColor', () => {
      render(<KpiCard {...defaultProps} iconColor="#000000" />);
      const iconElement = screen.getByTestId('kpi-card-icon');
      expect(iconElement).toHaveStyle({ color: '#000000' });
    });

    it('accepts rgb color format for iconColor', () => {
      render(<KpiCard {...defaultProps} iconColor="rgb(255, 0, 0)" />);
      const iconElement = screen.getByTestId('kpi-card-icon');
      expect(iconElement).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });
  });

  describe('Loading State', () => {
    it('renders loader icon when loading is true', () => {
      render(<KpiCard {...defaultProps} loading={true} />);
      const loaderElement = screen.getByTestId('kpi-card-loader');
      expect(loaderElement).toBeInTheDocument();
    });

    it('does not render the icon when loading is true', () => {
      render(<KpiCard {...defaultProps} loading={true} />);
      expect(screen.queryByTestId('kpi-card-icon')).not.toBeInTheDocument();
    });

    it('displays placeholder text when loading is true', () => {
      render(<KpiCard {...defaultProps} loading={true} />);
      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('does not display actual value when loading is true', () => {
      render(<KpiCard {...defaultProps} value={150} loading={true} />);
      expect(screen.queryByText('150')).not.toBeInTheDocument();
    });

    it('renders label even when loading is true', () => {
      render(<KpiCard {...defaultProps} loading={true} />);
      expect(screen.getByText('Total Deliveries')).toBeInTheDocument();
    });

    it('renders loader with correct color', () => {
      render(<KpiCard {...defaultProps} loading={true} iconColor="#ff0000" />);
      const loaderElement = screen.getByTestId('kpi-card-loader');
      expect(loaderElement).toHaveStyle({ color: '#ff0000' });
    });

    it('renders in non-loading state when loading is false', () => {
      render(<KpiCard {...defaultProps} loading={false} />);
      expect(screen.getByTestId('kpi-card-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('kpi-card-loader')).not.toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('defaults to non-loading state when loading prop is omitted', () => {
      render(<KpiCard {...defaultProps} />);
      expect(screen.getByTestId('kpi-card-icon')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  describe('Hover State', () => {
    it('has default shadow on initial render', () => {
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');
      expect(cardElement).toHaveStyle({ boxShadow: tokens.shadows.card });
    });

    it('updates shadow style on hover', async () => {
      const user = userEvent.setup();
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      await user.hover(cardElement);
      expect(cardElement).toHaveStyle({ boxShadow: tokens.shadows.cardHover });
    });

    it('restores default shadow after mouse leave', async () => {
      const user = userEvent.setup();
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      await user.hover(cardElement);
      expect(cardElement).toHaveStyle({ boxShadow: tokens.shadows.cardHover });

      await user.unhover(cardElement);
      expect(cardElement).toHaveStyle({ boxShadow: tokens.shadows.card });
    });

    it('maintains hover state during multiple hover interactions', async () => {
      const user = userEvent.setup();
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      await user.hover(cardElement);
      await user.unhover(cardElement);
      await user.hover(cardElement);


      expect(cardElement).toHaveStyle({ boxShadow: tokens.shadows.cardHover });
    });

    it('handles rapid hover/unhover transitions', async () => {
      const user = userEvent.setup();
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      await user.hover(cardElement);
      await user.unhover(cardElement);

      expect(cardElement).toHaveStyle({ boxShadow: tokens.shadows.card });
    });

    it('preserves value display during hover', async () => {
      const user = userEvent.setup();
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      await user.hover(cardElement);
      expect(screen.getByText('150')).toBeInTheDocument();

      await user.unhover(cardElement);
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  describe('Typography Styling', () => {
    it('applies correct font styles to value element', () => {
      render(<KpiCard {...defaultProps} />);
      const valueElement = screen.getByTestId('kpi-card-value');

      expect(valueElement).toHaveStyle({
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.kpiValue.size,
        fontWeight: tokens.typography.kpiValue.weight,
        lineHeight: tokens.typography.kpiValue.lineHeight,
      });
    });

    it('applies correct text color to value element', () => {
      render(<KpiCard {...defaultProps} />);
      const valueElement = screen.getByTestId('kpi-card-value');

      expect(valueElement).toHaveStyle({ color: tokens.colors.textPrimary });
    });

    it('applies correct font styles to label element', () => {
      render(<KpiCard {...defaultProps} />);
      const labelElement = screen.getByTestId('kpi-card-label');

      expect(labelElement).toHaveStyle({
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.kpiLabel.size,
        fontWeight: tokens.typography.kpiLabel.weight,
        lineHeight: tokens.typography.kpiLabel.lineHeight,
      });
    });

    it('applies correct text color to label element', () => {
      render(<KpiCard {...defaultProps} />);
      const labelElement = screen.getByTestId('kpi-card-label');

      expect(labelElement).toHaveStyle({ color: tokens.colors.textSecondary });
    });
  });

  describe('Layout Styling', () => {
    it('applies correct container styles', () => {
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      expect(cardElement).toHaveStyle({
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.radii.lg,
        padding: tokens.spacing.md,
        display: 'flex',
        flexDirection: 'column',
      });
    });

    it('applies correct gap spacing', () => {
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      expect(cardElement).toHaveStyle({ gap: tokens.spacing.sm });
    });

    it('applies transition style for hover effect', () => {
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      expect(cardElement).toHaveStyle({ transition: 'box-shadow 300ms ease' });
    });

    it('applies minimum width constraint', () => {
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      expect(cardElement).toHaveStyle({ minWidth: '200px' });
    });
  });

  describe('Event Handlers', () => {
    it('handles onMouseEnter event', () => {
      const onMouseEnter = jest.fn();
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');


      cardElement.onmouseenter = onMouseEnter;
      userEvent.hover(cardElement);

      expect(onMouseEnter).toHaveBeenCalled();
    });

    it('handles onMouseLeave event', () => {
      const onMouseLeave = jest.fn();
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      cardElement.onmouseleave = onMouseLeave;
      userEvent.unhover(cardElement);

      expect(onMouseLeave).toHaveBeenCalled();
    });
  });

  describe('Component Props Combinations', () => {
    it('renders correctly with all optional props provided', () => {
      render(
        <KpiCard
          label="Monthly Revenue"
          value="$12,345"
          icon={DollarSign}
          iconColor="#22c55e"
          loading={false}
        />
      );

      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('$12,345')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-icon')).toBeInTheDocument();
    });

    it('renders correctly with only required props', () => {
      render(<KpiCard label="Count" value={42} icon={Package} />);


      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-icon')).toBeInTheDocument();
    });

    it('renders correctly in loading state with custom icon color', () => {
      render(
        <KpiCard
          label="Active Routes"
          value={25}
          icon={TrendingUp}
          iconColor="#8b5cf6"
          loading={true}
        />
      );

      expect(screen.getByText('Active Routes')).toBeInTheDocument();
      expect(screen.getByText('--')).toBeInTheDocument();
      expect(screen.queryByTestId('kpi-card-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-loader')).toBeInTheDocument();
    });

    it('renders decimal numeric values correctly', () => {
      render(<KpiCard {...defaultProps} value={123.45} />);
      expect(screen.getByText('123.45')).toBeInTheDocument();
    });

    it('renders floating point values correctly', () => {
      render(<KpiCard {...defaultProps} value={3.14159} />);
      expect(screen.getByText('3.14159')).toBeInTheDocument();
    });
  });

  describe('Animation and CSS', () => {
    it('injects spin keyframes animation', () => {
      render(<KpiCard {...defaultProps} loading={true} />);
      const styleElements = document.getElementsByTagName('style');
      let foundSpinAnimation = false;

      for (const style of styleElements) {
        if (style.textContent?.includes('@keyframes spin')) {
          foundSpinAnimation = true;
          break;
        }
      }

      expect(foundSpinAnimation).toBe(true);
    });

    it('includes spin animation in loader style', () => {
      render(<KpiCard {...defaultProps} loading={true} />);
      const styleElements = document.getElementsByTagName('style');
      let foundSpinAnimation = false;

      for (const style of styleElements) {
        if (style.textContent?.includes('animation: spin 1s linear infinite')) {
          foundSpinAnimation = true;
          break;
        }
      }

      expect(foundSpinAnimation).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('renders as a div element', () => {
      render(<KpiCard {...defaultProps} />);
      const cardElement = screen.getByTestId('kpi-card');

      expect(cardElement.tagName).toBe('DIV');
    });

    it('contains both value and label for screen readers', () => {
      render(<KpiCard {...defaultProps} />);

      expect(screen.getByTestId('kpi-card-value')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-card-label')).toBeInTheDocument();
    });

    it('icon wrapper is accessible', () => {
      render(<KpiCard {...defaultProps} />);

      expect(screen.getByTestId('kpi-card-icon')).toBeInTheDocument();
    });
  });
});
