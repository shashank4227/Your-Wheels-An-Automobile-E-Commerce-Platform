export const testEnvironment = 'jsdom';
export const setupFiles = ['./jest.setup.js'];
export const transform = {
  '^.+\\.jsx?$': 'babel-jest', // If you're using JSX or React
  '^.+\\.css$': 'jest-transform-stub', // Mock CSS imports
};
export const transformIgnorePatterns = [
  "/node_modules/(?!(lucide-react)/)"
];
export const setupFilesAfterEnv = ['@testing-library/jest-dom'];
export const moduleNameMapper = {
  '\\.(css|less)$': 'identity-obj-proxy', // Mock CSS with identity-obj-proxy for styled-components or className-based CSS modules
};
