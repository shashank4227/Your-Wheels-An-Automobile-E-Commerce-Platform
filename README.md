
# 🚗 YourWheels - Vehicle Rental and Marketplace Platform

YourWheels is a full-stack web application that allows **buyers** to rent vehicles, **sellers** to list vehicles for rent, and **admins** to manage users and rentals. It also includes secure authentication and interactive API documentation with Swagger.

---

## 🌟 Features

### 👥 User Roles
- **Buyer**: Browse and rent available vehicles.
- **Seller**: List vehicles for rent and manage listings.
- **Admin**: Manage all users, view all transactions, and oversee platform activity.

### 🔐 Authentication
- JWT-based authentication.
- Signup/login for buyers and sellers.
- Middleware for protected routes.

### 🚘 Vehicle Rental
- Browse all available vehicles by filters.
- Rent a vehicle with booking details.
- Sellers can view and manage their listed vehicles.

### 📦 Transactions
- Every rental creates a buyer-seller transaction record.
- Admin can view all platform transactions.

### 🛠 Admin Dashboard
- View counts of buyers, sellers, vehicles, and transactions.
- Manage user accounts and monitor platform activity.

### 📄 Swagger API Docs
- Accessible at: `/api-docs`
- Interactive interface for testing all REST endpoints.

---

## ⚙️ Tech Stack

- **Frontend**: React.js, Axios, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Docs**: Swagger UI (`swagger-jsdoc`, `swagger-ui-express`)
- **Testing**: Jest, Supertest

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or MongoDB Atlas
- Git

### 1. Clone the repository
```bash
git clone https://github.com/shashank4227/Your-Wheels-Render-Deployment.git
cd your-wheels
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Environment variables
Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/yourwheels
JWT_SECRET=your_jwt_secret
BACKEND_URL=http://localhost:3000
```

### 4. Run backend server
```bash
node server.js
```
Server will be running at `http://localhost:3000`

### 5. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 6. Run frontend
```bash
npm run dev
```
Frontend will open at `http://localhost:5173` or similar.

---

## 📘 API Documentation

After starting the backend, visit:

```
http://localhost:3000/api-docs
```

To view and interact with the Swagger API documentation.

---

## 🧪 Running Tests (Backend)
```bash
cd backend
npm test
```

---

## 🏁 Deployment (Render)
- Make sure `BACKEND_URL` is correctly set in Render environment variables.
- Frontend and backend can be deployed separately.
- Ensure CORS and correct API routes are configured.

---

