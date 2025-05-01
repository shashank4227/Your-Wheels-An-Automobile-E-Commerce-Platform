import React, { useState,useEffect } from 'react';
import { useParams, useLocation,useNavigate } from 'react-router-dom';
import { Car, Key, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { 
    User, BarChart2, Users, CreditCard, Mail, HelpCircle, Settings, Star
 } from "lucide-react";
import './SellerMembership.css';
import SideBar from './SellerSideBar';
import axios from 'axios';
function SellerMembership() {
  const { id } = useParams(); // ✅ Get ID from URL
  const location = useLocation(); 
  const [activeLink, setActiveLink] = useState(location.pathname);
  const navigate = useNavigate(); 
const [membership, setMembership] = useState(null);
  const [isMember, setIsMember] = useState(false);
 

  useEffect(() => {
    setActiveLink(location.pathname);
    
    // ✅ Fetch membership status from the backend
    const fetchMembership = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/seller/${id}`);
        console.log('Membership:', response.data);

        if (response.data?.isMember) {
          setIsMember(true);
          setMembership(response.data);
          
          // ✅ Redirect to current membership if already a member
        
        navigate(`/current-seller-membership/${id}`, { state: { membership: response.data } });

        }
      } catch (error) {
        console.error('Error fetching membership:', error);
      }
    };

    fetchMembership();
  }, [id, navigate]);

  const handleButton = (amount, membershipType) => {
    navigate(`/seller-membership-payment/${id}`, { state: { amount, membershipType } });
  };

  return (
    <div className='app'>
      <nav className='sidebar'>
        <ul className="nav-items">
          <SideBar activeLink={activeLink} id={id} />
        </ul>
      </nav>          

      <main className='main-content'>
        {/* ✅ Hero Section */}
        <div className="hero">
          <br />
          <br />
          <h1 style={{color:"white"}}>Choose Your Membership Plan</h1>
          <p>Get exclusive access to our premium automobile services</p>
        </div>

        {/* ✅ Membership Cards */}
        <div className="cards-container">
          {/* Buy Access Card */}
          <div className="card">
            <div className="card-header">
              <ShoppingCart className="card-icon blue-icon" />
              <span className="price">₹200<span>/year</span></span>
            </div>
            <h2 style={{color:"white"}}>Sell Access</h2>
            <p>Perfect for those looking to sell vehicles</p>
            <ul className="features-list">
              <li>
                <CheckCircle className="check-icon blue-icon" />
                <span>Access to sell vehicles</span>
              </li>
              <li>
                <CheckCircle className="check-icon blue-icon" />
                <span>Vehicle history reports</span>
              </li>
              <li>
                <CheckCircle className="check-icon blue-icon" />
                <span>Price negotiation support</span>
              </li>
            </ul>
            <button 
              className="button blue-button"
              onClick={() => handleButton(200,'sellaccess')}
            >
              Select Plan
            </button>
          </div>

          {/* Rent Access Card */}
          <div className="card">
            <div className="card-header">
              <Clock className="card-icon purple-icon" />
              <span className="price">₹200<span>/year</span></span>
            </div>
            <h2 style={{color:"white"}}>Rent Access</h2>
            <p>Ideal for temporary vehicle needs</p>
            <ul className="features-list">
              <li>
                <CheckCircle className="check-icon purple-icon" />
                <span>Unlimited rental access</span>
              </li>
              <li>
                <CheckCircle className="check-icon purple-icon" />
                <span>Priority booking</span>
              </li>
              <li>
                <CheckCircle className="check-icon purple-icon" />
                <span>24/7 roadside assistance</span>
              </li>
            </ul>
            <button 
              className="button purple-button"
              onClick={() => handleButton(200,'rentaccess')}
            >
              Select Plan
            </button>
          </div>

          {/* Premium Access Card */}
          <div className="card">
            <div className="best-value">BEST VALUE</div>
            <div className="card-header">
              <Key className="card-icon gold-icon" />
              <span className="price">₹300<span>/year</span></span>
            </div>
            <h2 style={{color:"white"}}>Premium Access</h2>
            <p>Complete access to all services</p>
            <ul className="features-list">
              <li>
                <CheckCircle className="check-icon gold-icon" />
                <span>Full buying & rental access</span>
              </li>
              <li>
                <CheckCircle className="check-icon gold-icon" />
                <span>Best service</span>
              </li>
              <li>
                <CheckCircle className="check-icon gold-icon" />
                <span>VIP customer support</span>
              </li>
            </ul>
            <button 
              className="button gold-button"
              onClick={() => handleButton(300,'premiumaccess')}
            >
              Select Plan
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerMembership;
