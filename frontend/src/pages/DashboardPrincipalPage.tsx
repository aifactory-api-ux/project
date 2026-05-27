import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useNews } from '../hooks/useNews';
import { useAuth } from '../contexts/AuthContext';

interface MetricCardProps {
  label: string;
  value: number | string;
  color?: string;
  icon?: string;
}

function MetricCard({ label, value, color, icon }: MetricCardProps) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricHeader}>
        {icon && <span style={styles.metricIcon}>{icon}</span>}
        <span style={styles.metricLabel}>{label}</span>
      </div>
      <div style={{ ...styles.metricValue, color: color || tokens.colors.text_primary }}>
        {value}
      </div>
    </div>
  );
}

interface PriorityBadgeProps {
  priority: number;
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { color, label } = useMemo(() => {
    switch (priority) {
      case 4:
        return { color: tokens.colors.semaphore_red, label: 'CRÍTICO' };
      case 3:
        return { color: tokens.colors.warning, label: 'ALTO' };
      case 2:
        return { color: tokens.colors.semaphore_yellow, label: 'MEDIO' };
      default:
        return { color: tokens.colors.semaphore_green, label: 'BAJO' };
    }
  }, [priority]);

  return (
    <span
      style={{
        ...styles.priorityBadge,
        backgroundColor: color,
      }}
    >
      {label}
    </span>
  );
}

interface NewsCardProps {
  id: number;
  title: string;
  source: string;
  country: string;
  publishedAt: string;
  priority: number;
  tags: string[];
}

function NewsCard({ id, title, source, country, publishedAt, priority, tags }: NewsCardProps) {
  const formattedDate = useMemo(() => {
    const date = new Date(publishedAt);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [publishedAt]);

  return (
    <Link to={`/detalledenoticia/${id}`} style={styles.newsCardLink}>
      <div style={styles.newsCard}>
        <div style={styles.newsCardHeader}>
          <span style={styles.newsSource}>{source}</span>
          <PriorityBadge priority={priority} />
        </div>
        <h4 style={styles.newsCardTitle}>{title}</h4>
        <div style={styles.newsCardMeta}>
          <span style={styles.newsCountry}>{country}</span>
          <span style={styles.newsDate}>{formattedDate}</span>
        </div>
        <div style={styles.newsCardTags}>
          {tags.slice(0, 3).map((tag, index) => (
            <span key={index} style={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
}

function BarChart({ data, title }: BarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  return (
    <div style={styles.chartContainer}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <div style={styles.barChart}>
        {data.map((item, index) => (
          <div key={index} style={styles.barItem}>
            <div style={styles.barLabel}>{item.label}</div>
            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <div style={styles.barValue}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPrincipal() {
  const { user } = useAuth();
  const { news, total, loading, error } = useNews({ limit: 100 });

  const metrics = useMemo(() => {
    const byPriority = { low: 0, medium: 0, high: 0, critical: 0 };
    const byCountry: Record<string, number> = {};

    news.forEach((item) => {
      switch (item.priority) {
        case 1:
          byPriority.low++;
          break;
        case 2:
          byPriority.medium++;
          break;
        case 3:
          byPriority.high++;
          break;
        case 4:
          byPriority.critical++;
          break;
      }
      byCountry[item.country] = (byCountry[item.country] || 0) + 1;
    });

    return { byPriority, byCountry };
  }, [news]);

  const priorityDistribution = useMemo(
    () => [
      { label: 'Bajo', value: metrics.byPriority.low, color: tokens.colors.semaphore_green },
      { label: 'Medio', value: metrics.byPriority.medium, color: tokens.colors.semaphore_yellow },
      { label: 'Alto', value: metrics.byPriority.high, color: tokens.colors.warning },
      { label: 'Crítico', value: metrics.byPriority.critical, color: tokens.colors.semaphore_red },
    ],
    [metrics]
  );

  const countryDistribution = useMemo(() => {
    const countryColors: Record<string, string> = {
      CL: '#0033A0',
      AR: '#74ACDF',
      CO: '#FCD116',
      BR: '#009C3B',
      PE: '#D91023',
      UY: '#FFFFFF',
    };
    return Object.entries(metrics.byCountry).map(([code, count]) => ({
      label: code,
      value: count,
      color: countryColors[code] || tokens.colors.info,
    }));
  }, [metrics]);

  const criticalNews = useMemo(
    () => news.filter((item) => item.priority === 4).slice(0, 5),
    [news]
  );

  const recentNews = useMemo(() => {
    const sorted = [...news].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
    return sorted.slice(0, 8);
  }, [news]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <span>Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorState}>
          <span style={styles.errorIcon}>⚠</span>
          <span>Error al cargar el dashboard: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.headerTitle}>Daily Pulse</h1>
            <p style={styles.headerSubtitle}>
              Bienvenido, {user?.full_name || 'Usuario'}
            </p>
          </div>
          <div style={styles.headerDate}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Resumen de Noticias</h2>
          <div style={styles.metricsGrid}>
            <MetricCard label="Total Noticias" value={total} />
            <MetricCard
              label="Críticas"
              value={metrics.byPriority.critical}
              color={tokens.colors.semaphore_red}
            />
            <MetricCard
              label="Altas"
              value={metrics.byPriority.high}
              color={tokens.colors.warning}
            />
            <MetricCard
              label="Medias"
              value={metrics.byPriority.medium}
              color={tokens.colors.semaphore_yellow}
            />
            <MetricCard
              label="Bajas"
              value={metrics.byPriority.low}
              color={tokens.colors.semaphore_green}
            />
          </div>
        </section>

        <div style={styles.dashboardGrid}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Distribución por Prioridad</h2>
            </div>
            <BarChart data={priorityDistribution} title="" />
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Distribución por País</h2>
            </div>
            <BarChart data={countryDistribution} title="" />
          </section>
        </div>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Noticias Críticas</h2>
            <Link to="/listadenoticias?priority=4" style={styles.viewAllLink}>
              Ver todas →
            </Link>
          </div>
          {criticalNews.length === 0 ? (
            <p style={styles.emptyState}>No hay noticias críticas</p>
          ) : (
            <div style={styles.newsGrid}>
              {criticalNews.map((item) => (
                <NewsCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  source={item.source.name}
                  country={item.country}
                  publishedAt={item.published_at}
                  priority={item.priority}
                  tags={item.tags}
                />
              ))}
            </div>
          )}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Noticias Recientes</h2>
            <Link to="/listadenoticias" style={styles.viewAllLink}>
              Ver todas →
            </Link>
          </div>
          {recentNews.length === 0 ? (
            <p style={styles.emptyState}>No hay noticias recientes</p>
          ) : (
            <div style={styles.newsList}>
              {recentNews.map((item) => (
                <div key={item.id} style={styles.recentNewsItem}>
                  <PriorityBadge priority={item.priority} />
                  <Link to={`/detalledenoticia/${item.id}`} style={styles.recentNewsTitle}>
                    {item.title}
                  </Link>
                  <span style={styles.recentNewsSource}>{item.source.name}</span>
                  <span style={styles.recentNewsDate}>
                    {new Date(item.published_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerDate: {
    fontSize: tokens.typography.body.medium.size,
    textTransform: 'capitalize',
  },
  main: {
    maxWidth: 1440,
    margin: '0 auto',
    padding: tokens.spacing.xl,
  },
  section: {
    marginBottom: tokens.spacing.xl,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  sectionTitle: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    lineHeight: tokens.typography.headings.h2.line_height,
    color: tokens.colors.text_primary,
    marginBottom: tokens.spacing.md,
  },
  viewAllLink: {
    color: tokens.colors.primary,
    textDecoration: 'none',
    fontSize: tokens.typography.body.medium.size,
    fontWeight: 500,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacing.md,
  },
  metricCard: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
    border: `1px solid ${tokens.colors.border}`,
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  metricIcon: {
    fontSize: tokens.iconography.size_lg,
  },
  metricLabel: {
    fontSize: tokens.typography.label.size,
    fontWeight: tokens.typography.label.weight,
    letterSpacing: tokens.typography.label.letter_spacing,
    textTransform: tokens.typography.label.text_transform,
    color: tokens.colors.text_secondary,
  },
  metricValue: {
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    lineHeight: 1,
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  chartContainer: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
    border: `1px solid ${tokens.colors.border}`,
  },
  chartTitle: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    color: tokens.colors.text_primary,
    marginBottom: tokens.spacing.md,
  },
  barChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  },
  barItem: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 40px',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  barLabel: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.text_secondary,
    fontWeight: 500,
  },
  barTrack: {
    height: 8,
    backgroundColor: tokens.colors.secondary_light,
    borderRadius: tokens.border_radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: tokens.border_radius.full,
    transition: `width ${tokens.motion.duration_normal}ms ${tokens.motion.easing}`,
  },
  barValue: {
    fontSize: tokens.typography.body.medium.size,
    fontWeight: 600,
    color: tokens.colors.text_primary,
    textAlign: 'right',
  },
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: tokens.spacing.md,
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
  newsCardTitle: {
    fontSize: tokens.typography.body.large.size,
    fontWeight: 500,
    color: tokens.colors.text_primary,
    marginBottom: tokens.spacing.sm,
    lineHeight: tokens.typography.body.large.line_height,
    display: '-webkit-box',
    WebkitLineClamp: 2,
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
  },
  newsDate: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.text_secondary,
  },
  newsCardTags: {
    display: 'flex',
    gap: tokens.spacing.xs,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    fontSize: tokens.typography.label.size,
    fontWeight: tokens.typography.label.weight,
    letterSpacing: tokens.typography.label.letter_spacing,
    textTransform: tokens.typography.label.text_transform,
    color: tokens.colors.text_on_primary,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.border_radius.sm,
  },
  tag: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.text_secondary,
    backgroundColor: tokens.colors.secondary_light,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.border_radius.sm,
  },
  newsList: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    border: `1px solid ${tokens.colors.border}`,
    overflow: 'hidden',
  },
  recentNewsItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: tokens.spacing.md,
    borderBottom: `1px solid ${tokens.colors.border}`,
  },
  recentNewsTitle: {
    flex: 1,
    fontSize: tokens.typography.body.medium.size,
    color: tokens.colors.text_primary,
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  recentNewsSource: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.text_secondary,
    minWidth: 100,
  },
  recentNewsDate: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.text_secondary,
    minWidth: 70,
    textAlign: 'right',
  },
  emptyState: {
    fontSize: tokens.typography.body.medium.size,
    color: tokens.colors.text_secondary,
    textAlign: 'center',
    padding: tokens.spacing.xl,
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
  errorState: {
    display: 'flex',
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