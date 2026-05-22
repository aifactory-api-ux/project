import React, { useEffect, useState, useCallback } from 'react';
import { tokens } from '../styles/tokens';
import { Cart, CartItem } from '../types/cart';
import { Product } from '../types/product';
import { useCart } from '../hooks/useCart';
import CartProductRow from '../components/ui/CartProductRow';
import OrderSummaryCard from '../components/ui/OrderSummaryCard';
import CouponField from '../components/ui/CouponField';
import PrimaryButton from '../components/ui/PrimaryButton';
import TrustMessage from '../components/ui/TrustMessage';
import RecommendationCard from '../components/ui/RecommendationCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:23001';

interface CartProduct extends Product {
  quantity: number;
}

export default function CartPage() {
  const { cart, loading, error, fetchCart, updateItem, removeItem } = useCart();
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [shippingCost] = useState(0);

  const fetchCartProducts = useCallback(async (items: CartItem[]) => {
    if (!items || items.length === 0) return;

    setIsLoadingProducts(true);
    try {
      const productResponses = await Promise.all(
        items.map(item =>
          fetch(`${API_BASE_URL}/api/products/${item.productId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }).then(res => res.json())
        )
      );

      const productsWithQuantity = productResponses.map((product: Product, index: number) => ({
        ...product,
        quantity: items[index].quantity
      }));

      setCartProducts(productsWithQuantity);
    } catch (err) {
      console.error('Error fetching cart products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (cart?.items) {
      fetchCartProducts(cart.items);
    }
  }, [cart, fetchCartProducts]);

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    await updateItem(productId, { quantity });
  };

  const handleRemoveItem = async (productId: number) => {
    await removeItem(productId);
  };

  const handleApplyCoupon = async (couponCode: string) => {
    if (couponCode === 'GATO10') {
      setCouponDiscount(10);
      setCouponMessage({ type: 'success', text: 'Cupón aplicado: 10% de descuento' });
    } else if (couponCode === 'GATO20') {
      setCouponDiscount(20);
      setCouponMessage({ type: 'success', text: 'Cupón aplicado: 20% de descuento' });
    } else {
      setCouponDiscount(0);
      setCouponMessage({ type: 'error', text: 'El cupón no es válido o ha expirado' });
      throw new Error('Cupón inválido');
    }
  };

  const calculateSubtotal = () => {
    return cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * couponDiscount) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount + shippingCost;
  };

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  const handleContinueShopping = () => {
    window.location.href = '/';
  };

  if (loading && !cart) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        backgroundColor: tokens.colors.background
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: tokens.spacing.md
        }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <style>
              {`@keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }`}
            </style>
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke={tokens.colors.primary}
              strokeWidth="4"
              strokeDasharray="125.6"
              strokeDashoffset="40"
              strokeLinecap="round"
            />
          </svg>
          <span style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.body.regular.size,
            color: tokens.colors.text_secondary
          }}>
            Cargando carrito...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        backgroundColor: tokens.colors.background
      }}>
        <div style={{
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.border_radius.lg,
          padding: tokens.spacing.xl,
          boxShadow: tokens.shadows.card,
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ marginBottom: tokens.spacing.md }}
          >
            <circle cx="24" cy="24" r="22" stroke={tokens.colors.error} strokeWidth="2" />
            <path d="M24 14V26M24 32V34" stroke={tokens.colors.error} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h2 style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.h3.size,
            fontWeight: tokens.typography.h3.weight,
            color: tokens.colors.text_primary,
            margin: `0 0 ${tokens.spacing.sm} 0`
          }}>
            Error al cargar el carrito
          </h2>
          <p style={{
            fontFamily: tokens.typography.font_family,
            fontSize: tokens.typography.body.regular.size,
            color: tokens.colors.text_secondary,
            margin: `0 0 ${tokens.spacing.lg} 0`
          }}>
            {error}
          </p>
          <PrimaryButton onClick={() => fetchCart()}>
            Reintentar
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div style={{
      backgroundColor: tokens.colors.background,
      minHeight: '100vh',
      paddingBottom: tokens.spacing.xxl
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `${tokens.spacing.lg} ${tokens.spacing.md}`
      }}>
        <h1 style={{
          fontFamily: tokens.typography.font_family,
          fontSize: tokens.typography.h1.size,
          fontWeight: tokens.typography.h1.weight,
          color: tokens.colors.text_primary,
          margin: `0 0 ${tokens.spacing.xl} 0`,
          lineHeight: tokens.typography.h1.line_height
        }}>
          Carrito de Compras
        </h1>

        {isEmpty ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tokens.colors.surface,
            borderRadius: tokens.border_radius.lg,
            padding: `${tokens.spacing.xxl} ${tokens.spacing.lg}`,
            boxShadow: tokens.shadows.card,
            textAlign: 'center'
          }}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              style={{ marginBottom: tokens.spacing.lg }}
            >
              <circle cx="40" cy="40" r="38" stroke={tokens.colors.border} strokeWidth="2" />
              <path d="M25 30H55L50 55H30L25 30Z" stroke={tokens.colors.text_secondary} strokeWidth="2" strokeLinejoin="round" />
              <path d="M35 30V25C35 22.2386 37.2386 20 40 20C42.7614 20 45 22.2386 45 25V30" stroke={tokens.colors.text_secondary} strokeWidth="2" strokeLinecap="round" />
              <circle cx="33" cy="65" r="3" fill={tokens.colors.text_secondary} />
              <circle cx="47" cy="65" r="3" fill={tokens.colors.text_secondary} />
            </svg>
            <h2 style={{
              fontFamily: tokens.typography.font_family,
              fontSize: tokens.typography.h2.size,
              fontWeight: tokens.typography.h2.weight,
              color: tokens.colors.text_primary,
              margin: `0 0 ${tokens.spacing.sm} 0`
            }}>
              Tu carrito está vacío
            </h2>
            <p style={{
              fontFamily: tokens.typography.font_family,
              fontSize: tokens.typography.body.regular.size,
              color: tokens.colors.text_secondary,
              margin: `0 0 ${tokens.spacing.xl} 0`,
              maxWidth: '400px'
            }}>
              Parece que aún no has añadido productos para tu gato. ¡Explora nuestro catálogo y encuentra lo mejor para tu compañero felino!
            </p>
            <PrimaryButton onClick={handleContinueShopping} size="lg">
              Explorar Productos
            </PrimaryButton>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: tokens.spacing.xl
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: tokens.spacing.xl,
              alignItems: 'start'
            }}>
              <div style={{
                backgroundColor: tokens.colors.surface,
                borderRadius: tokens.border_radius.lg,
                padding: tokens.spacing.lg,
                boxShadow: tokens.shadows.card
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: tokens.spacing.lg,
                  paddingBottom: tokens.spacing.md,
                  borderBottom: `1px solid ${tokens.colors.border}`
                }}>
                  <span style={{
                    fontFamily: tokens.typography.font_family,
                    fontSize: tokens.typography.body.regular.size,
                    fontWeight: 600,
                    color: tokens.colors.text_primary
                  }}>
                    {cartProducts.length} {cartProducts.length === 1 ? 'producto' : 'productos'}
                  </span>
                  <button
                    onClick={handleContinueShopping}
                    style={{
                      fontFamily: tokens.typography.font_family,
                      fontSize: tokens.typography.body.small.size,
                      color: tokens.colors.secondary,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Continuar comprando
                  </button>
                </div>

                {isLoadingProducts ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: tokens.spacing.xxl
                  }}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      style={{ animation: 'spin 1s linear infinite' }}
                    >
                      <style>
                        {`@keyframes spin {
                          from { transform: rotate(0deg); }
                          to { transform: rotate(360deg); }
                        }`}
                      </style>
                      <circle
                        cx="16" cy="16" r="14"
                        fill="none"
                        stroke={tokens.colors.primary}
                        strokeWidth="3"
                        strokeDasharray="88"
                        strokeDashoffset="28"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {cartProducts.map((product) => (
                      <CartProductRow
                        key={product.id}
                        product={product}
                        quantity={product.quantity}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing.lg,
                position: 'sticky',
                top: tokens.spacing.lg
              }}>
                <OrderSummaryCard
                  subtotal={calculateSubtotal()}
                  shipping={shippingCost}
                  discount={calculateDiscount()}
                  total={calculateTotal()}
                />

                <CouponField
                  onApply={handleApplyCoupon}
                  error={couponMessage?.type === 'error' ? couponMessage.text : null}
                  success={couponMessage?.type === 'success' ? couponMessage.text : null}
                  disabled={isLoadingProducts}
                />

                <TrustMessage />

                <PrimaryButton
                  fullWidth
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceder al Pago
                </PrimaryButton>
              </div>
            </div>

            <div style={{
              backgroundColor: tokens.colors.surface,
              borderRadius: tokens.border_radius.lg,
              padding: tokens.spacing.lg,
              boxShadow: tokens.shadows.card
            }}>
              <h3 style={{
                fontFamily: tokens.typography.font_family,
                fontSize: tokens.typography.h3.size,
                fontWeight: tokens.typography.h3.weight,
                color: tokens.colors.text_primary,
                margin: `0 0 ${tokens.spacing.lg} 0`
              }}>
                Recomendaciones para ti
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: tokens.spacing.md
              }}>
                <RecommendationCard
                  name="Cama Premium para Gatos"
                  price={1299}
                  imageUrl="https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=300"
                  rating={4.8}
                />
                <RecommendationCard
                  name="Tower de Juego Interactivo"
                  price={899}
                  imageUrl="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300"
                  rating={4.6}
                />
                <RecommendationCard
                  name="Transportín Ergonómico"
                  price={749}
                  imageUrl="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300"
                  rating={4.7}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div:first-of-type > div > div:first-of-type {
            grid-template-columns: 1fr !important;
          }
          div:first-of-type > div > div:first-of-type > div:last-child {
            position: relative !important;
            top: auto !important;
          }
        }
      `}</style>
    </div>
  );
}