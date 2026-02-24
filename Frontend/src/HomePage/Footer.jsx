import React from 'react';
import { Car, Mail, Phone, MessageSquare } from 'lucide-react';
import './Footer.css';  // Import the CSS file
import { Link } from 'react-router-dom';
function Footer() {
  return (
    <div className="footer-container">
      {/* Footer */}
      <footer className="footer bg-[#0b0b0b] text-[#d1d5db] py-5 relative w-full">
        {/* Upper footer section */}
        <div className="footer-top flex flex-col md:flex-row justify-between items-start p-6 gap-10 md:px-20 lg:px-40">
          {/* Left half: About section */}
          <div className="footer-left w-full md:w-1/2 md:mr-10">
            <div className="footer-logo mb-3">
              <h2 style={{color:"white"}}>Your Wheels</h2>
            </div>
            <p>
              Your Wheels is revolutionizing the way you choose vehicles, offering a smarter, data-driven approach to car selection. Our advanced algorithms analyze fuel efficiency, safety features, and performance metrics to provide personalized recommendations that perfectly match your needs.
            </p>
            <br />
            <Link style={{ textDecoration: "under-line",color:"white"}} to="/faqs">Frequesntly Asked Questions</Link>
            
          </div>

          {/* Right half: Contact section */}
          <div className="footer-right w-full md:w-1/2">
            <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
            <div className="footer-links mt-3 space-y-3">
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
