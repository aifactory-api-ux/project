import React from 'react';
import { tokens } from '../styles/tokens';

export default function DashboardPrincipal() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Dashboard Principal</h1>
        <p style={styles.subtitle}>Daily Pulse - Cencosud</p>
      </header>
      <main style={styles.main}>
        <p>Contenido del dashboard</p>
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
    padding: tokens.spacing.lg,
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.text_on_primary,
  },
  title: {
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.body.large.size,
    opacity: 0.9,
  },
  main: {
    padding: tokens.spacing.lg,
  },
};