import React from 'react';
import { tokens } from '../../styles/tokens';

interface OrderSummaryCardProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price);
};

export default function OrderSummaryCard({ subtotal, shipping, discount, total }: OrderSummaryCardProps) {
  return (
    <div style={{
      backgroundColor: tokens.colors.surface,
      borderRadius: tokens.border_radius.lg,
      padding: tokens.spacing.lg,
      boxShadow: tokens.shadows.card,
      border: `1px solid ${tokens.colors.border}`
    }}>
      <h2 style={{
        fontFamily: tokens.typography.font_family,
        fontSize: tokens.typography.h3.size,
        fontWeight: tokens.typography.h3.weight,
        color: tokens.colors.text_primary,
        margin: `0 0 ${tokens.spacing.md} 0`,
        lineHeight: tokens.typography.h3.line_height
      }}>
        Resumen del Pedido
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing.md
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.body.regular.size,
            color: tokens.colors.text_secondary,
            lineHeight: tokens.typography.body.regular.line_height
          }}>
            Subtotal
          </span>
          <span style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.body.regular.size,
            fontWeight: tokens.typography.body.regular.weight,
            color: tokens.colors.text_primary,
            lineHeight: tokens.typography.body.regular.line_height
          }}>
            {formatPrice(subtotal)}
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.body.regular.size,
            color: tokens.colors.text_secondary,
            lineHeight: tokens.typography.body.regular.line_height
          }}>
            Envío
          </span>
          <span style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.body.regular.size,
            fontWeight: tokens.typography.body.regular.weight,
            color: shipping === 0 ? tokens.colors.success : tokens.colors.text_primary,
            lineHeight: tokens.typography.body.regular.line_height
          }}>
            {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
          </span>
        </div>

        {discount > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontFamily: tokens.typography.font_family,
              fontSize: tokens.typography.body.regular.size,
              color: tokens.colors.success,
              lineHeight: tokens.typography.body.regular.line_height
            }}>
              Descuento
            </span>
            <span style={{
              fontFamily: tokens.typography.font_family,
              fontSize: tokens.typography.body.regular.size,
              fontWeight: tokens.typography.body.regular.weight,
              color: tokens.colors.success,
              lineHeight: tokens.typography.body.regular.line_height
            }}>
              -{formatPrice(discount)}
            </span>
          </div>
        )}

        <div style={{
          borderTop: `1px solid ${tokens.colors.border}`,
          paddingTop: tokens.spacing.md,
          marginTop: tokens.spacing.xs,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.body.regular.size,
            fontWeight: 600,
            color: tokens.colors.text_primary,
            lineHeight: tokens.typography.body.regular.line_height
          }}>
            Total
          </span>
          <span style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.headings.h2.size,
            fontWeight: tokens.typography.headings.h2.weight,
            color: tokens.colors.primary,
            lineHeight: tokens.typography.headings.h2.line_height
          }}>
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}