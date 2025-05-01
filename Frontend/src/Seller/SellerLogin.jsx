import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const images = ["/login-1.jpeg", "/login-3.jpeg", "/login-2.jpeg"];

function SellerLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    // Check if redirected with token and store it
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // Get the userId from the URL path correctly
    const pathSegments = window.location.pathname.split("/");
    const userId = pathSegments[pathSegments.length - 1];

    // Only proceed if we have both a valid token and userId
    // Make sure userId is not "seller-login"
    if (token && userId && userId !== "seller-login") {
      localStorage.setItem("token", token);
      localStorage.setItem("sellerId", userId);
      console.log("Token from Google Login:", token);
      navigate(`/seller-dashboard/${userId}`);
    }
  }, []);

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
        `${import.meta.env.VITE_BACKEND_URL}/seller-login`,
        formData
      );
      const { token, user } = response.data; // ✅ Correct extraction
      const { sellerId } = user;

      // ✅ Store token and sellerId in local storage
      localStorage.setItem("sellerId", sellerId);
      localStorage.setItem("token", token);

      console.log("Token:", token);
      console.log("Seller ID:", sellerId);

      // ✅ Redirect to seller dashboard with correct ID
      navigate(`/seller-dashboard/${sellerId}`);
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
          <img src="/logo.png" alt="Logo" />
        </Link>
        <div className="slider">
          <img src={images[currentIndex]} alt="Slide" className="slide-image" />
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

        <div className="form-container" style={{ backgroundColor: "#1A1A1A" }}>
          <div className="form-header">
            <h1>Seller Login</h1>
            <p>
              Don't have an account? <Link to="/seller-signup">Sign up</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="email"
              className="input-field"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username" // ✅ Fix autocomplete warning
            />

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="input-field password-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password" // ✅ Fix autocomplete warning
              />

              <span
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn">
              Log in
            </button>

            <div className="divider">Or continue with</div>

            {/* ✅ Google Login Button */}
            <div className="social-buttons">
              <button
                type="button"
                className="social-btn"
                onClick={() =>
                  (window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/seller/google`)
                }
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  width="20"
                  height="20"
                />
                Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellerLogin;
