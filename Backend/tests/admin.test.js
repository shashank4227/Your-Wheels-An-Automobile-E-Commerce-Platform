const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/AdminRoutes');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/', adminRoutes);

// Mock environment variables and data
process.env.ALLOWED_ADMINS = JSON.stringify([
  { email: "admin@example.com", password: "secure123" }
]);
process.env.JWT_SECRET = "testsecret";

// Mock DB models
jest.mock('../models/SellVehicle', () => ({
  find: jest.fn()
}));
jest.mock('../models/Vehicle', () => ({
  find: jest.fn(() => ({
    populate: jest.fn().mockResolvedValue([]) // For getAdminVehiclesForRent
  }))
}));

const SellVehicle = require('../models/SellVehicle');
const Vehicle = require('../models/Vehicle');

describe('Admin Routes', () => {

  describe('POST /admin-login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/admin-login')
        .send({ email: 'admin@example.com', password: 'secure123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.message).toBe('Login successful');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/admin-login')
        .send({ email: 'wrong@example.com', password: 'wrong' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /admin-vehicle-on-sale', () => {
    it('should return unsold vehicles', async () => {
      SellVehicle.find.mockResolvedValue([{ id: 1, name: 'Car A', isSold: false }]);

      const res = await request(app).get('/admin-vehicle-on-sale');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /vehicles/admin', () => {
    it('should return vehicles available for rent', async () => {
      const res = await request(app).get('/vehicles/admin');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /sold/admin', () => {
    it('should return sold vehicles', async () => {
      SellVehicle.find.mockResolvedValue([{ id: 2, name: 'Car B', isSold: true }]);

      const res = await request(app).get('/sold/admin');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /rent/admin', () => {
    it('should return rented vehicles', async () => {
      Vehicle.find.mockResolvedValue([{ id: 3, name: 'Car C', isRented: true }]);

      const res = await request(app).get('/rent/admin');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

});
