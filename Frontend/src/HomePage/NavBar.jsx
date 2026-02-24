import React, { useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const MobileMenuOverlay = () => {
    // A helper to close menu on link click
    const handleMobileClick = (action) => {
      toggleMobileMenu();
      if (action) action();
    };

    return (
      <div className={`md:hidden absolute top-20 left-0 w-full bg-black flex flex-col items-center py-4 space-y-4 z-50 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 flex' : 'opacity-0 hidden'}`}>
        <Link to="/" onClick={() => handleMobileClick()} className="text-gray-400 hover:text-white text-lg">Home</Link>
        <button onClick={(e) => { handleMobileClick(() => handleScrollToAbout(e)) }} className="text-gray-400 hover:text-white text-lg bg-transparent border-none cursor-pointer">About</button>
        <button onClick={(e) => { handleMobileClick(() => handleScrollToServices(e)) }} className="text-gray-400 hover:text-white text-lg bg-transparent border-none cursor-pointer">Services</button>
        <button onClick={(e) => { handleMobileClick(() => handleScrollToContact(e)) }} className="text-gray-400 hover:text-white text-lg bg-transparent border-none cursor-pointer">Contact</button>
        <div className="flex flex-col space-y-3 w-3/4">
           <Link to="/role" onClick={() => handleMobileClick()} className="w-full">
            <button className="signup-btn w-full">Signup</button>
           </Link>
           <Link to="/login-role" onClick={() => handleMobileClick()} className="w-full">
             <button className="signup-btn w-full">Login</button>
           </Link>
        </div>
      </div>
    );
  };

  return (
    <nav className="navbar flex justify-between items-center bg-black h-20 px-4 md:px-10 relative">
      <div className="navbar-logo">
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="h-12" />
        </Link>
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="md:hidden">
        <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex navbar-links space-x-8">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">Home</Link>
        <button onClick={handleScrollToAbout} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors duration-200">About</button>
        <button onClick={handleScrollToServices} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors duration-200">Services</button>
        <button onClick={handleScrollToContact} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors duration-200">Contact</button>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex navbar-buttons space-x-4">
        <Link to="/role">
          <button className="signup-btn">Signup</button>
        </Link>
        <Link to="/login-role">
          <button className="signup-btn">Login</button>
        </Link>
      </div>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay />
    </nav>
  );
};

export default NavBar;
