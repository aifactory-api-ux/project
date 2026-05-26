import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useProducts, Product } from '../hooks/useProducts';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const generateMockReviews = (productId: string): Review[] => [
  {
    id: '1',
    userId: 'user1',
    userName: 'María García',
    rating: 5,
    comment: 'Excelente producto, mi gato lo ama. La calidad es muy buena y llegó rápido.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Carlos López',
    rating: 4,
    comment: 'Muy buen producto, pero el precio podría ser un poco más bajo.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Ana Martínez',
    rating: 5,
    comment: 'Mi gata está encantada con este producto. Lo recomiendo totalmente.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

const Breadcrumb = ({ productName, category }: { productName?: string; category?: string }) => (
  <nav style={styles.breadcrumb}>
    <a href="/iniciohome" style={styles.breadcrumbLink}>Inicio</a>
    <span style={styles.breadcrumbSeparator}>/</span>
    <a href="/catlogodeproductos" style={styles.breadcrumbLink}>Productos</a>
    {category && (
      <>
        <span style={styles.breadcrumbSeparator}>/</span>
        <a href={`/catlogodeproductos?category=${category}`} style={styles.breadcrumbLink}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </a>
      </>
    )}
    {productName && (
      <>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbCurrent}>{productName}</span>
      </>
    )}
  </nav>
);

const Spinner = () => (
  <div style={styles.spinnerContainer}>
    <div style={styles.spinner}></div>
    <p style={styles.spinnerText}>Cargando producto...</p>
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' }) => {
  const badgeStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: tokens.colors.neutral_medium, color: tokens.colors.neutral_dark },
    success: { backgroundColor: tokens.colors.success, color: tokens.colors.neutral_white },
    warning: { backgroundColor: tokens.colors.warning, color: tokens.colors.neutral_white },
    error: { backgroundColor: tokens.colors.error, color: tokens.colors.neutral_white },
    info: { backgroundColor: tokens.colors.info, color: tokens.colors.neutral_white },
  };

  return (
    <span style={{ ...styles.badge, ...badgeStyles[variant] }}>
      {children}
    </span>
  );
};

const RatingStars = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} width={size} height={size} viewBox="0 0 24 24" fill={tokens.colors.warning}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      {hasHalfStar && (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor={tokens.colors.warning}/>
              <stop offset="50%" stopColor={tokens.colors.neutral_medium}/>
            </linearGradient>
          </defs>
          <path fill="url(#halfGradient)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} width={size} height={size} viewBox="0 0 24 24" fill={tokens.colors.neutral_medium}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
};

const ReviewItem = ({ review }: { review: Review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={styles.reviewItem}>
      <div style={styles.reviewHeader}>
        <div style={styles.reviewUserInfo}>
          <div style={styles.reviewAvatar}>
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.reviewUserName}>{review.userName}</p>
            <p style={styles.reviewDate}>{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} size={14} />
      </div>
      <p style={styles.reviewComment}>{review.comment}</p>
    </div>
  );
};

const ImageGallery = ({ product }: { product: Product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const thumbnails = product.imageUrl ? [product.imageUrl] : [];

  if (thumbnails.length === 0) {
    thumbnails.push('');
  }

  return (
    <div style={styles.gallery}>
      <div style={styles.mainImageContainer}>
        {thumbnails[selectedImage] ? (
          <img src={thumbnails[selectedImage]} alt={product.name} style={styles.mainImage} />
        ) : (
          <div style={styles.imagePlaceholder}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.neutral_dark} strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
      </div>
      {thumbnails.length > 1 && (
        <div style={styles.thumbnailContainer}>
          {thumbnails.map((img, index) => (
            <button
              key={index}
              style={{
                ...styles.thumbnail,
                ...(selectedImage === index ? styles.thumbnailActive : {}),
              }}
              onClick={() => setSelectedImage(index)}
            >
              <img src={img} alt={`${product.name} ${index + 1}`} style={styles.thumbnailImage} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductInfo = ({
  product,
  quantity,
  setQuantity,
  onAddToCart,
  isAdding,
}: {
  product: Product;
  quantity: number;
  setQuantity: (q: number) => void;
  onAddToCart: () => void;
  isAdding: boolean;
}) => {
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price / 100);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const getStockBadge = () => {
    if (product.stock === 0) {
      return <Badge variant="error">Agotado</Badge>;
    }
    if (product.stock <= 5) {
      return <Badge variant="warning">Solo {product.stock} restantes</Badge>;
    }
    return <Badge variant="success">En Stock</Badge>;
  };

  const getCategoryBadge = () => {
    const categoryNames: Record<string, string> = {
      food: 'Alimentos',
      toys: 'Juguetes',
      bedding: 'Descanso',
      hygiene: 'Higiene',
      accessories: 'Accesorios',
    };
    return (
      <Badge variant="info">
        {categoryNames[product.category.toLowerCase()] || product.category}
      </Badge>
    );
  };

  return (
    <div style={styles.info}>
      <div style={styles.badges}>
        {getCategoryBadge()}
        {getStockBadge()}
      </div>

      <h1 style={styles.productName}>{product.name}</h1>

      <div style={styles.ratingRow}>
        <RatingStars rating={4.5} size={18} />
        <span style={styles.ratingText}>4.5 (128 reseñas)</span>
      </div>

      <p style={styles.productPrice}>{formattedPrice}</p>

      <p style={styles.productDescription}>{product.description}</p>

      {product.stock > 0 && (
        <div style={styles.quantitySection}>
          <label style={styles.quantityLabel}>Cantidad:</label>
          <div style={styles.quantityControls}>
            <button
              style={styles.quantityButton}
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= product.stock) {
                  setQuantity(val);
                }
              }}
              min={1}
              max={product.stock}
              style={styles.quantityInput}
            />
            <button
              style={styles.quantityButton}
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>
          <span style={styles.stockInfo}>({product.stock} disponibles)</span>
        </div>
      )}

      <div style={styles.actionButtons}>
        <button
          style={{
            ...styles.addToCartButton,
            ...(product.stock === 0 ? styles.addToCartButtonDisabled : {}),
          }}
          onClick={onAddToCart}
          disabled={product.stock === 0 || isAdding}
        >
          {isAdding ? 'Agregando...' : 'Agregar al Carrito'}
        </button>
        <button style={styles.buyNowButton}>
          Comprar Ahora
        </button>
      </div>

      <div style={styles.features}>
        <div style={styles.feature}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.success} strokeWidth="2">
            <path d="M5 12l5 5L20 7"/>
          </svg>
          <span>Envío gratis en pedidos mayores a $500</span>
        </div>
        <div style={styles.feature}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.success} strokeWidth="2">
            <path d="M5 12l5 5L20 7"/>
          </svg>
          <span>Devolución gratuita en 30 días</span>
        </div>
        <div style={styles.feature}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.success} strokeWidth="2">
            <path d="M5 12l5 5L20 7"/>
          </svg>
          <span>Garantía de calidad</span>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, productName }: { isOpen: boolean; onClose: () => void; productName: string }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.success} strokeWidth="2">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        </div>
        <h2 style={styles.modalTitle}>¡Producto agregado!</h2>
        <p style={styles.modalText}>
          {productName} ha sido agregado a tu carrito de compras.
        </p>
        <div style={styles.modalButtons}>
          <button style={styles.continueButton} onClick={onClose}>
            Continuar Comprando
          </button>
          <a href="/carritodecompras" style={styles.goToCartButton}>
            Ver Carrito
          </a>
        </div>
      </div>
    </div>
  );
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProduct, loading, error } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reviews] = useState<Review[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct(id)
        .then((p) => {
          setProduct(p);
          setReviews(generateMockReviews(p.id));
        })
        .catch(() => {
          navigate('/catlogodeproductos');
        });
    }
  }, [id, fetchProduct, navigate]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAdding(false);
    setShowSuccessModal(true);
  };

  const handleRetry = () => {
    if (id) {
      fetchProduct(id).then(setProduct).catch(() => {
        navigate('/catlogodeproductos');
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <main style={styles.main}>
          <Spinner />
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.page}>
        <main style={styles.main}>
          <div style={styles.errorContainer}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.error} strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
            <p style={styles.errorText}>Error al cargar el producto: {error || 'Producto no encontrado'}</p>
            <button style={styles.retryButton} onClick={handleRetry}>
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navbarLogo}>
          <a href="/iniciohome" style={styles.logoLink}>
            <span style={styles.logoIcon}>🐱</span>
            <span style={styles.logoText}>CatShop</span>
          </a>
        </div>
        <div style={styles.navbarLinks}>
          <a href="/iniciohome" style={styles.navLink}>Inicio</a>
          <a href="/catlogodeproductos" style={{ ...styles.navLink, color: tokens.colors.primary }}>Productos</a>
          <a href="/acerca" style={styles.navLink}>Nosotros</a>
          <a href="/contacto" style={styles.navLink}>Contacto</a>
        </div>
        <div style={styles.navbarActions}>
          <a href="/carritodecompras" style={styles.cartButton}>
            🛒
          </a>
          <a href="/login" style={styles.loginButton}>Iniciar Sesión</a>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.container}>
          <Breadcrumb productName={product.name} category={product.category} />

          <div style={styles.productLayout}>
            <ImageGallery product={product} />
            <ProductInfo
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
            />
          </div>

          <section style={styles.reviewsSection}>
            <h2 style={styles.sectionTitle}>Reseñas de Clientes</h2>
            {reviews.length > 0 ? (
              <div style={styles.reviewsList}>
                {reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div style={styles.noReviews}>
                <p>Este producto aún no tiene reseñas. ¡Sé el primero en calificarlo!</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>CatShop</h4>
            <p style={styles.footerText}>
              Tu tienda online especializada en productos para gatos.
            </p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Enlaces</h4>
            <ul style={styles.footerLinks}>
              <li><a href="/catlogodeproductos" style={styles.footerLink}>Catálogo</a></li>
              <li><a href="/login" style={styles.footerLink}>Mi Cuenta</a></li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>© 2024 CatShop. Todos los derechos reservados.</p>
        </div>
      </footer>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        productName={product.name}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, sans-serif; }
        a:hover { color: ${tokens.colors.primary}; }
        button:focus, input:focus { outline: 2px solid ${tokens.colors.primary_light}; outline-offset: 2px; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: tokens.typography.font_family,
    backgroundColor: tokens.colors.neutral_light,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.md + 'px ' + tokens.spacing.xl + 'px',
    backgroundColor: tokens.colors.neutral_white,
    boxShadow: tokens.shadows.card,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navbarLogo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoLink: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.primary,
  },
  navbarLinks: {
    display: 'flex',
    gap: tokens.spacing.lg,
  },
  navLink: {
    textDecoration: 'none',
    color: tokens.colors.neutral_dark,
    fontSize: tokens.typography.body.regular.size,
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },
  navbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  cartButton: {
    backgroundColor: 'transparent',
    border: '2px solid ' + tokens.colors.neutral_medium,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.sm + 'px ' + tokens.spacing.md + 'px',
    cursor: 'pointer',
    fontSize: '16px',
    textDecoration: 'none',
  },
  loginButton: {
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.sm + 'px ' + tokens.spacing.md + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    padding: tokens.spacing.lg + 'px ' + tokens.spacing.xl + 'px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
    fontSize: tokens.typography.body.small.size,
    flexWrap: 'wrap',
  },
  breadcrumbLink: {
    textDecoration: 'none',
    color: tokens.colors.neutral_dark,
    transition: 'color 0.2s ease',
  },
  breadcrumbSeparator: {
    color: tokens.colors.neutral_dark,
  },
  breadcrumbCurrent: {
    color: tokens.colors.neutral_dark,
    fontWeight: 500,
  },
  productLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacing.xl,
    marginBottom: tokens.spacing.section,
  },
  gallery: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  },
  mainImageContainer: {
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.lg,
    overflow: 'hidden',
    aspectRatio: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: tokens.shadows.card,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: tokens.colors.neutral_light,
  },
  thumbnailContainer: {
    display: 'flex',
    gap: tokens.spacing.md,
    justifyContent: 'center',
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    borderRadius: tokens.border_radius.md,
    overflow: 'hidden',
    border: '2px solid ' + tokens.colors.neutral_medium,
    backgroundColor: tokens.colors.neutral_white,
    cursor: 'pointer',
    padding: 0,
    transition: 'border-color 0.2s ease',
  },
  thumbnailActive: {
    borderColor: tokens.colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  },
  badges: {
    display: 'flex',
    gap: tokens.spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-block',
    padding: tokens.spacing.xs + 'px ' + tokens.spacing.sm + 'px',
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.caption.size,
    fontWeight: 500,
  },
  productName: {
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    lineHeight: tokens.typography.headings.h1.line_height,
    color: tokens.colors.neutral_black,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  ratingText: {
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
  },
  productPrice: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.primary,
  },
  productDescription: {
    fontSize: tokens.typography.body.large.size,
    fontWeight: tokens.typography.body.large.weight,
    lineHeight: tokens.typography.body.large.line_height,
    color: tokens.colors.neutral_dark,
  },
  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.sm,
  },
  quantityLabel: {
    fontSize: tokens.typography.body.regular.size,
    fontWeight: 500,
    color: tokens.colors.neutral_dark,
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid ' + tokens.colors.neutral_medium,
    borderRadius: tokens.border_radius.md,
    overflow: 'hidden',
  },
  quantityButton: {
    width: '40px',
    height: '40px',
    border: 'none',
    backgroundColor: tokens.colors.neutral_light,
    color: tokens.colors.neutral_dark,
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  quantityInput: {
    width: '60px',
    height: '40px',
    border: 'none',
    textAlign: 'center',
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
    backgroundColor: tokens.colors.neutral_white,
  },
  stockInfo: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.neutral_dark,
  },
  actionButtons: {
    display: 'flex',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.md,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.md + 'px ' + tokens.spacing.lg + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  addToCartButtonDisabled: {
    backgroundColor: tokens.colors.neutral_medium,
    color: tokens.colors.neutral_dark,
    cursor: 'not-allowed',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: tokens.colors.secondary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.md + 'px ' + tokens.spacing.lg + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    textDecoration: 'none',
    textAlign: 'center',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    borderTop: '1px solid ' + tokens.colors.neutral_medium,
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
  },
  reviewsSection: {
    marginTop: tokens.spacing.section,
    paddingTop: tokens.spacing.xl,
    borderTop: '1px solid ' + tokens.colors.neutral_medium,
  },
  sectionTitle: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.neutral_black,
    marginBottom: tokens.spacing.xl,
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  },
  reviewItem: {
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.md,
  },
  reviewUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  reviewAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: tokens.colors.primary_light,
    color: tokens.colors.neutral_white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.body.regular.size,
    fontWeight: 600,
  },
  reviewUserName: {
    fontSize: tokens.typography.body.regular.size,
    fontWeight: 600,
    color: tokens.colors.neutral_black,
    margin: 0,
  },
  reviewDate: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.neutral_dark,
    margin: 0,
  },
  reviewComment: {
    fontSize: tokens.typography.body.regular.size,
    lineHeight: tokens.typography.body.regular.line_height,
    color: tokens.colors.neutral_dark,
    margin: 0,
  },
  noReviews: {
    textAlign: 'center',
    padding: tokens.spacing.xl,
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.md,
  },
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xxl,
    gap: tokens.spacing.md,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid ' + tokens.colors.neutral_medium,
    borderTopColor: tokens.colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  spinnerText: {
    color: tokens.colors.neutral_dark,
    fontSize: tokens.typography.body.regular.size,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: tokens.spacing.xxl,
    gap: tokens.spacing.md,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: tokens.typography.body.regular.size,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: tokens.colors.secondary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.sm + 'px ' + tokens.spacing.lg + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.lg,
    padding: tokens.spacing.xl,
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    boxShadow: tokens.shadows.modal,
  },
  modalIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: tokens.colors.success + '20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto ' + tokens.spacing.lg,
  },
  modalTitle: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.neutral_black,
    marginBottom: tokens.spacing.sm,
  },
  modalText: {
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.xl,
  },
  modalButtons: {
    display: 'flex',
    gap: tokens.spacing.md,
  },
  continueButton: {
    flex: 1,
    backgroundColor: tokens.colors.neutral_light,
    color: tokens.colors.neutral_dark,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.md + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  goToCartButton: {
    flex: 1,
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.md + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: tokens.colors.neutral_black,
    color: tokens.colors.neutral_white,
    paddingTop: tokens.spacing.xxl,
    marginTop: tokens.spacing.section,
  },
  footerContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacing.xl,
    padding: '0 ' + tokens.spacing.xl + 'px ' + tokens.spacing.xl + 'px',
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  footerTitle: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: 600,
    color: tokens.colors.neutral_white,
    marginBottom: tokens.spacing.md,
  },
  footerText: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.neutral_medium,
    lineHeight: tokens.typography.body.small.line_height,
  },
  footerLinks: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
  },
  footerLink: {
    textDecoration: 'none',
    color: tokens.colors.neutral_medium,
    fontSize: tokens.typography.body.small.size,
    transition: 'color 0.2s ease',
  },
  footerBottom: {
    borderTop: '1px solid ' + tokens.colors.neutral_dark,
    padding: tokens.spacing.lg,
    textAlign: 'center',
  },
  copyright: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.neutral_medium,
    margin: 0,
  },
};