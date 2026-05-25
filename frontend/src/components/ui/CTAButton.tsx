import { tokens } from '../../styles/tokens';

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function CTAButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
}: CTAButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
        backgroundColor: tokens.colors.primary,
        color: tokens.colors.surface,
        border: 'none',
        borderRadius: tokens.radii.full,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.body.size,
        fontWeight: 600,
        lineHeight: tokens.typography.body.lineHeight,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        width: fullWidth ? '100%' : 'auto',
        transition: 'background-color 300ms',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = tokens.colors.primaryLight;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = tokens.colors.primary;
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${tokens.colors.primaryLight}`;
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      {children}
    </button>
  );
}