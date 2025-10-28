import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '@/test-utils';
import PromotionsList from './PromotionsList';
import * as usePromotionsModule from '@/hooks/usePromotions';
import { Promotion } from '@/types';

// Mock del hook usePromotions
const mockDeletePromotion = vi.fn();
const mockPermanentlyDeletePromotion = vi.fn();
const mockRestorePromotion = vi.fn();
const mockUsePromotions = vi.spyOn(usePromotionsModule, 'usePromotions');

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

// Mock de imágenes
vi.mock('@/assets/dog-products.jpg', () => ({ default: 'dog-products.jpg' }));
vi.mock('@/assets/cat-products.jpg', () => ({ default: 'cat-products.jpg' }));
vi.mock('@/assets/hero-pets.jpg', () => ({ default: 'hero-pets.jpg' }));

// Mock de window.confirm
const mockConfirm = vi.spyOn(window, 'confirm');

describe('PromotionsList Page', () => {
  const mockPromotions: Promotion[] = [
    {
      id: '1',
      name: 'Descuento en alimento para perros',
      description: 'Gran oferta en alimento premium',
      category: 'alimento',
      discount: 20,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      image: 'dog-products',
      isActive: true,
      selectedProducts: ['1', '2'],
    },
    {
      id: '2',
      name: 'Juguetes para gatos',
      description: 'Los mejores juguetes para tu gato',
      category: 'juguetes',
      discount: 15,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      image: 'cat-products',
      isActive: true,
      selectedProducts: ['5', '6'],
    },
    {
      id: '3',
      name: 'Promoción eliminada',
      description: 'Esta está en la papelera',
      category: 'cuidado',
      discount: 10,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      image: 'dog-products',
      isActive: false,
      selectedProducts: ['9'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePromotions.mockReturnValue({
      promotions: mockPromotions,
      isLoading: false,
      addPromotion: vi.fn(),
      updatePromotion: vi.fn(),
      deletePromotion: mockDeletePromotion,
      permanentlyDeletePromotion: mockPermanentlyDeletePromotion,
      restorePromotion: mockRestorePromotion,
    });
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar el título de la página', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByRole('heading', { name: /promociones/i })).toBeInTheDocument();
    });

    it('debería mostrar el botón "Crear" cuando no está en vista de papelera', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      const createButton = screen.getByRole('button', { name: /crear/i });
      expect(createButton).toBeInTheDocument();
    });

    it('debería mostrar filtros de promociones', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByText(/todas/i)).toBeInTheDocument();
    });

    it('debería mostrar solo promociones activas por defecto', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByText('Descuento en alimento para perros')).toBeInTheDocument();
      expect(screen.getByText('Juguetes para gatos')).toBeInTheDocument();
      expect(screen.queryByText('Promoción eliminada')).not.toBeInTheDocument();
    });

    it('debería mostrar el mensaje correcto cuando no hay promociones', () => {
      // Arrange
      mockUsePromotions.mockReturnValue({
        promotions: [],
        isLoading: false,
        addPromotion: vi.fn(),
        updatePromotion: vi.fn(),
        deletePromotion: mockDeletePromotion,
        permanentlyDeletePromotion: mockPermanentlyDeletePromotion,
        restorePromotion: mockRestorePromotion,
      });

      // Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByText(/no hay promociones disponibles/i)).toBeInTheDocument();
    });
  });

  describe('Visualización de promociones', () => {
    it('debería mostrar el nombre de cada promoción', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByText('Descuento en alimento para perros')).toBeInTheDocument();
      expect(screen.getByText('Juguetes para gatos')).toBeInTheDocument();
    });

    it('debería mostrar la descripción de cada promoción', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByText('Gran oferta en alimento premium')).toBeInTheDocument();
      expect(screen.getByText('Los mejores juguetes para tu gato')).toBeInTheDocument();
    });

    it('debería mostrar el descuento de cada promoción', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByText('20% OFF')).toBeInTheDocument();
      expect(screen.getByText('15% OFF')).toBeInTheDocument();
    });

    it('debería mostrar las fechas formateadas correctamente', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByText(/1 de enero de 2025/i)).toBeInTheDocument();
      expect(screen.getByText(/31 de diciembre de 2025/i)).toBeInTheDocument();
    });

    it('debería mostrar las imágenes de las promociones', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2); // 2 promociones activas
      expect(images[0]).toHaveAttribute('alt', 'Descuento en alimento para perros');
      expect(images[1]).toHaveAttribute('alt', 'Juguetes para gatos');
    });
  });

  describe('Botones de acción - Vista normal', () => {
    it('debería mostrar botones "Ver", "Editar" y "Eliminar" para cada promoción', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      const verButtons = screen.getAllByRole('button', { name: /ver/i });
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /^eliminar$/i });

      expect(verButtons).toHaveLength(2);
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    it('debería tener el enlace correcto para editar una promoción', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      const editLinks = screen.getAllByRole('link');
      const editLink = editLinks.find(link => link.getAttribute('href')?.includes('edit'));
      expect(editLink).toHaveAttribute('href', '/admin/promotions/1/edit');
    });
  });

  describe('Funcionalidad de eliminación suave', () => {
    it('debería abrir el diálogo de confirmación al hacer clic en "Eliminar"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /^eliminar$/i });
      await user.click(deleteButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText(/¿estás seguro/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar el nombre de la promoción en el diálogo', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /^eliminar$/i });
      await user.click(deleteButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/descuento en alimento para perros/i)).toBeInTheDocument();
      });
    });

    it('debería llamar a deletePromotion al confirmar', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /^eliminar$/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(mockDeletePromotion).toHaveBeenCalledWith('1');
        expect(mockDeletePromotion).toHaveBeenCalledTimes(1);
      });
    });

    it('debería mostrar toast después de eliminar', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /^eliminar$/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/promoción eliminada/i)).toBeInTheDocument();
        expect(screen.getByText(/la promoción se ha movido a la papelera/i)).toBeInTheDocument();
      });
    });

    it('NO debería eliminar si se cancela el diálogo', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const deleteButtons = screen.getAllByRole('button', { name: /^eliminar$/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      // Assert
      await waitFor(() => {
        expect(mockDeletePromotion).not.toHaveBeenCalled();
      });
    });
  });

  describe('Filtros de promociones', () => {
    it('debería filtrar promociones por estado "papelera"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Promoción eliminada')).toBeInTheDocument();
        expect(screen.queryByText('Descuento en alimento para perros')).not.toBeInTheDocument();
      });
    });

    it('debería mostrar botón "Salir de Papelera" en vista de papelera', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /salir de papelera/i })).toBeInTheDocument();
      });
    });

    it('NO debería mostrar botón "Crear" en vista de papelera', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      // Assert
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /crear/i })).not.toBeInTheDocument();
      });
    });

    it('debería mostrar mensaje correcto cuando no hay promociones en papelera', async () => {
      // Arrange
      const user = userEvent.setup();
      mockUsePromotions.mockReturnValue({
        promotions: [mockPromotions[0], mockPromotions[1]], // Solo activas
        isLoading: false,
        addPromotion: vi.fn(),
        updatePromotion: vi.fn(),
        deletePromotion: mockDeletePromotion,
        permanentlyDeletePromotion: mockPermanentlyDeletePromotion,
        restorePromotion: mockRestorePromotion,
      });
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no hay promociones en la papelera/i)).toBeInTheDocument();
      });
    });
  });

  describe('Vista de papelera - Acciones', () => {
    it('debería mostrar botones "Restaurar" y "Eliminar permanentemente" en papelera', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /restaurar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /eliminar permanentemente/i })).toBeInTheDocument();
      });
    });

    it('debería llamar a restorePromotion al hacer clic en "Restaurar"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /restaurar/i })).toBeInTheDocument();
      });

      const restoreButton = screen.getByRole('button', { name: /restaurar/i });
      await user.click(restoreButton);

      // Assert
      expect(mockRestorePromotion).toHaveBeenCalledWith('3');
      expect(mockRestorePromotion).toHaveBeenCalledTimes(1);
    });

    it('debería mostrar toast después de restaurar', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /restaurar/i })).toBeInTheDocument();
      });

      const restoreButton = screen.getByRole('button', { name: /restaurar/i });
      await user.click(restoreButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/promoción restaurada/i)).toBeInTheDocument();
        expect(screen.getByText(/la promoción ha sido restaurada exitosamente/i)).toBeInTheDocument();
      });
    });

    it('debería solicitar confirmación antes de eliminar permanentemente', async () => {
      // Arrange
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(true);
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /eliminar permanentemente/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /eliminar permanentemente/i });
      await user.click(deleteButton);

      // Assert
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining('¿Está seguro de eliminar permanentemente "Promoción eliminada"?')
      );
    });

    it('debería llamar a permanentlyDeletePromotion al confirmar', async () => {
      // Arrange
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(true);
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /eliminar permanentemente/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /eliminar permanentemente/i });
      await user.click(deleteButton);

      // Assert
      expect(mockPermanentlyDeletePromotion).toHaveBeenCalledWith('3');
    });

    it('NO debería eliminar si se cancela la confirmación', async () => {
      // Arrange
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(false);
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /eliminar permanentemente/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /eliminar permanentemente/i });
      await user.click(deleteButton);

      // Assert
      expect(mockPermanentlyDeletePromotion).not.toHaveBeenCalled();
    });
  });

  describe('Navegación', () => {
    it('debería tener el enlace correcto en el botón "Crear"', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      const createButton = screen.getByRole('button', { name: /crear/i });
      const link = createButton.closest('a');
      expect(link).toHaveAttribute('href', '/admin/promotions/create');
    });

    it('debería volver a la vista normal al hacer clic en "Salir de Papelera"', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<PromotionsList />);

      // Act
      const trashFilter = screen.getByRole('button', { name: /papelera/i });
      await user.click(trashFilter);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /salir de papelera/i })).toBeInTheDocument();
      });

      const exitButton = screen.getByRole('button', { name: /salir de papelera/i });
      await user.click(exitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Descuento en alimento para perros')).toBeInTheDocument();
        expect(screen.queryByText('Promoción eliminada')).not.toBeInTheDocument();
      });
    });
  });

  describe('Estado de carga', () => {
    it('debería renderizar correctamente cuando isLoading es false', () => {
      // Arrange
      mockUsePromotions.mockReturnValue({
        promotions: mockPromotions,
        isLoading: false,
        addPromotion: vi.fn(),
        updatePromotion: vi.fn(),
        deletePromotion: mockDeletePromotion,
        permanentlyDeletePromotion: mockPermanentlyDeletePromotion,
        restorePromotion: mockRestorePromotion,
      });

      // Act
      customRender(<PromotionsList />);

      // Assert
      expect(screen.getByRole('heading', { name: /promociones/i })).toBeInTheDocument();
    });
  });

  describe('Formato de fechas', () => {
    it('debería formatear las fechas en español', () => {
      // Arrange & Act
      customRender(<PromotionsList />);

      // Assert
      const dateRegex = /\d{1,2} de \w+ de \d{4}/;
      const allText = screen.getByText(/vigencia:/i).textContent;
      expect(allText).toMatch(dateRegex);
    });
  });
});
