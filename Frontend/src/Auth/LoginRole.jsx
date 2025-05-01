import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import './ChooseRole.css';

const LoginRole = () => {
  const [role, setRole] = useState("");
  const [showConflict, setShowConflict] = useState(false);
  const [existingBuyerId, setExistingBuyerId] = useState(null);
  const [existingSellerId, setExistingSellerId] = useState(null);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Extract existing role and email from query params
  useEffect(() => {
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
      checkExistingAccounts(emailParam);
    }
  }, [searchParams]);

  // ✅ Check if buyer and seller accounts already exist
  const checkExistingAccounts = async (email) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/check-role?email=${email}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (data.existingRole === "both") {
          setExistingBuyerId(data.buyerId);
          setExistingSellerId(data.sellerId);
          setShowConflict(true);
        } else if (data.existingRole === "buyer") {
          setExistingBuyerId(data.buyerId);
          setShowConflict(true);
        } else if (data.existingRole === "seller") {
          setExistingSellerId(data.sellerId);
          setShowConflict(true);
        }
      }
    } catch (error) {
      console.error("Error checking existing accounts:", error.message);
    }
  };

  const handleSetRole = async (selectedRole) => {
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/set-login-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, email }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role === "buyer") {
          navigate(`/buyer-dashboard/${data.userId}`);
        } else if (data.role === "seller") {
          navigate(`/seller-dashboard/${data.userId}`);
        }
      } else {
        throw new Error(data.msg);
      }
    } catch (error) {
      alert("Error setting role: " + error.message);
    }
  };

  const handleContinueAsBuyer = () => {
    navigate(`/buyer-dashboard/${existingBuyerId}`);
  };

  const handleContinueAsSeller = () => {
    navigate(`/seller-dashboard/${existingSellerId}`);
  };

  return (
    <div className="role-container">
      <header className="role-header">
        <h1>Choose Your Role</h1>
        <p>Select how you'd like to use our platform</p>
      </header>

      {/* ✅ Conflict popup */}
      {showConflict ? (
        <div className="conflict-popup">
          <p>
            An account already exists with this email:
          </p>
          {existingBuyerId && (
            <button onClick={handleContinueAsBuyer} className="role-button buyer">
              Continue as Buyer
            </button>
          )}
          {existingSellerId && (
            <button onClick={handleContinueAsSeller} className="role-button seller">
              Continue as Seller
            </button>
          )}
          {!existingSellerId && (
            <button onClick={() => handleSetRole("seller")} className="role-button">
              Create New Seller Account
            </button>
          )}
          {!existingBuyerId && (
            <button onClick={() => handleSetRole("buyer")} className="role-button">
              Create New Buyer Account
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="role-cards">
            <div 
              className={`role-card ${role === 'buyer' ? 'selected' : ''}`}
              onClick={() => setRole('buyer')}
            >
              <div className="role-icon">🛍️</div>
              <h2>Buyer</h2>
              <p>Browse and purchase vehicles.</p>
            </div>

            <div 
              className={`role-card ${role === 'seller' ? 'selected' : ''}`}
              onClick={() => setRole('seller')}
            >
              <div className="role-icon">💼</div>
              <h2>Seller</h2>
              <p>List and sell vehicles.</p>
            </div>
          </div>

          <button 
            className="confirm-button"
            onClick={() => handleSetRole(role)}
            disabled={!role}
          >
            Confirm Selection
          </button>
        </>
      )}
    </div>
  );
};

export default LoginRole;
