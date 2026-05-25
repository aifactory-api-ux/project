import { useState } from 'react';
import { tokens } from '../../styles/tokens';
import { ChevronDown } from 'lucide-react';

interface FilterBarProps {
  onPlantChange?: (plantId: string) => void;
  onStatusChange?: (status: string) => void;
  disabled?: boolean;
}

const plants = [
  { id: '', label: 'Todas' },
  { id: 'plant-1', label: 'Planta Norte' },
  { id: 'plant-2', label: 'Planta Sur' },
  { id: 'plant-3', label: 'Planta Este' },
  { id: 'plant-4', label: 'Planta Oeste' },
];

const statuses = [
  { id: '', label: 'Todos' },
  { id: 'pending', label: 'Pendiente' },
  { id: 'in_transit', label: 'En Tránsito' },
  { id: 'delivered', label: 'Entregado' },
  { id: 'cancelled', label: 'Cancelado' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  onPlantChange,
  onStatusChange,
  disabled = false,
}) => {
  const [plantId, setPlantId] = useState('');
  const [status, setStatus] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const handlePlantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPlantId(value);
    onPlantChange?.(value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    onStatusChange?.(value);
  };

  const getSelectStyle = (focused: boolean): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      appearance: 'none',
      backgroundColor: 'transparent',
      border: `1px solid ${focused ? tokens.colors.primary : tokens.colors.border}`,
      borderRadius: tokens.radii.md,
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      fontSize: tokens.typography.body.size,
      fontWeight: Number(tokens.typography.body.weight),
      lineHeight: tokens.typography.body.lineHeight,
      color: tokens.colors.textPrimary,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'border-color 300ms ease, box-shadow 300ms ease',
      minWidth: '160px',
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing.sm,
    };

    return baseStyle;
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: `${tokens.spacing.sm} 0`,
  };

  const selectContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.body.size,
    fontWeight: 500,
    lineHeight: tokens.typography.body.lineHeight,
    color: tokens.colors.textSecondary,
  };

  const selectWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    right: tokens.spacing.md,
    pointerEvents: 'none',
    color: tokens.colors.secondary,
    width: '16px',
    height: '16px',
  };

  return (
    <div style={wrapperStyle}>
      <div style={selectContainerStyle}>
        <label style={labelStyle}>Planta</label>
        <div style={selectWrapperStyle}>
          <select
            id="plant-filter"
            value={plantId}
            onChange={handlePlantChange}
            onFocus={() => setIsFocused('plant')}
            onBlur={() => setIsFocused(null)}
            disabled={disabled}
            style={getSelectStyle(isFocused === 'plant')}
          >
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.label}
              </option>
            ))}
          </select>
          <ChevronDown style={iconStyle} />
        </div>
      </div>

      <div style={selectContainerStyle}>
        <label style={labelStyle}>Estado</label>
        <div style={selectWrapperStyle}>
          <select
            id="status-filter"
            value={status}
            onChange={handleStatusChange}
            onFocus={() => setIsFocused('status')}
            onBlur={() => setIsFocused(null)}
            disabled={disabled}
            style={getSelectStyle(isFocused === 'status')}
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown style={iconStyle} />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;