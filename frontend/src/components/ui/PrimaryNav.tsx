import { useState, useEffect } from 'react';
import { Sun, Moon, LayoutDashboard, Package, Truck, Users } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export default function PrimaryNav() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'Despachos', icon: Package, active: false },
    { label: 'Flota', icon: Truck, active: false },
    { label: 'Personal', icon: Users, active: false },
  ];

  return (
    <nav
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
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.xxl }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md, marginLeft: tokens.spacing.xxl }}>
          {navItems.map((item) => (
            <button
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.sm,
                padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                backgroundColor: item.active ? (isDark ? tokens.colors.primary : tokens.colors.primaryLight) : 'transparent',
                border: 'none',
                borderRadius: tokens.radii.md,
                color: item.active 
                  ? (isDark ? tokens.colors.darkTextPrimary : tokens.colors.surface)
                  : (isDark ? tokens.colors.darkTextSecondary : tokens.colors.textSecondary),
                fontFamily: tokens.typography.fontFamily,
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: 1.4,
                cursor: 'pointer',
                transition: 'background-color 300ms ease, color 300ms ease',
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = isDark 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <item.icon size={20} style={{ color: 'inherit' }} />
              {item.label}
            </button>
          ))}
        </div>
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
    </nav>
  );
}