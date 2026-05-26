import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useProducts, Product } from '../hooks/useProducts';

const CATEGORIES = [
  { id: 'all', name: 'Todos los productos' },
  { id: 'food', name: 'Alimentos' },
  { id: 'toys', name: 'Juguetes' },
  { id: 'bedding', name: 'Descanso' },
  { id: 'hygiene', name: 'Higiene' },
  { id: 'accessories', name: 'Accesorios' },
];

const SORT_OPTIONS = [
  { id: 'name-asc', name: 'Nombre A-Z' },
  { id: 'name-desc', name: 'Nombre Z-A' },
  { id: 'price-asc', name: 'Precio menor a mayor' },
  { id: 'price-desc', name: 'Precio mayor a menor' },
  { id: 'newest', name: 'Mas recientes' },
];

const PRODUCTS_PER_PAGE = 12;

const Breadcrumb = ({ category }: { category: string }) => (
  <nav style={styles.breadcrumb}>
    <a href="/iniciohome" style={styles.breadcrumbLink}>Inicio</a>
    <span style={styles.breadcrumbSeparator}>/</span>
    <span style={styles.breadcrumbCurrent}>Productos</span>
    {category && category !== 'all' && (
      <>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbCurrent}>
          {CATEGORIES.find(c => c.id === category)?.name || category}
        </span>
      </>
    )}
  </nav>
);

const Spinner = () => (
  <div style={styles.spinnerContainer}>
    <div style={styles.spinner}></div>
    <p style={styles.spinnerText}>Cargando productos...</p>
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' }) => {
  const badgeStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: tokens.colors.neutral_medium, color: tokens.colors.neutral_dark },
    success: { backgroundColor: tokens.colors.success, color: tokens.colors.neutral_white },
    warning: { backgroundColor: tokens.colors.warning, color: tokens.colors.neutral_white },
    error: { backgroundColor: tokens.colors.error, color: tokens.colors.neutral_white },
  };

  return (
    <span style={{ ...styles.badge, ...badgeStyles[variant] }}>
      {children}
    </span>
  );
};

const ProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart?: (product: Product) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price / 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      onAddToCart?.(product);
    }
  };

  const handleCardClick = () => {
    navigate(`/detalledeproducto/${product.id}`);
  };

  return (
    <div
      style={{
        ...styles.productCard,
        ...(isHovered ? { boxShadow: tokens.shadows.elevated, transform: 'translateY(-4px)' } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div style={styles.productImageContainer}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={styles.productImage} />
        ) : (
          <div style={styles.productImagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.neutral_dark} strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
        {product.stock === 0 && (
          <div style={styles.outOfStockOverlay}>
            <Badge variant="error">Agotado</Badge>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div style={styles.lowStockOverlay}>
            <Badge variant="warning">Solo {product.stock} restantes</Badge>
          </div>
        )}
      </div>
      <div style={styles.productInfo}>
        <span style={styles.productCategory}>{product.category}</span>
        <h3 style={styles.productName}>{product.name}</h3>
        <p style={styles.productDescription}>{product.description.substring(0, 80)}...</p>
        <div style={styles.productFooter}>
          <span style={styles.productPrice}>{formattedPrice}</span>
          <button
            style={{
              ...styles.addToCartButton,
              ...(product.stock === 0 ? styles.addToCartButtonDisabled : {}),
            }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            onMouseEnter={(e) => {
              if (product.stock > 0) {
                e.currentTarget.style.backgroundColor = tokens.colors.primary_dark;
              }
            }}
            onMouseLeave={(e) => {
              if (product.stock > 0) {
                e.currentTarget.style.backgroundColor = tokens.colors.primary;
              }
            }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterSidebar = ({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
}: {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}) => {
  const [localMinPrice, setLocalMinPrice] = useState(priceRange[0].toString());
  const [localMaxPrice, setLocalMaxPrice] = useState(priceRange[1].toString());

  useEffect(() => {
    setLocalMinPrice(priceRange[0].toString());
    setLocalMaxPrice(priceRange[1].toString());
  }, [priceRange]);

  const handleMinPriceChange = (value: string) => {
    setLocalMinPrice(value);
    const min = parseInt(value) || 0;
    onPriceRangeChange([min, priceRange[1]]);
  };

  const handleMaxPriceChange = (value: string) => {
    setLocalMaxPrice(value);
    const max = parseInt(value) || 0;
    onPriceRangeChange([priceRange[0], max]);
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h3 style={styles.sidebarTitle}>Filtros</h3>
        <button style={styles.clearButton} onClick={onClearFilters}>
          Limpiar
        </button>
      </div>

      <div style={styles.filterSection}>
        <h4 style={styles.filterTitle}>Categoria</h4>
        <div style={styles.filterOptions}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              style={{
                ...styles.filterOption,
                ...(selectedCategory === cat.id ? styles.filterOptionActive : {}),
              }}
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.filterSection}>
        <h4 style={styles.filterTitle}>Rango de Precio</h4>
        <div style={styles.priceInputs}>
          <div style={styles.priceInputGroup}>
            <label style={styles.priceLabel}>Min</label>
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              style={styles.priceInput}
              min="0"
              placeholder="0"
            />
          </div>
          <span style={styles.priceSeparator}>-</span>
          <div style={styles.priceInputGroup}>
            <label style={styles.priceLabel}>Max</label>
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              style={styles.priceInput}
              min="0"
              placeholder="99999"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <nav style={styles.pagination}>
      <button
        style={{
          ...styles.paginationButton,
          ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
        }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      <div style={styles.paginationPages}>
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              style={{
                ...styles.paginationPage,
                ...(currentPage === page ? styles.paginationPageActive : {}),
              }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ) : (
            <span key={index} style={styles.paginationEllipsis}>...</span>
          )
        )}
      </div>

      <button
        style={{
          ...styles.paginationButton,
          ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}),
        }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </nav>
  );
};

export default function ProductCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, fetchProducts } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartItems, setCartItems] = useState<Product[]>([]);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
    fetchProducts(category && category !== 'all' ? category : undefined);
  }, [searchParams, fetchProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, selectedCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 999999]);
    setSortBy('name-asc');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => [...prev, product]);
    alert(product.name + ' agregado al carrito');
  };

  const handleRetry = () => {
    fetchProducts(selectedCategory !== 'all' ? selectedCategory : undefined);
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
          <a href="/catlogodeproductos" style={{ ...styles.navLink, color: tokens.colors.primary }}>Productos</a>
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

      <main style={styles.main}>
        <div style={styles.headerSection}>
          <Breadcrumb category={selectedCategory} />
          <h1 style={styles.pageTitle}>Catalogo de Productos</h1>
          <p style={styles.resultCount}>
            {filteredAndSortedProducts.length} productos encontrados
          </p>
        </div>

        <div style={styles.contentWrapper}>
          <div style={styles.mobileFilterBar}>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={styles.mobileSelect}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select value={sortBy} onChange={handleSortChange} style={styles.mobileSelect}>
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          <FilterSidebar
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            onPriceRangeChange={(range) => { setPriceRange(range); setCurrentPage(1); }}
            onClearFilters={handleClearFilters}
          />

          <div style={styles.productsSection}>
            <div style={styles.sortBar}>
              <label style={styles.sortLabel}>Ordenar por:</label>
              <select value={sortBy} onChange={handleSortChange} style={styles.sortSelect}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <Spinner />
            ) : error ? (
              <div style={styles.errorContainer}>
                <p style={styles.errorText}>Error al cargar productos: {error}</p>
                <button style={styles.retryButton} onClick={handleRetry}>
                  Reintentar
                </button>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div style={styles.emptyContainer}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.neutral_dark} strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <p style={styles.emptyText}>No se encontraron productos</p>
                <button style={styles.retryButton} onClick={handleClearFilters}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div style={styles.productsGrid}>
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
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
              <li><a href="/catlogodeproductos" style={styles.footerLink}>Catalogo</a></li>
              <li><a href="/login" style={styles.footerLink}>Mi Cuenta</a></li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>© 2024 CatShop. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, sans-serif; }
        a:hover { color: ${tokens.colors.primary}; }
        input:focus, select:focus, button:focus { outline: 2px solid ${tokens.colors.primary_light}; outline-offset: 2px; }
        @media (max-width: 768px) {
          .filter-sidebar { display: none !important; }
          .mobile-filter-bar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-filter-bar { display: none !important; }
        }
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
  main: {
    flex: 1,
    padding: tokens.spacing.lg + 'px ' + tokens.spacing.xl + 'px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  headerSection: {
    marginBottom: tokens.spacing.xl,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
    fontSize: tokens.typography.body.small.size,
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
  },
  pageTitle: {
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    lineHeight: tokens.typography.headings.h1.line_height,
    color: tokens.colors.neutral_black,
    marginBottom: tokens.spacing.sm,
  },
  resultCount: {
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
  },
  contentWrapper: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: tokens.spacing.lg,
    alignItems: 'start',
  },
  mobileFilterBar: {
    display: 'none',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    gridColumn: '1 / -1',
  },
  mobileSelect: {
    flex: 1,
    padding: tokens.spacing.sm + 'px ' + tokens.spacing.md + 'px',
    border: '2px solid ' + tokens.colors.neutral_medium,
    borderRadius: tokens.border_radius.md,
    fontSize: tokens.typography.body.regular.size,
    backgroundColor: tokens.colors.neutral_white,
    cursor: 'pointer',
  },
  sidebar: {
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.lg,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
    position: 'sticky',
    top: '100px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  sidebarTitle: {
    fontSize: tokens.typography.headings.h3.size,
    fontWeight: tokens.typography.headings.h3.weight,
    color: tokens.colors.neutral_black,
  },
  clearButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: tokens.colors.secondary,
    fontSize: tokens.typography.body.small.size,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  filterSection: {
    marginBottom: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
    borderBottom: '1px solid ' + tokens.colors.neutral_medium,
  },
  filterTitle: {
    fontSize: tokens.typography.body.regular.size,
    fontWeight: 600,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.md,
  },
  filterOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
  },
  filterOption: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: tokens.spacing.sm + 'px',
    textAlign: 'left',
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
    cursor: 'pointer',
    borderRadius: tokens.border_radius.sm,
    transition: 'all 0.2s ease',
  },
  filterOptionActive: {
    backgroundColor: tokens.colors.primary_light + '30',
    color: tokens.colors.primary_dark,
    fontWeight: 500,
  },
  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  priceInputGroup: {
    flex: 1,
  },
  priceLabel: {
    display: 'block',
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.neutral_dark,
    marginBottom: tokens.spacing.xs,
  },
  priceInput: {
    width: '100%',
    padding: tokens.spacing.sm + 'px',
    border: '2px solid ' + tokens.colors.neutral_medium,
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.body.regular.size,
    backgroundColor: tokens.colors.neutral_white,
  },
  priceSeparator: {
    color: tokens.colors.neutral_dark,
    marginTop: tokens.spacing.md,
  },
  productsSection: {
    minHeight: '400px',
  },
  sortBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.neutral_white,
    borderRadius: tokens.border_radius.md,
  },
  sortLabel: {
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
  },
  sortSelect: {
    padding: tokens.spacing.sm + 'px ' + tokens.spacing.md + 'px',
    border: '2px solid ' + tokens.colors.neutral_medium,
    borderRadius: tokens.border_radius.md,
    fontSize: tokens.typography.body.regular.size,
    backgroundColor: tokens.colors.neutral_white,
    cursor: 'pointer',
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
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  productImageContainer: {
    height: '200px',
    backgroundColor: tokens.colors.neutral_light,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowStockOverlay: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
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
    color: tokens.colors.neutral_dark,
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
  addToCartButtonDisabled: {
    backgroundColor: tokens.colors.neutral_medium,
    color: tokens.colors.neutral_dark,
    cursor: 'not-allowed',
  },
  badge: {
    display: 'inline-block',
    padding: tokens.spacing.xs + 'px ' + tokens.spacing.sm + 'px',
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.caption.size,
    fontWeight: 500,
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
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xxl,
    gap: tokens.spacing.md,
  },
  emptyText: {
    color: tokens.colors.neutral_dark,
    fontSize: tokens.typography.body.large.size,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
  },
  paginationButton: {
    backgroundColor: tokens.colors.neutral_white,
    border: '2px solid ' + tokens.colors.neutral_medium,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.sm + 'px ' + tokens.spacing.md + 'px',
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  paginationButtonDisabled: {
    backgroundColor: tokens.colors.neutral_light,
    color: tokens.colors.neutral_dark,
    cursor: 'not-allowed',
    borderColor: tokens.colors.neutral_light,
  },
  paginationPages: {
    display: 'flex',
    gap: tokens.spacing.xs,
  },
  paginationPage: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.body.regular.size,
    color: tokens.colors.neutral_dark,
    cursor: 'pointer',
    borderRadius: tokens.border_radius.sm,
    transition: 'all 0.2s ease',
  },
  paginationPageActive: {
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.neutral_white,
    fontWeight: 600,
  },
  paginationEllipsis: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colors.neutral_dark,
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
  },
};