import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { localStorageService } from '@/services/localStorage.service';

// Mock del servicio de localStorage
vi.mock('@/services/localStorage.service', () => ({
  localStorageService: {
    initializeDefaults: vi.fn(),
    getSession: vi.fn(),
    getUsers: vi.fn(),
    saveUsers: vi.fn(),
    saveSession: vi.fn(),
    clearSession: vi.fn(),
  },
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize and eventually set loading to false', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);

      // Act
      const { result } = renderHook(() => useAuth());

      // Assert - Initially loading might be true or false depending on React timing
      // We wait for the hook to finish initialization
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.user).toBeNull();
    });

    it('should initialize defaults on mount', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);

      // Act
      renderHook(() => useAuth());

      // Assert
      await waitFor(() => {
        expect(localStorageService.initializeDefaults).toHaveBeenCalledOnce();
      });
    });

    it('should load existing session if available', async () => {
      // Arrange
      const mockSession = {
        email: 'test@example.com',
        isAuthenticated: true,
      };
      vi.mocked(localStorageService.getSession).mockReturnValue(mockSession);

      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockSession);
      });
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue([
        { email: 'test@example.com', password: 'password123' },
      ]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const loginResult = result.current.login('test@example.com', 'password123');

      // Assert
      expect(loginResult).toBe(true);
      
      // Wait for state update
      await waitFor(() => {
        expect(result.current.user).toEqual({
          email: 'test@example.com',
          isAuthenticated: true,
        });
      });
      expect(localStorageService.saveSession).toHaveBeenCalledWith({
        email: 'test@example.com',
        isAuthenticated: true,
      });
    });

    it('should fail login with invalid email', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue([
        { email: 'test@example.com', password: 'password123' },
      ]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const loginResult = result.current.login('wrong@example.com', 'password123');

      // Assert
      expect(loginResult).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageService.saveSession).not.toHaveBeenCalled();
    });

    it('should fail login with invalid password', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue([
        { email: 'test@example.com', password: 'password123' },
      ]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const loginResult = result.current.login('test@example.com', 'wrongpassword');

      // Assert
      expect(loginResult).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageService.saveSession).not.toHaveBeenCalled();
    });

    it('should handle empty credentials', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue([]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const loginResult = result.current.login('', '');

      // Assert
      expect(loginResult).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Logout Functionality', () => {
    it('should logout successfully', async () => {
      // Arrange
      const mockSession = {
        email: 'test@example.com',
        isAuthenticated: true,
      };
      vi.mocked(localStorageService.getSession).mockReturnValue(mockSession);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockSession);
      });

      // Act
      act(() => {
        result.current.logout();
      });

      // Assert
      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
      expect(localStorageService.clearSession).toHaveBeenCalledOnce();
    });

    it('should handle logout when no user is logged in', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      act(() => {
        result.current.logout();
      });

      // Assert
      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
      expect(localStorageService.clearSession).toHaveBeenCalledOnce();
    });
  });

  describe('Register Functionality', () => {
    it('should register new user successfully', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue([]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const registerResult = result.current.register('new@example.com', 'newpass123');

      // Assert
      expect(registerResult).toBe(true);
      expect(localStorageService.saveUsers).toHaveBeenCalledWith([
        { email: 'new@example.com', password: 'newpass123' },
      ]);
    });

    it('should fail to register existing user', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue([
        { email: 'existing@example.com', password: 'pass123' },
      ]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const registerResult = result.current.register('existing@example.com', 'newpass123');

      // Assert
      expect(registerResult).toBe(false);
      expect(localStorageService.saveUsers).not.toHaveBeenCalled();
    });

    it('should add new user to existing users list', async () => {
      // Arrange
      const existingUsers = [
        { email: 'user1@example.com', password: 'pass1' },
        { email: 'user2@example.com', password: 'pass2' },
      ];
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue(existingUsers);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const registerResult = result.current.register('user3@example.com', 'pass3');

      // Assert
      expect(registerResult).toBe(true);
      
      // Verificar que se llamó con los usuarios existentes + el nuevo
      expect(localStorageService.saveUsers).toHaveBeenCalledOnce();
      const callArgs = vi.mocked(localStorageService.saveUsers).mock.calls[0][0];
      expect(callArgs).toHaveLength(3);
      expect(callArgs[2]).toEqual({ email: 'user3@example.com', password: 'pass3' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-sensitive email comparison', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue([
        { email: 'Test@Example.com', password: 'password123' },
      ]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const loginResult = result.current.login('test@example.com', 'password123');

      // Assert
      // Debería fallar porque el email es case-sensitive
      expect(loginResult).toBe(false);
    });

    it('should handle multiple login attempts', async () => {
      // Arrange
      vi.mocked(localStorageService.getSession).mockReturnValue(null);
      vi.mocked(localStorageService.getUsers).mockReturnValue([
        { email: 'test@example.com', password: 'password123' },
      ]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      result.current.login('test@example.com', 'wrongpass');
      const secondAttempt = result.current.login('test@example.com', 'password123');

      // Assert
      expect(secondAttempt).toBe(true);
      
      // Wait for state update after successful login
      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
        expect(result.current.user?.email).toBe('test@example.com');
      });
    });
  });
});
