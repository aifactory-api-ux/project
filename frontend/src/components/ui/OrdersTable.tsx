import React, { useMemo, useState } from 'react';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface ProductDispatch {
  productId: string;
  quantity: number;
  unit: string;
}

export interface Dispatch {
  id: string;
  plantId: string;
  distributionCenterId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  scheduledDate: string;
  actualDeliveryDate: string | null;
  vehicleId: string;
  driverId: string;
  products: ProductDispatch[];
}

interface OrdersTableProps {
  dispatches: Dispatch[];
  loading?: boolean;
  onStatusChange?: (id: string, status: Dispatch['status'], actualDeliveryDate?: string) => void;
  onDelete?: (id: string) => void;
}

const PAGE_SIZE = 10;

const getStatusBadgeStyle = (status: Dispatch['status'], _isDark: boolean): React.CSSProperties => {
  const colors: Record<Dispatch['status'], string> = {
    delivered: tokens.colors.badgeDelivered,
    in_transit: tokens.colors.badgeInTransit,
    pending: tokens.colors.badgePending,
    cancelled: tokens.colors.badgeCancelled,
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.radii.full,
    backgroundColor: colors[status],
    color: '#FFFFFF',
    fontSize: tokens.typography.small.size,
    fontWeight: 500,
    lineHeight: tokens.typography.small.lineHeight,
    minWidth: '80px',
    textAlign: 'center',
  };
};

const getStatusLabel = (status: Dispatch['status']): string => {
  const labels: Record<Dispatch['status'], string> = {
    delivered: 'Entregado',
    in_transit: 'En Tránsito',
    pending: 'Pendiente',
    cancelled: 'Cancelado',
  };
  return labels[status];
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const OrdersTable: React.FC<OrdersTableProps> = ({
  dispatches,
  loading = false,
  onStatusChange: _onStatusChange,
  onDelete: _onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  React.useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const totalPages = Math.ceil(dispatches.length / PAGE_SIZE);

  const paginatedDispatches = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return dispatches.slice(start, start + PAGE_SIZE);
  }, [dispatches, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [dispatches.length]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const getPlantLabel = (plantId: string): string => {
    const plantMap: Record<string, string> = {
      'plant-1': 'Planta Norte',
      'plant-2': 'Planta Sur',
      'plant-3': 'Planta Este',
      'plant-4': 'Planta Oeste',
    };
    return plantMap[plantId] || plantId;
  };

  const getCenterLabel = (centerId: string): string => {
    const centerMap: Record<string, string> = {
      'dc-1': 'Centro Norte',
      'dc-2': 'Centro Sur',
      'dc-3': 'Centro Este',
      'dc-4': 'Centro Oeste',
      'dc-5': 'Centro Central',
    };
    return centerMap[centerId] || centerId;
  };

  const getTotalQuantity = (products: ProductDispatch[]): string => {
    if (!products || products.length === 0) return '0';
    const total = products.reduce((sum, p) => sum + p.quantity, 0);
    const unit = products[0]?.unit || 'units';
    return `${total} ${unit}`;
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDark ? tokens.colors.darkSurface : tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.card,
    overflow: 'hidden',
    position: 'relative',
    minHeight: '400px',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const theadStyle: React.CSSProperties = {
    backgroundColor: isDark ? tokens.colors.darkBackground : tokens.colors.background,
    borderBottom: `1px solid ${isDark ? tokens.colors.darkBorder : tokens.colors.border}`,
  };

  const thStyle: React.CSSProperties = {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    textAlign: 'left',
    fontSize: tokens.typography.body.size,
    fontWeight: 600,
    lineHeight: 1.4,
    color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.textPrimary,
  };

  const getRowStyle = (index: number): React.CSSProperties => ({
    backgroundColor: isDark
      ? index % 2 === 0
        ? tokens.colors.darkSurface
        : tokens.colors.darkBackground
      : index % 2 === 0
      ? tokens.colors.surface
      : tokens.colors.background,
    borderBottom: `1px solid ${isDark ? tokens.colors.darkBorder : tokens.colors.border}`,
    transition: 'background-color 300ms ease',
  });

  const tdStyle: React.CSSProperties = {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.typography.body.size,
    fontWeight: 400,
    lineHeight: 1.5,
    color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.textPrimary,
  };

  const secondaryTdStyle: React.CSSProperties = {
    ...tdStyle,
    color: isDark ? tokens.colors.darkTextSecondary : tokens.colors.textSecondary,
  };

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.md,
    borderTop: `1px solid ${isDark ? tokens.colors.darkBorder : tokens.colors.border}`,
    backgroundColor: isDark ? tokens.colors.darkBackground : tokens.colors.background,
  };

  const pageInfoStyle: React.CSSProperties = {
    fontSize: tokens.typography.body.size,
    color: isDark ? tokens.colors.darkTextSecondary : tokens.colors.textSecondary,
  };

  const paginationButtonsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  };

  const getPageButtonStyle = (disabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.radii.md,
    border: `1px solid ${isDark ? tokens.colors.darkBorder : tokens.colors.border}`,
    backgroundColor: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 300ms ease, border-color 300ms ease',
    color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.textPrimary,
  });

  const spinnerOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(26, 26, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    borderRadius: tokens.radii.lg,
    zIndex: 10,
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xxl,
    color: isDark ? tokens.colors.darkTextSecondary : tokens.colors.textSecondary,
    fontSize: tokens.typography.body.size,
  };

  return (
    <div style={containerStyle}>
      {loading && (
        <div style={spinnerOverlayStyle}>
          <Loader
            size={40}
            color={tokens.colors.accent}
            style={{ animation: 'spin 1s linear infinite' }}
          />
        </div>
      )}

      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Planta</th>
            <th style={thStyle}>Centro Destino</th>
            <th style={thStyle}>Cantidad</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Fecha Despacho</th>
            <th style={thStyle}>Fecha Entrega</th>
          </tr>
        </thead>
        <tbody>
          {!loading && paginatedDispatches.length === 0 ? (
            <tr>
              <td colSpan={6} style={emptyStateStyle}>
                Sin resultados
              </td>
            </tr>
          ) : (
            paginatedDispatches.map((dispatch, index) => (
              <tr key={dispatch.id} style={getRowStyle(index)}>
                <td style={tdStyle}>{getPlantLabel(dispatch.plantId)}</td>
                <td style={tdStyle}>{getCenterLabel(dispatch.distributionCenterId)}</td>
                <td style={tdStyle}>{getTotalQuantity(dispatch.products)}</td>
                <td style={tdStyle}>
                  <span style={getStatusBadgeStyle(dispatch.status, isDark)}>
                    {getStatusLabel(dispatch.status)}
                  </span>
                </td>
                <td style={secondaryTdStyle}>{formatDate(dispatch.scheduledDate)}</td>
                <td style={secondaryTdStyle}>{formatDate(dispatch.actualDeliveryDate)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && dispatches.length > 0 && (
        <div style={paginationStyle}>
          <span style={pageInfoStyle}>
            Mostrando {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
            {Math.min(currentPage * PAGE_SIZE, dispatches.length)} de {dispatches.length}
          </span>
          <div style={paginationButtonsStyle}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={getPageButtonStyle(currentPage === 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span style={pageInfoStyle}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={getPageButtonStyle(currentPage === totalPages)}
              aria-label="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default OrdersTable;
