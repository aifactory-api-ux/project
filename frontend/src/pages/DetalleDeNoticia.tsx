import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useNewsItem } from '../hooks/useNews';

const COUNTRY_NAMES: Record<string, string> = {
  CL: 'Chile',
  AR: 'Argentina',
  CO: 'Colombia',
  BR: 'Brasil',
  PE: 'Perú',
  UY: 'Uruguay',
};

function getPriorityInfo(priority: number): { label: string; color: string; bgColor: string } {
  switch (priority) {
    case 4:
      return { label: 'Crítico', color: tokens.colors.semaphore_red, bgColor: '#FFEBEE' };
    case 3:
      return { label: 'Alto', color: tokens.colors.semaphore_red, bgColor: '#FFEBEE' };
    case 2:
      return { label: 'Medio', color: tokens.colors.semaphore_yellow, bgColor: '#FFF8E1' };
    case 1:
    default:
      return { label: 'Bajo', color: tokens.colors.semaphore_green, bgColor: '#E8F5E9' };
  }
}

export default function DetalleDeNoticia() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const newsId = id ? parseInt(id, 10) : 0;
  const { data: newsItem, isLoading, error } = useNewsItem(newsId);

  const [feedbackGiven, setFeedbackGiven] = useState<'correct' | 'incorrect' | null>(null);

  const handleFeedback = async (type: 'correct' | 'incorrect') => {
    setFeedbackGiven(type);
  };

  const handleVolver = () => {
    navigate('/listadenoticias');
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Cargando noticia...</p>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Error al cargar la noticia</h2>
          <p style={styles.errorText}>{(error as Error)?.message || 'Noticia no encontrada'}</p>
          <button style={styles.backButton} onClick={handleVolver}>
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const priorityInfo = getPriorityInfo(newsItem.priority);
  const publishedDate = newsItem.published_at
    ? new Date(newsItem.published_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <nav style={styles.breadcrumb}>
          <Link to="/dashboardprincipal" style={styles.breadcrumbLink}>Inicio</Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          <Link to="/listadenoticias" style={styles.breadcrumbLink}>Noticias</Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbCurrent}>Detalle</span>
        </nav>

        <main style={styles.main}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.sourceInfo}>
                <span style={styles.sourceName}>{newsItem.source?.name || 'Fuente desconocida'}</span>
                <span style={styles.countryBadge}>
                  {COUNTRY_NAMES[newsItem.country] || newsItem.country}
                </span>
              </div>
              <div
                style={{
                  ...styles.priorityBadge,
                  backgroundColor: priorityInfo.bgColor,
                  borderColor: priorityInfo.color,
                }}
              >
                <span
                  style={{
                    ...styles.priorityDot,
                    backgroundColor: priorityInfo.color,
                  }}
                />
                <span style={{ ...styles.priorityLabel, color: priorityInfo.color }}>
                  {priorityInfo.label}
                </span>
              </div>
            </div>

            <h1 style={styles.title}>{newsItem.title}</h1>

            <div style={styles.meta}>
              <span style={styles.dateText}>Publicado: {publishedDate}</span>
              {newsItem.tags && newsItem.tags.length > 0 && (
                <div style={styles.tagsContainer}>
                  {newsItem.tags.map((tag) => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.divider} />

            <div style={styles.summarySection}>
              <h2 style={styles.summaryTitle}>Resumen</h2>
              <p style={styles.summaryText}>{newsItem.summary}</p>
            </div>

            <div style={styles.actionsSection}>
              <a
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.visitButton}
              >
                Visitar artículo original
              </a>
            </div>

            <div style={styles.divider} />

            <div style={styles.feedbackSection}>
              <h3 style={styles.feedbackTitle}>¿Esta clasificación es correcta?</h3>
              <div style={styles.feedbackButtons}>
                <button
                  style={{
                    ...styles.feedbackButton,
                    ...(feedbackGiven === 'correct' ? styles.feedbackButtonActive : {}),
                    backgroundColor: feedbackGiven === 'correct' ? tokens.colors.success : 'transparent',
                    color: feedbackGiven === 'correct' ? '#FFFFFF' : tokens.colors.success,
                  }}
                  onClick={() => handleFeedback('correct')}
                  disabled={feedbackGiven !== null}
                >
                  Sí, es correcta
                </button>
                <button
                  style={{
                    ...styles.feedbackButton,
                    ...(feedbackGiven === 'incorrect' ? styles.feedbackButtonActive : {}),
                    backgroundColor: feedbackGiven === 'incorrect' ? tokens.colors.danger : 'transparent',
                    color: feedbackGiven === 'incorrect' ? '#FFFFFF' : tokens.colors.danger,
                  }}
                  onClick={() => handleFeedback('incorrect')}
                  disabled={feedbackGiven !== null}
                >
                  No, necesita ajuste
                </button>
              </div>
              {feedbackGiven && (
                <p style={styles.feedbackConfirmation}>
                  Gracias por tu retroalimentación
                </p>
              )}
            </div>
          </div>

          <div style={styles.footerActions}>
            <button style={styles.volverButton} onClick={handleVolver}>
              ← Volver a lista de noticias
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: tokens.colors.surface,
    fontFamily: tokens.typography.font_family,
  },
  contentWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: tokens.spacing.xl,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  breadcrumbLink: {
    color: tokens.colors.primary,
    textDecoration: 'none',
    fontSize: tokens.typography.body.small.size,
  },
  breadcrumbSeparator: {
    color: tokens.colors.text_secondary,
  },
  breadcrumbCurrent: {
    color: tokens.colors.text_secondary,
    fontSize: tokens.typography.body.small.size,
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  },
  card: {
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.md,
    border: `1px solid ${tokens.colors.border}`,
    boxShadow: tokens.shadows.card,
    padding: tokens.spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
  },
  sourceInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  sourceName: {
    fontSize: tokens.typography.body.medium.size,
    fontWeight: tokens.typography.body.large.weight,
    color: tokens.colors.text_primary,
  },
  countryBadge: {
    padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
    backgroundColor: tokens.colors.secondary_light,
    color: tokens.colors.text_secondary,
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.caption.size,
    fontWeight: tokens.typography.label.weight,
    textTransform: 'uppercase',
  },
  priorityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
    borderRadius: tokens.border_radius.full,
    border: '1px solid',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  priorityLabel: {
    fontSize: tokens.typography.caption.size,
    fontWeight: tokens.typography.label.weight,
    textTransform: 'uppercase',
    letterSpacing: tokens.typography.label.letter_spacing,
  },
  title: {
    fontSize: tokens.typography.headings.h3.size,
    fontWeight: tokens.typography.headings.h3.weight,
    lineHeight: tokens.typography.headings.h3.line_height,
    color: tokens.colors.text_primary,
    margin: 0,
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
  },
  dateText: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.text_secondary,
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  tag: {
    padding: '6px 10px',
    backgroundColor: tokens.colors.secondary_light,
    color: tokens.colors.text_secondary,
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.label.size,
    fontWeight: tokens.typography.label.weight,
    textTransform: 'uppercase',
    letterSpacing: tokens.typography.label.letter_spacing,
    cursor: 'pointer',
  },
  divider: {
    height: '1px',
    backgroundColor: tokens.colors.border,
  },
  summarySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
  },
  summaryTitle: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    lineHeight: tokens.typography.headings.h4.line_height,
    color: tokens.colors.text_primary,
    margin: 0,
  },
  summaryText: {
    fontSize: tokens.typography.body.large.size,
    fontWeight: tokens.typography.body.large.weight,
    lineHeight: tokens.typography.body.large.line_height,
    color: tokens.colors.text_primary,
    margin: 0,
  },
  actionsSection: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  visitButton: {
    padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.text_on_primary,
    border: 'none',
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.body.medium.size,
    fontWeight: tokens.typography.label.weight,
    textTransform: 'uppercase',
    letterSpacing: tokens.typography.label.letter_spacing,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  feedbackSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  },
  feedbackTitle: {
    fontSize: tokens.typography.headings.h4.size,
    fontWeight: tokens.typography.headings.h4.weight,
    lineHeight: tokens.typography.headings.h4.line_height,
    color: tokens.colors.text_primary,
    margin: 0,
  },
  feedbackButtons: {
    display: 'flex',
    gap: tokens.spacing.md,
    justifyContent: 'flex-end',
  },
  feedbackButton: {
    padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.body.medium.size,
    cursor: 'pointer',
  },
  feedbackButtonActive: {
    fontWeight: tokens.typography.label.weight,
  },
  feedbackConfirmation: {
    fontSize: tokens.typography.body.small.size,
    color: tokens.colors.success,
    textAlign: 'right',
    margin: 0,
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  volverButton: {
    padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
    backgroundColor: 'transparent',
    color: tokens.colors.primary,
    border: 'none',
    fontSize: tokens.typography.body.medium.size,
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: tokens.spacing.md,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${tokens.colors.border}`,
    borderTopColor: tokens.colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: tokens.typography.body.medium.size,
    color: tokens.colors.text_secondary,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: tokens.spacing.md,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    color: tokens.colors.danger,
    margin: 0,
  },
  errorText: {
    fontSize: tokens.typography.body.medium.size,
    color: tokens.colors.text_secondary,
    margin: 0,
  },
  backButton: {
    padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.text_on_primary,
    border: 'none',
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.body.medium.size,
    cursor: 'pointer',
  },
};