import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner from './ErrorBanner';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <span data-testid="alert-icon" />,
  RefreshCw: () => <span data-testid="refresh-icon" />,
}));

describe('ErrorBanner Component', () => {
  const defaultProps = {
    message: 'Test error message',
    visible: true,
  };

  describe('Rendering Conditions', () => {
    it('should return null when visible is false', () => {
      const { container } = render(<ErrorBanner {...defaultProps} visible={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render the banner when visible is true', () => {
      const { container } = render(<ErrorBanner {...defaultProps} visible={true} />);
      expect(container.firstChild).not.toBeNull();
    });

    it('should render with correct role="alert" for accessibility', () => {
      render(<ErrorBanner {...defaultProps} />);
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toBeInTheDocument();
    });

    it('should have aria-live="assertive" for accessibility', () => {
      const { container } = render(<ErrorBanner {...defaultProps} />);
      const alertContainer = container.querySelector('[role="alert"]');
      expect(alertContainer).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Error Message Display', () => {
    it('should display the error message correctly', () => {
      const errorMessage = 'Something went wrong with the API call';
      render(<ErrorBanner {...defaultProps} message={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should render the AlertCircle icon', () => {
      render(<ErrorBanner {...defaultProps} />);
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('should handle empty string message', () => {
      const { container } = render(<ErrorBanner {...defaultProps} message="" />);
      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(500);
      render(<ErrorBanner {...defaultProps} message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Error: <script>alert("xss")</script> & "quotes"';
      render(<ErrorBanner {...defaultProps} message={specialMessage} />);
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorBanner {...defaultProps} onRetry={undefined} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should not render retry button when onRetry is undefined', () => {
      render(<ErrorBanner {...defaultProps} onRetry={undefined as any} />);
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('should render retry button when onRetry is provided', () => {
      render(<ErrorBanner {...defaultProps} onRetry={jest.fn()} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should render retry button with correct aria-label', () => {
      render(<ErrorBanner {...defaultProps} onRetry={jest.fn()} />);
      const retryButton = screen.getByRole('button', { name: 'Retry action' });
      expect(retryButton).toBeInTheDocument();
    });

    it('should render the RefreshCw icon inside retry button', () => {
      render(<ErrorBanner {...defaultProps} onRetry={jest.fn()} />);
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });

    it('should display "Reintentar" text in retry button', () => {
      render(<ErrorBanner {...defaultProps} onRetry={jest.fn()} />);
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry only once per click', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalledTimes(3);
    });

    it('should not call onRetry when retry button is not clicked', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      expect(mockOnRetry).not.toHaveBeenCalled();
    });
  });

  describe('Hover Interactions', () => {
    it('should have mouseEnter handler on retry button', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.mouseEnter(retryButton);
      // Verify element still exists after mouse enter
      expect(retryButton).toBeInTheDocument();
    });

    it('should have mouseLeave handler on retry button', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.mouseLeave(retryButton);
      // Verify element still exists after mouse leave
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle rapid mouse enter/leave events', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      for (let i = 0; i < 5; i++) {
        fireEvent.mouseEnter(retryButton);
        fireEvent.mouseLeave(retryButton);
      }
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Click Interactions', () => {
    it('should handle click on retry button via fireEvent', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent(retryButton, new MouseEvent('click', { bubbles: true }));
      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('should not throw when clicking message area', () => {
      const { container } = render(<ErrorBanner {...defaultProps} />);
      const alertContainer = container.querySelector('[role="alert"]');
      expect(() => {
        fireEvent.click(alertContainer!);
      }).not.toThrow();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should be able to focus retry button with keyboard', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);
    });

    it('should call onRetry when pressing Enter on retry button', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.keyDown(retryButton, { key: 'Enter', code: 'Enter' });
      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('should call onRetry when pressing Space on retry button', () => {
      const mockOnRetry = jest.fn();
      render(<ErrorBanner {...defaultProps} onRetry={mockOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.keyDown(retryButton, { key: ' ', code: 'Space' });
      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('State Transitions', () => {
    it('should render null initially then show banner on visibility change', () => {
      const { container, rerender } = render(
        <ErrorBanner message="Error occurred" visible={false} />
      );
      expect(container.firstChild).toBeNull();

      rerender(<ErrorBanner message="Error occurred" visible={true} />);
      expect(container.firstChild).not.toBeNull();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should hide banner when visibility changes to false', () => {
      const { container, rerender } = render(
        <ErrorBanner message="Error occurred" visible={true} />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<ErrorBanner message="Error occurred" visible={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('should update message when props change', () => {
      const { rerender } = render(
        <ErrorBanner message="First error" visible={true} />
      );
      expect(screen.getByText('First error')).toBeInTheDocument();

      rerender(<ErrorBanner message="Second error" visible={true} />);
      expect(screen.getByText('Second error')).toBeInTheDocument();
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });

    it('should toggle retry button visibility when onRetry prop changes', () => {
      const { rerender } = render(
        <ErrorBanner message="Error" visible={true} onRetry={undefined} />
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();

      rerender(
        <ErrorBanner message="Error" visible={true} onRetry={jest.fn()} />
      );
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined message gracefully', () => {
      const { container } = render(
        <ErrorBanner message={undefined as any} visible={true} />
      );
      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    it('should handle null message gracefully', () => {
      const { container } = render(
        <ErrorBanner message={null as any} visible={true} />
      );
      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    it('should handle onRetry that throws an error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const throwingOnRetry = jest.fn().mockImplementation(() => {
        throw new Error('Retry failed');
      });

      render(<ErrorBanner {...defaultProps} onRetry={throwingOnRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      
      expect(() => {
        fireEvent.click(retryButton);
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid visibility toggling', () => {
      const { container, rerender } = render(
        <ErrorBanner message="Error" visible={true} />
      );
      
      for (let i = 0; i < 10; i++) {
        rerender(<ErrorBanner message="Error" visible={i % 2 === 0} />);
      }

      // Final state should be consistent
      const finalVisible = 10 % 2 === 0;
      if (finalVisible) {
        expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
      } else {
        expect(container.firstChild).toBeNull();
      }
    });

    it('should unmount cleanly without errors', () => {
      const { unmount } = render(<ErrorBanner {...defaultProps} onRetry={jest.fn()} />);
      expect(() => unmount()).not.toThrow();
    });

    it('should unmount cleanly when not visible', () => {
      const { unmount } = render(<ErrorBanner {...defaultProps} visible={false} />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Animation Styles', () => {
    it('should inject fadeIn keyframes animation', () => {
      const { container } = render(<ErrorBanner {...defaultProps} />);
      const styleElements = container.querySelectorAll('style');
      const hasFadeInAnimation = Array.from(styleElements).some((style) =>
        style.textContent?.includes('@keyframes fadeIn')
      );
      expect(hasFadeInAnimation).toBe(true);
    });

    it('should include animation in container style when visible', () => {
      const { container } = render(<ErrorBanner {...defaultProps} />);
      const alertElement = container.querySelector('[role="alert"]') as HTMLElement;
      expect(alertElement.style.animation).toContain('fadeIn');
    });

    it('should not inject animation style when not visible', () => {
      const { container } = render(<ErrorBanner {...defaultProps} visible={false} />);
      const styleElements = container.querySelectorAll('style');
      expect(styleElements).toHaveLength(0);
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple ErrorBanner instances independently', () => {
      const mockOnRetry1 = jest.fn();
      const mockOnRetry2 = jest.fn();
      
      render(
        <div>
          <ErrorBanner message="Error 1" visible={true} onRetry={mockOnRetry1} />
          <ErrorBanner message="Error 2" visible={true} onRetry={mockOnRetry2} />
        </div>
      );

      const buttons = screen.getAllByRole('button', { name: /retry/i });
      expect(buttons).toHaveLength(2);

      fireEvent.click(buttons[0]);
      expect(mockOnRetry1).toHaveBeenCalledTimes(1);
      expect(mockOnRetry2).not.toHaveBeenCalled();

      fireEvent.click(buttons[1]);
      expect(mockOnRetry2).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed visible/invisible instances', () => {
      render(
        <div>
          <ErrorBanner message="Visible error" visible={true} />
          <ErrorBanner message="Hidden error" visible={false} />
        </div>
      );

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(1);
      expect(screen.getByText('Visible error')).toBeInTheDocument();
    });
  });
});
