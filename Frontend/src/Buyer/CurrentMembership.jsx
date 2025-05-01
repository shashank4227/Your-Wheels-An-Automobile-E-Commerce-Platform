import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import SideBar from './BuyerSideBar';
import { ShoppingCart, Clock, Key, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
function CurrentMembership() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  // ✅ Use membershipType from backend
  const membership = location.state?.membership || null;

  if (!membership) return <p className="no-membership">No membership data available</p>;
  console.log('Membership:', membership);

  const removeMembership = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyer-memberships/${id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to remove membership');
      }

      // Handle successful removal, e.g., redirect or update state
      console.log('Membership removed successfully');
      navigate(`/buyer-membership/${id}`);
    } catch (error) {
      console.error('Error removing membership:', error);
    }
  };

  const renderMembershipBox = () => {
    if (membership.membershipType === 'buyaccess') {
      return (
        <div className="card highlight">
          <div className="card-header">
            <ShoppingCart className="card-icon blue-icon" />
            <span className="price">₹200<span>/year</span></span>
          </div>
          <h2 style={{color:"white"}}>Buy Access</h2>
          <p>Perfect for those looking to purchase vehicles</p>
          <ul className="features-list">
            <li>
              <CheckCircle className="check-icon blue-icon" />
              <span>Access to purchase vehicles</span>
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
          <button onClick={removeMembership} className="button blue-button disabled">Deactive</button>
        </div>
      );
    } 
    
    if (membership.membershipType === 'rentaccess') {
      return (
        <div className="card highlight" style={{width:"400px"}}>
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
          <button onClick={removeMembership} className="button purple-button disabled">Dective</button>
        </div>
      );
    }

    if (membership.membershipType === 'premiumaccess') {
      return (
        <div className="card highlight" style={{width:"400px"}}>
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
          <button onClick={removeMembership} className="button gold-button disabled">Deactive</button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <nav className="sidebar">
        <SideBar activeLink={`/buyer-membership/${id}`} id={id} />
      </nav>

      {/* Main Content */}
      <div className="main-content" style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
              <h2 className="membership-title" style={{color:"white",fontSize:"40px"}}>Current Membership</h2>
              <br /><br />

        {/* ✅ Display the current membership box only */}
        {renderMembershipBox()}
      </div>
    </div>
  );
}

export default CurrentMembership;
