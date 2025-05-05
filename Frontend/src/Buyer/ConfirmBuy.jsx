import React, { useState, useEffect } from "react";
import "./ConfirmBuy.css";
import { Phone, Mail, CheckCircle } from "lucide-react";
import SideBar from "./BuyerSideBar";
import { useLocation, useParams, useNavigate } from "react-router-dom";

function ConfirmBuy() {
  const { id: buyerId } = useParams(); // renamed for clarity
  const location = useLocation();
  const navigate = useNavigate();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [vehicleData, setVehicleData] = useState(null);

  // ✅ Extract vehicleId and price from location.state
  const { vehicleId, price } = location.state || {};

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  useEffect(() => {
    console.log("🟡 vehicleId from location.state:", vehicleId); // Debug log
    if (vehicleId) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/sell/${vehicleId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("✅ Vehicle data fetched:", data.vehicle); // Debug
            setVehicleData(data.vehicle);
          } else {
            throw new Error(data.message || "Vehicle not found");
          }
        })
        .catch((error) =>
          console.error("❌ Error fetching vehicle details:", error)
        );
    } else {
      console.error("❌ vehicleId not provided in location.state");
    }
  }, [vehicleId]);

  const handleConfirmPurchase = async () => {
    if (!vehicleData) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/create-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buyerId: buyerId,
            sellerId: vehicleData.sellerId,
            vehicleId: vehicleData._id,
            amount: price,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setIsConfirmed(true);
        navigate(`/bought-vehicles/${buyerId}`);
      } else {
        alert("Purchase failed: " + data.message);
      }
    } catch (error) {
      console.error("❌ Error creating transaction:", error);
      alert("Failed to complete purchase.");
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={buyerId} />
      </nav>
      <main className="main-content">
        <div className="purchase-container">
          <div className="purchase-card">
            <h1>Purchase Confirmation</h1>

            {vehicleData ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                {/* Vehicle Details */}
                <div
                  className="vehicle-details"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#f8f9fa",
                    padding: "20px",
                    borderRadius: "10px",
                  }}
                >
                  <h2>Vehicle Details</h2>
                  <div className="detail-row">
                    <span className="label">Make:</span>
                    <span className="value">{vehicleData.brand}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Model:</span>
                    <span className="value">{vehicleData.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Year:</span>
                    <span className="value">{vehicleData.year}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Price:</span>
                    <span className="value">
                      ₹{price?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: "100px",
                    height: "100%",
                    backgroundColor: "#ccc",
                  }}
                ></div>

                {/* Seller Details */}
                <div className="seller-details">
                  <h2>Seller Information</h2>
                  <div className="contact-info">
                    <div className="contact-row">
                      <Phone className="icon" />
                      <span>{vehicleData.phoneNumber || "Not Available"}</span>
                    </div>
                    <div className="contact-row">
                      <Mail className="icon" />
                      <span>{vehicleData.email || "Not Available"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading vehicle details...</p>
            )}

            {!isConfirmed ? (
              <div className="confirmation-section">
                <p className="disclaimer">
                  By clicking confirm, you agree to proceed with the purchase of
                  this vehicle. The seller will be notified and will contact you
                  shortly.
                </p>
                <button className="confirm-button" onClick={handleConfirmPurchase}>
                  Confirm Purchase
                </button>
              </div>
            ) : (
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <h3>Purchase Confirmed!</h3>
                <p>The seller has been notified and will contact you soon.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConfirmBuy;
