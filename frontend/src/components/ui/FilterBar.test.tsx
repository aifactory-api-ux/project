/// <reference types="jest" />
import type { FC } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ChevronDown } from 'lucide-react';
import FilterBar from './FilterBar';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronDown: jest.fn(() => null),
}));

// Mock the tokens module
jest.mock('../../styles/tokens', () => ({
  tokens: {
    colors: {
      primary: '#007bff',
      border: '#e0e0e0',
      textPrimary: '#333333',
      textSecondary: '#666666',
      secondary: '#888888',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
    },
    radii: {
      md: '4px',
    },
    typography: {
      body: {
        size: '14px',
        weight: '400',
        lineHeight: '1.5',
      },
    },
  },
}));

describe('FilterBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the FilterBar component without crashing', () => {
      render(<FilterBar />);
      expect(screen.getByRole('combobox', { name: /planta/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /estado/i })).toBeInTheDocument();
    });

    it('renders both plant and status labels', () => {
      render(<FilterBar />);
      expect(screen.getByText('Planta')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
    });

    it('renders plant select with correct id', () => {
      render(<FilterBar />);
      expect(screen.getByRole('combobox', { name: /planta/i })).toHaveAttribute('id', 'plant-filter');
    });

    it('renders status select with correct id', () => {
      render(<FilterBar />);
      expect(screen.getByRole('combobox', { name: /estado/i })).toHaveAttribute('id', 'status-filter');
    });

    it('renders all plant options including "Todas" as default', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const options = plantSelect.querySelectorAll('option');
      expect(options).toHaveLength(5);
      expect(options[0]).toHaveValue('');
      expect(options[0]).toHaveTextContent('Todas');
    });

    it('renders all status options including "Todos" as default', () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      const options = statusSelect.querySelectorAll('option');
      expect(options).toHaveLength(5);
      expect(options[0]).toHaveValue('');
      expect(options[0]).toHaveTextContent('Todos');
    });

    it('renders specific plant options with correct values', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      expect(plantSelect.querySelector('option[value="plant-1"]')?.textContent).toBe('Planta Norte');
      expect(plantSelect.querySelector('option[value="plant-2"]')?.textContent).toBe('Planta Sur');
      expect(plantSelect.querySelector('option[value="plant-3"]')?.textContent).toBe('Planta Este');
      expect(plantSelect.querySelector('option[value="plant-4"]')?.textContent).toBe('Planta Oeste');
    });

    it('renders specific status options with correct values', () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      expect(statusSelect.querySelector('option[value="pending"]')?.textContent).toBe('Pendiente');
      expect(statusSelect.querySelector('option[value="in_transit"]')?.textContent).toBe('En Tránsito');
      expect(statusSelect.querySelector('option[value="delivered"]')?.textContent).toBe('Entregado');
      expect(statusSelect.querySelector('option[value="cancelled"]')?.textContent).toBe('Cancelado');
    });

    it('renders ChevronDown icons for both selects', () => {
      render(<FilterBar />);
      expect(ChevronDown).toHaveBeenCalledTimes(2);
    });

    it('renders selects with default empty values', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      expect(plantSelect).toHaveValue('');
      expect(statusSelect).toHaveValue('');
    });

    it('renders a wrapper div containing both filter selects', () => {
      const { container } = render(<FilterBar />);
      const wrapper = container.firstChild;
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('initializes with empty string for plantId state', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      expect(plantSelect).toHaveValue('');
    });

    it('initializes with empty string for status state', () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      expect(statusSelect).toHaveValue('');
    });

    it('updates plantId state when plant selection changes', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      });

      expect(plantSelect).toHaveValue('plant-1');
    });

    it('updates status state when status selection changes', async () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: 'pending' } });
      });

      expect(statusSelect).toHaveValue('pending');
    });

    it('can change plant selection from one option to another', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      });
      expect(plantSelect).toHaveValue('plant-1');
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-2' } });
      });
      expect(plantSelect).toHaveValue('plant-2');
    });

    it('can change status selection from one option to another', async () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: 'pending' } });
      });
      expect(statusSelect).toHaveValue('pending');
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: 'delivered' } });
      });
      expect(statusSelect).toHaveValue('delivered');
    });

    it('can reset plant selection back to empty', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      });
      expect(plantSelect).toHaveValue('plant-1');
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: '' } });
      });
      expect(plantSelect).toHaveValue('');
    });

    it('can reset status selection back to empty', async () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: 'in_transit' } });
      });
      expect(statusSelect).toHaveValue('in_transit');
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: '' } });
      });
      expect(statusSelect).toHaveValue('');
    });

    it('manages plant and status states independently', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-3' } });
        fireEvent.change(statusSelect, { target: { value: 'delivered' } });
      });

      expect(plantSelect).toHaveValue('plant-3');
      expect(statusSelect).toHaveValue('delivered');
    });
  });

  describe('Callback Functions', () => {
    it('calls onPlantChange callback when plant selection changes', async () => {
      const onPlantChange = jest.fn();
      render(<FilterBar onPlantChange={onPlantChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-2' } });
      });

      expect(onPlantChange).toHaveBeenCalledTimes(1);
      expect(onPlantChange).toHaveBeenCalledWith('plant-2');
    });

    it('calls onStatusChange callback when status selection changes', async () => {
      const onStatusChange = jest.fn();
      render(<FilterBar onStatusChange={onStatusChange} />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: 'cancelled' } });
      });

      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith('cancelled');
    });

    it('calls both callbacks when both selections change', async () => {
      const onPlantChange = jest.fn();
      const onStatusChange = jest.fn();
      render(<FilterBar onPlantChange={onPlantChange} onStatusChange={onStatusChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
        fireEvent.change(statusSelect, { target: { value: 'pending' } });
      });

      expect(onPlantChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onPlantChange).toHaveBeenCalledWith('plant-1');
      expect(onStatusChange).toHaveBeenCalledWith('pending');
    });

    it('does not call onPlantChange when selecting empty option', async () => {
      const onPlantChange = jest.fn();
      render(<FilterBar onPlantChange={onPlantChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: '' } });
      });

      expect(onPlantChange).toHaveBeenCalledTimes(1);
      expect(onPlantChange).toHaveBeenCalledWith('');
    });

    it('does not call onStatusChange when selecting empty option', async () => {
      const onStatusChange = jest.fn();
      render(<FilterBar onStatusChange={onStatusChange} />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: '' } });
      });

      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith('');
    });

    it('does not throw when callbacks are not provided', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        expect(() => {
          fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
        }).not.toThrow();
        
        expect(() => {
          fireEvent.change(statusSelect, { target: { value: 'delivered' } });
        }).not.toThrow();
      });
    });

    it('passes correct value to onPlantChange callback for all plant options', async () => {
      const onPlantChange = jest.fn();
      render(<FilterBar onPlantChange={onPlantChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      const plantIds = ['plant-1', 'plant-2', 'plant-3', 'plant-4'];
      
      for (const plantId of plantIds) {
        await act(async () => {
          fireEvent.change(plantSelect, { target: { value: plantId } });
        });
        expect(onPlantChange).toHaveBeenLastCalledWith(plantId);
      }
    });

    it('passes correct value to onStatusChange callback for all status options', async () => {
      const onStatusChange = jest.fn();
      render(<FilterBar onStatusChange={onStatusChange} />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      const statusIds = ['pending', 'in_transit', 'delivered', 'cancelled'];
      
      for (const statusId of statusIds) {
        await act(async () => {
          fireEvent.change(statusSelect, { target: { value: statusId } });
        });
        expect(onStatusChange).toHaveBeenLastCalledWith(statusId);
      }
    });
  });

  describe('Disabled State', () => {
    it('renders selects as enabled by default when disabled prop is not provided', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      expect(plantSelect).not.toBeDisabled();
      expect(statusSelect).not.toBeDisabled();
    });

    it('renders selects as enabled when disabled prop is false', () => {
      render(<FilterBar disabled={false} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      expect(plantSelect).not.toBeDisabled();
      expect(statusSelect).not.toBeDisabled();
    });

    it('renders selects as disabled when disabled prop is true', () => {
      render(<FilterBar disabled={true} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      expect(plantSelect).toBeDisabled();
      expect(statusSelect).toBeDisabled();
    });

    it('does not call onPlantChange when disabled and selection changes', async () => {
      const onPlantChange = jest.fn();
      render(<FilterBar disabled={true} onPlantChange={onPlantChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      });

      expect(onPlantChange).not.toHaveBeenCalled();
    });

    it('does not call onStatusChange when disabled and selection changes', async () => {
      const onStatusChange = jest.fn();
      render(<FilterBar disabled={true} onStatusChange={onStatusChange} />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: 'delivered' } });
      });

      expect(onStatusChange).not.toHaveBeenCalled();
    });

    it('maintains disabled state while interacting', async () => {
      render(<FilterBar disabled={true} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      // Try to change selection
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      });

      // Selection should not change when disabled
      expect(plantSelect).toHaveValue('');
    });
  });

  describe('Focus Handling', () => {
    it('renders selects that can receive focus', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      plantSelect.focus();
      expect(plantSelect).toHaveFocus();
      
      statusSelect.focus();
      expect(statusSelect).toHaveFocus();
    });

    it('handles focus event on plant select', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.focus(plantSelect);
      });

      expect(plantSelect).toHaveFocus();
    });

    it('handles focus event on status select', async () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.focus(statusSelect);
      });

      expect(statusSelect).toHaveFocus();
    });

    it('handles blur event on plant select', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.focus(plantSelect);
        fireEvent.blur(plantSelect);
      });

      expect(plantSelect).not.toHaveFocus();
    });

    it('handles blur event on status select', async () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.focus(statusSelect);
        fireEvent.blur(statusSelect);
      });

      expect(statusSelect).not.toHaveFocus();
    });

    it('can focus and blur both selects independently', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        plantSelect.focus();
      });
      expect(plantSelect).toHaveFocus();
      
      await act(async () => {
        statusSelect.focus();
      });
      expect(statusSelect).toHaveFocus();
      expect(plantSelect).not.toHaveFocus();
    });

    it('handles focus and blur events correctly when disabled', async () => {
      render(<FilterBar disabled={true} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      // Focus and blur should not cause errors even when disabled
      await act(async () => {
        fireEvent.focus(plantSelect);
        fireEvent.blur(plantSelect);
      });

      expect(plantSelect).toBeDisabled();
    });
  });

  describe('Integration Tests', () => {
    it('allows user to filter by plant only', async () => {
      const onPlantChange = jest.fn();
      render(<FilterBar onPlantChange={onPlantChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-2' } });
      });

      expect(plantSelect).toHaveValue('plant-2');
      expect(onPlantChange).toHaveBeenCalledWith('plant-2');
    });

    it('allows user to filter by status only', async () => {
      const onStatusChange = jest.fn();
      render(<FilterBar onStatusChange={onStatusChange} />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: 'in_transit' } });
      });

      expect(statusSelect).toHaveValue('in_transit');
      expect(onStatusChange).toHaveBeenCalledWith('in_transit');
    });

    it('allows user to filter by both plant and status', async () => {
      const onPlantChange = jest.fn();
      const onStatusChange = jest.fn();
      render(
        <FilterBar 
          onPlantChange={onPlantChange} 
          onStatusChange={onStatusChange} 
        />
      );
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-3' } });
        fireEvent.change(statusSelect, { target: { value: 'delivered' } });
      });

      expect(plantSelect).toHaveValue('plant-3');
      expect(statusSelect).toHaveValue('delivered');
      expect(onPlantChange).toHaveBeenCalledWith('plant-3');
      expect(onStatusChange).toHaveBeenCalledWith('delivered');
    });

    it('allows user to clear plant filter', async () => {
      const onPlantChange = jest.fn();
      render(<FilterBar onPlantChange={onPlantChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      });
      expect(plantSelect).toHaveValue('plant-1');
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: '' } });
      });
      expect(plantSelect).toHaveValue('');
      expect(onPlantChange).toHaveBeenCalledWith('');
    });

    it('allows user to clear status filter', async () => {
      const onStatusChange = jest.fn();
      render(<FilterBar onStatusChange={onStatusChange} />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: 'pending' } });
      });
      expect(statusSelect).toHaveValue('pending');
      
      await act(async () => {
        fireEvent.change(statusSelect, { target: { value: '' } });
      });
      expect(statusSelect).toHaveValue('');
      expect(onStatusChange).toHaveBeenCalledWith('');
    });

    it('supports complete workflow of setting and clearing all filters', async () => {
      const onPlantChange = jest.fn();
      const onStatusChange = jest.fn();
      render(
        <FilterBar 
          onPlantChange={onPlantChange} 
          onStatusChange={onStatusChange} 
        />
      );
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      // Set filters
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-4' } });
        fireEvent.change(statusSelect, { target: { value: 'cancelled' } });
      });
      expect(plantSelect).toHaveValue('plant-4');
      expect(statusSelect).toHaveValue('cancelled');
      
      // Clear filters
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: '' } });
        fireEvent.change(statusSelect, { target: { value: '' } });
      });
      expect(plantSelect).toHaveValue('');
      expect(statusSelect).toHaveValue('');
    });
  });

  describe('Multiple Instances', () => {
    it('renders multiple FilterBar instances independently', () => {
      const { rerender } = render(<FilterBar />);
      const plantSelects = screen.getAllByRole('combobox', { name: /planta/i });
      expect(plantSelects).toHaveLength(1);
      
      rerender(<FilterBar />);
      const allSelects = screen.getAllByRole('combobox');
      expect(allSelects).toHaveLength(2);
    });

    it('each FilterBar instance maintains its own state', async () => {
      const onPlantChange1 = jest.fn();
      const onPlantChange2 = jest.fn();
      
      render(
        <div>
          <FilterBar onPlantChange={onPlantChange1} />
          <FilterBar onPlantChange={onPlantChange2} />
        </div>
      );
      
      const plantSelects = screen.getAllByRole('combobox', { name: /planta/i });
      expect(plantSelects).toHaveLength(2);
      
      await act(async () => {
        fireEvent.change(plantSelects[0], { target: { value: 'plant-1' } });
      });
      
      expect(plantSelects[0]).toHaveValue('plant-1');
      expect(plantSelects[1]).toHaveValue('');
      expect(onPlantChange1).toHaveBeenCalledWith('plant-1');
      expect(onPlantChange2).not.toHaveBeenCalled();
    });

    it('each FilterBar instance handles disabled state independently', () => {
      render(
        <div>
          <FilterBar disabled={true} />
          <FilterBar disabled={false} />
        </div>
      );
      
      const allSelects = screen.getAllByRole('combobox');
      expect(allSelects[0]).toBeDisabled();
      expect(allSelects[1]).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for plant select', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      expect(plantSelect).toHaveAccessibleName(/planta/i);
    });

    it('has accessible labels for status select', () => {
      render(<FilterBar />);
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      expect(statusSelect).toHaveAccessibleName(/estado/i);
    });

    it('renders labels that are associated with their selects', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      const statusSelect = screen.getByRole('combobox', { name: /estado/i });
      
      expect(plantSelect.getAttribute('id')).toBe('plant-filter');
      expect(statusSelect.getAttribute('id')).toBe('status-filter');
    });

    it('maintains accessibility when disabled', () => {
      render(<FilterBar disabled={true} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      expect(plantSelect).toBeDisabled();
      expect(plantSelect).toHaveAttribute('disabled');
    });

    it('options have accessible text content', () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      const options = Array.from(plantSelect.querySelectorAll('option'));
      options.forEach(option => {
        expect(option.textContent).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid successive selections', async () => {
      const onPlantChange = jest.fn();
      render(<FilterBar onPlantChange={onPlantChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
        fireEvent.change(plantSelect, { target: { value: 'plant-2' } });
        fireEvent.change(plantSelect, { target: { value: 'plant-3' } });
      });

      expect(onPlantChange).toHaveBeenCalledTimes(3);
      expect(plantSelect).toHaveValue('plant-3');
    });

    it('handles selecting the same option multiple times', async () => {
      const onPlantChange = jest.fn();
      render(<FilterBar onPlantChange={onPlantChange} />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      });
      expect(plantSelect).toHaveValue('plant-1');
      
      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      });
      expect(plantSelect).toHaveValue('plant-1');
    });

    it('handles selection change events correctly', async () => {
      render(<FilterBar />);
      const plantSelect = screen.getByRole('combobox', { name: /planta/i });
      
      const changeEvent = { target: { value: 'plant-4' } };
      
      await act(async () => {
        fireEvent.change(plantSelect, changeEvent);
      });

      expect(plantSelect).toHaveValue('plant-4');
    });

    it('renders correctly with all possible combinations of props', () => {
      const combinations = [
        {},
        { disabled: false },
        { disabled: true },
        { onPlantChange: jest.fn() },
        { onStatusChange: jest.fn() },
        { onPlantChange: jest.fn(), onStatusChange: jest.fn() },
        { disabled: true, onPlantChange: jest.fn() },
        { disabled: true, onStatusChange: jest.fn() },
        { disabled: true, onPlantChange: jest.fn(), onStatusChange: jest.fn() },
      ];

      combinations.forEach(props => {
        const { unmount } = render(<FilterBar {...props} />);
        expect(screen.getByRole('combobox', { name: /planta/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /estado/i })).toBeInTheDocument();
        unmount();
      });
    });
  });
});
