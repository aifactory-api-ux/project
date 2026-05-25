import { useState, useEffect } from 'react';
import { Loader, Plus, X, Package } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { apiFetch, ApiError } from '../../lib/api';

interface ProductDispatchCreate {
  productId: string;
  quantity: number;
  unit: string;
}

interface DispatchCreate {
  plantId: string;
  distributionCenterId: string;
  scheduledDate: string;
  vehicleId: string;
  driverId: string;
  products: ProductDispatchCreate[];
}

interface OrderFormProps {
  onSuccess?: (dispatch: unknown) => void;
  onError?: (error: string) => void;
}

interface ToastState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

const plants = [
  { id: 'plant-1', label: 'Planta Norte' },
  { id: 'plant-2', label: 'Planta Sur' },
  { id: 'plant-3', label: 'Planta Este' },
  { id: 'plant-4', label: 'Planta Oeste' },
];

const distributionCenters = [
  { id: 'dc-1', label: 'Centro Norte' },
  { id: 'dc-2', label: 'Centro Sur' },
  { id: 'dc-3', label: 'Centro Este' },
  { id: 'dc-4', label: 'Centro Oeste' },
  { id: 'dc-5', label: 'Centro Central' },
];

const products = [
  { id: 'prod-1', label: 'Producto A' },
  { id: 'prod-2', label: 'Producto B' },
  { id: 'prod-3', label: 'Producto C' },
  { id: 'prod-4', label: 'Producto D' },
];

const units = ['kg', 'unit', 'box', 'pallet'];

const OrderForm: React.FC<OrderFormProps> = ({ onSuccess, onError }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const [formData, setFormData] = useState<DispatchCreate>({
    plantId: '',
    distributionCenterId: '',
    scheduledDate: '',
    vehicleId: '',
    driverId: '',
    products: [{ productId: 'prod-1', quantity: 1, unit: 'unit' }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plantId) {
      newErrors.plantId = 'Selecciona una planta';
    }
    if (!formData.distributionCenterId) {
      newErrors.distributionCenterId = 'Selecciona un centro de destino';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La fecha de despacho es requerida';
    }
    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Selecciona un vehículo';
    }
    if (!formData.driverId) {
      newErrors.driverId = 'Selecciona un conductor';
    }
    if (formData.products.length === 0) {
      newErrors.products = 'Agrega al menos un producto';
    } else {
      formData.products.forEach((product, index) => {
        if (!product.productId) {
          newErrors[`product-${index}`] = 'Selecciona un producto';
        }
        if (product.quantity <= 0) {
          newErrors[`quantity-${index}`] = 'Cantidad debe ser mayor a 0';
        }
        if (!product.unit) {
          newErrors[`unit-${index}`] = 'Selecciona una unidad';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch('/api/dispatch', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      showToast('success', 'Orden creada exitosamente');
      setFormData({
        plantId: '',
        distributionCenterId: '',
        scheduledDate: '',
        vehicleId: '',
        driverId: '',
        products: [{ productId: 'prod-1', quantity: 1, unit: 'unit' }],
      });
      setErrors({});
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Error al crear la orden';
      showToast('error', errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DispatchCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProductChange = (index: number, field: keyof ProductDispatchCreate, value: string | number) => {
    const newProducts = [...formData.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData((prev) => ({ ...prev, products: newProducts }));

    const errorKey = `${field}-${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { productId: 'prod-1', quantity: 1, unit: 'unit' }],
    }));
  };

  const removeProduct = (index: number) => {
    if (formData.products.length > 1) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index),
      }));
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDark ? tokens.colors.darkSurface : tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    boxShadow: tokens.shadows.card,
    padding: tokens.spacing.lg,
    maxWidth: '600px',
    margin: '0 auto',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.headings.h2.size,
    fontWeight: tokens.typography.headings.h2.weight,
    lineHeight: tokens.typography.headings.h2.lineHeight,
    color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.textPrimary,
    marginBottom: tokens.spacing.lg,
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.md,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.body.size,
    fontWeight: 500,
    lineHeight: tokens.typography.body.lineHeight,
    color: isDark ? tokens.colors.darkTextSecondary : tokens.colors.textSecondary,
  };

  const getBaseInputStyle = (): React.CSSProperties => ({
    border: `1px solid ${isDark ? tokens.colors.darkBorder : tokens.colors.border}`,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.sm,
    fontSize: tokens.typography.body.size,
    fontWeight: Number(tokens.typography.body.weight),
    lineHeight: tokens.typography.body.lineHeight,
    color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.textPrimary,
    backgroundColor: isDark ? tokens.colors.darkBackground : tokens.colors.surface,
    transition: 'border-color 300ms ease',
    outline: 'none',
  });

  const selectStyle: React.CSSProperties = {
    ...getBaseInputStyle(),
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${tokens.spacing.sm} center`,
    paddingRight: tokens.spacing.xl,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: tokens.typography.small.size,
    fontWeight: 400,
    lineHeight: tokens.typography.small.lineHeight,
    color: tokens.colors.error,
    marginTop: tokens.spacing.xs,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    backgroundColor: loading ? tokens.colors.primaryLight : tokens.colors.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: tokens.radii.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    fontSize: tokens.typography.body.size,
    fontWeight: 600,
    lineHeight: tokens.typography.body.lineHeight,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 300ms ease',
    marginTop: tokens.spacing.lg,
    width: '100%',
    minHeight: '44px',
  };

  const productCardStyle: React.CSSProperties = {
    backgroundColor: isDark ? tokens.colors.darkBackground : tokens.colors.background,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    border: `1px solid ${isDark ? tokens.colors.darkBorder : tokens.colors.border}`,
  };

  const productHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  };

  const productGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr auto',
    gap: tokens.spacing.md,
    alignItems: 'end',
  };

  const addButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    backgroundColor: 'transparent',
    color: tokens.colors.primary,
    border: `1px dashed ${tokens.colors.primary}`,
    borderRadius: tokens.radii.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.typography.body.size,
    fontWeight: 500,
    lineHeight: tokens.typography.body.lineHeight,
    cursor: 'pointer',
    transition: 'background-color 300ms ease',
    width: '100%',
    justifyContent: 'center',
  };

  const removeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: tokens.colors.error,
    cursor: 'pointer',
    padding: tokens.spacing.xs,
    borderRadius: tokens.radii.sm,
    transition: 'background-color 300ms ease',
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
  };

  const getFieldError = (field: string): string | undefined => errors[field];

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Crear Nueva Orden</h2>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Planta</label>
          <select
            value={formData.plantId}
            onChange={(e) => handleInputChange('plantId', e.target.value)}
            style={selectStyle}
          >
            <option value="">Selecciona una planta</option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.label}
              </option>
            ))}
          </select>
          {getFieldError('plantId') && <span style={errorStyle}>{getFieldError('plantId')}</span>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Centro de Destino</label>
          <select
            value={formData.distributionCenterId}
            onChange={(e) => handleInputChange('distributionCenterId', e.target.value)}
            style={selectStyle}
          >
            <option value="">Selecciona un centro</option>
            {distributionCenters.map((center) => (
              <option key={center.id} value={center.id}>
                {center.label}
              </option>
            ))}
          </select>
          {getFieldError('distributionCenterId') && <span style={errorStyle}>{getFieldError('distributionCenterId')}</span>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Fecha de Despacho</label>
          <input
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            style={getBaseInputStyle()}
          />
          {getFieldError('scheduledDate') && <span style={errorStyle}>{getFieldError('scheduledDate')}</span>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Vehículo</label>
          <select
            value={formData.vehicleId}
            onChange={(e) => handleInputChange('vehicleId', e.target.value)}
            style={selectStyle}
          >
            <option value="">Selecciona un vehículo</option>
            <option value="veh-1">Vehículo 1 - Camión Grande</option>
            <option value="veh-2">Vehículo 2 - Camión Mediano</option>
            <option value="veh-3">Vehículo 3 - Furgón</option>
            <option value="veh-4">Vehículo 4 - Van</option>
          </select>
          {getFieldError('vehicleId') && <span style={errorStyle}>{getFieldError('vehicleId')}</span>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Conductor</label>
          <select
            value={formData.driverId}
            onChange={(e) => handleInputChange('driverId', e.target.value)}
            style={selectStyle}
          >
            <option value="">Selecciona un conductor</option>
            <option value="drv-1">Carlos Mendoza</option>
            <option value="drv-2">María García</option>
            <option value="drv-3">Juan Rodríguez</option>
            <option value="drv-4">Ana López</option>
          </select>
          {getFieldError('driverId') && <span style={errorStyle}>{getFieldError('driverId')}</span>}
        </div>

        <div style={{ marginBottom: tokens.spacing.md }}>
          <label style={{ ...labelStyle, marginBottom: tokens.spacing.sm, display: 'block' }}>Productos</label>
          {formData.products.map((product, index) => (
            <div key={index} style={productCardStyle}>
              <div style={productHeaderStyle}>
                <span style={{ ...tokens.typography.body, color: isDark ? tokens.colors.darkTextPrimary : tokens.colors.textPrimary, fontWeight: 500 }}>
                  Producto {index + 1}
                </span>
                {formData.products.length > 1 && (
                  <button type="button" onClick={() => removeProduct(index)} style={removeButtonStyle}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div style={productGridStyle}>
                <div style={fieldStyle}>
                  <select
                    value={product.productId}
                    onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError(`product-${index}`) && <span style={errorStyle}>{getFieldError(`product-${index}`)}</span>}
                </div>
                <div style={fieldStyle}>
                  <input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    style={getBaseInputStyle()}
                    placeholder="Cantidad"
                  />
                  {getFieldError(`quantity-${index}`) && <span style={errorStyle}>{getFieldError(`quantity-${index}`)}</span>}
                </div>
                <div style={fieldStyle}>
                  <select
                    value={product.unit}
                    onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Unidad</option>
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {getFieldError(`unit-${index}`) && <span style={errorStyle}>{getFieldError(`unit-${index}`)}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Package size={20} color={tokens.colors.textSecondary} />
                </div>
              </div>
            </div>
          ))}
          {getFieldError('products') && <span style={errorStyle}>{getFieldError('products')}</span>}
          <button type="button" onClick={addProduct} style={addButtonStyle}>
            <Plus size={16} />
            Agregar Producto
          </button>
        </div>

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Creando Orden...
            </>
          ) : (
            'Crear Orden'
          )}
        </button>
      </form>

      {toast.show && (
        <div style={toastStyle}>
          {toast.type === 'success' ? (
            <span style={{ fontSize: '18px' }}>✓</span>
          ) : (
            <span style={{ fontSize: '18px' }}>✕</span>
          )}
          {toast.message}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default OrderForm;