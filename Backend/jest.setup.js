// Jest setup file for backend tests
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment the following lines to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock nodemailer to prevent SMTP connection attempts during tests
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

// Mock cloudinary to prevent external API calls
jest.mock('./utils/cloudinary', () => ({
  upload: jest.fn().mockResolvedValue({
    public_id: 'test-public-id',
    secure_url: 'https://test-cloudinary-url.com/test-image.jpg',
  }),
  destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
}));

// Mock the Signup controller to prevent actual email sending
jest.mock('./controllers/Signup', () => ({
  googleAuth: jest.fn(),
  signup: jest.fn(),
  verifyEmail: jest.fn(),
}));

// Mock the Google controller
jest.mock('./controllers/Google', () => ({
  googleLogin: jest.fn((req, res, next) => {
    res.status(200).json({ message: 'Google login mocked' });
  }),
  googleCallback: jest.fn((req, res, next) => {
    res.status(200).json({ message: 'Google callback mocked' });
  }),
  logout: jest.fn((req, res) => {
    res.status(200).json({ message: 'Logout mocked' });
  }),
}));

// Mock passport to prevent authentication issues
jest.mock('./config/passport', () => ({
  initialize: jest.fn(() => (req, res, next) => next()),
  session: jest.fn(() => (req, res, next) => next()),
  authenticate: jest.fn((strategy, options) => (req, res, next) => {
    res.status(200).json({ message: 'Passport auth mocked' });
  }),
}));
