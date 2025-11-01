import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePromotions } from './usePromotions';
import { localStorageService } from '@/services/localStorage.service';
import { Promotion } from '@/types';

// Mock del servicio de localStorage
vi.mock('@/services/localStorage.service', () => ({
  localStorageService: {
    initializeDefaults: vi.fn(),
    getPromotions: vi.fn(),
    savePromotions: vi.fn(),
  },
}));

describe('usePromotions Hook', () => {
  const mockPromotions: Promotion[] = [
    {
      id: '1',
      name: 'Promoción Test 1',
      description: 'Descripción test',
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
      name: 'Promoción Test 2',
      description: 'Otra descripción',
      category: 'juguetes',
      discount: 15,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      image: 'cat-products',
      isActive: true,
      selectedProducts: ['3'],
    },
    {
      id: '3',
      name: 'Promoción Eliminada',
      description: 'Esta está inactiva',
      category: 'cuidado',
      discount: 10,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      image: 'dog-products',
      isActive: false,
      selectedProducts: ['4'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorageService.getPromotions).mockReturnValue(mockPromotions);
  });

  describe('Initialization', () => {
    it('should initialize with loading state true', () => {
      // Arrange & Act
      const { result } = renderHook(() => usePromotions());

      // Assert
      expect(result.current.isLoading).toBe(true);
    });

    it('should call initializeDefaults on mount', async () => {
      // Arrange & Act
      renderHook(() => usePromotions());

      // Assert
      await waitFor(() => {
        expect(localStorageService.initializeDefaults).toHaveBeenCalledOnce();
      });
    });

    it('should load promotions from localStorage', async () => {
      // Arrange & Act
      const { result } = renderHook(() => usePromotions());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.promotions).toEqual(mockPromotions);
        expect(result.current.promotions).toHaveLength(3);
      });
    });

    it('should handle empty promotions list', async () => {
      // Arrange
      vi.mocked(localStorageService.getPromotions).mockReturnValue([]);

      // Act
      const { result } = renderHook(() => usePromotions());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.promotions).toEqual([]);
        expect(result.current.promotions).toHaveLength(0);
      });
    });
  });

  describe('addPromotion', () => {
    it('should add a new promotion with generated ID', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const newPromotion = {
        name: 'Nueva Promoción',
        description: 'Nueva descripción',
        category: 'alimento' as const,
        discount: 25,
        startDate: '2025-02-01',
        endDate: '2025-12-31',
        image: 'dog-products',
        selectedProducts: ['5', '6'],
      };

      // Act
      act(() => {
        result.current.addPromotion(newPromotion);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.promotions).toHaveLength(4);
        expect(result.current.promotions[3]).toMatchObject({
          ...newPromotion,
          isActive: true,
        });
        expect(result.current.promotions[3].id).toBeDefined();
      });
    });

    it('should set isActive to true by default', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const newPromotion = {
        name: 'Test Promotion',
        description: 'Test',
        category: 'juguetes' as const,
        discount: 30,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        image: 'cat-products',
        selectedProducts: [],
      };

      // Act
      act(() => {
        result.current.addPromotion(newPromotion);
      });

      // Assert
      await waitFor(() => {
        const addedPromotion = result.current.promotions[result.current.promotions.length - 1];
        expect(addedPromotion.isActive).toBe(true);
      });
    });

    it('should call savePromotions after adding', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const newPromotion = {
        name: 'Test',
        description: 'Test',
        category: 'alimento' as const,
        discount: 20,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        image: 'dog-products',
        selectedProducts: [],
      };

      // Act
      act(() => {
        result.current.addPromotion(newPromotion);
      });

      // Assert
      await waitFor(() => {
        expect(localStorageService.savePromotions).toHaveBeenCalled();
        const savedPromotions = vi.mocked(localStorageService.savePromotions).mock.calls[0][0];
        expect(savedPromotions).toHaveLength(4);
      });
    });

    it('should handle empty selectedProducts array', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const newPromotion = {
        name: 'Test',
        description: 'Test',
        category: 'alimento' as const,
        discount: 20,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        image: 'dog-products',
        selectedProducts: undefined,
      };

      // Act
      act(() => {
        result.current.addPromotion(newPromotion);
      });

      // Assert
      await waitFor(() => {
        const addedPromotion = result.current.promotions[result.current.promotions.length - 1];
        expect(addedPromotion.selectedProducts).toEqual([]);
      });
    });
  });

  describe('updatePromotion', () => {
    it('should update an existing promotion', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.updatePromotion('1', {
          name: 'Nombre Actualizado',
          discount: 30,
        });
      });

      // Assert
      await waitFor(() => {
        const updatedPromotion = result.current.promotions.find(p => p.id === '1');
        expect(updatedPromotion?.name).toBe('Nombre Actualizado');
        expect(updatedPromotion?.discount).toBe(30);
        expect(updatedPromotion?.description).toBe('Descripción test'); // No cambió
      });
    });

    it('should not affect other promotions', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.updatePromotion('1', { discount: 50 });
      });

      // Assert
      await waitFor(() => {
        const promotion2 = result.current.promotions.find(p => p.id === '2');
        expect(promotion2?.discount).toBe(15); // Sin cambios
      });
    });

    it('should call savePromotions after updating', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.updatePromotion('1', { name: 'Updated' });
      });

      // Assert
      await waitFor(() => {
        expect(localStorageService.savePromotions).toHaveBeenCalled();
      });
    });

    it('should handle partial updates', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.updatePromotion('1', { discount: 40 });
      });

      // Assert
      await waitFor(() => {
        const updatedPromotion = result.current.promotions.find(p => p.id === '1');
        expect(updatedPromotion?.discount).toBe(40);
        expect(updatedPromotion?.name).toBe('Promoción Test 1'); // Mantiene valores originales
      });
    });

    it('should do nothing if promotion ID does not exist', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const initialLength = result.current.promotions.length;

      // Act
      act(() => {
        result.current.updatePromotion('999', { name: 'No Existe' });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.promotions).toHaveLength(initialLength);
        const nonExistent = result.current.promotions.find(p => p.id === '999');
        expect(nonExistent).toBeUndefined();
      });
    });
  });

  describe('deletePromotion (soft delete)', () => {
    it('should set isActive to false', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.deletePromotion('1');
      });

      // Assert
      await waitFor(() => {
        const deletedPromotion = result.current.promotions.find(p => p.id === '1');
        expect(deletedPromotion?.isActive).toBe(false);
      });
    });

    it('should keep promotion in array', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const initialLength = result.current.promotions.length;

      // Act
      act(() => {
        result.current.deletePromotion('1');
      });

      // Assert
      await waitFor(() => {
        expect(result.current.promotions).toHaveLength(initialLength);
      });
    });

    it('should call savePromotions after deleting', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.deletePromotion('1');
      });

      // Assert
      await waitFor(() => {
        expect(localStorageService.savePromotions).toHaveBeenCalled();
      });
    });

    it('should not affect other promotions', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.deletePromotion('1');
      });

      // Assert
      await waitFor(() => {
        const promotion2 = result.current.promotions.find(p => p.id === '2');
        expect(promotion2?.isActive).toBe(true);
      });
    });
  });

  describe('permanentlyDeletePromotion (hard delete)', () => {
    it('should remove promotion from array', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.permanentlyDeletePromotion('1');
      });

      // Assert
      await waitFor(() => {
        expect(result.current.promotions).toHaveLength(2);
        const deletedPromotion = result.current.promotions.find(p => p.id === '1');
        expect(deletedPromotion).toBeUndefined();
      });
    });

    it('should call savePromotions after permanently deleting', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.permanentlyDeletePromotion('1');
      });

      // Assert
      await waitFor(() => {
        expect(localStorageService.savePromotions).toHaveBeenCalled();
        const savedPromotions = vi.mocked(localStorageService.savePromotions).mock.calls[0][0];
        expect(savedPromotions).toHaveLength(2);
      });
    });

    it('should do nothing if promotion does not exist', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const initialLength = result.current.promotions.length;

      // Act
      act(() => {
        result.current.permanentlyDeletePromotion('999');
      });

      // Assert
      await waitFor(() => {
        expect(result.current.promotions).toHaveLength(initialLength);
      });
    });
  });

  describe('restorePromotion', () => {
    it('should set isActive to true for inactive promotion', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.restorePromotion('3'); // Promoción inactiva
      });

      // Assert
      await waitFor(() => {
        const restoredPromotion = result.current.promotions.find(p => p.id === '3');
        expect(restoredPromotion?.isActive).toBe(true);
      });
    });

    it('should call savePromotions after restoring', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.restorePromotion('3');
      });

      // Assert
      await waitFor(() => {
        expect(localStorageService.savePromotions).toHaveBeenCalled();
      });
    });

    it('should keep promotion already active as active', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.restorePromotion('1'); // Ya activa
      });

      // Assert
      await waitFor(() => {
        const promotion = result.current.promotions.find(p => p.id === '1');
        expect(promotion?.isActive).toBe(true);
      });
    });

    it('should not affect other promotions', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.restorePromotion('3');
      });

      // Assert
      await waitFor(() => {
        const promotion1 = result.current.promotions.find(p => p.id === '1');
        const promotion2 = result.current.promotions.find(p => p.id === '2');
        expect(promotion1?.isActive).toBe(true);
        expect(promotion2?.isActive).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple operations in sequence', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.addPromotion({
          name: 'Nueva',
          description: 'Test',
          category: 'alimento',
          discount: 20,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          image: 'dog-products',
          selectedProducts: [],
        });
      });

      await waitFor(() => expect(result.current.promotions).toHaveLength(4));

      act(() => {
        result.current.deletePromotion('1');
      });

      await waitFor(() => {
        const deletedPromotion = result.current.promotions.find(p => p.id === '1');
        expect(deletedPromotion?.isActive).toBe(false);
      });

      act(() => {
        result.current.restorePromotion('1');
      });

      // Assert
      await waitFor(() => {
        const restoredPromotion = result.current.promotions.find(p => p.id === '1');
        expect(restoredPromotion?.isActive).toBe(true);
        expect(result.current.promotions).toHaveLength(4);
      });
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      const { result } = renderHook(() => usePromotions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Act
      act(() => {
        result.current.updatePromotion('1', { discount: 25 });
        result.current.updatePromotion('2', { discount: 20 });
      });

      // Assert
      await waitFor(() => {
        const promotion1 = result.current.promotions.find(p => p.id === '1');
        const promotion2 = result.current.promotions.find(p => p.id === '2');
        expect(promotion1?.discount).toBe(25);
        expect(promotion2?.discount).toBe(20);
      });
    });
  });
});
