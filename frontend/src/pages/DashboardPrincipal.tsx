import { tokens } from '../styles/tokens';

export default function DashboardPrincipal() {
  return (
    <div style={{ padding: tokens.spacing.lg }}>
      <h1 style={{ fontSize: tokens.typography.headings.h1.size, fontWeight: tokens.typography.headings.h1.weight }}>
        Dashboard Principal
      </h1>
      <p style={{ color: tokens.colors.textSecondary }}>Cargando...</p>
    </div>
  );
}