import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '@/test-utils';
import Login from './Login';
import * as useAuthModule from '@/hooks/useAuth';

// Mock del hook useAuth
const mockLogin = vi.fn();
const mockUseAuth = vi.spyOn(useAuthModule, 'useAuth');

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
    });
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar el formulario de login con todos los elementos', () => {
      // Arrange & Act
      customRender(<Login />);

      // Assert
      expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByText(/¿olvidaste tu contraseña\?/i)).toBeInTheDocument();
    });

    it('debería mostrar campos de formulario vacíos inicialmente', () => {
      // Arrange & Act
      customRender(<Login />);

      // Assert
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/contraseña/i) as HTMLInputElement;
      
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });

    it('debería tener el botón de submit habilitado inicialmente', () => {
      // Arrange & Act
      customRender(<Login />);

      // Assert
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Validación de formulario', () => {
    it('debería mostrar error cuando el email es inválido', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<Login />);

      // Act
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur para validación
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error cuando la contraseña está vacía', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<Login />);

      // Act
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/contraseña requerida/i)).toBeInTheDocument();
      });
    });

    it('debería validar email y contraseña simultáneamente', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<Login />);

      // Act
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
        expect(screen.getByText(/contraseña requerida/i)).toBeInTheDocument();
      });
    });

    it('NO debería mostrar errores cuando los datos son válidos', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(true);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/email inválido/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/contraseña requerida/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidad de Login', () => {
    it('debería llamar a login con las credenciales correctas', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(true);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@petstore.com', 'admin123');
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });
    });

    it('debería navegar a home después de login exitoso', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(true);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('debería mostrar toast de éxito después de login exitoso', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(true);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/inicio de sesión exitoso/i)).toBeInTheDocument();
        expect(screen.getByText(/bienvenido a petstore/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar toast de error cuando las credenciales son incorrectas', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(false);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error de autenticación/i)).toBeInTheDocument();
        expect(screen.getByText(/email o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    it('NO debería navegar cuando el login falla', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(false);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Estado de carga', () => {
    it('debería deshabilitar el botón mientras está cargando', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(true);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      // Assert - El botón debería estar deshabilitado mientras procesa
      expect(submitButton).toBeDisabled();
    });

    it('debería cambiar el texto del botón a "Iniciando sesión..." mientras carga', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(true);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      expect(screen.getByRole('button', { name: /iniciando sesión\.\.\./i })).toBeInTheDocument();
    });

    it('debería volver a habilitar el botón después del login', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(true);
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar errores inesperados gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => {
        throw new Error('Network error');
      });
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/ocurrió un error inesperado/i)).toBeInTheDocument();
      });
    });

    it('NO debería navegar cuando hay un error inesperado', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => {
        throw new Error('Network error');
      });
      customRender(<Login />);

      // Act
      await user.type(screen.getByLabelText(/email/i), 'admin@petstore.com');
      await user.type(screen.getByLabelText(/contraseña/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Interacciones de usuario', () => {
    it('debería permitir escribir en el campo de email', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<Login />);

      // Act
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      // Assert
      expect(emailInput.value).toBe('test@example.com');
    });

    it('debería permitir escribir en el campo de contraseña', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<Login />);

      // Act
      const passwordInput = screen.getByLabelText(/contraseña/i) as HTMLInputElement;
      await user.type(passwordInput, 'mypassword123');

      // Assert
      expect(passwordInput.value).toBe('mypassword123');
    });

    it('debería ocultar la contraseña por defecto (type="password")', () => {
      // Arrange & Act
      customRender(<Login />);

      // Assert
      const passwordInput = screen.getByLabelText(/contraseña/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('debería permitir hacer clic en el enlace "¿Olvidaste tu contraseña?"', () => {
      // Arrange & Act
      customRender(<Login />);

      // Assert
      const forgotPasswordLink = screen.getByText(/¿olvidaste tu contraseña\?/i);
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '#');
    });
  });

  describe('Accesibilidad', () => {
    it('debería tener labels asociados correctamente a los inputs', () => {
      // Arrange & Act
      customRender(<Login />);

      // Assert
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('debería aplicar clases de error cuando hay errores de validación', async () => {
      // Arrange
      const user = userEvent.setup();
      customRender(<Login />);

      // Act
      await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Assert
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        
        expect(emailInput).toHaveClass('border-destructive');
        expect(passwordInput).toHaveClass('border-destructive');
      });
    });

    it('debería tener el formulario accesible por teclado', async () => {
      // Arrange
      const user = userEvent.setup();
      mockLogin.mockReturnValue(true);
      customRender(<Login />);

      // Act - Navegación completa con teclado
      await user.tab(); // Focus en email
      await user.keyboard('admin@petstore.com');
      await user.tab(); // Focus en password
      await user.keyboard('admin123');
      await user.tab(); // Focus en botón
      await user.keyboard('{Enter}'); // Submit

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@petstore.com', 'admin123');
      });
    });
  });
});
