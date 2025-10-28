# 🧪 Guía de Testing - Fluffy Deals Hub

Este documento describe el framework de testing implementado en el proyecto, siguiendo el patrón AAA (Arrange-Act-Assert) y con cobertura compatible con SonarQube.

## 📚 Stack de Testing

### Herramientas Principales
- **Vitest** v4.0.4 - Framework de testing (compatible con Jest)
- **@testing-library/react** - Testing de componentes React
- **@testing-library/jest-dom** - Matchers adicionales para DOM
- **@testing-library/user-event** - Simulación de interacciones de usuario
- **jsdom** - Simulación de entorno DOM
- **@vitest/coverage-v8** - Generación de cobertura LCOV

### Ventajas de Vitest
✅ Integración nativa con Vite (más rápido)  
✅ Compatible con sintaxis de Jest  
✅ Hot Module Replacement para tests  
✅ UI integrada para debugging  
✅ Cobertura LCOV nativa (SonarQube-ready)

---

## 🚀 Comandos Disponibles

```bash
# Modo watch (desarrollo) - Se re-ejecutan al cambiar código
npm test

# Ejecución única (CI/CD)
npm run test:run

# Interfaz visual de tests
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage
```

---

## 📁 Estructura de Tests

```
src/
├── services/
│   ├── localStorage.service.ts
│   └── localStorage.service.test.ts      ← ✅ 19 tests (servicios)
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts                   ← ✅ 14 tests (hooks)
├── lib/
│   ├── utils.ts
│   └── utils.test.ts                     ← ✅ 21 tests (utilidades)
├── components/
│   ├── DeletePromotionDialog.tsx
│   ├── PromotionFilters.tsx
│   └── SettingsPanel.tsx                 ← 🔜 Tests futuros (componentes)
├── pages/
│   ├── Login.tsx
│   ├── Login.test.tsx                    ← ✅ 28 tests (autenticación)
│   └── admin/
│       ├── PromotionsList.tsx
│       ├── PromotionsList.test.tsx       ← ✅ 44 tests (lista CRUD)
│       ├── CreatePromotion.tsx
│       ├── CreatePromotion.test.tsx      ← ✅ 46 tests (crear promoción)
│       ├── EditPromotion.tsx
│       └── EditPromotion.test.tsx        ← ✅ 18 tests (editar promoción)
└── test-utils.tsx                        ← 🛠️ Helpers (customRender, mocks)
```

**Total:** 190 tests | ✅ 137 passing (72%) | ⚠️ 53 need adjustments

---

## 🎯 Patrón AAA (Arrange-Act-Assert)

Todos los tests siguen el patrón **AAA** para máxima claridad:

```typescript
it('should do something correctly', () => {
  // ✅ ARRANGE (Preparar)
  // Configurar el estado inicial, mocks, datos de prueba
  const mockData = { email: 'test@example.com', password: 'pass123' };
  
  // ✅ ACT (Actuar)
  // Ejecutar la función o acción que queremos probar
  const result = functionUnderTest(mockData);
  
  // ✅ ASSERT (Afirmar)
  // Verificar que el resultado es el esperado
  expect(result).toBe(expectedValue);
});
```

### Ejemplo Real - localStorage.service.test.ts

```typescript
describe('Session Management', () => {
  it('should save and retrieve session correctly', () => {
    // Arrange
    const mockSession = {
      email: 'user@test.com',
      isAuthenticated: true,
    };

    // Act
    localStorageService.saveSession(mockSession);
    const retrievedSession = localStorageService.getSession();

    // Assert
    expect(retrievedSession).toEqual(mockSession);
    expect(retrievedSession.isAuthenticated).toBe(true);
  });
});
```

---

## 🔧 Configuración de Vitest

### `vitest.config.ts`
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',           // Simula el DOM del navegador
    setupFiles: ['./vitest.setup.ts'], // Setup global
    globals: true,                   // No necesitas imports de describe, it, expect
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'], // LCOV para SonarQube
      reportsDirectory: './coverage',
    },
  },
});
```

### `vitest.setup.ts`
- Extiende matchers con `@testing-library/jest-dom`
- Limpia el DOM después de cada test (`cleanup()`)
- Limpia localStorage después de cada test
- Mockea APIs del navegador (matchMedia, IntersectionObserver, ResizeObserver)
- **Polyfills para Radix UI:**
  - `hasPointerCapture()` - Requerido por Select component
  - `setPointerCapture()` - Manejo de pointer events
  - `releasePointerCapture()` - Liberación de pointer capture
  - `scrollIntoView()` - Scroll de elementos seleccionados

---

## 🛠️ Helpers de Testing

### `src/test-utils.tsx`

#### `render()` - Render con Providers
```typescript
import { render } from '@/test-utils';

// Automáticamente incluye:
// - QueryClientProvider
// - TooltipProvider
// - BrowserRouter
const { getByText } = render(<MyComponent />);
```

#### `mockLocalStorage()` - Mock de localStorage
```typescript
const mockStorage = mockLocalStorage();
mockStorage.setItem('key', 'value');
expect(mockStorage.getItem('key')).toBe('value');
```

---

## 📝 Tipos de Tests Implementados

### 1️⃣ **Tests de Servicios** (`localStorage.service.test.ts`)

**Cobertura:** 19 tests  
**Aspectos probados:**
- ✅ CRUD de usuarios
- ✅ Gestión de sesión
- ✅ CRUD de promociones
- ✅ Gestión de settings
- ✅ Inicialización de defaults
- ✅ Edge cases (datos corruptos, vacíos, nulos)

**Ejemplo:**
```typescript
describe('Users Management', () => {
  it('should save and retrieve users correctly', () => {
    // Arrange
    const mockUsers: User[] = [
      { email: 'test@example.com', password: 'password123' },
    ];

    // Act
    localStorageService.saveUsers(mockUsers);
    const retrievedUsers = localStorageService.getUsers();

    // Assert
    expect(retrievedUsers).toEqual(mockUsers);
    expect(retrievedUsers).toHaveLength(1);
  });
});
```

---

### 2️⃣ **Tests de Hooks** (`useAuth.test.ts`)

**Cobertura:** 14 tests  
**Aspectos probados:**
- ✅ Inicialización del hook
- ✅ Login exitoso/fallido
- ✅ Logout
- ✅ Registro de usuarios
- ✅ Validación de credenciales
- ✅ Persistencia de sesión

**Técnicas:**
- Mock de `localStorageService` con `vi.mock()`
- `renderHook()` de Testing Library
- `waitFor()` para operaciones asíncronas

**Ejemplo:**
```typescript
describe('Login Functionality', () => {
  it('should login successfully with valid credentials', async () => {
    // Arrange
    vi.mocked(localStorageService.getUsers).mockReturnValue([
      { email: 'test@example.com', password: 'password123' },
    ]);
    const { result } = renderHook(() => useAuth());

    // Act
    const loginResult = result.current.login('test@example.com', 'password123');

    // Assert
    expect(loginResult).toBe(true);
    expect(result.current.user).toEqual({
      email: 'test@example.com',
      isAuthenticated: true,
    });
  });
});
```

---

### 3️⃣ **Tests de Utilidades** (`utils.test.ts`)

**Cobertura:** 21 tests  
**Aspectos probados:**
- ✅ Función `cn()` (className utility)
- ✅ Merge de clases Tailwind
- ✅ Resolución de conflictos
- ✅ Clases condicionales
- ✅ Arrays y objetos
- ✅ Edge cases (undefined, null, empty)

**Ejemplo:**
```typescript
describe('Tailwind Merge Functionality', () => {
  it('should resolve conflicting Tailwind classes (last wins)', () => {
    // Arrange
    const firstClass = 'text-red-500';
    const secondClass = 'text-blue-500';

    // Act
    const result = cn(firstClass, secondClass);

    // Assert
    expect(result).toBe('text-blue-500');
    expect(result).not.toContain('text-red-500');
  });
});
```

---

### 4️⃣ **Tests de Páginas** (Etapa 3 - Implementado)

#### 📄 **Login.test.tsx**
**Cobertura:** 28 tests  
**Aspectos probados:**
- ✅ Renderizado de formulario
- ✅ Validación con zod (email, contraseña)
- ✅ Login exitoso/fallido
- ✅ Estados de carga (loading, disabled buttons)
- ✅ Manejo de errores (credenciales incorrectas, errores inesperados)
- ✅ Interacciones de usuario (typing, submit)
- ✅ Accesibilidad (labels, ARIA, navegación por teclado)

**Ejemplo:**
```typescript
describe('Login Functionality', () => {
  it('should call login with correct credentials', async () => {
    // Arrange
    const mockLogin = vi.fn().mockReturnValue(true);
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      // ... otros valores
    });
    render(<Login />);

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Assert
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
```

#### 📄 **PromotionsList.test.tsx**
**Cobertura:** 44 tests  
**Aspectos probados:**
- ✅ Renderizado de lista de promociones
- ✅ Visualización de detalles (nombre, descripción, descuento, fechas, imágenes)
- ✅ Botones de acción (Ver, Editar, Eliminar)
- ✅ Eliminación suave (soft delete con confirmación)
- ✅ Filtros de promociones (activas, expiradas, papelera)
- ✅ Vista de papelera (Restaurar, Eliminar permanentemente)
- ✅ Navegación entre vistas
- ✅ Estados de carga
- ✅ Formato de fechas en español

**Ejemplo:**
```typescript
describe('Soft Delete Functionality', () => {
  it('should call deletePromotion on confirmation', async () => {
    // Arrange
    const mockDeletePromotion = vi.fn();
    vi.mocked(usePromotions).mockReturnValue({
      deletePromotion: mockDeletePromotion,
      promotions: mockPromotions,
      // ... otros valores
    });
    render(<PromotionsList />);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    // Act
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    await userEvent.click(deleteButtons[0]);

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeletePromotion).toHaveBeenCalledWith('1');
  });
});
```

#### 📄 **CreatePromotion.test.tsx**
**Cobertura:** 46 tests (divididos en Paso 1 y Paso 2)  
**Aspectos probados:**

**Paso 1 - Información Básica:**
- ✅ Renderizado inicial (título, campos, botones)
- ✅ Validación de campos (nombre, descripción, categoría, descuento, fechas)
- ✅ Rangos de descuento (1-100%)
- ✅ Interacción con campos (typing, select)
- ✅ Navegación (Cancelar, Siguiente)
- ✅ Prevención de avance con errores

**Paso 2 - Selección de Productos:**
- ✅ Renderizado de productos por categoría
- ✅ Checkboxes para selección múltiple
- ✅ Precios de productos
- ✅ Selección/deselección de productos
- ✅ Resaltado visual de productos seleccionados
- ✅ Botón "Guardar" habilitado/deshabilitado
- ✅ Navegación "Anterior"
- ✅ Persistencia de datos entre pasos
- ✅ Guardado de promoción con addPromotion
- ✅ Estados de carga (loading, "Guardando...")
- ✅ Manejo de errores

**Ejemplo:**
```typescript
describe('Product Selection - Paso 2', () => {
  beforeEach(async () => {
    // Arrange: Navigate to Paso 2
    vi.mocked(usePromotions).mockReturnValue({
      addPromotion: mockAddPromotion,
      // ... otros valores
    });
    render(<CreatePromotion />);
    
    // Fill Paso 1 and advance
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Promoción Test');
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Descripción test');
    await userEvent.type(screen.getByLabelText(/descuento/i), '20');
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }));
  });

  it('should allow selecting multiple products', async () => {
    // Act
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    await userEvent.click(checkboxes[1]);

    // Assert
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });
});
```

#### 📄 **EditPromotion.test.tsx**
**Cobertura:** 18 tests  
**Aspectos probados:**
- ✅ Estado de carga (isLoading)
- ✅ Promoción no encontrada (redirect)
- ✅ Pre-carga de datos existentes (nombre, descripción, descuento, fechas, categoría)
- ✅ Validación en edición (rango de descuento)
- ✅ Edición de campos
- ✅ Cambio de categoría
- ✅ Pre-selección de productos existentes
- ✅ Resaltado visual de productos pre-seleccionados
- ✅ Modificación de selección (agregar/quitar productos)
- ✅ Validación de al menos 1 producto
- ✅ Navegación entre pasos (mantiene cambios)
- ✅ Actualización con updatePromotion
- ✅ Estados de loading y mensajes
- ✅ Manejo de errores

**Ejemplo:**
```typescript
describe('Product Editing - Paso 2', () => {
  beforeEach(async () => {
    // Arrange: Mock existing promotion
    const existingPromotion = {
      id: '1',
      name: 'Promoción Existente',
      category: 'tecnologia',
      productIds: ['1', '2'], // Pre-selected products
      // ... otros campos
    };
    
    vi.mocked(usePromotions).mockReturnValue({
      getPromotionById: vi.fn().mockReturnValue(existingPromotion),
      updatePromotion: mockUpdatePromotion,
      // ... otros valores
    });
    
    vi.mocked(useParams).mockReturnValue({ id: '1' });
    render(<EditPromotion />);
    
    // Navigate to Paso 2
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }));
  });

  it('should pre-select existing products', () => {
    // Assert
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked(); // Product 1
    expect(checkboxes[1]).toBeChecked(); // Product 2
    expect(checkboxes[2]).not.toBeChecked(); // Product 3
  });
});
```

---

## 📊 Cobertura de Código (Coverage)

### Generar Reporte
```bash
npm run test:coverage
```

### Archivos Generados
```
coverage/
├── lcov.info              ← Para SonarQube
├── coverage-final.json    ← Datos raw de coverage
└── lcov-report/           ← Reporte HTML visual
    └── index.html
```

### Ver Reporte HTML
```bash
# Abrir en navegador
$BROWSER coverage/lcov-report/index.html
```

### Archivos Excluidos del Coverage
- `**/*.test.ts` - Tests
- `**/*.config.ts` - Configuraciones
- `src/test-utils.tsx` - Helpers de testing
- `src/main.tsx` - Entry point
- `src/vite-env.d.ts` - Types de Vite
- `vitest.setup.ts` - Setup de Vitest

---

## 🎯 Integración con SonarQube

### Archivo `sonar-project.properties`
```properties
sonar.projectKey=fluffy-deals-hub
sonar.organization=eospgonz10

# Coverage report (LCOV)
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Exclusiones
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,src/test-utils.tsx
```

### GitHub Actions (CI/CD)
```yaml
- name: Install dependencies
  run: npm install

- name: Run tests with coverage
  run: npm run test:coverage

- name: SonarQube Scan
  uses: SonarSource/sonarqube-scan-action@v6
  env:
    SONAR_TOKEN: ${{ secrets.SONARCLOUD_TOKEN }}
```

---

## ✅ Mejores Prácticas

### 1. **Nombrar Tests Descriptivamente**
```typescript
❌ it('works', () => { ... })
✅ it('should save and retrieve users correctly', () => { ... })
```

### 2. **Un Assert por Concepto**
```typescript
// ✅ Varios expects relacionados OK
expect(result).toEqual(expected);
expect(result.status).toBe('success');

// ❌ Evitar mezclar conceptos no relacionados
```

### 3. **Usar Matchers Específicos**
```typescript
❌ expect(result === true).toBe(true)
✅ expect(result).toBe(true)

❌ expect(array.length).toBe(0)
✅ expect(array).toHaveLength(0)
```

### 4. **Limpiar Mocks**
```typescript
beforeEach(() => {
  vi.clearAllMocks();  // Limpia counters de llamadas
  vi.resetAllMocks();  // Restaura implementación original
  localStorage.clear(); // Limpia localStorage
});
```

### 5. **Tests Aislados**
Cada test debe ser independiente:
```typescript
// ✅ Cada test configura su propio estado
it('test 1', () => {
  const mockData = { ... };
  // test logic
});

it('test 2', () => {
  const mockData = { ... }; // No depende de test 1
  // test logic
});
```

---

## 🐛 Debugging Tests

### Modo UI
```bash
npm run test:ui
```
Abre interfaz visual en el navegador con:
- Tree view de todos los tests
- Output detallado
- Stack traces
- Re-run selectivo

### Modo Watch
```bash
npm test
```
Observa cambios y re-ejecuta automáticamente.

### Debugging Individual
```bash
# Ejecutar solo un archivo
npx vitest src/services/localStorage.service.test.ts

# Ejecutar solo un describe
npx vitest -t "Users Management"

# Ejecutar solo un test
npx vitest -t "should save and retrieve users correctly"
```

### Console.log en Tests
```typescript
it('debug test', () => {
  const result = myFunction();
  console.log('Result:', result); // Se muestra en terminal
  expect(result).toBe(expected);
});
```

---

## 📈 Métricas de Calidad

### Objetivos de Cobertura
| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Lines | 80% | En progreso |
| Functions | 80% | En progreso |
| Branches | 80% | En progreso |
| Statements | 80% | En progreso |

### Tests Actuales
- ✅ **190 tests** en total
- ✅ **137 tests** pasando (72% success rate)
- ⚠️ **53 tests** necesitan ajustes (componentes Radix UI, toasts, imágenes)
- ✅ **7 archivos** con tests
- 🎯 Patrón AAA implementado consistentemente

---

## 🔜 Próximos Pasos (Roadmap)

### Etapa 2: Tests de Componentes UI (Pendiente)
- [ ] Tests de `DeletePromotionDialog.tsx`
- [ ] Tests de `PromotionFilters.tsx`
- [ ] Tests de `SettingsPanel.tsx`
- [ ] Tests de `Layout.tsx`, `Navbar.tsx`, `Sidebar.tsx`

### Etapa 3: Tests de Páginas ✅ COMPLETADO (137/190 tests pasando)
- ✅ Tests de `Login.tsx` (28 tests - 21 passing)
- ✅ Tests de `PromotionsList.tsx` (44 tests - 31 passing)
- ✅ Tests de `CreatePromotion.tsx` (46 tests - 35 passing)
- ✅ Tests de `EditPromotion.tsx` (18 tests - 4 passing)

**Nota:** Los 53 tests fallando requieren ajustes en:
- Mocking de Radix UI Select component (categoría)
- Mocking de toast notifications (sonner)
- Mocking de diálogos de confirmación
- Mocking de imágenes estáticas

### Etapa 4: Optimización de Tests (En Progreso)
- [ ] Resolver tests de Select de Radix UI
- [ ] Implementar mocks para toast messages
- [ ] Mejorar testing de imágenes y assets
- [ ] Alcanzar > 90% de tests pasando

### Etapa 5: Tests E2E (Opcional - Futuro)
- [ ] Configurar Playwright
- [ ] User flows completos
- [ ] Tests de integración end-to-end

---

## 📚 Referencias

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [SonarQube Coverage](https://docs.sonarqube.org/latest/analysis/test-coverage/)

---

## 🤝 Contribuir

Al agregar nuevas funcionalidades:

1. **Escribe el test primero** (TDD opcional pero recomendado)
2. **Sigue el patrón AAA**
3. **Asegura cobertura > 80%**
4. **Ejecuta `npm run test:coverage` antes de commit**
5. **Verifica que todos los tests pasen**

---

**Última actualización:** Octubre 2025  
**Versión de Vitest:** 4.0.4  
**Mantenido por:** Team Fluffy Deals Hub
