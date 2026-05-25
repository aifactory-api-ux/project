import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import DashboardPrincipalPage from '../DashboardPrincipalPage';

// Mock dependencies before imports
jest.mock('../hooks/useDispatches', () => ({
  useDispatches: jest.fn(),
}));

jest.mock('../styles/tokens', () => ({
  tokens: {
    colors: {
      primary: '#007bff',
      background: '#ffffff',
      darkBackground: '#1a1a1a',
      badgeInTransit: '#ffc107',
      badgeDelivered: '#28a745',
      badgePending: '#6c757d',
    },
  },
}));

jest.mock('lucide-react', () => ({
  Package: () => <span data-testid="package-icon">Package</span>,
  Truck: () => <span data-testid="truck-icon">Truck</span>,
  CheckCircle: () => <span data-testid="check-icon">Check</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  AlertCircle: () => <span data-testid="alert-icon">Alert</span>,
  X: () => <span data-testid="x-icon">X</span>,
}));

jest.mock('../components/ui/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header Component</header>;
  };
});

jest.mock('../components/ui/FilterBar', () => {
  return function MockFilterBar({ 
    onPlantChange, 
    onStatusChange, 
    plantFilter, 
    statusFilter 
  }: { 
    onPlantChange: (v: string) => void; 
    onStatusChange: (v: string) => void; 
    plantFilter: string; 
    statusFilter: string; 
  }) {
    return (
      <div data-testid="filter-bar">
        <select 
          data-testid="plant-filter"
          value={plantFilter}
          onChange={(e) => onPlantChange(e.target.value)}
        >
          <option value="">All Plants</option>
          <option value="plant-1">Planta Norte</option>
          <option value="plant-2">Planta Sur</option>
          <option value="plant-3">Planta Este</option>
          <option value="plant-4">Planta Oeste</option>
        </select>
        <select 
          data-testid="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pendiente</option>
          <option value="in_transit">En Tránsito</option>
          <option value="delivered">Entregadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>
    );
  };
});

jest.mock('../components/ui/KpiCard', () => {
  return function MockKpiCard({ label, value }: { label: string; value: number }) {
    return (
      <div data-testid="kpi-card">
        <span data-testid="kpi-label">{label}</span>
        <span data-testid="kpi-value">{value}</span>
      </div>
    );
  };
});

jest.mock('../components/ui/TrendChart', () => ({
  __esModule: true,
  default: function MockTrendChart({ data }: { data: Array<{ month: string; value: number }> }) {
    return (
      <div data-testid="trend-chart">
        <span>TrendChart with {data.length} data points</span>
      </div>
    );
  },
}));

jest.mock('../components/ui/PlantChart', () => ({
  __esModule: true,
  default: function MockPlantChart({ data }: { data: Array<{ plantId: string; plantName: string; value: number }> }) {
    return (
      <div data-testid="plant-chart">
        <span>PlantChart with {data.length} plants</span>
      </div>
    );
  },
}));

jest.mock('../components/ui/OrdersTable', () => {
  return function MockOrdersTable({ 
    dispatches, 
    onUpdateStatus, 
    onDelete 
  }: { 
    dispatches: any[]; 
    onUpdateStatus: (id: string, status: string) => void; 
    onDelete: (id: string) => void; 
  }) {
    return (
      <div data-testid="orders-table">
        <span>OrdersTable with {dispatches.length} dispatches</span>
        {dispatches.map((dispatch, idx) => (
          <div key={dispatch.id} data-testid={`dispatch-row-${idx}`}>
            <button 
              data-testid={`update-btn-${idx}`}
              onClick={() => onUpdateStatus(dispatch.id, 'delivered')}
            >
              Update
            </button>
            <button 
              data-testid={`delete-btn-${idx}`}
              onClick={() => onDelete(dispatch.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../components/ui/OrderForm', () => {
  return function MockOrderForm({ 
    onClose, 
    onSuccess, 
    onError 
  }: { 
    onClose: () => void; 
    onSuccess: () => void; 
    onError: (msg: string) => void; 
  }) {
    return (
      <div data-testid="order-form">
        <button data-testid="close-form-btn" onClick={onClose}>Close</button>
        <button data-testid="success-form-btn" onClick={onSuccess}>Success</button>
        <button data-testid="error-form-btn" onClick={() => onError('Test error')}>Error</button>
      </div>
    );
  };
});

import { useDispatches } from '../hooks/useDispatches';

describe('DashboardPrincipalPage', () => {
  const mockDispatches = [
    {
      id: 'dispatch-1',
      plantId: 'plant-1',
      distributionCenterId: 'dc-1',
      status: 'in_transit' as const,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      scheduledDate: '2024-01-15',
      actualDeliveryDate: null,
      vehicleId: 'vehicle-1',
      driverId: 'driver-1',
      products: [{ productId: 'prod-1', quantity: 10, unit: 'kg' }],
    },
    {
      id: 'dispatch-2',
      plantId: 'plant-2',
      distributionCenterId: 'dc-2',
      status: 'delivered' as const,
      createdAt: '2024-01-14T10:00:00Z',
      updatedAt: '2024-01-14T12:00:00Z',
      scheduledDate: '2024-01-14',
      actualDeliveryDate: '2024-01-14T11:00:00Z',
      vehicleId: 'vehicle-2',
      driverId: 'driver-2',
      products: [{ productId: 'prod-2', quantity: 5, unit: 'units' }],
    },
    {
      id: 'dispatch-3',
      plantId: 'plant-1',
      distributionCenterId: 'dc-1',
      status: 'pending' as const,
      createdAt: '2024-01-16T08:00:00Z',
      updatedAt: '2024-01-16T08:00:00Z',
      scheduledDate: '2024-01-16',
      actualDeliveryDate: null,
      vehicleId: 'vehicle-3',
      driverId: 'driver-3',
      products: [{ productId: 'prod-3', quantity: 8, unit: 'kg' }],
    },
    {
      id: 'dispatch-4',
      plantId: 'plant-2',
      distributionCenterId: 'dc-2',
      status: 'pending' as const,
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z',
      scheduledDate: '2024-01-16',
      actualDeliveryDate: null,
      vehicleId: 'vehicle-4',
      driverId: 'driver-4',
      products: [{ productId: 'prod-4', quantity: 12, unit: 'units' }],
    },
  ];

  const mockUpdateDispatchStatus = jest.fn();
  const mockDeleteDispatch = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatches as jest.Mock).mockReturnValue({
      dispatches: mockDispatches,
      loading: false,
      error: null,
      updateDispatchStatus: mockUpdateDispatchStatus,
      deleteDispatch: mockDeleteDispatch,
      refresh: mockRefresh,
    });
    
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Rendering', () => {
    it('renders all main components', () => {
      render(<DashboardPrincipalPage />);
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
      expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
      expect(screen.getByTestId('plant-chart')).toBeInTheDocument();
      expect(screen.getByTestId('orders-table')).toBeInTheDocument();
    });

    it('renders KPI cards with correct count', () => {
      render(<DashboardPrincipalPage />);
      
      const kpiCards = screen.getAllByTestId('kpi-card');
      expect(kpiCards).toHaveLength(4);
    });

    it('renders KPI cards with labels', () => {
      render(<DashboardPrincipalPage />);
      
      expect(screen.getByText('Total Ordenes')).toBeInTheDocument();
      expect(screen.getByText('En Tránsito')).toBeInTheDocument();
      expect(screen.getByText('Entregadas')).toBeInTheDocument();
      expect(screen.getByText('Pendientes')).toBeInTheDocument();
    });
  });

  describe('KPI Calculations', () => {
    it('calculates total orders correctly', () => {
      render(<DashboardPrincipalPage />);
      
      const totalKpi = screen.getAllByTestId('kpi-card')[0];
      expect(totalKpi).toHaveTextContent('4');
    });

    it('calculates in_transit count correctly', () => {
      render(<DashboardPrincipalPage />);
      
      const inTransitKpi = screen.getAllByTestId('kpi-card')[1];
      expect(inTransitKpi).toHaveTextContent('1');
    });

    it('calculates delivered count correctly', () => {
      render(<DashboardPrincipalPage />);
      
      const deliveredKpi = screen.getAllByTestId('kpi-card')[2];
      expect(deliveredKpi).toHaveTextContent('1');
    });

    it('calculates pending count correctly', () => {
      render(<DashboardPrincipalPage />);
      
      const pendingKpi = screen.getAllByTestId('kpi-card')[3];
      expect(pendingKpi).toHaveTextContent('2');
    });

    it('updates KPIs when dispatches change', () => {
      const updatedDispatches = [
        ...mockDispatches,
        {
          id: 'dispatch-5',
          plantId: 'plant-3',
          distributionCenterId: 'dc-3',
          status: 'pending' as const,
          createdAt: '2024-01-17T10:00:00Z',
          updatedAt: '2024-01-17T10:00:00Z',
          scheduledDate: '2024-01-17',
          actualDeliveryDate: null,
          vehicleId: 'vehicle-5',
          driverId: 'driver-5',
          products: [{ productId: 'prod-5', quantity: 15, unit: 'kg' }],
        },
      ];

      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: updatedDispatches,
        loading: false,
        error: null,
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      const { rerender } = render(<DashboardPrincipalPage />);
      
      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: updatedDispatches,
        loading: false,
        error: null,
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      rerender(<DashboardPrincipalPage />);

      const totalKpi = screen.getAllByTestId('kpi-card')[0];
      expect(totalKpi).toHaveTextContent('5');
    });

    it('handles empty dispatches', () => {
      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: [],
        loading: false,
        error: null,
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      render(<DashboardPrincipalPage />);

      const totalKpi = screen.getAllByTestId('kpi-card')[0];
      expect(totalKpi).toHaveTextContent('0');
    });
  });

  describe('Trend Chart Data', () => {
    it('generates trend data with correct structure', () => {
      render(<DashboardPrincipalPage />);

      const trendChart = screen.getByTestId('trend-chart');
      expect(trendChart).toHaveTextContent('TrendChart with 6 data points');
    });

    it('contains all months', () => {
      render(<DashboardPrincipalPage />);

      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
      months.forEach(month => {
        expect(screen.getByText(new RegExp(month))).toBeInTheDocument();
      });
    });
  });

  describe('Plant Chart Data', () => {
    it('generates plant chart data from dispatches', () => {
      render(<DashboardPrincipalPage />);

      const plantChart = screen.getByTestId('plant-chart');
      expect(plantChart).toBeInTheDocument();
    });

    it('calculates plant counts correctly', () => {
      render(<DashboardPrincipalPage />);

      const plantChart = screen.getByTestId('plant-chart');
      // plant-1 has 2 dispatches, plant-2 has 2 dispatches
      expect(plantChart).toHaveTextContent('PlantChart with 2 plants');
    });
  });

  describe('Filter Functionality', () => {
    it('passes plant filter to useDispatches', async () => {
      render(<DashboardPrincipalPage />);

      const plantFilter = screen.getByTestId('plant-filter');
      fireEvent.change(plantFilter, { target: { value: 'plant-1' } });

      expect(useDispatches).toHaveBeenCalledWith({
        status: undefined,
        plantId: 'plant-1',
      });
    });

    it('passes status filter to useDispatches', async () => {
      render(<DashboardPrincipalPage />);

      const statusFilter = screen.getByTestId('status-filter');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });

      expect(useDispatches).toHaveBeenCalledWith({
        status: 'pending',
        plantId: undefined,
      });
    });

    it('passes both filters to useDispatches', async () => {
      render(<DashboardPrincipalPage />);

      const plantFilter = screen.getByTestId('plant-filter');
      const statusFilter = screen.getByTestId('status-filter');

      fireEvent.change(plantFilter, { target: { value: 'plant-1' } });
      fireEvent.change(statusFilter, { target: { value: 'delivered' } });

      expect(useDispatches).toHaveBeenCalledWith({
        status: 'delivered',
        plantId: 'plant-1',
      });
    });

    it('clears plant filter', async () => {
      render(<DashboardPrincipalPage />);

      const plantFilter = screen.getByTestId('plant-filter');
      fireEvent.change(plantFilter, { target: { value: 'plant-1' } });
      fireEvent.change(plantFilter, { target: { value: '' } });

      expect(useDispatches).toHaveBeenLastCalledWith({
        status: undefined,
        plantId: undefined,
      });
    });
  });

  describe('Order Form', () => {
    it('does not show order form initially', () => {
      render(<DashboardPrincipalPage />);

      expect(screen.queryByTestId('order-form')).not.toBeInTheDocument();
    });

    it('shows create order button', () => {
      render(<DashboardPrincipalPage />);

      const createButton = screen.getByText('Nueva Orden');
      expect(createButton).toBeInTheDocument();
    });

    it('shows order form when create button is clicked', async () => {
      render(<DashboardPrincipalPage />);

      const createButton = screen.getByText('Nueva Orden');
      await userEvent.click(createButton);

      expect(screen.getByTestId('order-form')).toBeInTheDocument();
    });

    it('calls onSuccess when order creation succeeds', async () => {
      render(<DashboardPrincipalPage />);

      const createButton = screen.getByText('Nueva Orden');
      await userEvent.click(createButton);

      const successButton = screen.getByTestId('success-form-btn');
      await userEvent.click(successButton);

      expect(screen.queryByTestId('order-form')).not.toBeInTheDocument();
    });

    it('shows success toast on order creation success', async () => {
      render(<DashboardPrincipalPage />);

      const createButton = screen.getByText('Nueva Orden');
      await userEvent.click(createButton);

      const successButton = screen.getByTestId('success-form-btn');
      await userEvent.click(successButton);

      await waitFor(() => {
        expect(screen.getByText('Orden creada exitosamente')).toBeInTheDocument();
      });
    });

    it('calls onError when order creation fails', async () => {
      render(<DashboardPrincipalPage />);

      const createButton = screen.getByText('Nueva Orden');
      await userEvent.click(createButton);

      const errorButton = screen.getByTestId('error-form-btn');
      await userEvent.click(errorButton);

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });

    it('closes order form on close button click', async () => {
      render(<DashboardPrincipalPage />);

      const createButton = screen.getByText('Nueva Orden');
      await userEvent.click(createButton);

      const closeButton = screen.getByTestId('close-form-btn');
      await userEvent.click(closeButton);

      expect(screen.queryByTestId('order-form')).not.toBeInTheDocument();
    });
  });

  describe('OrdersTable Integration', () => {
    it('passes dispatches to OrdersTable', () => {
      render(<DashboardPrincipalPage />);

      const ordersTable = screen.getByTestId('orders-table');
      expect(ordersTable).toHaveTextContent('OrdersTable with 4 dispatches');
    });

    it('calls updateDispatchStatus when update button is clicked', async () => {
      render(<DashboardPrincipalPage />);

      const updateButton = screen.getByTestId('update-btn-0');
      await userEvent.click(updateButton);

      expect(mockUpdateDispatchStatus).toHaveBeenCalledWith('dispatch-1', 'delivered');
    });

    it('calls deleteDispatch when delete button is clicked', async () => {
      render(<DashboardPrincipalPage />);

      const deleteButton = screen.getByTestId('delete-btn-0');
      await userEvent.click(deleteButton);

      expect(mockDeleteDispatch).toHaveBeenCalledWith('dispatch-1');
    });
  });

  describe('Toast Notifications', () => {
    it('auto-hides toast after 5 seconds', async () => {
      jest.useFakeTimers();

      render(<DashboardPrincipalPage />);

      const createButton = screen.getByText('Nueva Orden');
      await userEvent.click(createButton);

      const successButton = screen.getByTestId('success-form-btn');
      await userEvent.click(successButton);

      await waitFor(() => {
        expect(screen.getByText('Orden creada exitosamente')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Orden creada exitosamente')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('shows error toast when order creation fails', async () => {
      render(<DashboardPrincipalPage />);

      const createButton = screen.getByText('Nueva Orden');
      await userEvent.click(createButton);

      const errorButton = screen.getByTestId('error-form-btn');
      await userEvent.click(errorButton);

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state', () => {
      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: [],
        loading: true,
        error: null,
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      render(<DashboardPrincipalPage />);

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error state', () => {
      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: [],
        loading: false,
        error: 'Failed to load dispatches',
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      render(<DashboardPrincipalPage />);

      expect(screen.getByText('Error al cargar las órdenes')).toBeInTheDocument();
    });

    it('has retry button in error state', () => {
      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: [],
        loading: false,
        error: 'Failed to load dispatches',
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      render(<DashboardPrincipalPage />);

      const retryButton = screen.getByText('Reintentar');
      expect(retryButton).toBeInTheDocument();
    });

    it('calls refresh when retry button is clicked', async () => {
      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: [],
        loading: false,
        error: 'Failed to load dispatches',
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      render(<DashboardPrincipalPage />);

      const retryButton = screen.getByText('Reintentar');
      await userEvent.click(retryButton);

      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Theme Handling', () => {
    it('applies dark theme styles when isDark is true', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 'dark'),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      const { container } = render(<DashboardPrincipalPage />);
      
      expect(container.firstChild).toHaveStyle({ minHeight: '100vh' });
    });

    it('applies light theme styles when isDark is false', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      const { container } = render(<DashboardPrincipalPage />);
      
      expect(container.firstChild).toHaveStyle({ minHeight: '100vh' });
    });
  });

  describe('Refresh Functionality', () => {
    it('has refresh button', () => {
      render(<DashboardPrincipalPage />);

      const refreshButton = screen.getByTitle('Actualizar');
      expect(refreshButton).toBeInTheDocument();
    });

    it('calls refresh when refresh button is clicked', async () => {
      render(<DashboardPrincipalPage />);

      const refreshButton = screen.getByTitle('Actualizar');
      await userEvent.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles dispatch with unknown plantId', () => {
      const unknownPlantDispatch = [
        {
          id: 'dispatch-unknown',
          plantId: 'unknown-plant',
          distributionCenterId: 'dc-1',
          status: 'pending' as const,
          createdAt: '2024-01-16T08:00:00Z',
          updatedAt: '2024-01-16T08:00:00Z',
          scheduledDate: '2024-01-16',
          actualDeliveryDate: null,
          vehicleId: 'vehicle-1',
          driverId: 'driver-1',
          products: [{ productId: 'prod-1', quantity: 10, unit: 'kg' }],
        },
      ];

      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: unknownPlantDispatch,
        loading: false,
        error: null,
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      render(<DashboardPrincipalPage />);

      const plantChart = screen.getByTestId('plant-chart');
      expect(plantChart).toHaveTextContent('PlantChart with 1 plants');
    });

    it('handles all statuses for KPI calculation', () => {
      const allStatusesDispatch = [
        { id: 'd1', plantId: 'p1', distributionCenterId: 'dc1', status: 'pending' as const, createdAt: '', updatedAt: '', scheduledDate: '', actualDeliveryDate: null, vehicleId: 'v1', driverId: 'dr1', products: [] },
        { id: 'd2', plantId: 'p1', distributionCenterId: 'dc1', status: 'in_transit' as const, createdAt: '', updatedAt: '', scheduledDate: '', actualDeliveryDate: null, vehicleId: 'v1', driverId: 'dr1', products: [] },
        { id: 'd3', plantId: 'p1', distributionCenterId: 'dc1', status: 'delivered' as const, createdAt: '', updatedAt: '', scheduledDate: '', actualDeliveryDate: null, vehicleId: 'v1', driverId: 'dr1', products: [] },
        { id: 'd4', plantId: 'p1', distributionCenterId: 'dc1', status: 'cancelled' as const, createdAt: '', updatedAt: '', scheduledDate: '', actualDeliveryDate: null, vehicleId: 'v1', driverId: 'dr1', products: [] },
      ];

      (useDispatches as jest.Mock).mockReturnValue({
        dispatches: allStatusesDispatch,
        loading: false,
        error: null,
        updateDispatchStatus: mockUpdateDispatchStatus,
        deleteDispatch: mockDeleteDispatch,
        refresh: mockRefresh,
      });

      render(<DashboardPrincipalPage />);

      const kpiCards = screen.getAllByTestId('kpi-card');
      expect(kpiCards[0]).toHaveTextContent('4'); // Total
      expect(kpiCards[1]).toHaveTextContent('1'); // in_transit
      expect(kpiCards[2]).toHaveTextContent('1'); // delivered
      expect(kpiCards[3]).toHaveTextContent('1'); // pending
    });

    it('handles multiple rapid filter changes', async () => {
      render(<DashboardPrincipalPage />);

      const plantFilter = screen.getByTestId('plant-filter');
      const statusFilter = screen.getByTestId('status-filter');

      await fireEvent.change(plantFilter, { target: { value: 'plant-1' } });
      await fireEvent.change(statusFilter, { target: { value: 'pending' } });
      await fireEvent.change(plantFilter, { target: { value: 'plant-2' } });
      await fireEvent.change(statusFilter, { target: { value: 'in_transit' } });

      expect(useDispatches).toHaveBeenLastCalledWith({
        status: 'in_transit',
        plantId: 'plant-2',
      });
    });
  });
});
