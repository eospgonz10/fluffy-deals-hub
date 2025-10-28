# 🔐 Configuración de Secrets para CI/CD

Este documento explica cómo configurar los secrets necesarios para GitHub Actions y SonarQube.

## 📋 Secrets Requeridos

### **Para SonarQube (`sonarqube.yml`)**

| Secret | Descripción | Dónde Obtenerlo |
|--------|-------------|-----------------|
| `SONAR_TOKEN` | Token de autenticación de SonarQube | SonarCloud → My Account → Security |
| `SONAR_HOST_URL` | URL de SonarQube Cloud | `https://sonarcloud.io` |

### **Para Vercel (`ci-cd.yml`)**

| Secret | Descripción | Ya Configurado |
|--------|-------------|----------------|
| `VERCEL_TOKEN` | Token de autenticación de Vercel | ✅ Sí |
| `VERCEL_ORG_ID` | ID de organización de Vercel | ✅ Sí |
| `VERCEL_PROJECT_ID` | ID del proyecto de Vercel | ✅ Sí |

---

## 🚀 Paso a Paso: Configurar SonarQube

### **1. Crear Cuenta en SonarCloud (Si no tienes)**

1. Ve a [https://sonarcloud.io](https://sonarcloud.io)
2. Click en **"Log in"** → **"Sign up with GitHub"**
3. Autoriza SonarCloud para acceder a tu GitHub

### **2. Crear/Importar Proyecto**

1. En SonarCloud, click en **"+"** → **"Analyze new project"**
2. Selecciona el repositorio **`fluffy-deals-hub`**
3. Click en **"Set Up"**

### **3. Configurar Proyecto**

#### **Opción A: Análisis Manual (Recomendado para este proyecto)**

1. Selecciona **"With GitHub Actions"**
2. SonarCloud te mostrará los pasos, pero ya los tenemos configurados ✅

#### **Opción B: Análisis Automático**

1. Desactiva **"Automatic Analysis"** (lo haremos con GitHub Actions)
2. Ve a **Administration** → **Analysis Method**
3. Deshabilita **"SonarCloud Automatic Analysis"**

### **4. Obtener el SONAR_TOKEN**

#### **Método 1: Durante Setup (Recomendado)**

1. Durante el setup, SonarCloud te mostrará un token
2. **¡COPIA ESTE TOKEN INMEDIATAMENTE!** (solo se muestra una vez)
3. Si no lo copiaste, ve al Método 2

#### **Método 2: Generar Nuevo Token**

1. En SonarCloud, click en tu avatar (arriba derecha)
2. Ve a **"My Account"** → **"Security"**
3. En la sección **"Generate Tokens"**:
   - **Name:** `GitHub Actions - fluffy-deals-hub`
   - **Type:** `Global Analysis Token` o `Project Analysis Token`
   - **Expires in:** `No expiration` (o elige duración)
4. Click en **"Generate"**
5. **¡COPIA EL TOKEN INMEDIATAMENTE!** (solo se muestra una vez)

### **5. Agregar Secrets a GitHub**

1. Ve a tu repositorio en GitHub: `https://github.com/eospgonz10/fluffy-deals-hub`
2. Click en **"Settings"** (del repositorio)
3. En el menú izquierdo, click en **"Secrets and variables"** → **"Actions"**
4. Click en **"New repository secret"**

#### **Secret 1: SONAR_TOKEN**

- **Name:** `SONAR_TOKEN`
- **Value:** [Pega el token que copiaste de SonarCloud]
- Click en **"Add secret"**

#### **Secret 2: SONAR_HOST_URL**

- **Name:** `SONAR_HOST_URL`
- **Value:** `https://sonarcloud.io`
- Click en **"Add secret"**

### **6. Verificar sonar-project.properties**

Asegúrate de que el archivo `sonar-project.properties` tenga tu organización correcta:

```properties
sonar.projectKey=fluffy-deals-hub
sonar.organization=eospgonz10  # ← Verifica que sea TU organización
```

Para verificar tu organización:
1. En SonarCloud, ve a tu proyecto
2. La URL será algo como: `https://sonarcloud.io/dashboard?id=fluffy-deals-hub`
3. Tu organización está en: `https://sonarcloud.io/organizations/TU_ORG/projects`

---

## ✅ Verificación de Configuración

### **Checklist Antes de Hacer Push**

- [ ] ✅ Cuenta de SonarCloud creada
- [ ] ✅ Proyecto `fluffy-deals-hub` importado en SonarCloud
- [ ] ✅ Token de SonarCloud generado
- [ ] ✅ Secret `SONAR_TOKEN` agregado a GitHub
- [ ] ✅ Secret `SONAR_HOST_URL` agregado a GitHub
- [ ] ✅ `sonar-project.properties` tiene tu organización correcta
- [ ] ✅ Workflows `.github/workflows/` listos

### **Verificar Secrets en GitHub**

1. Ve a `https://github.com/eospgonz10/fluffy-deals-hub/settings/secrets/actions`
2. Deberías ver:
   ```
   ✅ SONAR_TOKEN
   ✅ SONAR_HOST_URL
   ✅ VERCEL_TOKEN (ya existente)
   ✅ VERCEL_ORG_ID (ya existente)
   ✅ VERCEL_PROJECT_ID (ya existente)
   ```

---

## 🎯 Probar la Configuración

### **Opción 1: Hacer un Commit de Prueba**

```bash
git add .
git commit -m "feat: add testing framework with SonarQube integration"
git push origin main
```

### **Opción 2: Trigger Manual del Workflow**

1. Ve a `https://github.com/eospgonz10/fluffy-deals-hub/actions`
2. Selecciona el workflow **"SonarQube Analysis"**
3. Click en **"Run workflow"** → **"Run workflow"**

### **Ver Resultados**

1. **GitHub Actions:**
   - Ve a `https://github.com/eospgonz10/fluffy-deals-hub/actions`
   - Verifica que el workflow se ejecute correctamente

2. **SonarCloud:**
   - Ve a `https://sonarcloud.io/dashboard?id=fluffy-deals-hub`
   - Verás las métricas de calidad y cobertura

---

## 📊 Qué Esperar en SonarQube

Después del primer análisis exitoso, verás:

### **Métricas de Calidad**
- ✅ **Coverage:** ~100% (en archivos testeados)
- ✅ **Bugs:** 0
- ✅ **Vulnerabilities:** 0
- ✅ **Code Smells:** Variable (depende del código)
- ✅ **Security Hotspots:** Variable
- ✅ **Duplications:** Bajo

### **Badges para README**
Puedes agregar badges a tu `README.md`:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=fluffy-deals-hub&metric=alert_status)](https://sonarcloud.io/dashboard?id=fluffy-deals-hub)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=fluffy-deals-hub&metric=coverage)](https://sonarcloud.io/dashboard?id=fluffy-deals-hub)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=fluffy-deals-hub&metric=bugs)](https://sonarcloud.io/dashboard?id=fluffy-deals-hub)
```

---

## 🐛 Troubleshooting

### **Error: "SONAR_TOKEN is not set"**

**Solución:**
1. Verifica que el secret existe en GitHub
2. El nombre debe ser exactamente `SONAR_TOKEN` (case-sensitive)
3. Re-genera el token en SonarCloud si es necesario

### **Error: "Project not found"**

**Solución:**
1. Verifica que `sonar-project.properties` tenga el `projectKey` correcto
2. El proyecto debe existir en SonarCloud
3. Verifica tu `organization` en el archivo

### **Error: "Coverage report not found"**

**Solución:**
1. Verifica que los tests pasen: `npm run test:coverage`
2. Verifica que `coverage/lcov.info` se genere localmente
3. Revisa los logs del workflow en GitHub Actions

### **Workflow no se ejecuta**

**Solución:**
1. Verifica que el archivo `.yml` esté en `.github/workflows/`
2. Verifica la sintaxis YAML (indentación correcta)
3. Verifica las branches configuradas en `on: push: branches:`

---

## 📞 Soporte

### **SonarCloud**
- Documentación: https://docs.sonarcloud.io/
- Soporte: https://community.sonarsource.com/

### **GitHub Actions**
- Documentación: https://docs.github.com/en/actions
- Marketplace: https://github.com/marketplace?type=actions

---

## 🎉 Siguiente Paso

Una vez configurados los secrets, ejecuta:

```bash
git add .
git commit -m "feat: add testing framework and SonarQube integration"
git push origin main
```

Luego verifica:
1. ✅ GitHub Actions → Ver que todo pase
2. ✅ SonarCloud → Ver las métricas

---

**Última actualización:** Octubre 2025  
**Mantenido por:** Team Fluffy Deals Hub
