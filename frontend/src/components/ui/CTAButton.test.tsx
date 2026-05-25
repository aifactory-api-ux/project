import { render, screen, fireEvent } from '@testing-library/react';
import CTAButton from './CTAButton';
import { tokens } from '../../styles/tokens';

jest.mock('../../styles/tokens', () => ({
  tokens: {
    spacing: {
      sm: '8px',
      lg: '16px',
    },
    colors: {
      primary: '#0066CC',
      primaryLight: '#0052A3',
      surface: '#FFFFFF',
    },
    radii: {
      full: '9999px',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      body: {
        size: '14px',
        lineHeight: '1.5',
      },
    },
  },
}));

describe('CTAButton', () => {
  const defaultProps = {
    children: 'Click Me',
  };

  describe('Rendering', () => {
    it('renders with children content', () => {
      render(<CTAButton {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });

    it('renders as a button element', () => {
      const { container } = render(<CTAButton {...defaultProps} />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('renders children of different types', () => {
      const { rerender } = render(<CTAButton>Text Child</CTAButton>);
      expect(screen.getByText('Text Child')).toBeInTheDocument();

      rerender(
        <CTAButton>
          <span data-testid="icon">🔘</span>
          <span data-testid="text">Icon Button</span>
        </CTAButton>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('has default type of "button"', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('is not disabled by default', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('does not have fullWidth by default', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).not.toHaveStyle({ width: '100%' });
    });
  });

  describe('Type Prop', () => {
    it('renders as submit type when specified', () => {
      render(<CTAButton {...defaultProps} type="submit" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders as reset type when specified', () => {
      render(<CTAButton {...defaultProps} type="reset" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<CTAButton {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('is not disabled when disabled prop is false', () => {
      render(<CTAButton {...defaultProps} disabled={false} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<CTAButton {...defaultProps} onClick={handleClick} disabled={true} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not change background on mouseEnter when disabled', () => {
      render(<CTAButton {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(button).toHaveStyle({ backgroundColor: tokens.colors.primary });
    });

    it('does not change background on mouseLeave when disabled', () => {
      render(<CTAButton {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      fireEvent.mouseLeave(button);
      expect(button).toHaveStyle({ backgroundColor: tokens.colors.primary });
    });
  });

  describe('FullWidth Prop', () => {
    it('has full width when fullWidth is true', () => {
      render(<CTAButton {...defaultProps} fullWidth={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: '100%' });
    });

    it('does not have full width when fullWidth is false', () => {
      render(<CTAButton {...defaultProps} fullWidth={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: 'auto' });
    });
  });

  describe('OnClick Handler', () => {
    it('calls onClick when clicked and not disabled', () => {
      const handleClick = jest.fn();
      render(<CTAButton {...defaultProps} onClick={handleClick} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<CTAButton {...defaultProps} onClick={handleClick} disabled={true} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('calls onClick with event when clicked', () => {
      const handleClick = jest.fn();
      render(<CTAButton {...defaultProps} onClick={handleClick} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('allows multiple clicks to trigger onClick', () => {
      const handleClick = jest.fn();
      render(<CTAButton {...defaultProps} onClick={handleClick} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Hover Behavior', () => {
    it('changes background color on mouseEnter when not disabled', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(button).toHaveStyle({ backgroundColor: tokens.colors.primaryLight });
    });

    it('reverts background color on mouseLeave when not disabled', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      expect(button).toHaveStyle({ backgroundColor: tokens.colors.primary });
    });

    it('maintains hover effect after multiple hover cycles', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      expect(button).toHaveStyle({ backgroundColor: tokens.colors.primaryLight });
      
      fireEvent.mouseLeave(button);
      expect(button).toHaveStyle({ backgroundColor: tokens.colors.primary });
      
      fireEvent.mouseEnter(button);
      expect(button).toHaveStyle({ backgroundColor: tokens.colors.primaryLight });
    });
  });

  describe('Focus Behavior', () => {
    it('adds outline on focus when not disabled', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      expect(button).toHaveStyle({
        outline: `2px solid ${tokens.colors.primaryLight}`,
        outlineOffset: '2px',
      });
    });

    it('removes outline on blur', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      fireEvent.blur(button);
      expect(button).toHaveStyle({ outline: 'none' });
    });

    it('maintains focus styles after focus/blur cycles', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      
      fireEvent.focus(button);
      expect(button).toHaveStyle({
        outline: `2px solid ${tokens.colors.primaryLight}`,
      });
      
      fireEvent.blur(button);
      expect(button).toHaveStyle({ outline: 'none' });
      
      fireEvent.focus(button);
      expect(button).toHaveStyle({
        outline: `2px solid ${tokens.colors.primaryLight}`,
      });
    });
  });

  describe('Cursor Behavior', () => {
    it('has pointer cursor when not disabled', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ cursor: 'pointer' });
    });

    it('has not-allowed cursor when disabled', () => {
      render(<CTAButton {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ cursor: 'not-allowed' });
    });
  });

  describe('Opacity and PointerEvents', () => {
    it('has full opacity when not disabled', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ opacity: 1 });
    });

    it('has reduced opacity when disabled', () => {
      render(<CTAButton {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ opacity: 0.5 });
    });

    it('has auto pointerEvents when not disabled', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ pointerEvents: 'auto' });
    });

    it('has none pointerEvents when disabled', () => {
      render(<CTAButton {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ pointerEvents: 'none' });
    });
  });

  describe('Styling Properties', () => {
    it('applies correct display and alignment styles', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });

    it('applies correct padding styles', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
      });
    });

    it('applies correct color styles', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        backgroundColor: tokens.colors.primary,
        color: tokens.colors.surface,
      });
    });

    it('applies correct border styles', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ border: 'none' });
    });

    it('applies correct border radius', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ borderRadius: tokens.radii.full });
    });

    it('applies correct typography styles', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.size,
        fontWeight: 600,
        lineHeight: tokens.typography.body.lineHeight,
      });
    });

    it('applies transition effect', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ transition: 'background-color 300ms' });
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty children', () => {
      render(<CTAButton>{}</CTAButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders with null children', () => {
      render(<CTAButton>{null as unknown as React.ReactNode}</CTAButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles rapid click events', () => {
      const handleClick = jest.fn();
      render(<CTAButton {...defaultProps} onClick={handleClick} />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('handles simultaneous mouse events', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      fireEvent.focus(button);
      
      expect(button).toHaveStyle({ backgroundColor: tokens.colors.primaryLight });
      expect(button).toHaveStyle({
        outline: `2px solid ${tokens.colors.primaryLight}`,
      });
    });

    it('handles nested interactive elements gracefully', () => {
      render(
        <CTAButton {...defaultProps}>
          <span>Outer</span>
          <button data-testid="inner">Inner</button>
        </CTAButton>
      );
      const button = screen.getByRole('button');
      const innerButton = screen.getByTestId('inner');
      
      expect(button).toBeInTheDocument();
      expect(innerButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('is focusable by default', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<CTAButton {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('can receive focus via fireEvent', () => {
      render(<CTAButton {...defaultProps} />);
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      expect(button).toHaveFocus();
    });
  });

  describe('All Props Combinations', () => {
    it('works with all props set simultaneously', () => {
      const handleClick = jest.fn();
      render(
        <CTAButton
          type="submit"
          disabled={false}
          fullWidth={true}
          onClick={handleClick}
        >
          Full Props Button
        </CTAButton>
      );
      
      const button = screen.getByRole('button', { name: 'Full Props Button' });
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).not.toBeDisabled();
      expect(button).toHaveStyle({ width: '100%' });
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('works with only required props (children)', () => {
      const { rerender } = render(<CTAButton>Test</CTAButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveStyle({ width: 'auto' });
      expect(button).toHaveStyle({ cursor: 'pointer' });
      expect(button).toHaveStyle({ opacity: 1 });
      
      rerender(<CTAButton>Updated Test</CTAButton>);
      expect(screen.getByRole('button', { name: 'Updated Test' })).toBeInTheDocument();
    });
  });
});
