import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Toast, ToastContainer } from './Toast';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <span data-testid="check-circle" />,
  XCircle: () => <span data-testid="x-circle" />,
  Info: () => <span data-testid="info-icon" />,
  X: () => <span data-testid="x-icon" />,
}));

// Mock tokens
jest.mock('../../styles/tokens', () => ({
  tokens: {
    colors: {
      success: '#22c55e',
      error: '#ef4444',
      info: '#3b82f6',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
    },
    radii: {
      sm: '4px',
      md: '8px',
    },
    typography: {
      body: {
        size: '14px',
      },
    },
    shadows: {
      dropdown: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  },
}));

describe('Toast Component', () => {
  const mockOnDismiss = jest.fn();
  const mockToast = {
    id: 'test-toast-1',
    type: 'success' as const,
    message: 'Operation completed successfully',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders toast message correctly', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('renders with correct role and aria attributes', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      const toastElement = screen.getByRole('alert');
      expect(toastElement).toBeInTheDocument();
      expect(toastElement).toHaveAttribute('aria-live', 'polite');
    });

    it('renders dismiss button with correct aria-label', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      const dismissButton = screen.getByRole('button', { name: 'Dismiss notification' });
      expect(dismissButton).toBeInTheDocument();
    });

    it('renders dismiss button icon', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });

  describe('Icon Display by Type', () => {
    it('displays CheckCircle icon for success type', () => {
      const successToast = { ...mockToast, type: 'success' as const };
      render(<Toast toast={successToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
      expect(screen.queryByTestId('x-circle')).not.toBeInTheDocument();
      expect(screen.queryByTestId('info-icon')).not.toBeInTheDocument();
    });

    it('displays XCircle icon for error type', () => {
      const errorToast = { ...mockToast, type: 'error' as const };
      render(<Toast toast={errorToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByTestId('x-circle')).toBeInTheDocument();
      expect(screen.queryByTestId('check-circle')).not.toBeInTheDocument();
      expect(screen.queryByTestId('info-icon')).not.toBeInTheDocument();
    });

    it('displays Info icon for info type', () => {
      const infoToast = { ...mockToast, type: 'info' as const };
      render(<Toast toast={infoToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('check-circle')).not.toBeInTheDocument();
      expect(screen.queryByTestId('x-circle')).not.toBeInTheDocument();
    });

    it('defaults to Info icon for unknown type', () => {
      const unknownToast = { ...mockToast, type: 'info' as const };
      render(<Toast toast={unknownToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  describe('Auto-dismiss Behavior', () => {
    it('calls onDismiss after 5000ms (5 seconds)', async () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      
      // Advance timer by 4.9 seconds - should not dismiss yet
      act(() => {
        jest.advanceTimersByTime(4900);
      });
      expect(mockOnDismiss).not.toHaveBeenCalled();

      // Advance to exactly 5 seconds
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast-1');
    });

    it('clears timers on unmount', () => {
      const { unmount } = render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      
      unmount();
      
      // Advance time after unmount
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      // Should not call onDismiss since component is unmounted
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('initiates leaving animation before calling onDismiss', async () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      
      // Advance to 4700ms - when leaving animation starts
      act(() => {
        jest.advanceTimersByTime(4700);
      });
      
      // onDismiss should not be called yet
      expect(mockOnDismiss).not.toHaveBeenCalled();
      
      // Advance to 5000ms
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manual Dismiss', () => {
    it('calls onDismiss immediately when dismiss button is clicked', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      
      const dismissButton = screen.getByRole('button', { name: 'Dismiss notification' });
      fireEvent.click(dismissButton);
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast-1');
    });

    it('allows multiple dismiss button clicks without multiple callbacks', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      
      const dismissButton = screen.getByRole('button', { name: 'Dismiss notification' });
      fireEvent.click(dismissButton);
      fireEvent.click(dismissButton);
      
      // Should only be called once due to closure
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty message string', () => {
      const emptyMessageToast = { ...mockToast, message: '' };
      render(<Toast toast={emptyMessageToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('handles very long message string', () => {
      const longMessage = 'A'.repeat(500);
      const longMessageToast = { ...mockToast, message: longMessage };
      render(<Toast toast={longMessageToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles special characters in message', () => {
      const specialCharToast = { 
        ...mockToast, 
        message: 'Test with <script>alert("xss")</script> & special "chars"' 
      };
      render(<Toast toast={specialCharToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByText(specialCharToast.message)).toBeInTheDocument();
    });

    it('handles unicode characters in message', () => {
      const unicodeToast = { 
        ...mockToast, 
        message: '消息提示 🎉 émoji 测试' 
      };
      render(<Toast toast={unicodeToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByText(unicodeToast.message)).toBeInTheDocument();
    });

    it('handles newline characters in message', () => {
      const multilineToast = { 
        ...mockToast, 
        message: 'Line 1\nLine 2\nLine 3' 
      };
      render(<Toast toast={multilineToast} onDismiss={mockOnDismiss} />);
      expect(screen.getByText(multilineToast.message)).toBeInTheDocument();
    });

    it('handles toast with all valid type values', () => {
      const types: Array<'success' | 'error' | 'info'> = ['success', 'error', 'info'];
      
      types.forEach((type) => {
        const toast = { ...mockToast, id: `toast-${type}`, type };
        const { unmount } = render(<Toast toast={toast} onDismiss={mockOnDismiss} />);
        
        expect(screen.getByRole('alert')).toBeInTheDocument();
        unmount();
      });
    });

    it('uses callback memoization for dismiss handler', () => {
      const { rerender } = render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
      
      const newMockDismiss = jest.fn();
      rerender(<Toast toast={mockToast} onDismiss={newMockDismiss} />);
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      // Should call the latest onDismiss
      expect(newMockDismiss).toHaveBeenCalledWith('test-toast-1');
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });
});

describe('ToastContainer Component', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders container with correct aria-label', () => {
      render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />);
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    it('renders nothing when toasts array is empty', () => {
      const { container } = render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />);
      expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0);
    });

    it('renders nothing when toasts array is undefined', () => {
      const { container } = render(
        <ToastContainer toasts={undefined as any} onDismiss={mockOnDismiss} />
      );
      expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0);
    });
  });

  describe('Multiple Toasts', () => {
    it('renders multiple toasts correctly', () => {
      const toasts = [
        { id: 'toast-1', type: 'success' as const, message: 'Success message' },
        { id: 'toast-2', type: 'error' as const, message: 'Error message' },
        { id: 'toast-3', type: 'info' as const, message: 'Info message' },
      ];
      
      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);
      
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('renders correct number of toast alerts', () => {
      const toasts = [
        { id: 'toast-1', type: 'success' as const, message: 'Message 1' },
        { id: 'toast-2', type: 'error' as const, message: 'Message 2' },
        { id: 'toast-3', type: 'info' as const, message: 'Message 3' },
        { id: 'toast-4', type: 'success' as const, message: 'Message 4' },
      ];
      
      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);
      
      const alertElements = screen.getAllByRole('alert');
      expect(alertElements).toHaveLength(4);
    });

    it('maintains order of toasts', () => {
      const toasts = [
        { id: 'toast-1', type: 'success' as const, message: 'First' },
        { id: 'toast-2', type: 'info' as const, message: 'Second' },
        { id: 'toast-3', type: 'error' as const, message: 'Third' },
      ];
      
      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);
      
      const container = screen.getByLabelText('Notifications');
      const toastElements = container.querySelectorAll('[role="alert"]');
      
      expect(toastElements[0]).toHaveTextContent('First');
      expect(toastElements[1]).toHaveTextContent('Second');
      expect(toastElements[2]).toHaveTextContent('Third');
    });

    it('handles single toast correctly', () => {
      const singleToast = [
        { id: 'toast-1', type: 'success' as const, message: 'Single toast' },
      ];
      
      render(<ToastContainer toasts={singleToast} onDismiss={mockOnDismiss} />);
      
      expect(screen.getByText('Single toast')).toBeInTheDocument();
      expect(screen.getAllByRole('alert')).toHaveLength(1);
    });
  });

  describe('Dismiss Callback', () => {
    it('passes correct toast id to onDismiss when dismiss button clicked', () => {
      const toasts = [
        { id: 'toast-1', type: 'success' as const, message: 'Message 1' },
        { id: 'toast-2', type: 'error' as const, message: 'Message 2' },
      ];
      
      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);
      
      const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss notification' });
      fireEvent.click(dismissButtons[1]);
      
      expect(mockOnDismiss).toHaveBeenCalledWith('toast-2');
    });

    it('calls onDismiss with correct id for first toast', () => {
      const toasts = [
        { id: 'toast-1', type: 'success' as const, message: 'First' },
        { id: 'toast-2', type: 'info' as const, message: 'Second' },
      ];
      
      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);
      
      const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss notification' });
      fireEvent.click(dismissButtons[0]);
      
      expect(mockOnDismiss).toHaveBeenCalledWith('toast-1');
    });
  });

  describe('Edge Cases', () => {
    it('handles duplicate toast ids', () => {
      const duplicateToasts = [
        { id: 'duplicate-id', type: 'success' as const, message: 'First' },
        { id: 'duplicate-id', type: 'error' as const, message: 'Second' },
      ];
      
      render(<ToastContainer toasts={duplicateToasts} onDismiss={mockOnDismiss} />);
      
      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
    });

    it('handles large number of toasts', () => {
      const manyToasts = Array.from({ length: 20 }, (_, i) => ({
        id: `toast-${i}`,
        type: 'info' as const,
        message: `Message ${i}`,
      }));
      
      render(<ToastContainer toasts={manyToasts} onDismiss={mockOnDismiss} />);
      
      expect(screen.getAllByRole('alert')).toHaveLength(20);
    });

    it('handles empty toast id', () => {
      const emptyIdToast = [
        { id: '', type: 'success' as const, message: 'Empty ID toast' },
      ];
      
      render(<ToastContainer toasts={emptyIdToast} onDismiss={mockOnDismiss} />);
      
      expect(screen.getByText('Empty ID toast')).toBeInTheDocument();
    });

    it('handles null in toasts array gracefully', () => {
      const toastsWithNull = [
        { id: 'toast-1', type: 'success' as const, message: 'Valid toast' },
        null as any,
        { id: 'toast-3', type: 'info' as const, message: 'Another valid toast' },
      ];
      
      render(<ToastContainer toasts={toastsWithNull} onDismiss={mockOnDismiss} />);
      
      expect(screen.getByText('Valid toast')).toBeInTheDocument();
      expect(screen.getByText('Another valid toast')).toBeInTheDocument();
    });
  });
});
