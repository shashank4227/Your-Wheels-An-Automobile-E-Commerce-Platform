module.exports = {
  testEnvironment: 'jsdom',  // Ensure the environment is set correctly
  setupFiles: ['./jest.setup.js'], // Correctly pointing to the setup file
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // If you're using JSX or React
    '^.+\\.css$': 'jest-transform-stub', // Mock CSS imports
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(lucide-react)/)"
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy', // Mock CSS with identity-obj-proxy for styled-components or className-based CSS modules
  },
};
