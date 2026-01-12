import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ChooseRole.css";

const ChooseRole = () => {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: "",
    googleId: "",
  });

  useEffect(() => {
    const firstName = searchParams.get("firstName") || "";
    const lastName = searchParams.get("lastName") || "";
    const email = searchParams.get("email") || "";
    const profilePicture = searchParams.get("profilePicture") || "";
    const googleId = searchParams.get("googleId") || "";

    setUserData({ firstName, lastName, email, profilePicture, googleId });

    // ✅ Check if the user already has an associated role
    const checkUserRole = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/check-role`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          if (data.roles.length === 1) {
            // ✅ If the user has one role, ask to continue or create a new role
            const confirmContinue = window.confirm(
              `You are already registered as a ${data.roles[0]}. Continue as ${data.roles[0]}?`
            );
            if (confirmContinue) {
              navigate(`/${data.roles[0]}-dashboard/${data.userId}`);
            }
          } else if (data.roles.length === 2) {
            // ✅ If both roles exist, ask which role to log in as
            const selectedRole = window.prompt(
              `You have both roles. Type "buyer" or "seller" to continue:`
            );
            if (selectedRole === "buyer" || selectedRole === "seller") {
              navigate(`/${selectedRole}-dashboard/${data.userId}`);
            }
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    if (email) {
      checkUserRole();
    }
  }, [searchParams, navigate]);

  const handleRoleSubmit = async () => {
    if (!role) {
      alert("Please select a role");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/set-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          ...userData,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/${role}-dashboard/${data.userId}`);
      } else {
        const error = await response.json();
        alert("Error setting role: " + error.msg);
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="role-container">
      <header className="role-header">
        <h1>Choose Your Role</h1>
        <p>Select how you'd like to use our platform</p>
      </header>

      <div className="role-cards">
        <div
          className={`role-card ${role === "buyer" ? "selected" : ""}`}
          onClick={() => setRole("buyer")}
        >
          <div className="role-icon">🛍️</div>
          <h2 >Buyer</h2>
          <p>Browse and purchase vehicles.</p>
          <button className="role-button">Select Buyer</button>
        </div>

        <div
          className={`role-card ${role === "seller" ? "selected" : ""}`}
          onClick={() => setRole("seller")}
        >
          <div className="role-icon">💼</div>
          <h2>Seller</h2>
          <p>List and sell vehicles.</p>
          <button className="role-button">Select Seller</button>
        </div>
      </div>

      <button className="confirm-button" onClick={handleRoleSubmit} disabled={!role}>
        Confirm Selection
      </button>
    </div>
  );
};

export default ChooseRole;
