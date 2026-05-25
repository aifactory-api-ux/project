import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: isDark ? tokens.colors.darkSurface : tokens.colors.primary,
        color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.surface,
        padding: `0 ${tokens.spacing.xl}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 300ms ease, color 300ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
        <h1
          style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.headings.h1.size,
            fontWeight: tokens.typography.headings.h1.weight,
            lineHeight: tokens.typography.headings.h1.lineHeight,
            margin: 0,
          }}
        >
          DistroViz
        </h1>
        <span
          style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.headings.h3.size,
            fontWeight: tokens.typography.headings.h3.weight,
            lineHeight: tokens.typography.headings.h3.lineHeight,
            color: isDark ? tokens.colors.darkTextSecondary : tokens.colors.textSecondary,
          }}
        >
          Dashboard de Distribución
        </span>
      </div>

      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: tokens.radii.md,
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          marginLeft: tokens.spacing.lg,
          color: isDark ? tokens.colors.accent : tokens.colors.secondary,
          transition: 'background-color 300ms ease, color 300ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = tokens.colors.primaryLight;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = tokens.colors.primaryLight;
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}