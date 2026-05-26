import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { Product } from '../hooks/useProducts';

interface CartItem {
  product: Product;
  quantity: number;
}

const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrder, loading: orderLoading, error: orderError } = useOrders();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
      } catch {
        setError('Error loading cart');
      }
    }
  }, []);

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    setCartItems(prev => {
      const updated = prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId: string) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.product.id !== productId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    setShowClearModal(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 500 : 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    try {
      await createOrder({
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      localStorage.removeItem('cart');
      setCartItems([]);
      navigate('/orderhistory');
    } catch {
      // error is handled by useOrders
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Carrito de Compras</h1>
        {cartItems.length > 0 && (
          <button style={styles.clearButton} onClick={() => setShowClearModal(true)}>
            Vaciar carrito
          </button>
        )}
      </header>

      {error && (
        <div style={styles.errorMessage}>{error}</div>
      )}

      {orderError && (
        <div style={styles.errorMessage}>{orderError}</div>
      )}

      {cartItems.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🛒</div>
          <h2 style={styles.emptyTitle}>Tu carrito está vacío</h2>
          <p style={styles.emptyText}>Explora nuestros productos para encontrar algo especial para tu gato</p>
          <button style={styles.ctaButton} onClick={() => navigate('/catlogodeproductos')}>
            Ver productos
          </button>
        </div>
      ) : (
        <div style={styles.content}>
          <div style={styles.cartItems}>
            {cartItems.map(item => (
              <div key={item.product.id} style={styles.cartItem}>
                <img
                  src={item.product.imageUrl || 'https://via.placeholder.com/120'}
                  alt={item.product.name}
                  style={styles.itemImage}
                />
                <div style={styles.itemDetails}>
                  <h3 style={styles.itemName}>{item.product.name}</h3>
                  <p style={styles.itemPrice}>{formatPrice(item.product.price)}</p>
                  <p style={styles.itemStock}>Stock: {item.product.stock}</p>
                </div>
                <div style={styles.itemActions}>
                  <div style={styles.quantityControl}>
                    <button
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      disabled={orderLoading}
                    >
                      −
                    </button>
                    <span style={styles.quantityValue}>{item.quantity}</span>
                    <button
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={orderLoading || item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                  <p style={styles.itemSubtotal}>
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeItem(item.product.id)}
                    disabled={orderLoading}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <h2 style={styles.summaryTitle}>Resumen del pedido</h2>
            <div style={styles.summaryRow}>
              <span>Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} productos)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Envío</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.summaryRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalValue}>{formatPrice(total)}</span>
            </div>
            <button
              style={{
                ...styles.ctaButton,
                ...(orderLoading ? styles.ctaButtonDisabled : {}),
              }}
              onClick={handleCheckout}
              disabled={orderLoading}
            >
              {orderLoading ? 'Procesando...' : 'Proceder al pago'}
            </button>
            {!user && (
              <p style={styles.loginHint}>Inicia sesión para completar tu compra</p>
            )}
          </div>
        </div>
      )}

      {showClearModal && (
        <div style={styles.modalOverlay} onClick={() => setShowClearModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>¿Vaciar carrito?</h3>
            <p style={styles.modalText}>Esta acción eliminará todos los productos de tu carrito.</p>
            <div style={styles.modalActions}>
              <button style={styles.modalCancelButton} onClick={() => setShowClearModal(false)}>
                Cancelar
              </button>
              <button style={styles.modalConfirmButton} onClick={clearCart}>
                Vaciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: tokens.colors.neutral_light,
    fontFamily: tokens.typography.font_family,
    padding: `${tokens.spacing.lg} ${tokens.spacing.md}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    lineHeight: tokens.typography.headings.h1.line_height,
    color: tokens.colors.neutral_dark,
  },
  clearButton: {
    fontSize: tokens.typography.body.regular.size,
    fontWeight: tokens.typography.button.weight,
    color: tokens.colors.error,
    background: 'none',
    border: `1px solid ${tokens.colors.error}`,
    borderRadius: tokens.border_radius.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  errorMessage: {
    backgroundColor: tokens.colors.error,
    color: tokens.colors.neutral_white,
    padding: tokens.spacing.md,
    borderRadius: tokens.border_radius.md,
    marginBottom: tokens.spacing.lg,
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: tokens.spacing.lg,
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: tokens.spacing.xl,
    maxWidth: '1200px',
    margin: '0 auto',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '2fr 1fr',
    },
  },
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  },
  cartItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.lg,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  itemImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: tokens.border_radius.md,
    backgroundColor: tokens.colors.neutral_light,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: tokens.typography.headings.h3.size,
    fontWeight: tokens.typography.headings.h3.weight,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.xs,
  },
  itemPrice: {
    fontSize: tokens.typography.body.large.size,
    fontWeight: tokens.typography.body.large.weight,
    color: tokens.colors.primary,
    marginBottom: tokens.spacing.xs,
  },
  itemStock: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.neutral_dark,
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: tokens.spacing.md,
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    border: `1px solid ${tokens.colors.neutral_medium}`,
    borderRadius: tokens.border_radius.md,
    backgroundColor: tokens.colors.neutral_white,
    fontSize: tokens.typography.body.large.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: tokens.colors.neutral_dark,
  },
  quantityValue: {
    fontSize: tokens.typography.body.large.size,
    fontWeight: tokens.typography.button.weight,
    minWidth: '24px',
    textAlign: 'center',
    color: tokens.colors.neutral_dark,
  },
  itemSubtotal: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    color: tokens.colors.neutral_dark,
  },
  removeButton: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.error,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  summary: {
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.lg,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
    height: 'fit-content',
    position: 'sticky',
    top: tokens.spacing.lg,
  },
  summaryTitle: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.lg,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.md,
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
  },
  divider: {
    height: '1px',
    backgroundColor: tokens.colors.neutral_medium,
    margin: tokens.spacing.md 0,
  },
  totalLabel: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    color: tokens.colors.neutral_dark,
  },
  totalValue: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.primary,
  },
  ctaButton: {
    width: '100%',
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.neutral_white,
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: tokens.spacing.lg,
  },
  ctaButtonDisabled: {
    backgroundColor: tokens.colors.neutral_medium,
    color: tokens.colors.neutral_dark,
    cursor: 'not-allowed',
  },
  loginHint: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.muted || '#9A8C98',
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.section} ${tokens.spacing.lg}`,
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: tokens.spacing.lg,
  },
  emptyTitle: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.sm,
  },
  emptyText: {
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.xl,
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid ${tokens.colors.neutral_medium}`,
    borderTopColor: tokens.colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.lg,
    padding: tokens.spacing.xl,
    maxWidth: '400px',
    width: '90%',
    boxShadow: tokens.shadows.modal,
  },
  modalTitle: {
    fontSize: tokens.typography.headings.h3.size,
    fontWeight: tokens.typography.headings.h3.weight,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.md,
  },
  modalText: {
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.xl,
  },
  modalActions: {
    display: 'flex',
    gap: tokens.spacing.md,
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    backgroundColor: tokens.colors.neutral_light,
    color: tokens.colors.neutral_dark,
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    cursor: 'pointer',
  },
  modalConfirmButton: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    backgroundColor: tokens.colors.error,
    color: tokens.colors.neutral_white,
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    cursor: 'pointer',
  },
};