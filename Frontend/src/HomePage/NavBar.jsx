import React, { useRef } from 'react';
import './NavBar.css';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const servicesRef = useRef(null); // Create a reference to the services section

  const handleScrollToServices = (e) => {
    e.preventDefault(); // Prevent default link behavior
    const servicesSection = document.getElementById("services"); // Find the section directly by id
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to it
    }
  };

  const handleScrollToContact = (e) => {
    e.preventDefault(); // Prevent default link behavior
    const servicesSection = document.getElementById("contact"); // Find the section directly by id
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to it
    }
  };
  const handleScrollToAbout = (e) => {
    e.preventDefault(); // Prevent default link behavior
    const servicesSection = document.getElementById("about"); // Find the section directly by id
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to it
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src="/logo.png" alt="Logo" />
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <button onClick={handleScrollToAbout}>About</button>
        <button onClick={handleScrollToServices}>Services</button>
        <button onClick={handleScrollToContact}>Contact</button>
        
      </div>

      <div className="navbar-buttons">
        <Link to="/role">
          <button className="signup-btn">Signup</button>
         
        </Link>
        <Link to="/login-role">
          <button className="signup-btn">Login</button>
        </Link>
        
      </div>
    </nav>
  );
};

export default NavBar;
