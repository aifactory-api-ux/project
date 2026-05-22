import React from 'react';
import { tokens } from '../../styles/tokens';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'md'
}: PrimaryButtonProps) {
  const sizeStyles = {
    sm: {
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      fontSize: '14px',
      minHeight: '36px'
    },
    md: {
      padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
      fontSize: tokens.typography.button.size,
      minHeight: '44px'
    },
    lg: {
      padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
      fontSize: '18px',
      minHeight: '52px'
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing.sm,
        width: fullWidth ? '100%' : 'auto',
        padding: sizeStyles[size].padding,
        minHeight: sizeStyles[size].minHeight,
        fontFamily: tokens.typography.font_family,
        fontSize: sizeStyles[size].fontSize,
        fontWeight: tokens.typography.button.weight,
        letterSpacing: tokens.typography.button.letter_spacing,
        color: tokens.colors.text_on_primary,
        backgroundColor: isDisabled
          ? tokens.colors.border
          : isHovered
            ? tokens.colors.primary_hover
            : tokens.colors.primary,
        border: `1px solid ${
          isDisabled
            ? tokens.colors.border
            : isHovered
              ? tokens.colors.primary_hover
              : tokens.colors.primary
        }`,
        borderRadius: tokens.border_radius.md,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
        boxShadow: isFocused && !isDisabled
          ? `0 0 0 3px ${tokens.colors.primary}40`
          : 'none',
        transform: isHovered && !isDisabled ? 'translateY(-1px)' : 'none'
      }}
    >
      {loading && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          style={{
            animation: 'spin 1s linear infinite',
          }}
        >
          <style>
            {`@keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }`}
          </style>
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke={tokens.colors.text_on_primary}
            strokeWidth="2"
            strokeDasharray="31.4"
            strokeDashoffset="10"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
}