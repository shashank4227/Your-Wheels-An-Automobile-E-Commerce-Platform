import React from 'react';
import { Car, Mail, Phone, MessageSquare } from 'lucide-react';
import './Footer.css';  // Import the CSS file
import { Link } from 'react-router-dom';
function Footer() {
  return (
    <div className="footer-container">
      {/* Footer */}
      <footer className="footer">
        {/* Upper footer section */}
        <div className="footer-top">
          {/* Left half: About section */}
          <div className="footer-left">
            <div className="footer-logo">
              <h2 style={{color:"white"}}>Your Wheels</h2>
            </div>
            <p>
              Your Wheels is revolutionizing the way you choose vehicles, offering a smarter, data-driven approach to car selection. Our advanced algorithms analyze fuel efficiency, safety features, and performance metrics to provide personalized recommendations that perfectly match your needs.
            </p>
            <br />
            <Link style={{ textDecoration: "under-line",color:"white"}} to="/faqs">Frequesntly Asked Questions</Link>
            
          </div>

          {/* Right half: Contact section */}
          <div className="footer-right">
            <h3>Contact Us</h3>
            <div className="footer-links">
              <a href="mailto:yourwheels@gmail.com" className="footer-link">
                <Mail className="icon" />
                <span>yourwheels123@gmail.com</span>
              </a>
              <div className="footer-phone">
                <Phone className="icon" />
                <span>+91 9876543210</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer section */}
        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <div className="footer-text">
              Copyright © 2025 Your Wheels. All rights reserved.
                          <br />
                          <br />
              <a href="#">Terms & Conditions</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
