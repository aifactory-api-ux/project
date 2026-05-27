import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tokens } from '../styles/tokens';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      navigate('/dashboardprincipal');
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Daily Pulse</h1>
        <p style={styles.subtitle}>Iniciar Sesión</p>
        {(error || localError) && (
          <div style={styles.error}>{error || localError}</div>
        )}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p style={styles.registerLink}>
          ¿No tienes cuenta?{' '}
          <a href="/register" style={styles.link}>Regístrate</a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface,
    fontFamily: tokens.typography.font_family,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: tokens.spacing.xl,
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.border_radius.lg,
    boxShadow: tokens.shadows.elevated,
  },
  title: {
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    color: tokens.colors.primary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.body.large.size,
    color: tokens.colors.text_secondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
  },
  label: {
    fontSize: tokens.typography.label.size,
    fontWeight: tokens.typography.label.weight,
    color: tokens.colors.text_primary,
    textTransform: tokens.typography.label.text_transform,
    letterSpacing: tokens.typography.label.letter_spacing,
  },
  input: {
    padding: tokens.spacing.sm,
    fontSize: tokens.typography.body.medium.size,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.border_radius.sm,
    outline: 'none',
    transition: `border-color ${tokens.motion.duration_fast}ms`,
  },
  button: {
    marginTop: tokens.spacing.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    fontSize: tokens.typography.body.medium.size,
    fontWeight: 600,
    color: tokens.colors.text_on_primary,
    backgroundColor: tokens.colors.primary,
    border: 'none',
    borderRadius: tokens.border_radius.md,
    cursor: 'pointer',
    transition: `background-color ${tokens.motion.duration_fast}ms`,
  },
  registerLink: {
    marginTop: tokens.spacing.lg,
    textAlign: 'center',
    fontSize: tokens.typography.body.medium.size,
    color: tokens.colors.text_secondary,
  },
  link: {
    color: tokens.colors.primary,
    textDecoration: 'none',
  },
  error: {
    padding: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
    backgroundColor: `${tokens.colors.danger}20`,
    color: tokens.colors.danger,
    borderRadius: tokens.border_radius.sm,
    fontSize: tokens.typography.body.small.size,
  },
};