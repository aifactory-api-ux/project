import React from 'react';
import { Product } from '../../types/product';
import { tokens } from '../../styles/tokens';

interface RecommendationCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

export default function RecommendationCard({ product, onAddToCart }: RecommendationCardProps) {
  const handleAddToCart = () => {
    onAddToCart(product.id);
  };

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={styles.image}
        />
      </div>
      <div style={styles.content}>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.description}>{product.description}</p>
        <div style={styles.footer}>
          <span style={styles.price}>${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary_hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary;
            }}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.border_radius.md,
    boxShadow: tokens.shadows.card,
    overflow: 'hidden',
    maxWidth: '280px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },
  imageContainer: {
    width: '100%',
    height: '180px',
    overflow: 'hidden',
    backgroundColor: tokens.colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    padding: tokens.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
  },
  name: {
    fontFamily: tokens.typography.font_family,
    fontSize: tokens.typography.headings.h3.size,
    fontWeight: tokens.typography.headings.h3.weight,
    lineHeight: tokens.typography.headings.h3.line_height,
    color: tokens.colors.text_primary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    fontFamily: tokens.typography.font_family,
    fontSize: tokens.typography.body.small.size,
    fontWeight: tokens.typography.body.small.weight,
    lineHeight: tokens.typography.body.small.line_height,
    color: tokens.colors.text_secondary,
    margin: 0,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    minHeight: '40px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.sm,
    paddingTop: tokens.spacing.sm,
    borderTop: `1px solid ${tokens.colors.border}`,
  },
  price: {
    fontFamily: tokens.typography.font_family,
    fontSize: tokens.typography.headings.h3.size,
    fontWeight: tokens.typography.headings.h3.weight,
    color: tokens.colors.primary,
  },
  button: {
    fontFamily: tokens.typography.font_family,
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    letterSpacing: tokens.typography.button.letter_spacing,
    color: tokens.colors.text_on_primary,
    backgroundColor: tokens.colors.primary,
    border: 'none',
    borderRadius: tokens.border_radius.sm,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};