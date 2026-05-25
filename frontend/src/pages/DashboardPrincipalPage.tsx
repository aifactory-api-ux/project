import { useState, useEffect, useMemo } from 'react';
import { Package, Truck, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { useDispatches } from '../hooks/useDispatches';
import Header from '../components/ui/Header';
import FilterBar from '../components/ui/FilterBar';
import KpiCard from '../components/ui/KpiCard';
import TrendChart, { TrendDataPoint } from '../components/ui/TrendChart';
import PlantChart, { PlantChartDataPoint } from '../components/ui/PlantChart';
import OrdersTable from '../components/ui/OrdersTable';
import OrderForm from '../components/ui/OrderForm';

interface ToastState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export default function DashboardPrincipalPage() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [plantFilter, setPlantFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });
  const [showOrderForm, setShowOrderForm] = useState(false);

  const { dispatches, loading, error, updateDispatchStatus, deleteDispatch, refresh } = useDispatches({
    status: statusFilter || undefined,
    plantId: plantFilter || undefined,
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  const kpis = useMemo(() => {
    const total = dispatches.length;
    const inTransit = dispatches.filter((d) => d.status === 'in_transit').length;
    const delivered = dispatches.filter((d) => d.status === 'delivered').length;
    const pending = dispatches.filter((d) => d.status === 'pending').length;

    return [
      { label: 'Total Ordenes', value: total, icon: Package, iconColor: tokens.colors.primary },
      { label: 'En Tránsito', value: inTransit, icon: Truck, iconColor: tokens.colors.badgeInTransit },
      { label: 'Entregadas', value: delivered, icon: CheckCircle, iconColor: tokens.colors.badgeDelivered },
      { label: 'Pendientes', value: pending, icon: Clock, iconColor: tokens.colors.badgePending },
    ];
  }, [dispatches]);

  const trendData: TrendDataPoint[] = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const counts = [12, 19, 15, 22, 18, 24];
    return months.map((month, i) => ({ month, value: counts[i] }));
  }, []);

  const plantChartData: PlantChartDataPoint[] = useMemo(() => {
    const plantCounts: Record<string, number> = {};
    dispatches.forEach((d) => {
      plantCounts[d.plantId] = (plantCounts[d.plantId] || 0) + 1;
    });

    const plantNames: Record<string, string> = {
      'plant-1': 'Planta Norte',
      'plant-2': 'Planta Sur',
      'plant-3': 'Planta Este',
      'plant-4': 'Planta Oeste',
    };

    return Object.entries(plantCounts).map(([plantId, count]) => ({
      plantId,
      plantName: plantNames[plantId] || plantId,
      value: count,
    }));
  }, [dispatches]);

  const handleCreateSuccess = () => {
    showToast('success', 'Orden creada exitosamente');
    setShowOrderForm(false);
  };

  const handleCreateError = (errorMsg: string) => {
    showToast('error', errorMsg);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: isDark ? tokens.colors.darkBackground : tokens.colors.background,
    transition: 'background-color 300ms ease',
  };

  const mainContentStyle: React.CSSProperties = {
    padding: tokens.spacing.xl,
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const pageTitleStyle: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.headings.h1.size,
    fontWeight: tokens.typography.headings.h1.weight,
    lineHeight: tokens.typography.headings.h1.lineHeight,
    color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.textPrimary,
    marginBottom: tokens.spacing.lg,
  };

  const kpiGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  };

  const chartsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: tokens.spacing.lg,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    lineHeight: tokens.typography.headings.h2.lineHeight,
    color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.textPrimary,
    marginBottom: tokens.spacing.md,
  };

  const toggleFormButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.accent,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: tokens.radii.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    fontSize: tokens.typography.body.size,
    fontWeight: 600,
    lineHeight: tokens.typography.body.lineHeight,
    cursor: 'pointer',
    transition: 'background-color 300ms ease',
    marginBottom: tokens.spacing.md,
  };

  const formContainerStyle: React.CSSProperties = {
    marginBottom: tokens.spacing.lg,
  };

  const errorBannerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.error,
    color: tokens.colors.surface,
    borderRadius: tokens.radii.md,
    boxShadow: tokens.shadows.card,
    marginBottom: tokens.spacing.md,
    animation: 'fadeIn 300ms ease-out',
  };

  const toastStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: tokens.spacing.lg,
    right: tokens.spacing.lg,
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    borderRadius: tokens.radii.md,
    backgroundColor: toast.type === 'success' ? tokens.colors.success : tokens.colors.error,
    color: '#FFFFFF',
    fontSize: tokens.typography.body.size,
    fontWeight: 500,
    lineHeight: tokens.typography.body.lineHeight,
    boxShadow: tokens.shadows.dropdown,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    zIndex: 1000,
    animation: 'slideIn 300ms ease',
    maxWidth: '400px',
  };

  return (
    <div style={containerStyle}>
      <Header />

      <main style={mainContentStyle}>
        <h1 style={pageTitleStyle}>Dashboard de Distribución</h1>

        {error && (
          <div style={errorBannerStyle}>
            <AlertCircle size={20} color={tokens.colors.surface} style={{ marginRight: tokens.spacing.md }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={refresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.sm,
                marginLeft: tokens.spacing.md,
                padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.error,
                border: `1px solid ${tokens.colors.surface}`,
                borderRadius: tokens.radii.md,
                fontSize: tokens.typography.body.size,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        <div style={sectionStyle}>
          <FilterBar
            onPlantChange={setPlantFilter}
            onStatusChange={setStatusFilter}
            disabled={loading}
          />
        </div>

        <div className="kpi-grid" style={kpiGridStyle}>
          {kpis.map((kpi, index) => (
            <KpiCard
              key={index}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              iconColor={kpi.iconColor}
              loading={loading}
            />
          ))}
        </div>

        <div className="charts-grid" style={chartsGridStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Tendencia de Entregas</h2>
            <TrendChart data={trendData} loading={loading} />
          </div>
          <div>
            <h2 style={sectionTitleStyle}>Despachos por Planta</h2>
            <PlantChart data={plantChartData} loading={loading} />
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.md }}>
            <h2 style={sectionTitleStyle}>Órdenes Recientes</h2>
            <button
              onClick={() => setShowOrderForm(!showOrderForm)}
              style={toggleFormButtonStyle}
            >
              {showOrderForm ? 'Cancelar' : '+ Nueva Orden'}
            </button>
          </div>

          {showOrderForm && (
            <div style={formContainerStyle}>
              <OrderForm onSuccess={handleCreateSuccess} onError={handleCreateError} />
            </div>
          )}

          <OrdersTable
            dispatches={dispatches}
            loading={loading}
            onStatusChange={(id, status, actualDeliveryDate) =>
              updateDispatchStatus(id, status, actualDeliveryDate)
            }
            onDelete={deleteDispatch}
          />
        </div>
      </main>

      {toast.show && (
        <div style={toastStyle}>
          {toast.type === 'success' ? (
            <CheckCircle size={20} color="#FFFFFF" />
          ) : (
            <AlertCircle size={20} color="#FFFFFF" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              marginLeft: tokens.spacing.sm,
              padding: tokens.spacing.xs,
              opacity: 0.8,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @media (max-width: 1024px) {
            .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .charts-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 768px) {
            .kpi-grid { grid-template-columns: 1fr !important; }
            .charts-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>
    </div>
  );
}