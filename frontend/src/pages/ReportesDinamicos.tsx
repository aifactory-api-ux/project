import React from 'react';
import { tokens } from '../styles/tokens';

export default function ReportesDinamicos() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Reportes Dinámicos</h1>
      </header>
      <main style={styles.main}>
        <p>Contenido de reportes dinámicos</p>
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
  },
  main: {
    padding: tokens.spacing.lg,
  },
};