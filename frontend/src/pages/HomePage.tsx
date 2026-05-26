import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useProducts, Product } from '../hooks/useProducts';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section style={styles.hero}>
      <div style={styles.heroContent}>
        <h1 style={styles.heroTitle}>
          Todo lo que tu gato necesita, en un solo lugar
        </h1>
        <p style={styles.heroSubtitle}>
          Descubre productos de calidad para consentir a tu felino. Desde alimentos premium hasta juguetes que los hacen felices.
        </p>
        <button
          style={styles.heroButton}
          onClick={() => navigate('/catlogodeproductos')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.primary_dark;
            e.currentTarget.style.boxShadow = tokens.shadows.elevated;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.primary;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Ver Catalogo
        </button>
      </div>
      <div style={styles.heroImage}>
        <div style={styles.heroImagePlaceholder}>
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.primary} strokeWidth="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <circle cx="8.5" cy="9.5" r="1.5"/>
            <circle cx="15.5" cy="9.5" r="1.5"/>
            <path d="M12 16c-1.65 0-3-1.35-3-3h6c0 1.65-1.35 3-3 3z"/>
            <path d="M4 9l2 2M20 9l-2 2M4 15l2-2M20 15l-2-2"/>
          </svg>
        </div>
      </div>
    </section>
  );
};

const CategoriesSection = () => {
  const categories = [
    { id: 'food', name: 'Alimentos', icon: '🍲' },
    { id: 'toys', name: 'Juguetes', icon: '🎾' },
    { id: 'bedding', name: 'Descanso', icon: '🛏️' },
    { id: 'hygiene', name: 'Higiene', icon: '🧴' },
  ];

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Categorias</h2>
      <div style={styles.categoriesGrid}>
        {categories.map((category) => (
          <button
            key={category.id}
            style={styles.categoryCard}
            onClick={() => window.location.href = '/catlogodeproductos?category=' + category.id}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = tokens.shadows.card;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={styles.categoryIcon}>{category.icon}</span>
            <span style={styles.categoryName}>{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart?: (product: Product) => void }) => {
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price / 100);

  return (
    <div style={styles.productCard}>
      <div style={styles.productImageContainer}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={styles.productImage} />
        ) : (
          <div style={styles.productImagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.info} strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
      </div>
      <div style={styles.productInfo}>
        <span style={styles.productCategory}>{product.category}</span>
        <h3 style={styles.productName}>{product.name}</h3>
        <p style={styles.productDescription}>{product.description.substring(0, 60)}...</p>
        <div style={styles.productFooter}>
          <span style={styles.productPrice}>{formattedPrice}</span>
          {onAddToCart && (
            <button
              style={styles.addToCartButton}
              onClick={() => onAddToCart(product)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.primary_dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.primary;
              }}
            >
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BestSellersSection = ({ onAddToCart }: { onAddToCart?: (product: Product) => void }) => {
  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Los Mas Vendidos</h2>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Los Mas Vendidos</h2>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Error al cargar productos: {error}</p>
          <button style={styles.retryButton} onClick={() => fetchProducts()}>
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  const bestSellers = products.slice(0, 4);

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Los Mas Vendidos</h2>
      <div style={styles.productsGrid}>
        {bestSellers.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Maria Garcia',
      text: 'Mi gato esta encantado con los productos. La calidad es excepcional y los precios muy razonables.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Carlos Lopez',
      text: 'Entrega rapida y atencion al cliente excelente. Definitivamente mi tienda favorita para productos felinos.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Ana Martinez',
      text: 'Encontre exactamente lo que necesitaba para mi gatito nuevo. El catalogo es muy completo.',
      rating: 4,
    },
  ];

  const StarRating = ({ rating }: { rating: number }) => (
    <div style={styles.starRating}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={styles.star}>
          {star <= rating ? '\u2605' : '\u2606'}
        </span>
      ))}
    </div>
  );

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Lo Que Dicen Nuestros Clientes</h2>
      <div style={styles.testimonialsContainer}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} style={styles.testimonialCard}>
            <StarRating rating={testimonial.rating} />
            <p style={styles.testimonialText}>"{testimonial.text}"</p>
            <p style={styles.testimonialAuthor}>— {testimonial.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setErrorMessage('');

    if (!email) {
      setStatus('error');
      setErrorMessage('Por favor ingresa tu correo electronico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Por favor ingresa un correo electronico valido');
      return;
    }

    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 500);
  };

  return (
    <section style={styles.newsletterSection}>
      <div style={styles.newsletterContent}>
        <h2 style={styles.newsletterTitle}>Unete a nuestra comunidad felina</h2>
        <p style={styles.newsletterSubtitle}>
          Suscribete para recibir ofertas exclusivas, consejos de cuidado y novedades para tu gato.
        </p>
        <form onSubmit={handleSubmit} style={styles.newsletterForm}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.newsletterInput}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.neutral_medium;
              }}
            />
            <button
              type="submit"
              style={styles.newsletterButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.primary_dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.primary;
              }}
            >
              Suscribirme
            </button>
          </div>
          {status === 'success' && (
            <p style={styles.successMessage}>Gracias por suscribirte! Pronto recibiras novedades.</p>
          )}
          {status === 'error' && (
            <p style={styles.errorMessage}>{errorMessage}</p>
          )}
        </form>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.footerContent}>
      <div style={styles.footerSection}>
        <h4 style={styles.footerTitle}>CatShop</h4>
        <p style={styles.footerText}>
          Tu tienda online especializada en productos para gatos. Calidad, amor y cuidado en cada producto.
        </p>
      </div>
      <div style={styles.footerSection}>
        <h4 style={styles.footerTitle}>Enlaces Rapidos</h4>
        <ul style={styles.footerLinks}>
          <li><a href="/catlogodeproductos" style={styles.footerLink}>Catalogo</a></li>
          <li><a href="/acerca" style={styles.footerLink}>Acerca de Nosotros</a></li>
          <li><a href="/contacto" style={styles.footerLink}>Contacto</a></li>
        </ul>
      </div>
      <div style={styles.footerSection}>
        <h4 style={styles.footerTitle}>Legal</h4>
        <ul style={styles.footerLinks}>
          <li><a href="/privacidad" style={styles.footerLink}>Politica de Privacidad</a></li>
          <li><a href="/terminos" style={styles.footerLink}>Terminos y Condiciones</a></li>
        </ul>
      </div>
      <div style={styles.footerSection}>
        <h4 style={styles.footerTitle}>Siguenos</h4>
        <div style={styles.socialLinks}>
          <a href="#" style={styles.socialLink}>Facebook</a>
          <a href="#" style={styles.socialLink}>Instagram</a>
        </div>
      </div>
    </div>
    <div style={styles.footerBottom}>
      <p style={styles.copyright}>© 2024 CatShop. Todos los derechos reservados.</p>
    </div>
  </footer>
);

export default function HomePage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => [...prev, product]);
    alert(product.name + ' agregado al carrito');
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navbarLogo}>
          <span style={styles.logoIcon}>🐱</span>
          <span style={styles.logoText}>CatShop</span>
        </div>
        <div style={styles.navbarLinks}>
          <a href="/iniciohome" style={styles.navLink}>Inicio</a>
          <a href="/catlogodeproductos" style={styles.navLink}>Productos</a>
          <a href="/acerca" style={styles.navLink}>Nosotros</a>
          <a href="/contacto" style={styles.navLink}>Contacto</a>
        </div>
        <div style={styles.navbarActions}>
          <button style={styles.cartButton}>
            🛒 <span style={styles.cartCount}>{cartItems.length}</span>
          </button>
          <a href="/login" style={styles.loginButton}>Iniciar Sesion</a>
        </div>
      </nav>

      <main>
        <HeroSection />
        <CategoriesSection />
        <BestSellersSection onAddToCart={handleAddToCart} />
        <TestimonialsSection />
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: tokens.typography.font_family,
    backgroundColor: tokens.colors.neutral_light,
    minHeight: '100vh',
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
    fontSize: tokens.typography.body.regular.size,
    position: 'relative',
  },
  cartCount: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: tokens.colors.accent,
    color: tokens.colors.neutral_white,
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600,
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
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacing.xl,
    padding: tokens.spacing.section + 'px ' + tokens.spacing.xl + 'px',
    backgroundColor: tokens.colors.neutral_white,
    minHeight: '500px',
    alignItems: 'center',
  },
  heroContent: {
    padding: tokens.spacing.xl,
  },
  heroTitle: {
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    lineHeight: tokens.typography.headings.h1.line_height,
    color: tokens.colors.neutral_black,
    marginBottom: tokens.spacing.md,
  },
  heroSubtitle: {
    fontSize: tokens.typography.body.large.size,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.lg,
    lineHeight: tokens.typography.body.large.line_height,
  },
  heroButton: {
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.md + 'px ' + tokens.spacing.xl + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  heroImage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImagePlaceholder: {
    width: '300px',
    height: '300px',
    borderRadius: tokens.border_radius.xl,
    backgroundColor: tokens.colors.neutral_light,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: tokens.spacing.section + 'px ' + tokens.spacing.xl + 'px',
  },
  sectionTitle: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    lineHeight: tokens.typography.headings.h2.line_height,
    color: tokens.colors.neutral_black,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacing.lg,
  },
  categoryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: tokens.spacing.xl,
    backgroundColor: tokens.colors.neutral_white,
    border: '1px solid ' + tokens.colors.neutral_medium,
    borderRadius: tokens.border_radius.lg,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  categoryIcon: {
    fontSize: '48px',
  },
  categoryName: {
    fontSize: tokens.typography.body.large.size,
    fontWeight: 500,
    color: tokens.colors.neutral_dark,
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: tokens.spacing.lg,
  },
  productCard: {
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.lg,
    overflow: 'hidden',
    boxShadow: tokens.shadows.card,
    transition: 'box-shadow 0.2s ease',
  },
  productImageContainer: {
    height: '200px',
    backgroundColor: tokens.colors.neutral_light,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productImagePlaceholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: tokens.spacing.lg,
  },
  productCategory: {
    fontSize: tokens.typography.caption.size,
    fontWeight: tokens.typography.caption.weight,
    color: tokens.colors.secondary,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    color: tokens.colors.neutral_black,
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.xs,
  },
  productDescription: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.info,
    lineHeight: tokens.typography.body.small.line_height,
    marginBottom: tokens.spacing.md,
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: tokens.typography.headings.h3.size,
    fontWeight: tokens.typography.headings.h3.weight,
    color: tokens.colors.primary,
  },
  addToCartButton: {
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.sm + 'px ' + tokens.spacing.md + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  loadingContainer: {
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
  },
  retryButton: {
    backgroundColor: tokens.colors.secondary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.sm + 'px ' + tokens.spacing.md + 'px',
    cursor: 'pointer',
  },
  testimonialsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacing.lg,
  },
  testimonialCard: {
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.lg,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
  },
  starRating: {
    marginBottom: tokens.spacing.sm,
  },
  star: {
    color: tokens.colors.warning,
    fontSize: '18px',
    marginRight: '2px',
  },
  testimonialText: {
    fontSize: tokens.typography.body.regular.size,
    lineHeight: tokens.typography.body.regular.line_height,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.md,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.info,
  },
  newsletterSection: {
    backgroundColor: tokens.colors.primary,
    padding: tokens.spacing.section + 'px ' + tokens.spacing.xl + 'px',
  },
  newsletterContent: {
    maxWidth: '480px',
    margin: '0 auto',
    textAlign: 'center',
  },
  newsletterTitle: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.neutral_white,
    marginBottom: tokens.spacing.sm,
  },
  newsletterSubtitle: {
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_white,
    opacity: 0.9,
    marginBottom: tokens.spacing.lg,
  },
  newsletterForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  },
  inputGroup: {
    display: 'flex',
    gap: tokens.spacing.sm,
  },
  newsletterInput: {
    flex: 1,
    padding: tokens.spacing.md + 'px',
    border: '2px solid ' + tokens.colors.neutral_medium,
    borderRadius: tokens.border_radius.md,
    fontSize: tokens.typography.body.regular.size,
    outline: 'none',
  },
  newsletterButton: {
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.neutral_white,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.md + 'px ' + tokens.spacing.lg + 'px',
    fontSize: tokens.typography.button.size,
    fontWeight: tokens.typography.button.weight,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap',
  },
  successMessage: {
    color: tokens.colors.neutral_white,
    fontSize: tokens.typography.body.small.size,
    padding: tokens.spacing.sm,
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
    borderRadius: tokens.border_radius.sm,
  },
  errorMessage: {
    color: tokens.colors.neutral_white,
    fontSize: tokens.typography.body.small.size,
    padding: tokens.spacing.sm,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: tokens.border_radius.sm,
  },
  footer: {
    backgroundColor: tokens.colors.neutral_black,
    color: tokens.colors.neutral_white,
    paddingTop: tokens.spacing.xxl,
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
  socialLinks: {
    display: 'flex',
    gap: tokens.spacing.md,
  },
  socialLink: {
    textDecoration: 'none',
    color: tokens.colors.neutral_medium,
    fontSize: tokens.typography.body.small.size,
  },
  footerBottom: {
    borderTop: '1px solid ' + tokens.colors.neutral_dark,
    padding: tokens.spacing.lg,
    textAlign: 'center',
  },
  copyright: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.neutral_medium,
  },
};

const globalStyles = document.createElement('style');
globalStyles.textContent = '@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Inter, sans-serif; } a:hover { color: ' + tokens.colors.primary + '; }';
document.head.appendChild(globalStyles);
