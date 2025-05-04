import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SideBar from './BuyerSideBar';
import React from 'react';

function ProtectedBuyerRoute({ children, requiredAccess }) {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [membershipType, setMembershipType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      try {
        const buyerId = localStorage.getItem("buyerId");
        if (!buyerId) {
          navigate("/buyer-login");
          return;
        }

        setId(buyerId);

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/buyer/${buyerId}`);
        const { membershipType } = response.data; // Fetch buyer membership type

        setMembershipType(membershipType);
      } catch (error) {
        console.error("Failed to fetch buyer membership status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipStatus();
  }, [navigate]);

  const handleConfirm = () => {
    navigate(`/buyer-membership/${id}`);
  };

  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  if (loading) return <div>Loading...</div>;

  // Define access based on membership type
  const access = {
    buyAccess: membershipType === "buyaccess" || membershipType === "premiumaccess",
    rentAccess: membershipType === "rentaccess" || membershipType === "premiumaccess",
  };

  // Check if user has required access
  const hasRequiredAccess = requiredAccess.some((accessType) => access[accessType]);

  return (
    <div className="app">
      {/* Show sidebar only if the user DOES NOT have access */}
      {!hasRequiredAccess && (
        <nav className="sidebar">
          <SideBar activeLink={activeLink} id={id} />
        </nav>
      )}

      <div className="main-content" style={{ padding: "0px" }}>
        {hasRequiredAccess ? (
          children
        ) : (
          <div
            className="membership-required"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
            <p className="mt-2 text-gray-600">
              You need an active buyer membership with {requiredAccess.join(", ")} access.
            </p>
            <br />
            <button
              className="membership-pay-button"
              style={{ width: "300px" }}
              onClick={handleConfirm}
            >
              Get Membership
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProtectedBuyerRoute;
