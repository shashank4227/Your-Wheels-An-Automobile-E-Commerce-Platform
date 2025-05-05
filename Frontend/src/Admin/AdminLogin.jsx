import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import React from "react";

//images path
const images = ["/login-1.jpeg", "/login-3.jpeg", "/login-2.jpeg"];

function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    const { email, password } = formData;
    if (!email) return "Email is required!";
    if (!password) return "Password is required!";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin-login`,
        formData
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("email", response.data.email);
      console.log(response.data.email);

      navigate(`/admin-dashboard/${formData.email}`); // Fixing the email reference here
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="app-container">
      <div className="image-section">
        <Link to="/" className="logo">
          <img src="/logo_without_bg.png" alt="Logo" />
        </Link>
        <div className="slider">
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="slide-image"
          />
          <div className="image-content">
            <h2>
              Your Wheels,
              <br /> A website for Vehicle Enthusiasts
            </h2>
            <div className="dots">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`dot ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <Link to="/" className="back-link">
          Back to website →
        </Link>

        <div className="form-container">
          <div className="form-header">
            <h1>Welcome Admin 👨‍💻</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="email"
              className="input-field"
              placeholder="Admin Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username" // Fixing the warning
            />
            <div className="password-container">
              <input
                className="input-field password-input"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn">
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
