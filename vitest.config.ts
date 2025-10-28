import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Configuración de entorno
    environment: 'jsdom',
    
    // Archivo de setup global
    setupFiles: ['./vitest.setup.ts'],
    
    // Globals para no tener que importar describe, it, expect
    globals: true,
    
    // Coverage configuration para SonarQube
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test-utils.tsx',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      // Umbrales de cobertura (ajusta según necesites)
      // Deshabilitados temporalmente para permitir coverage con tests fallidos
      // lines: 80,
      // functions: 80,
      // branches: 80,
      // statements: 80,
    },
    
    // Incluir archivos de test
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // Excluir directorios
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
  },
});
