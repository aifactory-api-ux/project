import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useNews, NewsQueryParams } from '../hooks/useNews';
import type { NewsItem } from '../types/models';

const COUNTRIES = [
  { code: '', label: 'Todos los países' },
  { code: 'CL', label: 'Chile' },
  { code: 'AR', label: 'Argentina' },
  { code: 'CO', label: 'Colombia' },
  { code: 'BR', label: 'Brasil' },
  { code: 'PE', label: 'Perú' },
  { code: 'UY', label: 'Uruguay' },
];

const PRIORITIES = [
  { value: undefined, label: 'Todas las prioridades' },
  { value: 4, label: 'Crítico' },
  { value: 3, label: 'Alto' },
  { value: 2, label: 'Medio' },
  { value: 1, label: 'Bajo' },
];

interface PriorityBadgeProps {
  priority: number;
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const color = useMemo(() => {
    switch (priority) {
      case 4:
        return tokens.colors.semaphore_red;
      case 3:
        return tokens.colors.warning;
      case 2:
        return tokens.colors.semaphore_yellow;
      default:
        return tokens.colors.semaphore_green;
    }
  }, [priority]);

  const label = useMemo(() => {
    switch (priority) {
      case 4:
        return 'CRÍTICO';
      case 3:
        return 'ALTO';
      case 2:
        return 'MEDIO';
      default:
        return 'BAJO';
    }
  }, [priority]);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing.xs,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      <span
        style={{
          ...styles.priorityLabel,
          color: color,
        }}
      >
        {label}
      </span>
    </span>
  );
}

interface TagChipProps {
  tag: string;
}

function TagChip({ tag }: TagChipProps) {
  return (
    <span style={styles.tagChip}>{tag}</span>
  );
}

interface NewsCardProps {
  item: NewsItem;
}

function NewsCard({ item }: NewsCardProps) {
  const formattedDate = useMemo(() => {
    const date = new Date(item.published_at);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [item.published_at]);

  return (
    <Link to={`/detalledenoticia/${item.id}`} style={styles.newsCardLink}>
      <div style={styles.newsCard}>
        <div style={styles.newsCardHeader}>
          <span style={styles.newsSource}>{item.source.name}</span>
          <PriorityBadge priority={item.priority} />
        </div>
        <h3 style={styles.newsCardTitle}>{item.title}</h3>
        <p style={styles.newsCardSummary}>{item.summary}</p>
        <div style={styles.newsCardMeta}>
          <span style={styles.newsCountry}>{item.country}</span>
          <span style={styles.newsDate}>{formattedDate}</span>
        </div>
        <div style={styles.newsCardTags}>
          {item.tags.slice(0, 4).map((tag, index) => (
            <TagChip key={index} tag={tag} />
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function ListaNoticiasPage() {
  const [country, setCountry] = useState('');
  const [tag, setTag] = useState('');
  const [priority, setPriority] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const queryParams = useMemo((): NewsQueryParams => {
    const params: NewsQueryParams = {
      limit: pageSize,
      offset: page * pageSize,
    };
    if (country) params.country = country;
    if (tag) params.tag = tag;
    if (priority !== undefined) params.priority = priority;
    return params;
  }, [country, tag, priority, page]);

  const { news, total, loading, error } = useNews(queryParams);
  const totalPages = Math.ceil(total / pageSize);

  const handleFilterChange = () => {
    setPage(0);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    handleFilterChange();
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTag(e.target.value);
    handleFilterChange();
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPriority(val === '' ? undefined : parseInt(val, 10));
    handleFilterChange();
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    news.forEach((item) => item.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [news]);

  if (error) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Lista de Noticias</h1>
        </header>
        <main style={styles.main}>
          <div style={styles.errorState}>
            <span style={styles.errorIcon}>⚠</span>
            <span>Error al cargar las noticias: {error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Lista de Noticias</h1>
          <p style={styles.headerSubtitle}>
            {total} noticias encontradas
          </p>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>País</label>
            <select
              style={styles.filterSelect}
              value={country}
              onChange={handleCountryChange}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Prioridad</label>
            <select
              style={styles.filterSelect}
              value={priority === undefined ? '' : priority}
              onChange={handlePriorityChange}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value === undefined ? '' : p.value} value={p.value === undefined ? '' : p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Etiqueta</label>
            <input
              type="text"
              style={styles.filterInput}
              placeholder="Buscar etiqueta..."
              value={tag}
              onChange={handleTagChange}
            />
          </div>

          {allTags.length > 0 && (
            <div style={styles.quickTags}>
              <span style={styles.quickTagsLabel}>Populares:</span>
              {allTags.slice(0, 6).map((t) => (
                <button
                  key={t}
                  style={{
                    ...styles.quickTagButton,
                    backgroundColor: tag === t ? tokens.colors.primary_light : tokens.colors.secondary_light,
                    color: tag === t ? tokens.colors.primary : tokens.colors.text_secondary,
                  }}
                  onClick={() => {
                    setTag(tag === t ? '' : t);
                    handleFilterChange();
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <span>Cargando noticias...</span>
          </div>
        ) : news.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <span>No se encontraron noticias con los filtros seleccionados</span>
          </div>
        ) : (
          <>
            <div style={styles.newsGrid}>
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.pageButton,
                  opacity: page === 0 ? 0.5 : 1,
                }}
                onClick={handlePrevPage}
                disabled={page === 0}
              >
                ← Anterior
              </button>
              <span style={styles.pageInfo}>
                Página {page + 1} de {totalPages}
              </span>
              <button
                style={{
                  ...styles.pageButton,
                  opacity: page >= totalPages - 1 ? 0.5 : 1,
                }}
                onClick={handleNextPage}
                disabled={page >= totalPages - 1}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: tokens.colors.surface,
    fontFamily: tokens.typography.font_family,
  },
  header: {
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.text_on_primary,
    padding: `${tokens.spacing.lg} ${tokens.spacing.xl}`,
  },
  headerContent: {
    maxWidth: 1440,
    margin: '0 auto',
  },
  headerTitle: {
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    lineHeight: tokens.typography.headings.h1.line_height,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    fontSize: tokens.typography.body.large.size,
    opacity: 0.9,
  },
  main: {
    maxWidth: 1440,
    margin: '0 auto',
    padding: tokens.spacing.xl,
  },
  filterBar: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
    boxShadow: tokens.shadows.card,
    border: `1px solid ${tokens.colors.border}`,
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.md,
  },
  filterLabel: {
    fontSize: tokens.typography.label.size,
    fontWeight: tokens.typography.label.weight,
    letterSpacing: tokens.typography.label.letter_spacing,
    textTransform: tokens.typography.label.text_transform,
    color: tokens.colors.text_secondary,
  },
  filterSelect: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.typography.body.medium.size,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.border_radius.md,
    backgroundColor: tokens.colors.background,
    color: tokens.colors.text_primary,
    outline: 'none',
    transition: `border-color ${tokens.motion.duration_fast}ms`,
  },
  filterInput: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.typography.body.medium.size,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.border_radius.md,
    backgroundColor: tokens.colors.background,
    color: tokens.colors.text_primary,
    outline: 'none',
    transition: `border-color ${tokens.motion.duration_fast}ms`,
  },
  quickTags: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    flexWrap: 'wrap',
    marginTop: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    borderTop: `1px solid ${tokens.colors.border}`,
  },
  quickTagsLabel: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.text_secondary,
    fontWeight: 500,
  },
  quickTagButton: {
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    fontSize: tokens.typography.caption.size,
    fontWeight: 500,
    border: 'none',
    borderRadius: tokens.border_radius.full,
    cursor: 'pointer',
    transition: `background-color ${tokens.motion.duration_fast}ms`,
  },
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: tokens.spacing.lg,
  },
  newsCardLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  newsCard: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
    border: `1px solid ${tokens.colors.border}`,
    transition: `box-shadow ${tokens.motion.duration_fast}ms ${tokens.motion.easing}`,
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  newsCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  newsSource: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.text_secondary,
    fontWeight: 500,
  },
  priorityLabel: {
    fontSize: tokens.typography.label.size,
    fontWeight: tokens.typography.label.weight,
    letterSpacing: tokens.typography.label.letter_spacing,
    textTransform: tokens.typography.label.text_transform,
  },
  newsCardTitle: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    lineHeight: tokens.typography.headings.h4.line_height,
    color: tokens.colors.text_primary,
    marginBottom: tokens.spacing.sm,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  newsCardSummary: {
    fontSize: tokens.typography.body.medium.size,
    color: tokens.colors.text_secondary,
    lineHeight: tokens.typography.body.medium.line_height,
    marginBottom: tokens.spacing.sm,
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  newsCardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  newsCountry: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.primary,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  newsDate: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.text_secondary,
  },
  newsCardTags: {
    display: 'flex',
    gap: tokens.spacing.xs,
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
  tagChip: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.text_secondary,
    backgroundColor: tokens.colors.secondary_light,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.border_radius.full,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.lg,
    marginTop: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    borderTop: `1px solid ${tokens.colors.border}`,
  },
  pageButton: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.typography.body.medium.size,
    fontWeight: 500,
    color: tokens.colors.primary,
    backgroundColor: tokens.colors.background,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.border_radius.md,
    cursor: 'pointer',
    transition: `all ${tokens.motion.duration_fast}ms`,
  },
  pageInfo: {
    fontSize: tokens.typography.body.medium.size,
    color: tokens.colors.text_secondary,
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: tokens.spacing.md,
    color: tokens.colors.text_secondary,
  },
  spinner: {
    width: 40,
    height: 40,
    border: `3px solid ${tokens.colors.border}`,
    borderTopColor: tokens.colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: tokens.spacing.md,
    color: tokens.colors.text_secondary,
  },
  emptyIcon: {
    fontSize: 48,
  },
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: tokens.spacing.md,
    color: tokens.colors.danger,
  },
  errorIcon: {
    fontSize: 24,
  },
};