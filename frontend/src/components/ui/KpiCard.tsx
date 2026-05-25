import React from 'react';
import { LucideIcon, Loader } from 'lucide-react';
import { tokens } from '../../styles/tokens';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = tokens.colors.accent,
  loading = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
    transition: 'box-shadow 300ms ease',
    boxShadow: isHovered ? tokens.shadows.cardHover : tokens.shadows.card,
    minWidth: '200px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  };

  const iconWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: iconColor,
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.kpiValue.size,
    fontWeight: tokens.typography.kpiValue.weight,
    lineHeight: tokens.typography.kpiValue.lineHeight,
    color: tokens.colors.textPrimary,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.kpiLabel.size,
    fontWeight: tokens.typography.kpiLabel.weight,
    lineHeight: tokens.typography.kpiLabel.lineHeight,
    color: tokens.colors.textSecondary,
  };

  const spinnerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={headerStyle}>
        {loading ? (
          <div style={spinnerStyle}>
            <Loader size={20} color={iconColor} />
          </div>
        ) : (
          <div style={iconWrapperStyle}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div style={valueStyle}>{loading ? '--' : value}</div>
      <div style={labelStyle}>{label}</div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default KpiCard;