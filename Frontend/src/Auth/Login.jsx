import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import './Login.css';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const images = [
  "/login-1.jpeg",
  "/login-3.jpeg",
  "/login-2.jpeg",
];

function Login() {
  const handleSuccess = (credentialResponse) => {
    console.log("Google Login Success:", credentialResponse);
    // Send credentialResponse.credential (JWT) to your backend for verification
  };

  const handleFailure = () => {
    console.error("Google Login Failed");
  };
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const validateForm = () => {
    const { email, password, role } = formData;
    if (!email) return "Email is required!";
    if (!password) return "Password is required!";
    if (!role) return "Please select a role!";
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', formData.role);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };
  useEffect(() => {
    /* Load Google's OAuth script */
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-login`, {
        token: credentialResponse.credential,
      });
  
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Google login failed. Please try again.");
    }
  };
  
  
  const handleGoogleLoginFailure = () => {
    console.error("Google Login Failed");
    setError("Google login failed. Please try again.");
  };
  
  return (
    <div className="app-container">
      <div className="image-section">
        <Link to="/" className="logo"  >
          <img src="/logo.png" alt="Logo" />
        </Link>
        <div className="slider">
          <img src={images[currentIndex]} alt="Slide" className="slide-image" />
          <div className="image-content">
            <h2>Your Wheels,<br /> A website for Vehicle Enthusiasts</h2>
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

      <div className="form-section" >
        <Link to="/" className="back-link">Back to website →</Link>

        <div className="form-container" style={{backgroundColor:"#1A1A1A"}}>
          <div className="form-header">
            <h1>Welcome back</h1>
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="email"
              className="input-field"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="input-field password-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <span className="eye-icon" onClick={() => setShowPassword(prev => !prev)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="role-selector">
              <label htmlFor="role">Select Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="dropdown"
              >
                <option value="">Choose...</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn">
              Log in
            </button>
            <div className="divider">Or continue with</div>
            <div className="social-buttons">
  <button 
    type="button" 
    className="social-btn" 
    onClick={() => window.location.href = "http://your-wheels-an-automobile-e-commerce.onrender.com:/auth/google"}
  >
    <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
    Google
  </button>
</div>

    {/* <div className="social-buttons" style={{display:"flex",justifyContent:"center"}}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <div className="social-buttons" style={{ display: "flex", justifyContent: "center" }}>
      <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginFailure} useOneTap />
    </div>
  </GoogleOAuthProvider>
              </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
