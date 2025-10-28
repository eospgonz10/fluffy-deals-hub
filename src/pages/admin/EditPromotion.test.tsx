import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '@/test-utils';
import EditPromotion from './EditPromotion';
import * as usePromotionsModule from '@/hooks/usePromotions';
import { Promotion } from '@/types';

// Mock del hook usePromotions
const mockUpdatePromotion = vi.fn();
const mockUsePromotions = vi.spyOn(usePromotionsModule, 'usePromotions');

// Mock de react-router-dom con useParams
const mockNavigate = vi.fn();
let mockParams = { id: '1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

describe('EditPromotion Page', () => {
  const mockPromotion: Promotion = {
    id: '1',
    name: 'Oferta Existente',
    description: 'Descripción de oferta',
    category: 'alimento',
    discount: 25,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    image: 'dog-products',
    isActive: true,
    selectedProducts: ['1', '2'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { id: '1' };
    mockUsePromotions.mockReturnValue({
      promotions: [mockPromotion],
      isLoading: false,
      addPromotion: vi.fn(),
      updatePromotion: mockUpdatePromotion,
      deletePromotion: vi.fn(),
      permanentlyDeletePromotion: vi.fn(),
      restorePromotion: vi.fn(),
    });
  });

  describe('Estado de carga', () => {
    it('debería mostrar mensaje de carga cuando isLoading es true', () => {
      // Arrange
      mockUsePromotions.mockReturnValue({
        promotions: [],
        isLoading: true,
        addPromotion: vi.fn(),
        updatePromotion: mockUpdatePromotion,
        deletePromotion: vi.fn(),
        permanentlyDeletePromotion: vi.fn(),
        restorePromotion: vi.fn(),
      });

      // Act
      customRender(<EditPromotion />);

      // Assert
      expect(screen.getByText(/cargando\.\.\./i)).toBeInTheDocument();
    });

    it('NO debería mostrar el formulario mientras está cargando', () => {
      // Arrange
      mockUsePromotions.mockReturnValue({
        promotions: [],
        isLoading: true,
        addPromotion: vi.fn(),
        updatePromotion: mockUpdatePromotion,
        deletePromotion: vi.fn(),
        permanentlyDeletePromotion: vi.fn(),
        restorePromotion: vi.fn(),
      });

      // Act
      customRender(<EditPromotion />);

      // Assert
      expect(screen.queryByLabelText(/nombre de la promoción/i)).not.toBeInTheDocument();
    });
  });

  describe('Promoción no encontrada', () => {
    it('debería mostrar toast de error cuando la promoción no existe', async () => {
      // Arrange
      mockUsePromotions.mockReturnValue({
        promotions: [],
        isLoading: false,
        addPromotion: vi.fn(),
        updatePromotion: mockUpdatePromotion,
        deletePromotion: vi.fn(),
        permanentlyDeletePromotion: vi.fn(),
        restorePromotion: vi.fn(),
      });

      // Act
      customRender(<EditPromotion />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/promoción no encontrada/i)).toBeInTheDocument();
      });
    });

    it('debería navegar a /admin/promotions cuando no encuentra la promoción', async () => {
      // Arrange
      mockUsePromotions.mockReturnValue({
        promotions: [],
        isLoading: false,
        addPromotion: vi.fn(),
        updatePromotion: mockUpdatePromotion,
        deletePromotion: vi.fn(),
        permanentlyDeletePromotion: vi.fn(),
        restorePromotion: vi.fn(),
      });

      // Act
      customRender(<EditPromotion />);

      // Assert
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/promotions');
      });
    });

    it('NO debería renderizar nada después de redirigir', () => {
      // Arrange
      mockUsePromotions.mockReturnValue({
        promotions: [],
        isLoading: false,
        addPromotion: vi.fn(),
        updatePromotion: mockUpdatePromotion,
        deletePromotion: vi.fn(),
        permanentlyDeletePromotion: vi.fn(),
        restorePromotion: vi.fn(),
      });

      // Act
      const { container } = customRender(<EditPromotion />);

      // Assert
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Paso 1 - Carga de datos existentes', () => {
    describe('Renderizado inicial con datos', () => {
      it('debería mostrar el título correcto', async () => {
        // Arrange & Act
        customRender(<EditPromotion />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/editar promoción - paso 1 de 2/i)).toBeInTheDocument();
        });
      });

      it('debería pre-cargar el nombre de la promoción', async () => {
        // Arrange & Act
        customRender(<EditPromotion />);

        // Assert
        await waitFor(() => {
          const nameInput = screen.getByLabelText(/nombre de la promoción/i) as HTMLInputElement;
          expect(nameInput.value).toBe('Oferta Existente');
        });
      });

      it('debería pre-cargar la descripción', async () => {
        // Arrange & Act
        customRender(<EditPromotion />);

        // Assert
        await waitFor(() => {
          const descInput = screen.getByLabelText(/descripción/i) as HTMLTextAreaElement;
          expect(descInput.value).toBe('Descripción de oferta');
        });
      });

      it('debería pre-cargar el porcentaje de descuento', async () => {
        // Arrange & Act
        customRender(<EditPromotion />);

        // Assert
        await waitFor(() => {
          const discountInput = screen.getByLabelText(/porcentaje de descuento/i) as HTMLInputElement;
          expect(discountInput.value).toBe('25');
        });
      });

      it('debería pre-cargar las fechas', async () => {
        // Arrange & Act
        customRender(<EditPromotion />);

        // Assert
        await waitFor(() => {
          const startDateInput = screen.getByLabelText(/fecha de inicio/i) as HTMLInputElement;
          const endDateInput = screen.getByLabelText(/fecha de fin/i) as HTMLInputElement;
          
          expect(startDateInput.value).toBe('2025-01-01');
          expect(endDateInput.value).toBe('2025-12-31');
        });
      });

      it('debería pre-seleccionar la categoría', async () => {
        // Arrange & Act
        customRender(<EditPromotion />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/alimento/i)).toBeInTheDocument();
        });
      });
    });

    describe('Validación en edición', () => {
      it('debería validar cuando se elimina el nombre', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<EditPromotion />);

        // Act
        await waitFor(() => {
          expect(screen.getByLabelText(/nombre de la promoción/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/nombre de la promoción/i);
        await user.clear(nameInput);
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/nombre requerido/i)).toBeInTheDocument();
        });
      });

      it('debería validar el rango del descuento al editar', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<EditPromotion />);

        // Act
        await waitFor(() => {
          expect(screen.getByLabelText(/porcentaje de descuento/i)).toBeInTheDocument();
        });

        const discountInput = screen.getByLabelText(/porcentaje de descuento/i);
        await user.clear(discountInput);
        await user.type(discountInput, '150');
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/descuento no puede ser mayor a 100/i)).toBeInTheDocument();
        });
      });
    });

    describe('Modificación de datos', () => {
      it('debería permitir editar el nombre', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<EditPromotion />);

        // Act
        await waitFor(() => {
          expect(screen.getByLabelText(/nombre de la promoción/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/nombre de la promoción/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Nombre Actualizado');

        // Assert
        expect((nameInput as HTMLInputElement).value).toBe('Nombre Actualizado');
      });

      it('debería permitir cambiar la categoría', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<EditPromotion />);

        // Act
        await waitFor(() => {
          expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const categoryTrigger = screen.getByRole('combobox');
        await user.click(categoryTrigger);

        await waitFor(() => {
          expect(screen.getByRole('option', { name: /juguetes/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole('option', { name: /juguetes/i }));

        // Assert
        await waitFor(() => {
          const options = screen.getAllByText(/juguetes/i);
          expect(options.length).toBeGreaterThan(0);
        });
      });
    });

    describe('Navegación desde Paso 1', () => {
      it('debería cancelar y volver a /admin/promotions', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<EditPromotion />);

        // Act
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /cancelar/i }));

        // Assert
        expect(mockNavigate).toHaveBeenCalledWith('/admin/promotions');
      });

      it('debería avanzar al paso 2 con validación exitosa', async () => {
        // Arrange
        const user = userEvent.setup();
        customRender(<EditPromotion />);

        // Act
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Paso 2 - Edición de productos', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      customRender(<EditPromotion />);

      // Esperar a que cargue y avanzar al paso 2
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /siguiente/i }));

      await waitFor(() => {
        expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
      });
    });

    describe('Pre-selección de productos', () => {
      it('debería pre-seleccionar los productos existentes', () => {
        // Assert
        const checkboxes = screen.getAllByRole('checkbox');
        const selectedCheckboxes = checkboxes.filter((checkbox) => (checkbox as HTMLInputElement).checked);
        
        expect(selectedCheckboxes.length).toBe(2); // mockPromotion tiene ['1', '2']
      });

      it('debería mostrar productos de la categoría correcta', () => {
        // Assert - La categoría es 'alimento'
        expect(screen.getByText(/alimento premium para perros/i)).toBeInTheDocument();
        expect(screen.getByText(/alimento para gatos adultos/i)).toBeInTheDocument();
      });

      it('debería resaltar visualmente los productos pre-seleccionados', () => {
        // Assert
        const checkboxes = screen.getAllByRole('checkbox');
        const firstSelectedCheckbox = checkboxes.find((cb) => (cb as HTMLInputElement).checked);
        const productCard = firstSelectedCheckbox?.closest('.p-4');
        
        expect(productCard).toHaveClass('bg-accent', 'border-primary');
      });
    });

    describe('Modificación de selección', () => {
      it('debería permitir deseleccionar productos existentes', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        const firstChecked = checkboxes.find((cb) => (cb as HTMLInputElement).checked);
        
        if (firstChecked) {
          await user.click(firstChecked);
        }

        // Assert
        expect(firstChecked).not.toBeChecked();
      });

      it('debería permitir agregar nuevos productos', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        const firstUnchecked = checkboxes.find((cb) => !(cb as HTMLInputElement).checked);
        
        if (firstUnchecked) {
          await user.click(firstUnchecked);
        }

        // Assert
        expect(firstUnchecked).toBeChecked();
      });

      it('debería mantener al menos un producto para habilitar guardar', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        const checkedBoxes = checkboxes.filter((cb) => (cb as HTMLInputElement).checked);
        
        // Deseleccionar todos menos uno
        for (let i = 0; i < checkedBoxes.length - 1; i++) {
          await user.click(checkedBoxes[i]);
        }

        // Assert
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        expect(saveButton).not.toBeDisabled();
      });

      it('debería deshabilitar guardar si se deseleccionan todos los productos', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        const checkedBoxes = checkboxes.filter((cb) => (cb as HTMLInputElement).checked);
        
        // Deseleccionar todos
        for (const checkbox of checkedBoxes) {
          await user.click(checkbox);
        }

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

      it('debería mantener cambios del paso 1 al navegar atrás y adelante', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act - Volver al paso 1
        await user.click(screen.getByRole('button', { name: /anterior/i }));

        await waitFor(() => {
          expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
        });

        // Modificar nombre
        const nameInput = screen.getByLabelText(/nombre de la promoción/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Nombre Modificado');

        // Avanzar de nuevo
        await user.click(screen.getByRole('button', { name: /siguiente/i }));

        // Volver
        await waitFor(() => {
          expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /anterior/i }));

        // Assert
        await waitFor(() => {
          const updatedNameInput = screen.getByLabelText(/nombre de la promoción/i) as HTMLInputElement;
          expect(updatedNameInput.value).toBe('Nombre Modificado');
        });
      });
    });

    describe('Actualización de promoción', () => {
      it('debería llamar a updatePromotion con los datos correctos', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(mockUpdatePromotion).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
              name: 'Oferta Existente',
              description: 'Descripción de oferta',
              category: 'alimento',
              discount: 25,
              startDate: '2025-01-01',
              endDate: '2025-12-31',
            })
          );
        });
      });

      it('debería incluir los productos actualizados', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const checkboxes = screen.getAllByRole('checkbox');
        const unchecked = checkboxes.find((cb) => !(cb as HTMLInputElement).checked);
        if (unchecked) {
          await user.click(unchecked);
        }

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(mockUpdatePromotion).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
              selectedProducts: expect.arrayContaining(['1', '2']),
            })
          );
        });
      });

      it('debería mostrar toast de éxito después de actualizar', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/promoción actualizada/i)).toBeInTheDocument();
          expect(screen.getByText(/la promoción se ha actualizado exitosamente/i)).toBeInTheDocument();
        });
      });

      it('debería navegar a /admin/promotions después de actualizar', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNavigate.mockClear();

        // Act
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/admin/promotions');
        });
      });

      it('debería deshabilitar el botón mientras está guardando', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        expect(saveButton).toBeDisabled();
      });

      it('debería cambiar el texto del botón a "Guardando..." mientras guarda', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        expect(screen.getByRole('button', { name: /guardando\.\.\./i })).toBeInTheDocument();
      });

      it('NO debería actualizar sin productos seleccionados', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act - Deseleccionar todos los productos
        const checkboxes = screen.getAllByRole('checkbox');
        const checkedBoxes = checkboxes.filter((cb) => (cb as HTMLInputElement).checked);
        
        for (const checkbox of checkedBoxes) {
          await user.click(checkbox);
        }

        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/debe seleccionar al menos un producto/i)).toBeInTheDocument();
        });
        expect(mockUpdatePromotion).not.toHaveBeenCalled();
      });
    });

    describe('Manejo de errores', () => {
      it('debería mostrar toast de error si falla la actualización', async () => {
        // Arrange
        const user = userEvent.setup();
        mockUpdatePromotion.mockImplementation(() => {
          throw new Error('Error al actualizar');
        });

        // Act
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/error/i)).toBeInTheDocument();
          expect(screen.getByText(/ocurrió un error al actualizar la promoción/i)).toBeInTheDocument();
        });
      });

      it('NO debería navegar si hay error al actualizar', async () => {
        // Arrange
        const user = userEvent.setup();
        mockUpdatePromotion.mockImplementation(() => {
          throw new Error('Error al actualizar');
        });
        mockNavigate.mockClear();

        // Act
        const saveButton = screen.getByRole('button', { name: /guardar/i });
        await user.click(saveButton);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/ocurrió un error al actualizar la promoción/i)).toBeInTheDocument();
        });
        expect(mockNavigate).not.toHaveBeenCalledWith('/admin/promotions');
      });
    });
  });

  describe('Cambio de categoría en edición', () => {
    it('debería actualizar los productos disponibles al cambiar categoría', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<EditPromotion />);

      // Act
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      // Cambiar categoría a "juguetes"
      const categoryTrigger = screen.getByRole('combobox');
      await user.click(categoryTrigger);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /juguetes/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: /juguetes/i }));

      // Avanzar al paso 2
      await user.click(screen.getByRole('button', { name: /siguiente/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/pelota de goma/i)).toBeInTheDocument();
        expect(screen.getByText(/rascador para gatos/i)).toBeInTheDocument();
      });
    });

    it('debería resetear la selección de productos al cambiar categoría', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<EditPromotion />);

      // Act
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const categoryTrigger = screen.getByRole('combobox');
      await user.click(categoryTrigger);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /juguetes/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: /juguetes/i }));

      await user.click(screen.getByRole('button', { name: /siguiente/i }));

      // Assert - No debería haber productos pre-seleccionados
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        const selectedCheckboxes = checkboxes.filter((cb) => (cb as HTMLInputElement).checked);
        expect(selectedCheckboxes.length).toBe(0);
      });
    });
  });
});
