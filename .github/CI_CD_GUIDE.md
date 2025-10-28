# 🚀 Guía Rápida de CI/CD

## 📋 Workflows Configurados

### **1. CI/CD Principal (`ci-cd.yml`)**

**Trigger:** Push/PR a `main`

**Jobs:**
1. ✅ **avoid_redundancy** - Cancela builds duplicados
2. ✅ **lint** - ESLint analysis
3. ✅ **build** - Build del proyecto con Vite
4. ✅ **test** - Tests unitarios + coverage
5. ✅ **e2e** - Tests E2E (placeholder)
6. ✅ **deploy** - Deploy a Vercel (solo en main)

**Comandos ejecutados:**
```bash
npm run lint          # ESLint
npm run build         # Vite build
npm run test:run      # Tests unitarios
npm run test:coverage # Coverage report
```

**Artifacts generados:**
- `dist/` - Build del proyecto
- `coverage/` - Reporte de cobertura

---

### **2. SonarQube Analysis (`sonarqube.yml`)**

**Trigger:** Push/PR a `main` o `develop`

**Steps:**
1. ✅ Checkout del código
2. ✅ Setup de Node.js 22
3. ✅ Install de dependencias
4. ✅ Ejecución de tests con coverage
5. ✅ Verificación de `lcov.info`
6. ✅ SonarQube scan
7. ✅ Upload de coverage report

**Comandos ejecutados:**
```bash
npm ci --no-audit
npm run test:coverage
```

**Análisis de SonarQube:**
- Code coverage
- Bugs
- Vulnerabilities
- Code smells
- Security hotspots
- Duplications

---

## 🔐 Secrets Requeridos

| Secret | Usado en | Descripción |
|--------|----------|-------------|
| `SONAR_TOKEN` | `sonarqube.yml` | Token de autenticación de SonarCloud |
| `SONAR_HOST_URL` | `sonarqube.yml` | URL de SonarCloud (`https://sonarcloud.io`) |
| `VERCEL_TOKEN` | `ci-cd.yml` | Token de Vercel |
| `VERCEL_ORG_ID` | `ci-cd.yml` | ID de organización de Vercel |
| `VERCEL_PROJECT_ID` | `ci-cd.yml` | ID del proyecto de Vercel |

Ver [SONARQUBE_SETUP.md](./SONARQUBE_SETUP.md) para instrucciones detalladas.

---

## 📊 Estado de los Workflows

### **Ver Estado**
```
https://github.com/eospgonz10/fluffy-deals-hub/actions
```

### **Badges en README**
```markdown
[![CI/CD](https://github.com/eospgonz10/fluffy-deals-hub/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/eospgonz10/fluffy-deals-hub/actions/workflows/ci-cd.yml)
[![SonarQube](https://github.com/eospgonz10/fluffy-deals-hub/actions/workflows/sonarqube.yml/badge.svg)](https://github.com/eospgonz10/fluffy-deals-hub/actions/workflows/sonarqube.yml)
```

---

## 🎯 Flujo de Trabajo Típico

### **1. Desarrollo Local**
```bash
# Crear rama feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y agregar tests
# ...

# Ejecutar tests localmente
npm test

# Verificar lint
npm run lint

# Verificar coverage
npm run test:coverage

# Commit
git add .
git commit -m "feat: nueva funcionalidad con tests"
```

### **2. Push y PR**
```bash
# Push a GitHub
git push origin feature/nueva-funcionalidad

# Crear PR en GitHub
# Los workflows se ejecutan automáticamente
```

### **3. Verificación en GitHub Actions**
- ✅ Lint debe pasar
- ✅ Build debe ser exitoso
- ✅ Tests deben pasar (54/54)
- ✅ Coverage debe mantenerse >= 80%
- ✅ SonarQube debe pasar Quality Gate

### **4. Merge a Main**
```bash
# Después de review y aprobación
# Merge del PR

# Triggers:
# 1. CI/CD completo
# 2. SonarQube scan
# 3. Deploy a Vercel (producción)
```

---

## 🔍 Debugging de Workflows

### **Workflow falla en Lint**
```bash
# Ejecutar localmente
npm run lint

# Fix automático
npm run lint -- --fix
```

### **Workflow falla en Tests**
```bash
# Ejecutar localmente
npm run test:run

# Ver detalles
npm test
```

### **Workflow falla en Build**
```bash
# Ejecutar localmente
npm run build

# Verificar errores de TypeScript
npx tsc --noEmit
```

### **SonarQube falla**
```bash
# Verificar que coverage se genere
npm run test:coverage

# Verificar que lcov.info exista
ls -la coverage/lcov.info

# Ver contenido
head coverage/lcov.info
```

---

## 📈 Métricas Esperadas

### **GitHub Actions**
- ⏱️ **Duración total:** ~3-5 minutos
- ✅ **Success rate:** 100%

### **SonarQube**
| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Coverage | >= 80% | 100% ✅ |
| Bugs | 0 | 0 ✅ |
| Vulnerabilities | 0 | - |
| Code Smells | < 50 | - |
| Security Hotspots | 0 | - |
| Duplications | < 3% | - |

---

## 🚨 Troubleshooting

### **"SONAR_TOKEN is not set"**
1. Verifica que el secret existe en GitHub Settings → Secrets
2. Nombre exacto: `SONAR_TOKEN`
3. Re-genera token en SonarCloud si necesario

### **"Coverage report not found"**
1. Verifica que tests pasen: `npm run test:coverage`
2. Verifica path en `sonar-project.properties`: `coverage/lcov.info`
3. Verifica exclusions en `vitest.config.ts`

### **"Quality Gate Failed"**
1. Ve a SonarCloud dashboard
2. Revisa métricas que fallan
3. Fix issues localmente
4. Re-push

### **Deploy a Vercel falla**
1. Verifica que build pase: `npm run build`
2. Verifica secrets de Vercel en GitHub
3. Verifica permisos de Vercel token

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [SonarCloud Docs](https://docs.sonarcloud.io/)
- [Vercel Docs](https://vercel.com/docs)
- [Vitest Docs](https://vitest.dev/)

---

## 🎯 Comandos Útiles

```bash
# Local
npm test                 # Tests en watch mode
npm run test:run         # Tests una vez
npm run test:coverage    # Coverage report
npm run lint             # Lint check
npm run build            # Build producción

# GitHub Actions (manual trigger)
# Settings → Actions → Select workflow → Run workflow

# Ver logs
# Actions → Select run → Select job → View logs
```

---

**Última actualización:** Octubre 2025
