import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  test: {
    environment: 'jsdom', // Using jsdom for React testing
    globals: true,         // Allow global setup like jest
    coverage: {
      provider: 'v8',      // Use v8 for coverage reporting
      reporter: ['text', 'json', 'html'], // Coverage output formats
      exclude: ['node_modules/**', 'tests/**'], // Exclude node_modules and test files from coverage
    },
    transformMode: {
      web: [/\.[jt]sx$/], // Ensure JS/TSX files are transformed properly in the web environment
    },
    include: ['tests/**/*.{js,ts,jsx,tsx}'], // Focus on test files only
    alias: {
      '@components': '/src/components', // Example alias for easy imports in tests
    },
  },
});
