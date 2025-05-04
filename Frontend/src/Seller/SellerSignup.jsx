import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";  // Import eye icons
import { GoogleOAuthProvider, GoogleLogin ,useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import React from 'react';
const images = [
  "/login-1.jpeg",
  "/login-3.jpeg",
  "/login-2.jpeg",
];


function SellerSignup() {

  const [currentIndex, setCurrentIndex] = useState(0);
  
    // Auto-slide every 3 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }, []);
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return setErrorMessage("First name is required.");
    if (!formData.lastName.trim()) return setErrorMessage("Last name is required.");
    if (!formData.email.trim()) return setErrorMessage("Email is required.");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return setErrorMessage("Invalid email format.");
    if (!formData.password.trim()) return setErrorMessage("Password is required.");
    
    const password = formData.password;
    if (password.length < 8) return setErrorMessage("Password must be at least 8 characters long.");
    if (!/[A-Z]/.test(password)) return setErrorMessage("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(password)) return setErrorMessage("Password must contain at least one lowercase letter.");
    if (!/[0-9]/.test(password)) return setErrorMessage("Password must contain at least one number.");
    if (!/[@$!%*?&]/.test(password)) return setErrorMessage("Password must contain at least one special character (@$!%*?&).");
    
    if (!formData.terms) return setErrorMessage("You must agree to the terms.");

    setErrorMessage("");
    return true;
  };

  const sendVerificationCode = async () => {
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage("Enter a valid email before verifying.");
      return;
    }
  
    try {
      console.log("Sending OTP to:", formData.email); // ✅ Debugging
  
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
  
      const data = await response.json();
      console.log("OTP Response:", data); // ✅ Debugging
  
      if (data.success) {
        setEmailSent(true);
        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage("Error sending OTP.");
    }
  };
  
  
  const verifyCode = async () => {
    if (!verificationCode) {
      setErrorMessage("Please enter the OTP.");
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: verificationCode }),
      });
  
      const data = await response.json();
      if (data.success) {
        setEmailVerified(true);  // ✅ Set emailVerified to true
        setErrorMessage("");      // ✅ Clear any previous error message
      } else {
        setErrorMessage(data.error || "Invalid OTP.");
      }
    } catch (error) {
      setErrorMessage("Error verifying OTP.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    if (!emailVerified) {
      setErrorMessage("Please verify your email before signing up.");
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/seller-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (data.success) {
        const userId = data.userId;
  
        localStorage.setItem("token", data.token);
        localStorage.setItem("sellerId", userId);
          navigate(`/seller-dashboard/${userId}`);
      } else {
        setErrorMessage(data.msg || "Signup failed.");
      }
    } catch (error) {
      setErrorMessage("Error submitting form.");
    }
  };
  

  // const handleSuccess = async (response) => {
  //   try {
  //     const googleToken = response.credential;
  
  //     // Send Google token to backend
  //     const res = await axios.post("http://localhost:3000/google", { googleToken });
  
  //     console.log("Login successful:", res.data);
  
  //     // Store token in local storage
  //     localStorage.setItem("token", res.data.token);
  
  //     // Redirect to dashboard
  //     navigate("/dashboard");
  
  //   } catch (error) {
  //     console.error("Error logging in:", error.response?.data || error.message);
  
  //     // If user already exists, redirect to login
  //     if (error.response?.status === 401 && error.response?.data?.message === "User already exists") {
  //       alert("User already exists. Redirecting to login...");
  //       navigate("/login");  // Redirect user to login page
  //     }
  //   }
  // };
  
  // const handleLogin = useGoogleLogin({
  //   onSuccess: async (response) => {
  //     try {
  //       const googleToken = response.credential; // Get the Google token

  //       // Send the token to your backend
  //       const res = await axios.post("http://localhost:3000/google", { googleToken });

  //       console.log("Login successful:", res.data);

  //       // Store token in local storage for authentication
  //       localStorage.setItem("token", res.data.token);
  //       navigate("/dashboard");
  //     } catch (error) {
  //       console.error("Error logging in:", error.response?.data || error.message);
  //     }
  //   },
  //   onError: () => console.log("Login Failed"),
  //   flow: "auth-code", // Uses OAuth code flow instead of implicit token
  // });

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize Google Sign-In
  useEffect(() => {
    // Load the Google API script
    const loadGoogleScript = () => {
      // Check if script is already loaded
      if (document.getElementById('google-client-script')) {
        initializeGoogleSignIn();
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-client-script';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    // Initialize Google Sign-In client
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          ux_mode: 'redirect',
          login_uri: window.location.origin + '/auth/google/callback',
        });
      }
    };

    loadGoogleScript();
  }, [googleClientId]);

  // Handle the sign-in response
  const handleCredentialResponse = (response) => {
    // This won't run in redirect mode, but keep it for reference
    console.log("Credential response:", response);
  };

  // Handle Google sign-in button click
  // const handleGoogleSignIn = () => {
  //   if (window.google && window.google.accounts && window.google.accounts.oauth2) {
  //     // Using the OAuth2 client for redirect flow
  //     const client = window.google.accounts.oauth2.initCodeClient({
  //       client_id: googleClientId,
  //       scope: 'email profile',
  //       ux_mode: 'redirect',
  //       redirect_uri: 'http://localhost:3000/auth/google/callback',
  //     });
      
  //     client.requestCode();
  //   } else {
  //     console.error("Google Sign-In API not loaded yet");
  //     // Fallback direct OAuth URL
  //     window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&response_type=code&scope=email%20profile`;
  //   }
  // };


  return (
    <div className="app-container">
      <div className="image-section">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Logo" />
        </Link>

        <div className="slider">
          <img src={images[currentIndex]} alt="Slide" className="slide-image" />
        </div>

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

      <div className="form-section">
        <Link to="/" className="back-link">
          Back to website →
        </Link>

        <div className="form-container" style={{backgroundColor:"#1A1A1A"}}>
          <div className="form-header">
            <h1>Seller Signup</h1>
            <p>Already have an account? <Link to="/seller-login">Log in</Link></p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
      <div className="name-inputs">
        <input type="text" name="firstName" className="input-field" placeholder="First name" value={formData.firstName} onChange={handleChange} />
        <input type="text" name="lastName" className="input-field" placeholder="Last name" value={formData.lastName} onChange={handleChange} />
      </div>

      <div className="email-container">
        <input type="email" name="email" className="input-field" placeholder="Email" value={formData.email} onChange={handleChange} />
        <button type="button" className="verify-email-btn" onClick={sendVerificationCode} disabled={emailSent}>
          {emailSent ? "OTP Sent" : "Verify Email"}
        </button>
      </div>

      {emailSent && (
        <div className="email-container">
          <input type="text" className="input-field" placeholder="Enter OTP" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
          <button type="button"  className="verify-email-btn" onClick={verifyCode} disabled={!verificationCode}>
            Verify OTP
          </button>
        </div>
      )}

      <div className="password-container">
        <input type={showPassword ? "text" : "password"} name="password" className="input-field password-input" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
        <span className="eye-icon" onClick={() => setShowPassword((prev) => !prev)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      

      <div className="terms">
  <input type="checkbox" name="terms" id="terms" checked={formData.terms} onChange={handleChange} />
  <label htmlFor="terms">
    I agree to the 
    <Link to="/terms" className="terms-link">
      Terms & Conditions
    </Link>
  </label>
</div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
{emailSent && !emailVerified && <p style={{color:"blueviolet"}}>OTP sent successfully!</p>}
{emailVerified && <p style={{color:"blueviolet"}}>OTP verified successfully! 🎉</p>}


<br />
      <button type="submit" className="create-account-btn" disabled={!emailVerified}>
        Create account
      </button>

      <div className="divider">Or register with</div>
      {/* <div className="social-buttons" style={{ display: "flex", justifyContent: "center" }}>
  <GoogleLogin onSuccess={handleSuccess} onError={() => console.log("Login Failed")} />
</div> */}
             <div className="social-buttons">
      <button 
        type="button" 
        className="social-btn"
                // onClick={handleGoogleSignIn}
                onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/seller/google`}
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
        Google
      </button>
    </div>
            
    </form>
    

        </div>
      </div>
    </div>
  );
}

export default SellerSignup;
