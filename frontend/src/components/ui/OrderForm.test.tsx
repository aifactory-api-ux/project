import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrderForm } from './OrderForm';
import { apiFetch } from '../../lib/api';

jest.mock('../../lib/api');
jest.mock('lucide-react', () => ({
  Loader: () => <span data-testid="loader-icon">Loading</span>,
  Plus: () => <span data-testid="plus-icon">Plus</span>,
  X: () => <span data-testid="x-icon">X</span>,
  Package: () => <span data-testid="package-icon">Package</span>,
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('OrderForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('theme', 'light');
  });

  describe('Initial Render', () => {
    it('renders the form with all required fields', () => {
      render(<OrderForm />);

      expect(screen.getByLabelText(/planta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/centro de destino/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de despacho/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/vehículo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/conductor/i)).toBeInTheDocument();
    });

    it('renders plant selection options', () => {
      render(<OrderForm />);

      expect(screen.getByText('Planta Norte')).toBeInTheDocument();
      expect(screen.getByText('Planta Sur')).toBeInTheDocument();
      expect(screen.getByText('Planta Este')).toBeInTheDocument();
      expect(screen.getByText('Planta Oeste')).toBeInTheDocument();
    });

    it('renders distribution center options', () => {
      render(<OrderForm />);

      expect(screen.getByText('Centro Norte')).toBeInTheDocument();
      expect(screen.getByText('Centro Sur')).toBeInTheDocument();
      expect(screen.getByText('Centro Este')).toBeInTheDocument();
      expect(screen.getByText('Centro Oeste')).toBeInTheDocument();
      expect(screen.getByText('Centro Central')).toBeInTheDocument();
    });

    it('renders product options', () => {
      render(<OrderForm />);

      expect(screen.getByText('Producto A')).toBeInTheDocument();
      expect(screen.getByText('Producto B')).toBeInTheDocument();
      expect(screen.getByText('Producto C')).toBeInTheDocument();
      expect(screen.getByText('Producto D')).toBeInTheDocument();
    });

    it('renders unit options', () => {
      render(<OrderForm />);

      expect(screen.getByText('kg')).toBeInTheDocument();
      expect(screen.getByText('unit')).toBeInTheDocument();
      expect(screen.getByText('box')).toBeInTheDocument();
      expect(screen.getByText('pallet')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<OrderForm />);

      expect(screen.getByRole('button', { name: /crear orden/i })).toBeInTheDocument();
    });

    it('initializes with default product entry', () => {
      render(<OrderForm />);

      const productSections = screen.getAllByTestId(/product-entry-/);
      expect(productSections).toHaveLength(1);
    });

    it('has add product button', () => {
      render(<OrderForm />);

      expect(screen.getByRole('button', { name: /agregar producto/i })).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('allows selecting a plant', () => {
      render(<OrderForm />);

      const plantSelect = screen.getByLabelText(/planta/i);
      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });

      expect((plantSelect as HTMLSelectElement).value).toBe('plant-1');
    });

    it('allows selecting a distribution center', () => {
      render(<OrderForm />);

      const dcSelect = screen.getByLabelText(/centro de destino/i);
      fireEvent.change(dcSelect, { target: { value: 'dc-1' } });

      expect((dcSelect as HTMLSelectElement).value).toBe('dc-1');
    });

    it('allows entering a scheduled date', () => {
      render(<OrderForm />);

      const dateInput = screen.getByLabelText(/fecha de despacho/i);
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });

      expect((dateInput as HTMLInputElement).value).toBe('2024-12-20');
    });

    it('allows selecting a vehicle', () => {
      render(<OrderForm />);

      const vehicleSelect = screen.getByLabelText(/vehículo/i);
      fireEvent.change(vehicleSelect, { target: { value: 'vehicle-1' } });

      expect((vehicleSelect as HTMLSelectElement).value).toBe('vehicle-1');
    });

    it('allows selecting a driver', () => {
      render(<OrderForm />);

      const driverSelect = screen.getByLabelText(/conductor/i);
      fireEvent.change(driverSelect, { target: { value: 'driver-1' } });

      expect((driverSelect as HTMLSelectElement).value).toBe('driver-1');
    });

    it('allows changing product selection', () => {
      render(<OrderForm />);

      const productSelect = screen.getByLabelText(/producto/i);
      fireEvent.change(productSelect, { target: { value: 'prod-2' } });

      expect((productSelect as HTMLSelectElement).value).toBe('prod-2');
    });

    it('allows changing quantity', () => {
      render(<OrderForm />);

      const quantityInput = screen.getByLabelText(/cantidad/i);
      fireEvent.change(quantityInput, { target: { value: '10' } });

      expect((quantityInput as HTMLInputElement).value).toBe('10');
    });

    it('allows changing unit', () => {
      render(<OrderForm />);

      const unitSelect = screen.getByLabelText(/unidad/i);
      fireEvent.change(unitSelect, { target: { value: 'kg' } });

      expect((unitSelect as HTMLSelectElement).value).toBe('kg');
    });
  });

  describe('Product Management', () => {
    it('adds a new product entry when clicking add button', async () => {
      render(<OrderForm />);

      const addButton = screen.getByRole('button', { name: /agregar producto/i });

      await act(async () => {
        fireEvent.click(addButton);
      });

      const productEntries = document.querySelectorAll('[data-testid^="product-entry-"]');
      expect(productEntries.length).toBe(2);
    });

    it('removes a product entry when clicking remove button', async () => {
      render(<OrderForm />);

      const addButton = screen.getByRole('button', { name: /agregar producto/i });
      await act(async () => {
        fireEvent.click(addButton);
      });

      const removeButtons = screen.getAllByTestId(/remove-product-/);
      expect(removeButtons).toHaveLength(2);

      await act(async () => {
        fireEvent.click(removeButtons[0]);
      });

      const productEntriesAfterRemove = document.querySelectorAll('[data-testid^="product-entry-"]');
      expect(productEntriesAfterRemove.length).toBe(1);
    });

    it('maintains independent state for multiple product entries', async () => {
      render(<OrderForm />);

      const addButton = screen.getByRole('button', { name: /agregar producto/i });
      await act(async () => {
        fireEvent.click(addButton);
        fireEvent.click(addButton);
      });

      const productSelects = screen.getAllByLabelText(/producto/i);
      fireEvent.change(productSelects[0], { target: { value: 'prod-1' } });
      fireEvent.change(productSelects[1], { target: { value: 'prod-2' } });

      expect((productSelects[0] as HTMLSelectElement).value).toBe('prod-1');
      expect((productSelects[1] as HTMLSelectElement).value).toBe('prod-2');
    });

    it('does not allow removing the last product entry', async () => {
      render(<OrderForm />);

      const removeButtons = screen.queryAllByTestId(/remove-product-/);
      
      if (removeButtons.length > 0) {
        await act(async () => {
          fireEvent.click(removeButtons[0]);
        });
      }

      const productEntries = document.querySelectorAll('[data-testid^="product-entry-"]');
      expect(productEntries.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Validation', () => {
    it('shows error when plant is not selected on submit', async () => {
      render(<OrderForm />);

      const submitButton = screen.getByRole('button', { name: /crear orden/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText('Selecciona una planta')).toBeInTheDocument();
    });

    it('shows error when distribution center is not selected on submit', async () => {
      render(<OrderForm />);

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      const plantSelect = screen.getByLabelText(/planta/i);

      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText('Selecciona un centro de destino')).toBeInTheDocument();
    });

    it('shows error when scheduled date is not provided on submit', async () => {
      render(<OrderForm />);

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      const plantSelect = screen.getByLabelText(/planta/i);
      const dcSelect = screen.getByLabelText(/centro de destino/i);

      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      fireEvent.change(dcSelect, { target: { value: 'dc-1' } });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText('La fecha de despacho es requerida')).toBeInTheDocument();
    });

    it('shows error when vehicle is not selected on submit', async () => {
      render(<OrderForm />);

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      const plantSelect = screen.getByLabelText(/planta/i);
      const dcSelect = screen.getByLabelText(/centro de destino/i);
      const dateInput = screen.getByLabelText(/fecha de despacho/i);

      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      fireEvent.change(dcSelect, { target: { value: 'dc-1' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText('Selecciona un vehículo')).toBeInTheDocument();
    });

    it('shows error when driver is not selected on submit', async () => {
      render(<OrderForm />);

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      const plantSelect = screen.getByLabelText(/planta/i);
      const dcSelect = screen.getByLabelText(/centro de destino/i);
      const dateInput = screen.getByLabelText(/fecha de despacho/i);
      const vehicleSelect = screen.getByLabelText(/vehículo/i);

      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      fireEvent.change(dcSelect, { target: { value: 'dc-1' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
      fireEvent.change(vehicleSelect, { target: { value: 'vehicle-1' } });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText('Selecciona un conductor')).toBeInTheDocument();
    });

    it('shows error when quantity is zero or negative', async () => {
      render(<OrderForm />);

      const quantityInput = screen.getByLabelText(/cantidad/i);
      fireEvent.change(quantityInput, { target: { value: '0' } });

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText(/cantidad debe ser mayor a 0/i)).toBeInTheDocument();
    });

    it('shows error when product is not selected for additional entry', async () => {
      render(<OrderForm />);

      const addButton = screen.getByRole('button', { name: /agregar producto/i });
      await act(async () => {
        fireEvent.click(addButton);
      });

      const productSelects = screen.getAllByLabelText(/producto/i);
      fireEvent.change(productSelects[1], { target: { value: '' } });

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText('Selecciona un producto')).toBeInTheDocument();
    });

    it('clears errors when user corrects invalid fields', async () => {
      render(<OrderForm />);

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText('Selecciona una planta')).toBeInTheDocument();

      const plantSelect = screen.getByLabelText(/planta/i);
      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });

      await waitFor(() => {
        expect(screen.queryByText('Selecciona una planta')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async () => {
      const plantSelect = screen.getByLabelText(/planta/i);
      const dcSelect = screen.getByLabelText(/centro de destino/i);
      const dateInput = screen.getByLabelText(/fecha de despacho/i);
      const vehicleSelect = screen.getByLabelText(/vehículo/i);
      const driverSelect = screen.getByLabelText(/conductor/i);
      const productSelect = screen.getByLabelText(/producto/i);
      const quantityInput = screen.getByLabelText(/cantidad/i);
      const unitSelect = screen.getByLabelText(/unidad/i);

      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      fireEvent.change(dcSelect, { target: { value: 'dc-1' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
      fireEvent.change(vehicleSelect, { target: { value: 'vehicle-1' } });
      fireEvent.change(driverSelect, { target: { value: 'driver-1' } });
      fireEvent.change(productSelect, { target: { value: 'prod-1' } });
      fireEvent.change(quantityInput, { target: { value: '10' } });
      fireEvent.change(unitSelect, { target: { value: 'kg' } });
    };

    it('submits form successfully with valid data', async () => {
      const mockDispatch = {
        id: 'dispatch-123',
        plantId: 'plant-1',
        distributionCenterId: 'dc-1',
        status: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        scheduledDate: '2024-12-20',
        actualDeliveryDate: null,
        vehicleId: 'vehicle-1',
        driverId: 'driver-1',
        products: [{ productId: 'prod-1', quantity: 10, unit: 'kg' }],
      };

      mockApiFetch.mockResolvedValueOnce(mockDispatch as any);

      render(<OrderForm />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/dispatch', {
          method: 'POST',
          body: expect.objectContaining({
            plantId: 'plant-1',
            distributionCenterId: 'dc-1',
            scheduledDate: '2024-12-20',
            vehicleId: 'vehicle-1',
            driverId: 'driver-1',
            products: [{ productId: 'prod-1', quantity: 10, unit: 'kg' }],
          }),
        });
      });
    });

    it('calls onSuccess callback after successful submission', async () => {
      const onSuccess = jest.fn();
      const mockDispatch = { id: 'dispatch-123' };

      mockApiFetch.mockResolvedValueOnce(mockDispatch as any);

      render(<OrderForm onSuccess={onSuccess} />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockDispatch);
      });
    });

    it('does not submit form if validation fails', async () => {
      render(<OrderForm />);

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(mockApiFetch).not.toHaveBeenCalled();
    });

    it('shows loading state during submission', async () => {
      mockApiFetch.mockImplementation(() => new Promise(() => {}));

      render(<OrderForm />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('handles API error and shows error toast', async () => {
      const errorMessage = 'Network error';
      mockApiFetch.mockRejectedValueOnce(new Error(errorMessage));

      render(<OrderForm />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('calls onError callback on API error', async () => {
      const onError = jest.fn();
      const errorMessage = 'Server error';
      mockApiFetch.mockRejectedValueOnce(new Error(errorMessage));

      render(<OrderForm onError={onError} />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('resets loading state after submission completes', async () => {
      mockApiFetch.mockResolvedValueOnce({ id: 'dispatch-123' } as any);

      render(<OrderForm />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast Notifications', () => {
    it('shows success toast after successful submission', async () => {
      mockApiFetch.mockResolvedValueOnce({ id: 'dispatch-123' } as any);

      render(<OrderForm />);

      const plantSelect = screen.getByLabelText(/planta/i);
      const dcSelect = screen.getByLabelText(/centro de destino/i);
      const dateInput = screen.getByLabelText(/fecha de despacho/i);
      const vehicleSelect = screen.getByLabelText(/vehículo/i);
      const driverSelect = screen.getByLabelText(/conductor/i);

      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      fireEvent.change(dcSelect, { target: { value: 'dc-1' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
      fireEvent.change(vehicleSelect, { target: { value: 'vehicle-1' } });
      fireEvent.change(driverSelect, { target: { value: 'driver-1' } });

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/orden creada exitosamente/i)).toBeInTheDocument();
      });
    });

    it('auto-hides toast after 5 seconds', async () => {
      jest.useFakeTimers();
      mockApiFetch.mockResolvedValueOnce({ id: 'dispatch-123' } as any);

      render(<OrderForm />);

      const plantSelect = screen.getByLabelText(/planta/i);
      const dcSelect = screen.getByLabelText(/centro de destino/i);
      const dateInput = screen.getByLabelText(/fecha de despacho/i);
      const vehicleSelect = screen.getByLabelText(/vehículo/i);
      const driverSelect = screen.getByLabelText(/conductor/i);

      fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
      fireEvent.change(dcSelect, { target: { value: 'dc-1' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
      fireEvent.change(vehicleSelect, { target: { value: 'vehicle-1' } });
      fireEvent.change(driverSelect, { target: { value: 'driver-1' } });

      const submitButton = screen.getByRole('button', { name: /crear orden/i });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/orden creada exitosamente/i)).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByText(/orden creada exitosamente/i)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Theme Handling', () => {
    it('initializes with dark theme when localStorage has dark theme', () => {
      localStorage.setItem('theme', 'dark');

      render(<OrderForm />);

      const form = screen.getByTestId('order-form');
      expect(form).toBeInTheDocument();
    });

    it('initializes with light theme when localStorage has light theme', () => {
      localStorage.setItem('theme', 'light');

      render(<OrderForm />);

      const form = screen.getByTestId('order-form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long product list', async () => {
      render(<OrderForm />);

      const addButton = screen.getByRole('button', { name: /agregar producto/i });

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          fireEvent.click(addButton);
        });
      }

      const productEntries = document.querySelectorAll('[data-testid^="product-entry-"]');
      expect(productEntries.length).toBe(11);
    });

    it('handles decimal quantities', () => {
      render(<OrderForm />);

      const quantityInput = screen.getByLabelText(/cantidad/i);
      fireEvent.change(quantityInput, { target: { value: '1.5' } });

      expect((quantityInput as HTMLInputElement).value).toBe('1.5');
    });

    it('handles large quantity values', () => {
      render(<OrderForm />);

      const quantityInput = screen.getByLabelText(/cantidad/i);
      fireEvent.change(quantityInput, { target: { value: '999999' } });

      expect((quantityInput as HTMLInputElement).value).toBe('999999');
    });

    it('handles all unit types', () => {
      render(<OrderForm />);

      const units = ['kg', 'unit', 'box', 'pallet'];
      const unitSelect = screen.getByLabelText(/unidad/i);

      units.forEach(async (unit) => {
        fireEvent.change(unitSelect, { target: { value: unit } });
        expect((unitSelect as HTMLSelectElement).value).toBe(unit);
      });
    });

    it('handles rapid form interactions', async () => {
      render(<OrderForm />);

      const plantSelect = screen.getByLabelText(/planta/i);
      const dcSelect = screen.getByLabelText(/centro de destino/i);

      await act(async () => {
        fireEvent.change(plantSelect, { target: { value: 'plant-1' } });
        fireEvent.change(plantSelect, { target: { value: 'plant-2' } });
        fireEvent.change(dcSelect, { target: { value: 'dc-1' } });
        fireEvent.change(dcSelect, { target: { value: 'dc-2' } });
      });

      expect((plantSelect as HTMLSelectElement).value).toBe('plant-2');
      expect((dcSelect as HTMLSelectElement).value).toBe('dc-2');
    });
  });
});
