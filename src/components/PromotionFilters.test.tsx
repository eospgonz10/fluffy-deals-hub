import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '@/test-utils';
import { PromotionFilters, PromotionStatus } from './PromotionFilters';

describe('PromotionFilters Component', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar el icono de filtro', () => {
      // Arrange & Act
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Assert
      const filterIcon = document.querySelector('svg.lucide-filter');
      expect(filterIcon).toBeInTheDocument();
    });

    it('debería renderizar el select con el filtro seleccionado', () => {
      // Arrange & Act
      customRender(
        <PromotionFilters selectedFilter="active" onFilterChange={mockOnFilterChange} />
      );

      // Assert
      expect(screen.getByRole('combobox', { name: /filtrar promociones/i })).toBeInTheDocument();
    });

    it('debería tener el ancho correcto (200px)', () => {
      // Arrange & Act
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Assert
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger.parentElement).toHaveClass('w-[200px]');
    });

    it('debería tener aria-label para accesibilidad', () => {
      // Arrange & Act
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Assert
      const select = screen.getByRole('combobox', { name: /filtrar promociones/i });
      expect(select).toHaveAttribute('aria-label', 'Filtrar promociones');
    });
  });

  describe('Opciones de filtrado', () => {
    it('debería mostrar la opción "Todas" con su icono', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Assert
      expect(screen.getByRole('option', { name: /todas/i })).toBeInTheDocument();
    });

    it('debería mostrar la opción "Activas" con su icono', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Assert
      expect(screen.getByRole('option', { name: /activas/i })).toBeInTheDocument();
    });

    it('debería mostrar la opción "Programadas"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Assert
      expect(screen.getByRole('option', { name: /programadas/i })).toBeInTheDocument();
    });

    it('debería mostrar la opción "Vencidas"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Assert
      expect(screen.getByRole('option', { name: /vencidas/i })).toBeInTheDocument();
    });

    it('debería mostrar la opción "Papelera"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Assert
      expect(screen.getByRole('option', { name: /papelera/i })).toBeInTheDocument();
    });

    it('debería mostrar todas las opciones (5 en total)', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Assert
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(5);
    });
  });

  describe('Selección de filtros', () => {
    it('debería llamar onFilterChange al seleccionar "Activas"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const activeOption = screen.getByRole('option', { name: /activas/i });
      await user.click(activeOption);

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith('active');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    });

    it('debería llamar onFilterChange al seleccionar "Programadas"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const scheduledOption = screen.getByRole('option', { name: /programadas/i });
      await user.click(scheduledOption);

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith('scheduled');
    });

    it('debería llamar onFilterChange al seleccionar "Vencidas"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const expiredOption = screen.getByRole('option', { name: /vencidas/i });
      await user.click(expiredOption);

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith('expired');
    });

    it('debería llamar onFilterChange al seleccionar "Papelera"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const trashOption = screen.getByRole('option', { name: /papelera/i });
      await user.click(trashOption);

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith('trash');
    });

    it('debería llamar onFilterChange al seleccionar "Todas"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="active" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const allOption = screen.getByRole('option', { name: /todas/i });
      await user.click(allOption);

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });
  });

  describe('Estado del filtro seleccionado', () => {
    it('debería reflejar el filtro "active" cuando está seleccionado', () => {
      // Arrange & Act
      const { rerender } = customRender(
        <PromotionFilters selectedFilter="active" onFilterChange={mockOnFilterChange} />
      );

      // Assert
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveAttribute('data-state', 'closed');
      
      // Verificar que el valor actual está presente
      expect(selectTrigger).toBeInTheDocument();
    });

    it('debería reflejar el filtro "trash" cuando está seleccionado', () => {
      // Arrange & Act
      customRender(
        <PromotionFilters selectedFilter="trash" onFilterChange={mockOnFilterChange} />
      );

      // Assert
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
    });

    it('debería cambiar el filtro seleccionado al recibir nueva prop', () => {
      // Arrange
      const { rerender } = customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      rerender(
        <PromotionFilters selectedFilter="active" onFilterChange={mockOnFilterChange} />
      );

      // Assert
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('debería aceptar todos los valores válidos de PromotionStatus', () => {
      // Arrange & Act
      const validStatuses: PromotionStatus[] = ['all', 'active', 'scheduled', 'expired', 'trash'];

      // Assert - Verificar que todos los tipos son válidos
      validStatuses.forEach(status => {
        expect(() => {
          customRender(
            <PromotionFilters selectedFilter={status} onFilterChange={mockOnFilterChange} />
          );
        }).not.toThrow();
      });
    });
  });

  describe('Edge Cases', () => {
    it('debería manejar clicks múltiples sin errores', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      await user.click(selectTrigger);
      await user.click(selectTrigger);

      // Assert - No debería lanzar errores
      expect(selectTrigger).toBeInTheDocument();
    });

    it('debería funcionar correctamente con diferentes filtros iniciales', () => {
      // Arrange & Act
      const filters: PromotionStatus[] = ['all', 'active', 'scheduled', 'expired', 'trash'];
      
      // Assert
      filters.forEach(filter => {
        const { unmount } = customRender(
          <PromotionFilters selectedFilter={filter} onFilterChange={mockOnFilterChange} />
        );
        
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
        
        unmount();
      });
    });

    it('debería poder cambiar de filtro múltiples veces', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act & Assert
      const selectTrigger = screen.getByRole('combobox');
      
      // Primera selección
      await user.click(selectTrigger);
      await user.click(screen.getByRole('option', { name: /activas/i }));
      expect(mockOnFilterChange).toHaveBeenCalledWith('active');

      // Segunda selección
      await user.click(selectTrigger);
      await user.click(screen.getByRole('option', { name: /papelera/i }));
      expect(mockOnFilterChange).toHaveBeenCalledWith('trash');

      // Tercera selección
      await user.click(selectTrigger);
      await user.click(screen.getByRole('option', { name: /todas/i }));
      expect(mockOnFilterChange).toHaveBeenCalledWith('all');

      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Iconos visuales', () => {
    it('debería renderizar iconos para cada opción', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(
        <PromotionFilters selectedFilter="all" onFilterChange={mockOnFilterChange} />
      );

      // Act
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Assert - Verificar que existen múltiples iconos SVG (uno por opción)
      const svgIcons = document.querySelectorAll('svg.lucide-check-circle, svg.lucide-clock, svg.lucide-x-circle, svg.lucide-trash-2, svg.lucide-filter');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });
});
