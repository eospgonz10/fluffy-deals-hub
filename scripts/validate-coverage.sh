#!/bin/bash

# Script para validar la generación de coverage para SonarQube
# Este script simula el proceso que se ejecutará en GitHub Actions

set -e  # Salir si hay error crítico (excepto en tests)

echo "🧪 Ejecutando tests con cobertura..."
npm run test:coverage:report || echo "⚠️  Algunos tests fallaron, pero continuamos para generar coverage"

echo ""
echo "📊 Validando archivo LCOV..."

if [ ! -f "coverage/lcov.info" ]; then
    echo "❌ ERROR: No se generó el archivo coverage/lcov.info"
    exit 1
fi

echo "✅ Archivo LCOV generado correctamente"
echo "📈 Tamaño del archivo: $(du -h coverage/lcov.info | cut -f1)"
echo "📄 Líneas en el reporte: $(wc -l < coverage/lcov.info)"

echo ""
echo "🔍 Verificando contenido del LCOV..."

# Verificar que el archivo tenga contenido válido
if ! grep -q "^SF:" coverage/lcov.info; then
    echo "❌ ERROR: El archivo LCOV no contiene información de archivos fuente"
    exit 1
fi

TOTAL_FILES=$(grep -c "^SF:" coverage/lcov.info)
echo "✅ Archivos con cobertura: $TOTAL_FILES"

echo ""
echo "📋 Archivos principales con cobertura:"
grep "^SF:" coverage/lcov.info | grep -E "(hooks|pages|services|components)" | head -10

echo ""
echo "✅ Validación completa. El reporte está listo para SonarQube"
echo ""
echo "📊 Resumen de Coverage:"
npm run test:coverage:report 2>&1 | grep "All files" | tail -1

echo ""
echo "🚀 Para subir a SonarQube, ejecuta:"
echo "   sonar-scanner"
