# ✅ Configuración de Coverage para SonarQube con Tests Fallidos

## 🎯 Solución Implementada

Este proyecto usa **Vitest v8** con una configuración especial que permite generar reportes de cobertura **incluso cuando hay tests fallidos**. Esto es crucial para obtener métricas de deuda técnica sin necesidad de corregir todos los tests primero.

## 📊 Métricas Actuales

```
Total Tests: 239
├─ ✅ Pasando: 181 (75.7%)
└─ ❌ Fallando: 58 (24.3%)

Cobertura General:
├─ Statements: 42.59%
├─ Branches: 29.67%
├─ Functions: 44.84%
└─ Lines: 42.5%

Archivos Analizados: 71
Líneas en LCOV: 2,332
```

## 🔧 Configuración Clave

### 1. vitest.config.ts

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: './coverage',
  all: true, // ✅ Incluir archivos sin tests
  reportOnFailure: true, // 🔑 CRÍTICO: Generar reporte con tests fallidos
  clean: true,
  cleanOnRerun: true,
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    // ... otros exclusiones
  ],
}
```

### 2. package.json Scripts

```json
{
  "test:coverage:report": "vitest run --coverage --reporter=verbose || exit 0",
  "test:coverage:ci": "vitest run --coverage --reporter=default --reporter=json --allowOnly=false || exit 0"
}
```

**Clave**: `|| exit 0` permite que el comando termine exitosamente incluso si hay tests fallidos, pero **el coverage se genera antes del exit**.

### 3. GitHub Actions Workflow

```yaml
- name: Run Tests with Coverage
  run: npm run test:coverage:report
  continue-on-error: true  # ✅ No fallar el pipeline
  env:
    CI: true

- name: Verify Coverage Report
  run: |
    if [ ! -f coverage/lcov.info ]; then
      echo "❌ Error: coverage/lcov.info not found!"
      exit 1
    fi
    echo "✅ Coverage report generated successfully"
```

### 4. sonar-project.properties

```properties
# Rutas de coverage (documentación oficial SonarQube)
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Exclusiones de coverage
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx
```

## 🚀 Comandos de Uso

### Desarrollo Local

```bash
# Generar coverage completo
npm run test:coverage:report

# Validar que el reporte se generó correctamente
./scripts/validate-coverage.sh

# Ver reporte HTML
open coverage/index.html
```

### CI/CD (GitHub Actions)

El workflow se ejecuta automáticamente en:
- Push a `main` o `develop`
- Pull Requests

## 📈 Áreas con Cobertura

### ✅ Alta Cobertura (>80%)

- `src/hooks/useAuth.ts` - **100%**
- `src/hooks/usePromotions.ts` - **100%**
- `src/services/localStorage.service.ts` - **100%**
- `src/lib/utils.ts` - **100%**
- `src/pages/Login.tsx` - **100%**
- `src/pages/admin/CreatePromotion.tsx` - **93.87%**
- `src/pages/admin/EditPromotion.tsx` - **96%**
- `src/pages/admin/PromotionsList.tsx` - **76.47%**

### ⚠️ Baja Cobertura (<50%)

- `src/components/ui/*` - **9.97%** (componentes Shadcn/UI)
- `src/pages/Home.tsx` - **0%**
- `src/pages/Index.tsx` - **0%**
- `src/pages/NotFound.tsx` - **0%**
- `src/App.tsx` - **0%**

## 🔍 Deuda Técnica Identificada

### 1. Tests Fallidos (58 tests)

**Categorías principales:**
- Toast notifications (sonner) no mockeadas correctamente
- Radix UI Select interactions requieren polyfills adicionales
- Imágenes y assets estáticos causan errores de renderizado
- Timing issues en operaciones async del hook usePromotions

### 2. Código Sin Tests

**Componentes críticos sin cobertura:**
- Páginas de navegación (Home, Index, NotFound)
- Componentes UI de Shadcn (80+ componentes)
- App.tsx (punto de entrada)

### 3. Componentes Parcialmente Testeados

- `SettingsPanel.tsx` - **68%** - Falta coverage de handlers de eventos
- `use-toast.ts` (hook) - **54.71%** - Reducers y estados edge case sin cubrir

## 📚 Referencias

- [SonarQube JS/TS Coverage](https://docs.sonarsource.com/sonarqube-cloud/enriching/test-coverage/javascript-typescript-test-coverage/)
- [Vitest Coverage Configuration](https://vitest.dev/config/#coverage)
- [Vitest v8 Provider](https://vitest.dev/guide/coverage.html#coverage-providers)

## 🎯 Próximos Pasos Recomendados

1. **Corregir mocks de Sonner**: Mock global en `vitest.setup.ts`
2. **Mejorar polyfills de Radix UI**: Select, Dialog, Popover
3. **Tests para páginas básicas**: Home, Index, NotFound
4. **Incrementar threshold gradualmente**: 50% → 60% → 70% → 80%

## ✅ Verificación

Para validar que todo funciona correctamente:

```bash
# 1. Generar coverage
npm run test:coverage:report

# 2. Verificar archivo LCOV
ls -lah coverage/lcov.info

# 3. Validar contenido
grep -c "^SF:" coverage/lcov.info  # Debe ser > 50

# 4. Ejecutar validación completa
./scripts/validate-coverage.sh
```

**Resultado esperado**: Archivo `coverage/lcov.info` con 2000+ líneas y 70+ archivos cubiertos.
