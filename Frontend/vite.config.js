import { defineConfig } from 'vitest/config';

export default defineConfig({
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
