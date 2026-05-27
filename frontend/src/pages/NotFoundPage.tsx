import React from 'react';
import { Link } from 'react-router-dom';
import { tokens } from '../styles/tokens';

export default function NotFoundPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <p style={styles.message}>Página no encontrada</p>
      <Link to="/" style={styles.link}>
        Volver al inicio
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface,
    fontFamily: tokens.typography.font_family,
  },
  title: {
    fontSize: 72,
    fontWeight: 700,
    color: tokens.colors.primary,
    marginBottom: tokens.spacing.md,
  },
  message: {
    fontSize: tokens.typography.headings.h3.size,
    color: tokens.colors.text_secondary,
    marginBottom: tokens.spacing.lg,
  },
  link: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    fontSize: tokens.typography.body.medium.size,
    fontWeight: 600,
    color: tokens.colors.text_on_primary,
    backgroundColor: tokens.colors.primary,
    textDecoration: 'none',
    borderRadius: tokens.border_radius.md,
  },
};