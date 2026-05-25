import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  visible: boolean;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, visible }) => {
  if (!visible) return null;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.error,
    color: tokens.colors.surface,
    borderRadius: tokens.radii.md,
    boxShadow: tokens.shadows.card,
    animation: 'fadeIn 300ms ease-out',
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.md,
  };

  const messageStyle: React.CSSProperties = {
    fontSize: tokens.typography.body.size,
    fontWeight: 500,
    lineHeight: 1.4,
    flex: 1,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginLeft: tokens.spacing.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    backgroundColor: tokens.colors.surface,
    color: tokens.colors.error,
    border: `1px solid ${tokens.colors.surface}`,
    borderRadius: tokens.radii.md,
    fontSize: tokens.typography.body.size,
    fontWeight: 600,
    lineHeight: 1.4,
    cursor: 'pointer',
    transition: 'background-color 300ms ease, color 300ms ease',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = tokens.colors.surface;
    e.currentTarget.style.color = tokens.colors.error;
    e.currentTarget.style.opacity = '0.9';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = tokens.colors.surface;
    e.currentTarget.style.color = tokens.colors.error;
    e.currentTarget.style.opacity = '1';
  };

  return (
    <div style={containerStyle} role="alert" aria-live="assertive">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div style={contentStyle}>
        <AlertCircle size={20} color={tokens.colors.surface} />
        <span style={messageStyle}>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            style={buttonStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="Retry action"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;