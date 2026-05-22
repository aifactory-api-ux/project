import React from 'react';
import { tokens } from '../../styles/tokens';
import { Product } from '../../types/product';

interface CartProductRowProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
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

const TrashIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5H15M6 5V3C6 2.44772 6.44772 2 7 2H11C11.5523 2 12 2.44772 12 3V5M7 8V13M11 8V13M4 5L5 15C5 15.5523 5.44772 16 6 16H12C12.5523 16 13 15.5523 13 15L14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price);
};

export default function CartProductRow({ product, quantity, onUpdateQuantity, onRemove }: CartProductRowProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      onUpdateQuantity(product.id, quantity + 1);
    }
  };

  const handleRemove = () => {
    onRemove(product.id);
  };

  const subtotal = product.price * quantity;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '80px 1fr auto auto',
      gap: tokens.spacing.md,
      alignItems: 'center',
      padding: `${tokens.spacing.md} 0`,
      borderBottom: `1px solid ${tokens.colors.border}`
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: tokens.border_radius.md,
        overflow: 'hidden',
        backgroundColor: tokens.colors.background,
        flexShrink: 0
      }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect fill="%23E0E0E0" width="80" height="80"/%3E%3Ctext x="40" y="45" text-anchor="middle" fill="%237F8C8D" font-size="12"%3ENo image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing.xs,
        minWidth: 0
      }}>
        <h3 style={{
          fontFamily: tokens.typography.font_family,
          fontSize: tokens.typography.body.regular.size,
          fontWeight: 600,
          color: tokens.colors.text_primary,
          margin: 0,
          lineHeight: tokens.typography.body.regular.line_height,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {product.name}
        </h3>
        <p style={{
          fontFamily: tokens.typography.font_family,
          fontSize: tokens.typography.body.small.size,
          color: tokens.colors.text_secondary,
          margin: 0,
          lineHeight: tokens.typography.body.small.line_height,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.description}
        </p>
        <span style={{
          fontFamily: tokens.typography.font_family,
          fontSize: tokens.typography.body.small.size,
          color: tokens.colors.text_secondary,
          margin: 0
        }}>
          {formatPrice(product.price)} c/u
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing.sm,
        backgroundColor: tokens.colors.background,
        borderRadius: tokens.border_radius.md,
        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
        border: `1px solid ${tokens.colors.border}`
      }}>
        <button
          onClick={handleDecrement}
          disabled={quantity <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: tokens.border_radius.sm,
            border: 'none',
            backgroundColor: quantity <= 1 ? tokens.colors.border : tokens.colors.surface,
            color: quantity <= 1 ? tokens.colors.text_secondary : tokens.colors.text_primary,
            cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (quantity > 1) {
              e.currentTarget.style.backgroundColor = tokens.colors.primary;
              e.currentTarget.style.color = tokens.colors.text_on_primary;
            }
          }}
          onMouseLeave={(e) => {
            if (quantity > 1) {
              e.currentTarget.style.backgroundColor = tokens.colors.surface;
              e.currentTarget.style.color = tokens.colors.text_primary;
            }
          }}
          aria-label="Decrease quantity"
        >
          <MinusIcon />
        </button>

        <span style={{
          fontFamily: tokens.typography.font_family,
          fontSize: tokens.typography.body.regular.size,
          fontWeight: 600,
          color: tokens.colors.text_primary,
          minWidth: '32px',
          textAlign: 'center'
        }}>
          {quantity}
        </span>

        <button
          onClick={handleIncrement}
          disabled={quantity >= product.stock}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: tokens.border_radius.sm,
            border: 'none',
            backgroundColor: quantity >= product.stock ? tokens.colors.border : tokens.colors.surface,
            color: quantity >= product.stock ? tokens.colors.text_secondary : tokens.colors.text_primary,
            cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (quantity < product.stock) {
              e.currentTarget.style.backgroundColor = tokens.colors.primary;
              e.currentTarget.style.color = tokens.colors.text_on_primary;
            }
          }}
          onMouseLeave={(e) => {
            if (quantity < product.stock) {
              e.currentTarget.style.backgroundColor = tokens.colors.surface;
              e.currentTarget.style.color = tokens.colors.text_primary;
            }
          }}
          aria-label="Increase quantity"
        >
          <PlusIcon />
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: tokens.spacing.sm,
        minWidth: '100px'
      }}>
        <span style={{
          fontFamily: tokens.typography.font_family,
          fontSize: tokens.typography.body.regular.size,
          fontWeight: 700,
          color: tokens.colors.text_primary
        }}>
          {formatPrice(subtotal)}
        </span>
        <button
          onClick={handleRemove}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacing.xs,
            backgroundColor: 'transparent',
            border: 'none',
            color: tokens.colors.text_secondary,
            cursor: 'pointer',
            borderRadius: tokens.border_radius.sm,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.error;
            e.currentTarget.style.color = tokens.colors.text_on_primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = tokens.colors.text_secondary;
          }}
          aria-label="Remove item"
        >
          <TrashIcon />
        </button>
      </div>

      <style>{`
        @media (max-width: 600px) {
          div:first-of-type {
            grid-template-columns: 60px 1fr !important;
            grid-template-rows: auto auto !important;
            gap: ${tokens.spacing.sm} !important;
          }
          div:first-of-type > div:nth-child(3) {
            grid-column: 1 / -1 !important;
            justify-self: start !important;
          }
          div:first-of-type > div:nth-child(4) {
            grid-column: 1 / -1 !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
}