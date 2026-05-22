import React, { useState } from 'react';
import { tokens } from '../../styles/tokens';

interface CouponFieldProps {
  onApply: (couponCode: string) => Promise<void>;
  error?: string | null;
  success?: string | null;
  disabled?: boolean;
}

export default function CouponField({
  onApply,
  error = null,
  success = null,
  disabled = false
}: CouponFieldProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setLocalError('Por favor ingresa un código de cupón');
      return;
    }

    if (trimmedCode.length < 4) {
      setLocalError('El código debe tener al menos 4 caracteres');
      return;
    }

    setLocalError(null);
    setIsLoading(true);
    setShowSuccess(false);

    try {
      await onApply(trimmedCode);
      setShowSuccess(true);
      setCode('');
    } catch {
      setLocalError('El cupón no es válido o ha expirado');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;
  const showSuccessMessage = showSuccess || (success && !displayError);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing.sm,
      width: '100%'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: tokens.spacing.sm,
          width: '100%'
        }}
      >
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setLocalError(null);
              setShowSuccess(false);
            }}
            placeholder="Código de cupón"
            disabled={disabled || isLoading}
            style={{
              width: '100%',
              padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
              fontSize: tokens.typography.body.regular.size,
              fontFamily: tokens.typography.font_family,
              fontWeight: tokens.typography.body.regular.weight,
              lineHeight: tokens.typography.body.regular.line_height,
              color: tokens.colors.text_primary,
              backgroundColor: tokens.colors.surface,
              border: `2px solid ${displayError ? tokens.colors.error : tokens.colors.border}`,
              borderRadius: tokens.border_radius.md,
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!displayError) {
                e.target.style.borderColor = tokens.colors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${tokens.colors.primary}20`;
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = displayError ? tokens.colors.error : tokens.colors.border;
              e.target.style.boxShadow = 'none';
            }}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? 'coupon-error' : undefined}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || isLoading}
          style={{
            padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
            fontSize: tokens.typography.button.size,
            fontFamily: tokens.typography.font_family,
            fontWeight: tokens.typography.button.weight,
            letterSpacing: tokens.typography.button.letter_spacing,
            color: tokens.colors.text_on_primary,
            backgroundColor: disabled || isLoading ? tokens.colors.muted : tokens.colors.primary,
            border: 'none',
            borderRadius: tokens.border_radius.md,
            cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
            whiteSpace: 'nowrap',
            minWidth: '100px'
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isLoading) {
              e.currentTarget.style.backgroundColor = tokens.colors.primary_hover;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = disabled || isLoading ? tokens.colors.muted : tokens.colors.primary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onMouseDown={(e) => {
            if (!disabled && !isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isLoading ? 'Aplicando...' : 'Aplicar'}
        </button>
      </form>

      {displayError && (
        <p
          id="coupon-error"
          role="alert"
          style={{
            margin: 0,
            padding: 0,
            fontSize: tokens.typography.body.small.size,
            fontFamily: tokens.typography.font_family,
            fontWeight: tokens.typography.body.small.weight,
            color: tokens.colors.error,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.xs
          }}
        >
          <span style={{ color: tokens.colors.error }}>✕</span>
          {displayError}
        </p>
      )}

      {showSuccessMessage && (
        <p
          role="status"
          aria-live="polite"
          style={{
            margin: 0,
            padding: 0,
            fontSize: tokens.typography.body.small.size,
            fontFamily: tokens.typography.font_family,
            fontWeight: tokens.typography.body.small.weight,
            color: tokens.colors.success,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.xs
          }}
        >
          <span style={{ color: tokens.colors.success }}>✓</span>
          {success || 'Cupón aplicado correctamente'}
        </p>
      )}
    </div>
  );
}