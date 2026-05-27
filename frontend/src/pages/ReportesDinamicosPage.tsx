import React, { useState, useMemo } from 'react';
import { tokens } from '../styles/tokens';
import { useNews, NewsQueryParams } from '../hooks/useNews';

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

interface StatCardProps {
  title: string;
  value: number | string;
  color: string;
  icon: string;
}

function StatCard({ title, value, color, icon }: StatCardProps) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, color }}>
        {icon}
      </div>
      <div style={styles.statContent}>
        <span style={styles.statValue}>{value}</span>
        <span style={styles.statTitle}>{title}</span>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: number }) {
  const color = useMemo(() => {
    switch (priority) {
      case 4: return tokens.colors.semaphore_red;
      case 3: return tokens.colors.warning;
      case 2: return tokens.colors.semaphore_yellow;
      default: return tokens.colors.semaphore_green;
    }
  }, [priority]);

  const label = useMemo(() => {
    switch (priority) {
      case 4: return 'CRÍTICO';
      case 3: return 'ALTO';
      case 2: return 'MEDIO';
      default: return 'BAJO';
    }
  }, [priority]);

  return (
    <span style={{ ...styles.priorityBadge, color, borderColor: color }}>
      {label}
    </span>
  );
}

function TagChip({ tag }: { tag: string }) {
  return <span style={styles.tagChip}>{tag}</span>;
}

type SortField = 'published_at' | 'priority' | 'title' | 'country';
type SortDirection = 'asc' | 'desc';

export default function ReportesDinamicosPage() {
  const [country, setCountry] = useState('');
  const [priority, setPriority] = useState<number | undefined>(undefined);
  const [tag, setTag] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('published_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

  const filteredNews = useMemo(() => {
    let filtered = [...news];

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(item => new Date(item.published_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.published_at) <= toDate);
    }

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'published_at':
          aVal = new Date(a.published_at).getTime();
          bVal = new Date(b.published_at).getTime();
          break;
        case 'priority':
          aVal = a.priority;
          bVal = b.priority;
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'country':
          aVal = a.country;
          bVal = b.country;
          break;
        default:
          return 0;
      }
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [news, dateFrom, dateTo, sortField, sortDirection]);

  const stats = useMemo(() => {
    const totalItems = news.length;
    const criticalCount = news.filter(n => n.priority === 4).length;
    const highCount = news.filter(n => n.priority === 3).length;
    const avgScore = totalItems > 0
      ? (news.reduce((sum, n) => sum + (n.priority * 25), 0) / totalItems).toFixed(1)
      : '0.0';

    return { totalItems, criticalCount, highCount, avgScore };
  }, [news]);

  const countryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    news.forEach(item => {
      counts[item.country] = (counts[item.country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
  }, [news]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFilterChange = () => {
    setPage(0);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    handleFilterChange();
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPriority(val === '' ? undefined : parseInt(val, 10));
    handleFilterChange();
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTag(e.target.value);
    handleFilterChange();
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
    handleFilterChange();
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
    handleFilterChange();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Título', 'Fuente', 'País', 'Prioridad', 'Fecha', 'Tags', 'URL'];
    const rows = filteredNews.map(item => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      item.source.name,
      item.country,
      item.priority,
      item.published_at,
      `"${item.tags.join(', ')}"`,
      item.url,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reportes_dinamicos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(total / pageSize);
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handleClearFilters = () => {
    setCountry('');
    setPriority(undefined);
    setTag('');
    setDateFrom('');
    setDateTo('');
    handleFilterChange();
  };

  const totalPages = Math.ceil(total / pageSize);

  const SortIcon = ({ field }: { field: SortField }) => (
    <span style={styles.sortIcon}>
      {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  if (error) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Reportes Dinámicos</h1>
        </header>
        <main style={styles.main}>
          <div style={styles.errorState}>
            <span style={styles.errorIcon}>⚠</span>
            <span>Error al cargar los reportes: {error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Reportes Dinámicos</h1>
          <p style={styles.headerSubtitle}>
            Análisis y métricas de noticias por región y prioridad
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.exportButton} onClick={handleExportCSV}>
            📥 Exportar CSV
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.statsGrid}>
          <StatCard
            title="Total Noticias"
            value={stats.totalItems}
            color={tokens.colors.info}
            icon="📰"
          />
          <StatCard
            title="Críticos"
            value={stats.criticalCount}
            color={tokens.colors.semaphore_red}
            icon="🔴"
          />
          <StatCard
            title="Altos"
            value={stats.highCount}
            color={tokens.colors.warning}
            icon="🟡"
          />
          <StatCard
            title="Score Promedio"
            value={`${stats.avgScore}%`}
            color={tokens.colors.success}
            icon="📊"
          />
        </div>

        <div style={styles.chartSection}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Distribución por País</h3>
            <div style={styles.chartContent}>
              {countryStats.map(stat => {
                const countryName = COUNTRIES.find(c => c.code === stat.code)?.label || stat.code;
                const percentage = stats.totalItems > 0 ? (stat.count / stats.totalItems * 100) : 0;
                return (
                  <div key={stat.code} style={styles.chartBarRow}>
                    <span style={styles.chartBarLabel}>{countryName}</span>
                    <div style={styles.chartBarContainer}>
                      <div
                        style={{
                          ...styles.chartBar,
                          width: `${percentage}%`,
                          backgroundColor: tokens.colors.primary,
                        }}
                      />
                    </div>
                    <span style={styles.chartBarValue}>{stat.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Distribución por Prioridad</h3>
            <div style={styles.chartContent}>
              {[4, 3, 2, 1].map(p => {
                const count = news.filter(n => n.priority === p).length;
                const percentage = stats.totalItems > 0 ? (count / stats.totalItems * 100) : 0;
                const label = p === 4 ? 'Crítico' : p === 3 ? 'Alto' : p === 2 ? 'Medio' : 'Bajo';
                const color = p === 4 ? tokens.colors.semaphore_red :
                             p === 3 ? tokens.colors.warning :
                             p === 2 ? tokens.colors.semaphore_yellow :
                             tokens.colors.semaphore_green;
                return (
                  <div key={p} style={styles.chartBarRow}>
                    <span style={styles.chartBarLabel}>{label}</span>
                    <div style={styles.chartBarContainer}>
                      <div
                        style={{
                          ...styles.chartBar,
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span style={styles.chartBarValue}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.filterSection}>
          <h3 style={styles.filterSectionTitle}>Filtros</h3>
          <div style={styles.filterGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>País</label>
              <select style={styles.filterSelect} value={country} onChange={handleCountryChange}>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Prioridad</label>
              <select style={styles.filterSelect} value={priority === undefined ? '' : priority} onChange={handlePriorityChange}>
                {PRIORITIES.map(p => (
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

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Desde</label>
              <input
                type="date"
                style={styles.filterInput}
                value={dateFrom}
                onChange={handleDateFromChange}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Hasta</label>
              <input
                type="date"
                style={styles.filterInput}
                value={dateTo}
                onChange={handleDateToChange}
              />
            </div>

            <div style={styles.filterGroup}>
              <button style={styles.clearButton} onClick={handleClearFilters}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        <div style={styles.tableSection}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>
              Detalle de Noticias ({filteredNews.length} registros)
            </h3>
          </div>

          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner} />
              <span>Cargando reportes...</span>
            </div>
          ) : filteredNews.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <span>No se encontraron noticias con los filtros seleccionados</span>
            </div>
          ) : (
            <>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeadRow}>
                      <th style={styles.tableHead} onClick={() => handleSort('title')}>
                        Título <SortIcon field="title" />
                      </th>
                      <th style={styles.tableHead}>Fuente</th>
                      <th style={styles.tableHead} onClick={() => handleSort('country')}>
                        País <SortIcon field="country" />
                      </th>
                      <th style={styles.tableHead} onClick={() => handleSort('priority')}>
                        Prioridad <SortIcon field="priority" />
                      </th>
                      <th style={styles.tableHead} onClick={() => handleSort('published_at')}>
                        Fecha <SortIcon field="published_at" />
                      </th>
                      <th style={styles.tableHead}>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNews.map(item => (
                      <tr key={item.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" style={styles.titleLink}>
                            {item.title.length > 60 ? `${item.title.substring(0, 60)}...` : item.title}
                          </a>
                        </td>
                        <td style={styles.tableCell}>{item.source.name}</td>
                        <td style={styles.tableCell}>
                          <span style={styles.countryBadge}>{item.country}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <PriorityBadge priority={item.priority} />
                        </td>
                        <td style={styles.tableCell}>
                          {new Date(item.published_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.tagContainer}>
                            {item.tags.slice(0, 3).map((tag, idx) => (
                              <TagChip key={idx} tag={tag} />
                            ))}
                            {item.tags.length > 3 && (
                              <span style={styles.moreTag}>+{item.tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={styles.pagination}>
                <button
                  style={{ ...styles.pageButton, opacity: page === 0 ? 0.5 : 1 }}
                  onClick={handlePrevPage}
                  disabled={page === 0}
                >
                  ← Anterior
                </button>
                <span style={styles.pageInfo}>
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  style={{ ...styles.pageButton, opacity: page >= totalPages - 1 ? 0.5 : 1 }}
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                >
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
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
  headerActions: {
    display: 'flex',
    gap: tokens.spacing.md,
  },
  exportButton: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.typography.body.medium.size,
    fontWeight: 500,
    color: tokens.colors.text_on_primary,
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: `1px solid rgba(255,255,255,0.3)`,
    borderRadius: tokens.border_radius.md,
    cursor: 'pointer',
    transition: `background-color ${tokens.motion.duration_fast}ms`,
  },
  main: {
    maxWidth: 1440,
    margin: '0 auto',
    padding: tokens.spacing.xl,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  statCard: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.lg,
    boxShadow: tokens.shadows.card,
    border: `1px solid ${tokens.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  statIcon: {
    fontSize: 32,
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.text_primary,
  },
  statTitle: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.text_secondary,
  },
  chartSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  chartCard: {
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
  chartContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
  },
  chartBarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  chartBarLabel: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.text_secondary,
    width: 80,
    flexShrink: 0,
  },
  chartBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: tokens.colors.secondary_light,
    borderRadius: tokens.border_radius.sm,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: tokens.border_radius.sm,
    transition: `width ${tokens.motion.duration_normal}ms ${tokens.motion.easing}`,
  },
  chartBarValue: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.text_primary,
    fontWeight: 600,
    width: 40,
    textAlign: 'right',
  },
  filterSection: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
    boxShadow: tokens.shadows.card,
    border: `1px solid ${tokens.colors.border}`,
  },
  filterSectionTitle: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    color: tokens.colors.text_primary,
    marginBottom: tokens.spacing.md,
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: tokens.spacing.md,
    alignItems: 'end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
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
  clearButton: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.typography.body.medium.size,
    fontWeight: 500,
    color: tokens.colors.text_secondary,
    backgroundColor: tokens.colors.secondary_light,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    cursor: 'pointer',
    transition: `background-color ${tokens.motion.duration_fast}ms`,
  },
  tableSection: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    boxShadow: tokens.shadows.card,
    border: `1px solid ${tokens.colors.border}`,
    overflow: 'hidden',
  },
  tableHeader: {
    padding: tokens.spacing.lg,
    borderBottom: `1px solid ${tokens.colors.border}`,
  },
  tableTitle: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    color: tokens.colors.text_primary,
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadRow: {
    backgroundColor: tokens.colors.surface,
    borderBottom: `2px solid ${tokens.colors.border}`,
  },
  tableHead: {
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    fontSize: tokens.typography.label.size,
    fontWeight: tokens.typography.label.weight,
    letterSpacing: tokens.typography.label.letter_spacing,
    textTransform: tokens.typography.label.text_transform,
    color: tokens.colors.text_secondary,
    textAlign: 'left',
    cursor: 'pointer',
    userSelect: 'none',
  },
  tableRow: {
    borderBottom: `1px solid ${tokens.colors.border}`,
    transition: `background-color ${tokens.motion.duration_fast}ms`,
  },
  tableCell: {
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    fontSize: tokens.typography.body.medium.size,
    color: tokens.colors.text_primary,
  },
  titleLink: {
    color: tokens.colors.primary,
    textDecoration: 'none',
    fontWeight: 500,
  },
  countryBadge: {
    fontSize: tokens.typography.caption.size,
    fontWeight: 600,
    color: tokens.colors.primary,
    textTransform: 'uppercase',
    backgroundColor: tokens.colors.primary_light,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.border_radius.sm,
  },
  priorityBadge: {
    fontSize: tokens.typography.label.size,
    fontWeight: tokens.typography.label.weight,
    letterSpacing: tokens.typography.label.letter_spacing,
    textTransform: tokens.typography.label.text_transform,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.border_radius.sm,
    border: `1px solid`,
  },
  tagContainer: {
    display: 'flex',
    gap: tokens.spacing.xs,
    flexWrap: 'wrap',
  },
  tagChip: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.text_secondary,
    backgroundColor: tokens.colors.secondary_light,
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.border_radius.full,
  },
  moreTag: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.text_secondary,
    fontWeight: 500,
  },
  sortIcon: {
    marginLeft: tokens.spacing.xs,
    opacity: 0.6,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.lg,
    padding: tokens.spacing.lg,
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