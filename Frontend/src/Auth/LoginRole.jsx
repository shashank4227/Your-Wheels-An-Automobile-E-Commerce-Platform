import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Role = () => {
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    const handleRoleSubmit = () => {
        if (role === "buyer") {
            navigate("/buyer-login");
        } else if (role === "seller") {
            navigate("/seller-login");
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
                    <h2 style={{marginLeft:"75px"}}>Buyer</h2>
                    <p>Browse and purchase vehicles.</p>
                    <button className="role-button">Select Buyer</button>
                </div>

                <div
                    className={`role-card ${role === "seller" ? "selected" : ""}`}
                    onClick={() => setRole("seller")}
                >
                    <div className="role-icon">💼</div>
                    <h2  style={{marginLeft:"75px"}}>Seller</h2>
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

export default Role;
