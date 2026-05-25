import React from 'react';
import { tokens } from '../../styles/tokens';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  hoverable = true,
  className,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: tokens.colors.surface,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    boxShadow: isHovered && hoverable ? tokens.shadows.cardHover : tokens.shadows.card,
    transition: 'box-shadow 300ms ease',
    cursor: onClick ? 'pointer' : 'default',
  };

  return (
    <div
      style={cardStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default Card;