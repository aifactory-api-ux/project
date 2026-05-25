import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = 5000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - 300);

    const dismissTimer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [toast.id, onDismiss]);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} color="#FFFFFF" />;
      case 'error':
        return <XCircle size={20} color="#FFFFFF" />;
      case 'info':
        return <Info size={20} color="#FFFFFF" />;
      default:
        return <Info size={20} color="#FFFFFF" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return tokens.colors.success;
      case 'error':
        return tokens.colors.error;
      case 'info':
        return tokens.colors.info;
      default:
        return tokens.colors.info;
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    backgroundColor: getBackgroundColor(),
    color: '#FFFFFF',
    minWidth: '240px',
    maxWidth: '400px',
    boxShadow: tokens.shadows.dropdown,
    marginBottom: tokens.spacing.md,
    opacity: isLeaving ? 0 : 1,
    transform: isLeaving ? 'translateX(100%)' : 'translateX(0)',
    transition: 'opacity 300ms ease, transform 300ms ease',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: tokens.typography.body.size,
    fontWeight: 500,
    lineHeight: 1.4,
    flex: 1,
  };

  const dismissButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
    padding: tokens.spacing.xs,
    borderRadius: tokens.radii.sm,
    opacity: 0.8,
    transition: 'opacity 200ms ease',
  };

  return (
    <div style={containerStyle} role="alert" aria-live="polite">
      {getIcon()}
      <span style={messageStyle}>{toast.message}</span>
      <button
        onClick={handleDismiss}
        style={dismissButtonStyle}
        aria-label="Dismiss notification"
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: tokens.spacing.lg,
    right: tokens.spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
    zIndex: 1000,
    pointerEvents: 'none',
  };

  const toastItemStyle: React.CSSProperties = {
    pointerEvents: 'auto',
  };

  return (
    <div style={containerStyle} aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} style={toastItemStyle}>
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

let toastIdCounter = 0;

export const toast = {
  show: (_type: ToastType, _message: string) => {
    toastIdCounter += 1;
    return `toast-${toastIdCounter}`;
  },
};

interface UseToastReturn {
  toasts: ToastMessage[];
  showToast: (type: ToastType, message: string) => void;
  dismissToast: (id: string) => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${toastIdCounter}`;
    toastIdCounter += 1;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
};

export default Toast;
