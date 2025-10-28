import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '@/test-utils';
import CreatePromotion from './CreatePromotion';
import * as usePromotionsModule from '@/hooks/usePromotions';

// Mock del hook usePromotions
const mockAddPromotion = vi.fn();
const mockUsePromotions = vi.spyOn(usePromotionsModule, 'usePromotions');

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreatePromotion Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePromotions.mockReturnValue({
      promotions: [],
      isLoading: false,
      addPromotion: mockAddPromotion,
      updatePromotion: vi.fn(),
      deletePromotion: vi.fn(),
      permanentlyDeletePromotion: vi.fn(),
      restorePromotion: vi.fn(),
    });
  });

  describe('Paso 1 - Información básica', () => {
    describe('Renderizado inicial', () => {
      it('debería mostrar el título con el paso actual', () => {
        // Arrange & Act
        customRender(<CreatePromotion />);

        // Assert
        expect(screen.getByText(/crear nueva promoción - paso 1 de 2/i)).toBeInTheDocument();
      });

      it('debería mostrar todos los campos del formulario', () => {
        // Arrange & Act
        customRender(<CreatePromotion />);

        // Assert
        expect(screen.getByLabelText(/nombre de la promoción/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/fecha de fin/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
        expect(screen.getByText(/categoría/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/porcentaje de descuento/i)).toBeInTheDocument();
      });

      it('debería mostrar botones "Cancelar" y "Siguiente"', () => {
        // Arrange & Act
        customRender(<CreatePromotion />);

        // Assert
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
      });

      it('debería tener todos los campos vacíos inicialmente', () => {
        // Arrange & Act
        customRender(<CreatePromotion />);

        // Assert
        const nameInput = screen.getByLabelText(/nombre de la promoción/i) as HTMLInputElement;
        const descInput = screen.getByLabelText(/descripción/i) as HTMLTextAreaElement;
        const discountInput = screen.getByLabelText(/porcentaje de descuento/i) as HTMLInputElement;

        expect(nameInput.value).toBe('');
        expect(descInput.value).toBe('');
        expect(discountInput.value).toBe('');
      });
    });

    describe('Validación de campos', () => {
      it('debería mostrar error cuando el nombre está vacío', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/nombre requerido/i)).toBeInTheDocument();
        });
      });

      it('debería mostrar error cuando la descripción está vacía', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/descripción requerida/i)).toBeInTheDocument();
        });
      });

      it('debería mostrar error cuando la categoría no está seleccionada', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/categoría requerida/i)).toBeInTheDocument();
        });
      });

      it('debería mostrar error cuando el descuento es menor a 1', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        const discountInput = screen.getByLabelText(/porcentaje de descuento/i);
        await user.type(discountInput, '0');
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/descuento debe ser mayor a 0/i)).toBeInTheDocument();
        });
      });

      it('debería mostrar error cuando el descuento es mayor a 100', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        const discountInput = screen.getByLabelText(/porcentaje de descuento/i);
        await user.type(discountInput, '101');
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/descuento no puede ser mayor a 100/i)).toBeInTheDocument();
        });
      });

      it('debería mostrar error cuando la fecha de inicio está vacía', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/fecha de inicio requerida/i)).toBeInTheDocument();
        });
      });

      it('debería mostrar error cuando la fecha de fin está vacía', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/fecha de fin requerida/i)).toBeInTheDocument();
        });
      });

      it('NO debería avanzar al paso 2 si hay errores de validación', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
        });
      });
    });

    describe('Interacción con campos', () => {
      it('debería permitir escribir en el campo de nombre', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        const nameInput = screen.getByLabelText(/nombre de la promoción/i) as HTMLInputElement;
        await user.type(nameInput, 'Oferta Especial');

        // Assert
        expect(nameInput.value).toBe('Oferta Especial');
      });

      it('debería permitir escribir en el campo de descripción', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        const descInput = screen.getByLabelText(/descripción/i) as HTMLTextAreaElement;
        await user.type(descInput, 'Descripción de prueba');

        // Assert
        expect(descInput.value).toBe('Descripción de prueba');
      });

      it('debería permitir seleccionar una categoría', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        const categoryTrigger = screen.getByRole('combobox');
        await user.click(categoryTrigger);

        await waitFor(() => {
          expect(screen.getByRole('option', { name: /alimento/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole('option', { name: /alimento/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/alimento/i)).toBeInTheDocument();
        });
      });

      it('debería permitir escribir en el campo de descuento', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        const discountInput = screen.getByLabelText(/porcentaje de descuento/i) as HTMLInputElement;
        await user.type(discountInput, '25');

        // Assert
        expect(discountInput.value).toBe('25');
      });

      it('debería permitir seleccionar fechas', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        const startDateInput = screen.getByLabelText(/fecha de inicio/i) as HTMLInputElement;
        const endDateInput = screen.getByLabelText(/fecha de fin/i) as HTMLInputElement;
        
        await user.type(startDateInput, '2025-01-01');
        await user.type(endDateInput, '2025-12-31');

        // Assert
        expect(startDateInput.value).toBe('2025-01-01');
        expect(endDateInput.value).toBe('2025-12-31');
      });
    });

    describe('Navegación desde Paso 1', () => {
      it('debería navegar de vuelta a /admin/promotions al hacer clic en "Cancelar"', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act
        await user.click(screen.getByRole('button', { name: /cancelar/i }));

        // Assert
        expect(mockNavigate).toHaveBeenCalledWith('/admin/promotions');
      });

      it('debería avanzar al paso 2 con datos válidos', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<CreatePromotion />);

        // Act - Llenar todos los campos
        await user.type(screen.getByLabelText(/nombre de la promoción/i), 'Oferta Especial');
        await user.type(screen.getByLabelText(/descripción/i), 'Gran descuento');
        await user.type(screen.getByLabelText(/porcentaje de descuento/i), '20');
        await user.type(screen.getByLabelText(/fecha de inicio/i), '2025-01-01');
        await user.type(screen.getByLabelText(/fecha de fin/i), '2025-12-31');

        const categoryTrigger = screen.getByRole('combobox');
        await user.click(categoryTrigger);
        await waitFor(() => {
          expect(screen.getByRole('option', { name: /alimento/i })).toBeInTheDocument();
        });
        await user.click(screen.getByRole('option', { name: /alimento/i }));

        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Paso 2 - Selección de productos', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      customRender(<CreatePromotion />);

      // Llenar paso 1 y avanzar
      await user.type(screen.getByLabelText(/nombre de la promoción/i), 'Oferta Especial');
      await user.type(screen.getByLabelText(/descripción/i), 'Gran descuento');
      await user.type(screen.getByLabelText(/porcentaje de descuento/i), '20');
      await user.type(screen.getByLabelText(/fecha de inicio/i), '2025-01-01');
      await user.type(screen.getByLabelText(/fecha de fin/i), '2025-12-31');

      const categoryTrigger = screen.getByRole('combobox');
      await user.click(categoryTrigger);
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /alimento/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: /alimento/i }));

      await user.click(screen.getByRole('button', { name: /siguiente/i }));

      await waitFor(() => {
        expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
      });
    });

    describe('Renderizado de productos', () => {
      it('debería mostrar el título "Seleccionar Productos"', () => {
        // Assert
        expect(screen.getByText(/seleccionar productos/i)).toBeInTheDocument();
      });

      it('debería mostrar la categoría seleccionada', () => {
        // Assert
        expect(screen.getByText(/categoría: alimento/i)).toBeInTheDocument();
      });

      it('debería mostrar productos de la categoría seleccionada', () => {
        // Assert
        expect(screen.getByText(/alimento premium para perros/i)).toBeInTheDocument();
        expect(screen.getByText(/alimento para gatos adultos/i)).toBeInTheDocument();
        expect(screen.getByText(/snacks naturales/i)).toBeInTheDocument();
        expect(screen.getByText(/alimento para cachorros/i)).toBeInTheDocument();
      });

      it('debería mostrar los precios de los productos', () => {
        // Assert
        expect(screen.getByText('$45.99')).toBeInTheDocument();
        expect(screen.getByText('$32.50')).toBeInTheDocument();
      });

      it('debería mostrar checkboxes para cada producto', () => {
        // Assert
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      it('debería mostrar botones "Anterior" y "Guardar"', () => {
        // Assert
        expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
      });

      it('debería mostrar mensaje cuando no hay productos seleccionados', () => {
        // Assert
        expect(screen.getByText(/selecciona al menos un producto para continuar/i)).toBeInTheDocument();
      });
    });

    describe('Selección de productos', () => {
      it('debería permitir seleccionar un producto', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        // Assert
        expect(checkboxes[0]).toBeChecked();
      });

      it('debería permitir deseleccionar un producto', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        expect(checkboxes[0]).toBeChecked();
        
        await user.click(checkboxes[0]);

        // Assert
        expect(checkboxes[0]).not.toBeChecked();
      });

      it('debería permitir seleccionar múltiples productos', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
        await user.click(checkboxes[2]);

        // Assert
        expect(checkboxes[0]).toBeChecked();
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[2]).toBeChecked();
      });

      it('debería resaltar visualmente los productos seleccionados', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        const productCard = checkboxes[0].closest('.p-4');
        await user.click(checkboxes[0]);

        // Assert
        expect(productCard).toHaveClass('bg-accent', 'border-primary');
      });

      it('debería habilitar el botón "Guardar" cuando hay productos seleccionados', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        // Assert
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        expect(saveButton).not.toBeDisabled();
      });

      it('debería deshabilitar el botón "Guardar" sin productos seleccionados', () => {
        // Assert
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        expect(saveButton).toBeDisabled();
      });
    });

    describe('Navegación desde Paso 2', () => {
      it('debería volver al paso 1 al hacer clic en "Anterior"', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        await user.click(screen.getByRole('button', { name: /anterior/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
        });
      });

      it('debería mantener los datos del paso 1 al volver atrás', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        await user.click(screen.getByRole('button', { name: /anterior/i }));

        // Assert
        await waitFor(() => {
          const nameInput = screen.getByLabelText(/nombre de la promoción/i) as HTMLInputElement;
          expect(nameInput.value).toBe('Oferta Especial');
        });
      });

      it('NO debería guardar sin productos seleccionados', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/debe seleccionar al menos un producto/i)).toBeInTheDocument();
        });
        expect(mockAddPromotion).not.toHaveBeenCalled();
      });
    });

    describe('Guardado de promoción', () => {
      it('debería llamar a addPromotion con los datos correctos', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(mockAddPromotion).toHaveBeenCalledWith(
            expect.objectContaining({
              name: 'Oferta Especial',
              description: 'Gran descuento',
              category: 'alimento',
              discount: 20,
              startDate: '2025-01-01',
              endDate: '2025-12-31',
              isActive: true,
              selectedProducts: expect.any(Array),
            })
          );
        });
      });

      it('debería incluir los productos seleccionados', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(mockAddPromotion).toHaveBeenCalledWith(
            expect.objectContaining({
              selectedProducts: ['1'],
            })
          );
        });
      });

      it('debería navegar a /admin/promotions después de guardar', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/admin/promotions');
        });
      });

      it('debería mostrar toast de éxito después de guardar', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/promoción creada/i)).toBeInTheDocument();
          expect(screen.getByText(/la promoción se ha creado exitosamente/i)).toBeInTheDocument();
        });
      });

      it('debería deshabilitar el botón mientras está guardando', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        expect(saveButton).toBeDisabled();
      });

      it('debería cambiar el texto del botón a "Guardando..." mientras guarda', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        expect(screen.getByRole('button', { name: /guardando\.\.\./i })).toBeInTheDocument();
      });
    });

    describe('Manejo de errores', () => {
      it('debería mostrar toast de error si falla el guardado', async () => {
        // Arrange
        const user = userEvent.setup();
        mockAddPromotion.mockImplementation(() => {
          throw new Error('Error al guardar');
        });

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/error/i)).toBeInTheDocument();
          expect(screen.getByText(/ocurrió un error al crear la promoción/i)).toBeInTheDocument();
        });
      });

      it('NO debería navegar si hay error al guardar', async () => {
        // Arrange
        const user = userEvent.setup();
        mockAddPromotion.mockImplementation(() => {
          throw new Error('Error al guardar');
        });
        mockNavigate.mockClear();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/ocurrió un error al crear la promoción/i)).toBeInTheDocument();
        });
        expect(mockNavigate).not.toHaveBeenCalledWith('/admin/promotions');
      });
    });
  });

  describe('Categorías disponibles', () => {
    it('debería mostrar todas las categorías en el select', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<CreatePromotion />);

      // Act
      const categoryTrigger = screen.getByRole('combobox');
      await user.click(categoryTrigger);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /alimento/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /juguetes/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /cuidado e higiene/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /accesorios/i })).toBeInTheDocument();
      });
    });
  });
});
