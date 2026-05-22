import React from 'react';
import { tokens } from '../../styles/tokens';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
}

const MinusIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max,
  disabled = false
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const isDecrementDisabled = disabled || quantity <= min;
  const isIncrementDisabled = disabled || quantity >= max;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing.sm,
        backgroundColor: tokens.colors.background,
        borderRadius: tokens.border_radius.md,
        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
        border: `1px solid ${tokens.colors.border}`
      }}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        aria-label="Decrease quantity"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: tokens.border_radius.sm,
          border: 'none',
          backgroundColor: isDecrementDisabled ? tokens.colors.border : tokens.colors.surface,
          color: isDecrementDisabled ? tokens.colors.text_secondary : tokens.colors.text_primary,
          cursor: isDecrementDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          if (!isDecrementDisabled) {
            e.currentTarget.style.backgroundColor = tokens.colors.primary;
            e.currentTarget.style.color = tokens.colors.text_on_primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!isDecrementDisabled) {
            e.currentTarget.style.backgroundColor = tokens.colors.surface;
            e.currentTarget.style.color = tokens.colors.text_primary;
          }
        }}
        onFocus={(e) => {
          if (!isDecrementDisabled) {
            e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.colors.primary}40`;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <MinusIcon />
      </button>

      <span
        style={{
          fontFamily: tokens.typography.font_family,
          fontSize: tokens.typography.body.regular.size,
          fontWeight: 600,
          color: disabled ? tokens.colors.text_secondary : tokens.colors.text_primary,
          minWidth: '40px',
          textAlign: 'center'
        }}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        aria-label="Increase quantity"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: tokens.border_radius.sm,
          border: 'none',
          backgroundColor: isIncrementDisabled ? tokens.colors.border : tokens.colors.surface,
          color: isIncrementDisabled ? tokens.colors.text_secondary : tokens.colors.text_primary,
          cursor: isIncrementDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          if (!isIncrementDisabled) {
            e.currentTarget.style.backgroundColor = tokens.colors.primary;
            e.currentTarget.style.color = tokens.colors.text_on_primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!isIncrementDisabled) {
            e.currentTarget.style.backgroundColor = tokens.colors.surface;
            e.currentTarget.style.color = tokens.colors.text_primary;
          }
        }}
        onFocus={(e) => {
          if (!isIncrementDisabled) {
            e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.colors.primary}40`;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <PlusIcon />
      </button>
    </div>
  );
}